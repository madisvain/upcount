# Governed AI access for Upcount (optional)

This folder lets an AI assistant (Claude Desktop, Cursor, …) safely **operate** Upcount — not by
screen-scraping or opening the raw SQLite file, but by exposing Upcount's *existing* actions as a
**governed [MCP](https://modelcontextprotocol.io) server**.

It is **off by default** and **changes nothing in the app**. If you never wire it into an
assistant, none of this runs.

> Why this exists: Upcount is local-first with no API, so until now there was no *safe* way to let
> an assistant do things in it. This gives the agent a narrow, permissioned, audited door instead
> of ungoverned database access.

---

## What you get

- 🔒 **Permissions** — the agent can only call the actions you allow-list (everything else denied).
- ✋ **Human approval** — financial-document actions (create/update/issue an invoice) and anything
  destructive (`delete_*`) pause for a one-click yes/no before they touch your books.
- 🧾 **Signed audit log** — every executed agent action is an Ed25519-signed receipt you can replay.
- 💸 **Budget cap** — at most N actions per rolling minute, so a looping agent can't run away.

## How it works

```
  Claude Desktop ──MCP/stdio──▶  kriya-mcp  ──one JSON line per action──▶  kriya_exec
  (the agent)                    (governor)                                (Upcount's data layer)
                                    │                                          │
                          policy ▸ approval ▸ budget ▸ audit            reuses Upcount's async
                          (agent-policy.yaml)                            Database methods → sqlite.db
```

- **`kriya_exec`** (`src-tauri/src/bin/kriya_exec.rs`) is a small second binary in *this* crate.
  It does **no** business logic of its own — it pulls in the very same `db` module the Tauri
  commands use, so an AI tool-call runs the **identical async `Database` method** a human action
  does. No second implementation, nothing new to trust.
- **`kriya-mcp`** is the external governor (from the open-source [`kriya`](https://crates.io/crates/kriya)
  crate). It speaks MCP to the assistant and, for every call, enforces policy → approval → budget →
  signed-audit **before** forwarding the cleared action to `kriya_exec`.

## Enable it

1. **Build the executor** (release):
   ```bash
   cd src-tauri
   cargo build --release --bin kriya_exec     # → src-tauri/target/release/kriya_exec
   ```
2. **Install the governor**:
   ```bash
   cargo install kriya                         # provides the `kriya-mcp` binary on your PATH
   ```
3. **Point it at your data.** By default `kriya_exec` opens the same database the app uses
   (`<app data dir>/com.upcount.dev/sqlite.db`). To target a copy, set `UPCOUNT_DB` (a path or a
   full `sqlite://` URL) or pass `--db <path>`.
4. **Wire it into your assistant.** Copy the `mcpServers.upcount` block from [`.mcp.json`](.mcp.json)
   into your assistant's MCP config (Claude Desktop on macOS:
   `~/Library/Application Support/Claude/claude_desktop_config.json`), replacing the
   `/ABSOLUTE/PATH/...` placeholders. Restart the assistant.
5. Ask something read-only first, e.g. *"List my unpaid invoices for <org>."* Then try an invoice
   create and watch the approval prompt appear.

## Governance model

| Tier | Actions | Policy |
|---|---|---|
| Read | `get_*` | allow (no prompt) |
| Routine write | `create_*` / `update_*` for clients, organizations, tax rates, tags, time entries, projects | allow + audit |
| Money / financial document | `create_invoice`, `update_invoice`, `update_invoice_state` | **human approval** + audit |
| Destructive | `delete_*` (client, invoice, organization, tax rate, tag, time entry) | **human approval** + audit |
| Anything else | — | **denied** |

Edit [`agent-policy.yaml`](agent-policy.yaml) to tighten or loosen this (e.g. set an action to
`allow: false` to forbid it outright, or drop `require_approval` to let it run audited).

## Notes for agents

- **IDs are optional on create** — `kriya_exec` mints a nanoid when you omit `id`. (You may still
  pass an explicit `id`.) Foreign keys are enforced, so create an organization and client before an
  invoice, and pass their ids as `organizationId` / `clientId`.
- **Money is integer minor units (cents)** — `total`, `taxTotal`, `subTotal`, and line-item
  `unitPrice` are cents (e.g. `1000` = 10.00).
- **Invoice `number` is caller-supplied** — Upcount's numbering/format logic lives in the UI, so an
  agent-created invoice must pass `number` itself.
- Field names follow Upcount's own schema: mostly camelCase (`organizationId`, `clientId`,
  `dueDate`, …) with a few snake_case (`registration_number`, `bank_name`, `date_format`). See
  [`tools.json`](tools.json) for each action's exact shape.

## Approval on each OS

`--approval gui` is a native macOS dialog that works even though Claude Desktop has no terminal.
On **Linux/Windows** there is no GUI gate yet, so either run `kriya-mcp` from a terminal with
`--approval tty`, or keep the default and know that approval-required actions will simply be
**denied** when there's no way to ask a human — the safe failure mode. Reads and routine writes are
unaffected.

## Audit log

Executed actions are appended as signed JSONL receipts to `$TMPDIR/kriya-audit.jsonl` (override with
`kriya-mcp --audit-log <path>`). Each receipt is attributable to the `--actor` you set.

## Adding an action

1. Add a `match` arm in `dispatch()` in `src-tauri/src/bin/kriya_exec.rs` calling the relevant
   `db` method.
2. Add a tool entry to [`tools.json`](tools.json).
3. Add a rule to [`agent-policy.yaml`](agent-policy.yaml) deciding its tier.

## What this does **not** do

- It adds **no new dependency** to the app and changes nothing in the app binary/runtime —
  `kriya_exec` is a separate binary and the governor is a separate process.
- It makes no network calls (beyond the local stdio MCP pipe) and adds no telemetry.
- It exposes nothing not listed in `tools.json`; the policy denies everything else. `backup_database`
  / `restore_database` are intentionally **not** exposed (they need the Tauri GUI dialog).

This integration is contributed under Upcount's GPL-3.0 license; `kriya-mcp` runs as a separate
process and is not linked into the app.
