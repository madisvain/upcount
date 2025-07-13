use crate::db::{
    Client, CreateClientRequest, Database, UpdateClientRequest,
    Invoice, InvoiceLineItem, CreateInvoiceRequest, UpdateInvoiceRequest,
    Organization, CreateOrganizationRequest, UpdateOrganizationRequest,
    TaxRate, CreateTaxRateRequest, UpdateTaxRateRequest,
    Tag, CreateTagRequest, UpdateTagRequest,
    TimeEntry, CreateTimeEntryRequest, UpdateTimeEntryRequest,
    Project, CreateProjectRequest, UpdateProjectRequest
};
use tauri::{AppHandle, Manager, State};
use chrono::{DateTime, Utc};
use std::fs;

// Helper function to handle database errors
fn handle_db_error(error: sqlx::Error, operation: &str) -> String {
    format!("{}: {}", operation, error)
}

#[tauri::command]
pub async fn get_clients(
    organization_id: String,
    db: State<'_, Database>,
) -> Result<Vec<Client>, String> {
    db.get_clients(&organization_id)
        .await
        .map_err(|e| handle_db_error(e, "get_clients"))
}

#[tauri::command]
pub async fn get_client(client_id: String, db: State<'_, Database>) -> Result<Option<Client>, String> {
    db.get_client(&client_id)
        .await
        .map_err(|e| handle_db_error(e, "get_client"))
}

#[tauri::command]
pub async fn create_client(
    client: CreateClientRequest,
    db: State<'_, Database>,
) -> Result<Client, String> {
    db.create_client(client)
        .await
        .map_err(|e| handle_db_error(e, "create_client"))
}

#[tauri::command]
pub async fn update_client(
    client_id: String,
    updates: UpdateClientRequest,
    db: State<'_, Database>,
) -> Result<Client, String> {
    db.update_client(&client_id, updates)
        .await
        .map_err(|e| handle_db_error(e, "update_client"))
}

#[tauri::command]
pub async fn delete_client(client_id: String, db: State<'_, Database>) -> Result<bool, String> {
    db.delete_client(&client_id)
        .await
        .map_err(|e| handle_db_error(e, "delete_client"))
}

#[tauri::command]
pub async fn get_client_invoice_count(client_id: String, db: State<'_, Database>) -> Result<i64, String> {
    db.get_client_invoice_count(&client_id)
        .await
        .map_err(|e| handle_db_error(e, "get_client_invoice_count"))
}

#[tauri::command]
pub async fn get_invoices(
    organization_id: String,
    db: State<'_, Database>,
) -> Result<Vec<Invoice>, String> {
    db.get_invoices(&organization_id)
        .await
        .map_err(|e| handle_db_error(e, "get_invoices"))
}

#[tauri::command]
pub async fn get_invoice(invoice_id: String, db: State<'_, Database>) -> Result<Option<Invoice>, String> {
    db.get_invoice(&invoice_id)
        .await
        .map_err(|e| handle_db_error(e, "get_invoice"))
}

#[tauri::command]
pub async fn get_invoice_line_items(
    invoice_id: String,
    db: State<'_, Database>,
) -> Result<Vec<InvoiceLineItem>, String> {
    db.get_invoice_line_items(&invoice_id)
        .await
        .map_err(|e| handle_db_error(e, "get_invoice_line_items"))
}

#[tauri::command]
pub async fn create_invoice(
    invoice: CreateInvoiceRequest,
    db: State<'_, Database>,
) -> Result<Invoice, String> {
    db.create_invoice(invoice)
        .await
        .map_err(|e| handle_db_error(e, "create_invoice"))
}

#[tauri::command]
pub async fn update_invoice(
    invoice_id: String,
    updates: UpdateInvoiceRequest,
    db: State<'_, Database>,
) -> Result<Invoice, String> {
    db.update_invoice(&invoice_id, updates)
        .await
        .map_err(|e| handle_db_error(e, "update_invoice"))
}

#[tauri::command]
pub async fn delete_invoice(invoice_id: String, db: State<'_, Database>) -> Result<bool, String> {
    db.delete_invoice(&invoice_id)
        .await
        .map_err(|e| handle_db_error(e, "delete_invoice"))
}

#[tauri::command]
pub async fn get_organizations(db: State<'_, Database>) -> Result<Vec<Organization>, String> {
    db.get_organizations()
        .await
        .map_err(|e| handle_db_error(e, "get_organizations"))
}

#[tauri::command]
pub async fn get_organization(organization_id: String, db: State<'_, Database>) -> Result<Option<Organization>, String> {
    db.get_organization(&organization_id)
        .await
        .map_err(|e| handle_db_error(e, "get_organization"))
}

#[tauri::command]
pub async fn create_organization(
    organization: CreateOrganizationRequest,
    db: State<'_, Database>,
) -> Result<Organization, String> {
    db.create_organization(organization)
        .await
        .map_err(|e| handle_db_error(e, "create_organization"))
}

#[tauri::command]
pub async fn update_organization(
    organization_id: String,
    updates: UpdateOrganizationRequest,
    db: State<'_, Database>,
) -> Result<Organization, String> {
    db.update_organization(&organization_id, updates)
        .await
        .map_err(|e| handle_db_error(e, "update_organization"))
}

#[tauri::command]
pub async fn delete_organization(organization_id: String, db: State<'_, Database>) -> Result<bool, String> {
    db.delete_organization(&organization_id)
        .await
        .map_err(|e| handle_db_error(e, "delete_organization"))
}

#[tauri::command]
pub async fn get_tax_rates(
    organization_id: String,
    db: State<'_, Database>,
) -> Result<Vec<TaxRate>, String> {
    db.get_tax_rates(&organization_id)
        .await
        .map_err(|e| handle_db_error(e, "get_tax_rates"))
}

#[tauri::command]
pub async fn get_tax_rate(tax_rate_id: String, db: State<'_, Database>) -> Result<Option<TaxRate>, String> {
    db.get_tax_rate(&tax_rate_id)
        .await
        .map_err(|e| handle_db_error(e, "get_tax_rate"))
}

#[tauri::command]
pub async fn create_tax_rate(
    tax_rate: CreateTaxRateRequest,
    db: State<'_, Database>,
) -> Result<TaxRate, String> {
    db.create_tax_rate(tax_rate)
        .await
        .map_err(|e| handle_db_error(e, "create_tax_rate"))
}

#[tauri::command]
pub async fn update_tax_rate(
    tax_rate_id: String,
    updates: UpdateTaxRateRequest,
    db: State<'_, Database>,
) -> Result<TaxRate, String> {
    db.update_tax_rate(&tax_rate_id, updates)
        .await
        .map_err(|e| handle_db_error(e, "update_tax_rate"))
}

#[tauri::command]
pub async fn delete_tax_rate(tax_rate_id: String, db: State<'_, Database>) -> Result<bool, String> {
    db.delete_tax_rate(&tax_rate_id)
        .await
        .map_err(|e| handle_db_error(e, "delete_tax_rate"))
}

#[tauri::command]
pub async fn backup_database(app: AppHandle) -> Result<String, String> {
    use tauri_plugin_dialog::DialogExt;
    use tokio::sync::oneshot;
    use std::path::PathBuf;
    
    // Get the app data directory and database path
    let app_dir = app.path().app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;
    let db_path = app_dir.join("sqlite.db");
    
    // Check if database file exists
    if !db_path.exists() {
        return Err("Database file not found".to_string());
    }
    
    // Generate default filename with current date
    let now: DateTime<Utc> = Utc::now();
    let default_filename = format!("upcount-backup-{}.db", now.format("%Y-%m-%d"));
    
    // Show save dialog using callback approach
    let (tx, rx) = oneshot::channel();
    
    app.dialog()
        .file()
        .set_title("Save Database Backup")
        .set_file_name(&default_filename)
        .add_filter("Database", &["db"])
        .save_file(move |file_path| {
            let _ = tx.send(file_path);
        });
    
    let file_path = rx.await
        .map_err(|_| "Dialog callback failed")?
        .ok_or("User cancelled save dialog")?;
    
    // Convert FilePath to PathBuf
    let path_buf = PathBuf::from(file_path.to_string());
    
    // Copy database file to selected location
    fs::copy(&db_path, &path_buf)
        .map_err(|e| format!("Failed to copy database file: {}", e))?;
    
    Ok(path_buf.to_string_lossy().to_string())
}

#[tauri::command]
pub async fn restore_database(app: AppHandle) -> Result<String, String> {
    use tauri_plugin_dialog::DialogExt;
    use tokio::sync::oneshot;
    use std::path::PathBuf;
    
    // Get the app data directory and database path
    let app_dir = app.path().app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;
    let db_path = app_dir.join("sqlite.db");
    let backup_path = app_dir.join("sqlite.db.backup");
    
    // Show open dialog using callback approach
    let (tx, rx) = oneshot::channel();
    
    app.dialog()
        .file()
        .set_title("Select Database Backup to Restore")
        .add_filter("Database", &["db"])
        .pick_file(move |file_path| {
            let _ = tx.send(file_path);
        });
    
    let file_path = rx.await
        .map_err(|_| "Dialog callback failed")?
        .ok_or("User cancelled open dialog")?;
    
    // Convert FilePath to PathBuf
    let source_path = PathBuf::from(file_path.to_string());
    
    // Verify the source file exists
    if !source_path.exists() {
        return Err("Selected backup file does not exist".to_string());
    }
    
    // Create a backup of current database before replacing
    if db_path.exists() {
        fs::copy(&db_path, &backup_path)
            .map_err(|e| format!("Failed to backup current database: {}", e))?;
    }
    
    // Copy backup file to database location
    fs::copy(&source_path, &db_path)
        .map_err(|e| {
            // Try to restore the original database if copy fails
            if backup_path.exists() {
                let _ = fs::copy(&backup_path, &db_path);
            }
            format!("Failed to restore database: {}", e)
        })?;
    
    // Remove temporary backup if restore was successful
    if backup_path.exists() {
        let _ = fs::remove_file(&backup_path);
    }
    
    Ok("Database restored successfully".to_string())
}

// Time Tracking Commands

// Tag Commands
#[tauri::command]
pub async fn get_tags(
    organization_id: String,
    db: State<'_, Database>,
) -> Result<Vec<Tag>, String> {
    db.get_tags(&organization_id)
        .await
        .map_err(|e| handle_db_error(e, "get_tags"))
}

#[tauri::command]
pub async fn get_tag(tag_id: String, db: State<'_, Database>) -> Result<Option<Tag>, String> {
    db.get_tag(&tag_id)
        .await
        .map_err(|e| handle_db_error(e, "get_tag"))
}

#[tauri::command]
pub async fn create_tag(
    tag: CreateTagRequest,
    db: State<'_, Database>,
) -> Result<Tag, String> {
    db.create_tag(tag)
        .await
        .map_err(|e| handle_db_error(e, "create_tag"))
}

#[tauri::command]
pub async fn update_tag(
    tag_id: String,
    updates: UpdateTagRequest,
    db: State<'_, Database>,
) -> Result<Tag, String> {
    db.update_tag(&tag_id, updates)
        .await
        .map_err(|e| handle_db_error(e, "update_tag"))
}

#[tauri::command]
pub async fn delete_tag(tag_id: String, db: State<'_, Database>) -> Result<bool, String> {
    db.delete_tag(&tag_id)
        .await
        .map_err(|e| handle_db_error(e, "delete_tag"))
}

// Time Entry Commands
#[tauri::command]
pub async fn get_time_entries(
    organization_id: String,
    db: State<'_, Database>,
) -> Result<Vec<TimeEntry>, String> {
    db.get_time_entries(&organization_id)
        .await
        .map_err(|e| handle_db_error(e, "get_time_entries"))
}

#[tauri::command]
pub async fn get_time_entry(time_entry_id: String, db: State<'_, Database>) -> Result<Option<TimeEntry>, String> {
    db.get_time_entry(&time_entry_id)
        .await
        .map_err(|e| handle_db_error(e, "get_time_entry"))
}

#[tauri::command]
pub async fn create_time_entry(
    time_entry: CreateTimeEntryRequest,
    db: State<'_, Database>,
) -> Result<TimeEntry, String> {
    db.create_time_entry(time_entry)
        .await
        .map_err(|e| handle_db_error(e, "create_time_entry"))
}

#[tauri::command]
pub async fn update_time_entry(
    time_entry_id: String,
    updates: UpdateTimeEntryRequest,
    db: State<'_, Database>,
) -> Result<TimeEntry, String> {
    db.update_time_entry(&time_entry_id, updates)
        .await
        .map_err(|e| handle_db_error(e, "update_time_entry"))
}

#[tauri::command]
pub async fn delete_time_entry(time_entry_id: String, db: State<'_, Database>) -> Result<bool, String> {
    db.delete_time_entry(&time_entry_id)
        .await
        .map_err(|e| handle_db_error(e, "delete_time_entry"))
}

// Project commands
#[tauri::command]
pub async fn get_projects(
    organization_id: String,
    db: State<'_, Database>,
) -> Result<Vec<Project>, String> {
    db.get_projects(&organization_id)
        .await
        .map_err(|e| handle_db_error(e, "get_projects"))
}

#[tauri::command]
pub async fn get_project(project_id: String, db: State<'_, Database>) -> Result<Option<Project>, String> {
    db.get_project(&project_id)
        .await
        .map_err(|e| handle_db_error(e, "get_project"))
}

#[tauri::command]
pub async fn create_project(
    project: CreateProjectRequest,
    db: State<'_, Database>,
) -> Result<Project, String> {
    db.create_project(project)
        .await
        .map_err(|e| handle_db_error(e, "create_project"))
}

#[tauri::command]
pub async fn update_project(
    project_id: String,
    updates: UpdateProjectRequest,
    db: State<'_, Database>,
) -> Result<Project, String> {
    db.update_project(&project_id, updates)
        .await
        .map_err(|e| handle_db_error(e, "update_project"))
}