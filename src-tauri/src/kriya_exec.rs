//! Headless action executor for the optional Kriya governed-MCP bolt-on.
//! See `kriya-mcp/README.md` for the full picture and how to turn it on.
//!
//! `kriya-mcp` (the external governor process) spawns this binary and speaks a tiny line
//! protocol to it: one request per line on stdin —
//!     {"action": "<name>", "params": { ... }}
//! and one reply per line on stdout —
//!     {"success": true,  "data": <json>}        (on success)
//!     {"success": false, "error": "<message>"}  (on failure)
//!
//! Like the rest of Upcount's backend this is async (sqlx + tokio), so the loop runs under
//! `#[tokio::main]` and every data call is `.await`ed.
//!
//! It reuses Upcount's EXACT data layer: this file pulls in the same `db` module the Tauri
//! human action does. There is no second implementation to keep in sync.
//!
//! It performs NO governance. Whether an action is allowed, needs human approval, fits the
//! budget, and how it is audited is decided entirely by `kriya-mcp` (see
//! `kriya-mcp/agent-policy.yaml`) BEFORE a request ever reaches this binary. The app
//! (`lib.rs`/`main.rs`) is untouched and unaware of this; if a user never wires it into an
//! assistant, it is inert and never runs.

mod db;

use std::path::PathBuf;

use db::{
    CreateClientRequest, CreateInvoiceRequest, CreateOrganizationRequest, CreateProjectRequest,
    CreateTagRequest, CreateTaxRateRequest, CreateTimeEntryRequest, Database, UpdateClientRequest,
    UpdateInvoiceRequest, UpdateOrganizationRequest, UpdateProjectRequest, UpdateTagRequest,
    UpdateTaxRateRequest, UpdateTimeEntryRequest,
};
use serde_json::{json, Value};
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};

/// Unwrap a `Result<T, String>` or short-circuit the dispatch with a one-line failure reply.
/// Defined before its use sites because `macro_rules!` is textually scoped.
macro_rules! unwrap_or_fail {
    ($expr:expr) => {
        match $expr {
            Ok(value) => value,
            Err(message) => return fail(message),
        }
    };
}

#[tokio::main]
async fn main() {
    let db_url = resolve_db_url();
    let database = match Database::new(&db_url).await {
        Ok(database) => database,
        Err(err) => {
            // Without a database there is nothing to serve. Report once on stderr (kriya-mcp
            // inherits it) and exit non-zero so the operator sees the misconfiguration.
            eprintln!("[upcount kriya_exec] cannot open database at {db_url}: {err}");
            std::process::exit(1);
        }
    };
    eprintln!("[upcount kriya_exec] ready · db={db_url}");

    let mut lines = BufReader::new(tokio::io::stdin()).lines();
    let mut out = tokio::io::stdout();

    // One request per line, one reply per line; EOF ends the session (covers both the
    // per-call and --persistent kriya-mcp executor modes).
    loop {
        let line = match lines.next_line().await {
            Ok(Some(line)) => line,
            Ok(None) | Err(_) => break,
        };
        if line.trim().is_empty() {
            continue;
        }
        let reply = handle(&database, &line).await;
        if out.write_all(reply.as_bytes()).await.is_err() || out.write_all(b"\n").await.is_err() {
            break;
        }
        // Flush so --persistent mode receives each reply immediately, not at EOF.
        let _ = out.flush().await;
    }
}

/// Parse one request line and dispatch it, always yielding exactly one JSON reply line.
async fn handle(db: &Database, line: &str) -> String {
    let request: Value = match serde_json::from_str(line) {
        Ok(value) => value,
        Err(err) => return fail(format!("request was not valid JSON: {err}")),
    };
    let action = request.get("action").and_then(Value::as_str).unwrap_or_default().to_string();
    let params = request.get("params").cloned().unwrap_or_else(|| json!({}));
    dispatch(db, &action, params).await
}

/// Map an action id to the matching `Database` method — the same methods `commands.rs` exposes
/// to the UI. Unknown actions are rejected, so an agent can only reach this curated surface.
async fn dispatch(db: &Database, action: &str, params: Value) -> String {
    match action {
        // ---- Clients ----
        "get_clients" => reply(db.get_clients(&unwrap_or_fail!(req_str(&params, "organizationId"))).await),
        "get_client" => reply(db.get_client(&unwrap_or_fail!(req_str(&params, "id"))).await),
        "get_client_invoice_count" => {
            reply(db.get_client_invoice_count(&unwrap_or_fail!(req_str(&params, "id"))).await)
        }
        "create_client" => reply(db.create_client(unwrap_or_fail!(parse::<CreateClientRequest>(with_id(params)))).await),
        "update_client" => {
            let id = unwrap_or_fail!(req_str(&params, "id"));
            reply(db.update_client(&id, unwrap_or_fail!(parse::<UpdateClientRequest>(params))).await)
        }
        "delete_client" => reply(db.delete_client(&unwrap_or_fail!(req_str(&params, "id"))).await),

        // ---- Invoices ----
        "get_invoices" => reply(db.get_invoices(&unwrap_or_fail!(req_str(&params, "organizationId"))).await),
        "get_invoice" => reply(db.get_invoice(&unwrap_or_fail!(req_str(&params, "id"))).await),
        "get_invoice_line_items" => {
            reply(db.get_invoice_line_items(&unwrap_or_fail!(req_str(&params, "id"))).await)
        }
        "create_invoice" => reply(db.create_invoice(unwrap_or_fail!(parse::<CreateInvoiceRequest>(with_id(params)))).await),
        "update_invoice" => {
            let id = unwrap_or_fail!(req_str(&params, "id"));
            reply(db.update_invoice(&id, unwrap_or_fail!(parse::<UpdateInvoiceRequest>(params))).await)
        }
        "update_invoice_state" => {
            let id = unwrap_or_fail!(req_str(&params, "id"));
            let state = unwrap_or_fail!(req_str(&params, "state"));
            reply(db.update_invoice_state(&id, &state).await)
        }
        "delete_invoice" => reply(db.delete_invoice(&unwrap_or_fail!(req_str(&params, "id"))).await),

        // ---- Organizations ----
        "get_organizations" => reply(db.get_organizations().await),
        "get_organization" => reply(db.get_organization(&unwrap_or_fail!(req_str(&params, "id"))).await),
        "create_organization" => reply(db.create_organization(unwrap_or_fail!(parse::<CreateOrganizationRequest>(with_id(params)))).await),
        "update_organization" => {
            let id = unwrap_or_fail!(req_str(&params, "id"));
            reply(db.update_organization(&id, unwrap_or_fail!(parse::<UpdateOrganizationRequest>(params))).await)
        }
        "delete_organization" => reply(db.delete_organization(&unwrap_or_fail!(req_str(&params, "id"))).await),

        // ---- Tax rates ----
        "get_tax_rates" => reply(db.get_tax_rates(&unwrap_or_fail!(req_str(&params, "organizationId"))).await),
        "get_tax_rate" => reply(db.get_tax_rate(&unwrap_or_fail!(req_str(&params, "id"))).await),
        "create_tax_rate" => reply(db.create_tax_rate(unwrap_or_fail!(parse::<CreateTaxRateRequest>(with_id(params)))).await),
        "update_tax_rate" => {
            let id = unwrap_or_fail!(req_str(&params, "id"));
            reply(db.update_tax_rate(&id, unwrap_or_fail!(parse::<UpdateTaxRateRequest>(params))).await)
        }
        "delete_tax_rate" => reply(db.delete_tax_rate(&unwrap_or_fail!(req_str(&params, "id"))).await),

        // ---- Tags ----
        "get_tags" => reply(db.get_tags(&unwrap_or_fail!(req_str(&params, "organizationId"))).await),
        "get_tag" => reply(db.get_tag(&unwrap_or_fail!(req_str(&params, "id"))).await),
        "create_tag" => reply(db.create_tag(unwrap_or_fail!(parse::<CreateTagRequest>(with_id(params)))).await),
        "update_tag" => {
            let id = unwrap_or_fail!(req_str(&params, "id"));
            reply(db.update_tag(&id, unwrap_or_fail!(parse::<UpdateTagRequest>(params))).await)
        }
        "delete_tag" => reply(db.delete_tag(&unwrap_or_fail!(req_str(&params, "id"))).await),

        // ---- Time entries ----
        "get_time_entries" => reply(db.get_time_entries(&unwrap_or_fail!(req_str(&params, "organizationId"))).await),
        "get_time_entry" => reply(db.get_time_entry(&unwrap_or_fail!(req_str(&params, "id"))).await),
        "create_time_entry" => reply(db.create_time_entry(unwrap_or_fail!(parse::<CreateTimeEntryRequest>(with_id(params)))).await),
        "update_time_entry" => {
            let id = unwrap_or_fail!(req_str(&params, "id"));
            reply(db.update_time_entry(&id, unwrap_or_fail!(parse::<UpdateTimeEntryRequest>(params))).await)
        }
        "delete_time_entry" => reply(db.delete_time_entry(&unwrap_or_fail!(req_str(&params, "id"))).await),

        // ---- Projects (no delete: archival is update_project { archivedAt }) ----
        "get_projects" => reply(db.get_projects(&unwrap_or_fail!(req_str(&params, "organizationId"))).await),
        "get_project" => reply(db.get_project(&unwrap_or_fail!(req_str(&params, "id"))).await),
        "create_project" => reply(db.create_project(unwrap_or_fail!(parse::<CreateProjectRequest>(with_id(params)))).await),
        "update_project" => {
            let id = unwrap_or_fail!(req_str(&params, "id"));
            reply(db.update_project(&id, unwrap_or_fail!(parse::<UpdateProjectRequest>(params))).await)
        }

        other => fail(format!("unknown action '{other}'")),
    }
}

// ---- reply helpers ----

fn ok(data: Value) -> String {
    json!({ "success": true, "data": data }).to_string()
}

fn fail(message: impl Into<String>) -> String {
    json!({ "success": false, "error": message.into() }).to_string()
}

/// Turn a `Database` method's `Result` into the wire reply. Generic over the error type so this
/// file never needs to name `sqlx`.
fn reply<T: serde::Serialize, E: std::fmt::Display>(result: Result<T, E>) -> String {
    match result {
        Ok(value) => match serde_json::to_value(value) {
            Ok(data) => ok(data),
            Err(err) => fail(format!("could not serialize result: {err}")),
        },
        Err(err) => fail(err.to_string()),
    }
}

// ---- param handling ----

fn req_str(params: &Value, key: &str) -> Result<String, String> {
    params
        .get(key)
        .and_then(Value::as_str)
        .map(str::to_string)
        .ok_or_else(|| format!("parameter '{key}' is required and must be a string"))
}

/// Deserialize the params object into one of the app's existing `Create*/Update*Request` structs.
fn parse<T: serde::de::DeserializeOwned>(params: Value) -> Result<T, String> {
    serde_json::from_value(params).map_err(|err| format!("invalid params: {err}"))
}

/// Every `Create*Request` requires a caller-supplied `id` (the UI mints a nanoid). To spare the
/// agent that bookkeeping, generate one when it's absent — matching the app's 21-char id shape.
fn with_id(mut params: Value) -> Value {
    let has_id = params.get("id").and_then(Value::as_str).map(|s| !s.is_empty()).unwrap_or(false);
    if !has_id {
        if let Value::Object(map) = &mut params {
            map.insert("id".to_string(), Value::String(nanoid::nanoid!()));
        }
    }
    params
}

// ---- database location ----

/// Resolve the Upcount SQLite URL. Explicit overrides win (so an operator can point the agent at
/// a copy); otherwise fall back to the same per-OS location the app itself uses.
fn resolve_db_url() -> String {
    if let Ok(value) = std::env::var("UPCOUNT_DB") {
        let value = value.trim();
        if !value.is_empty() {
            return normalize_url(value);
        }
    }
    let args: Vec<String> = std::env::args().skip(1).collect();
    if let Some(pos) = args.iter().position(|a| a == "--db") {
        if let Some(value) = args.get(pos + 1) {
            return normalize_url(value);
        }
    }
    let path = default_db_path();
    if let Some(parent) = path.parent() {
        let _ = std::fs::create_dir_all(parent);
    }
    format!("sqlite://{}", path.display())
}

/// Accept either a `sqlite://…` URL or a bare filesystem path; sqlx needs the URL form.
fn normalize_url(value: &str) -> String {
    if value.starts_with("sqlite:") {
        return value.to_string();
    }
    let path = PathBuf::from(value);
    if let Some(parent) = path.parent() {
        let _ = std::fs::create_dir_all(parent);
    }
    format!("sqlite://{}", path.display())
}

/// Mirror Tauri's `app_data_dir()/sqlite.db` for identifier `com.upcount.dev`.
fn default_db_path() -> PathBuf {
    const IDENTIFIER: &str = "com.upcount.dev";
    const DB_FILE: &str = "sqlite.db";

    let base = if cfg!(target_os = "macos") {
        PathBuf::from(home()).join("Library/Application Support")
    } else if cfg!(target_os = "windows") {
        PathBuf::from(std::env::var("APPDATA").unwrap_or_default())
    } else {
        std::env::var("XDG_DATA_HOME")
            .map(PathBuf::from)
            .unwrap_or_else(|_| PathBuf::from(home()).join(".local/share"))
    };
    base.join(IDENTIFIER).join(DB_FILE)
}

fn home() -> String {
    std::env::var("HOME").unwrap_or_default()
}
