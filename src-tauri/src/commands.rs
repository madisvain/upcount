use crate::database::{
    Client, CreateClientRequest, Database, UpdateClientRequest,
    Invoice, InvoiceLineItem, CreateInvoiceRequest, UpdateInvoiceRequest,
    Organization, CreateOrganizationRequest, UpdateOrganizationRequest,
    TaxRate, CreateTaxRateRequest, UpdateTaxRateRequest
};
use tauri::{AppHandle, Manager, State};
use chrono::{DateTime, Utc};
use std::fs;

#[tauri::command]
pub async fn get_clients(
    organization_id: String,
    db: State<'_, Database>,
) -> Result<Vec<Client>, String> {
    db.get_clients(&organization_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_client(client_id: String, db: State<'_, Database>) -> Result<Option<Client>, String> {
    db.get_client(&client_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_client(
    client: CreateClientRequest,
    db: State<'_, Database>,
) -> Result<Client, String> {
    db.create_client(client)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_client(
    client_id: String,
    updates: UpdateClientRequest,
    db: State<'_, Database>,
) -> Result<Client, String> {
    db.update_client(&client_id, updates)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_client(client_id: String, db: State<'_, Database>) -> Result<bool, String> {
    db.delete_client(&client_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_client_invoice_count(client_id: String, db: State<'_, Database>) -> Result<i64, String> {
    db.get_client_invoice_count(&client_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_invoices(
    organization_id: String,
    db: State<'_, Database>,
) -> Result<Vec<Invoice>, String> {
    db.get_invoices(&organization_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_invoice(invoice_id: String, db: State<'_, Database>) -> Result<Option<Invoice>, String> {
    db.get_invoice(&invoice_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_invoice_line_items(
    invoice_id: String,
    db: State<'_, Database>,
) -> Result<Vec<InvoiceLineItem>, String> {
    db.get_invoice_line_items(&invoice_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_invoice(
    invoice: CreateInvoiceRequest,
    db: State<'_, Database>,
) -> Result<Invoice, String> {
    db.create_invoice(invoice)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_invoice(
    invoice_id: String,
    updates: UpdateInvoiceRequest,
    db: State<'_, Database>,
) -> Result<Invoice, String> {
    db.update_invoice(&invoice_id, updates)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_invoice(invoice_id: String, db: State<'_, Database>) -> Result<bool, String> {
    db.delete_invoice(&invoice_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_organizations(db: State<'_, Database>) -> Result<Vec<Organization>, String> {
    db.get_organizations()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_organization(organization_id: String, db: State<'_, Database>) -> Result<Option<Organization>, String> {
    db.get_organization(&organization_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_organization(
    organization: CreateOrganizationRequest,
    db: State<'_, Database>,
) -> Result<Organization, String> {
    db.create_organization(organization)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_organization(
    organization_id: String,
    updates: UpdateOrganizationRequest,
    db: State<'_, Database>,
) -> Result<Organization, String> {
    db.update_organization(&organization_id, updates)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_organization(organization_id: String, db: State<'_, Database>) -> Result<bool, String> {
    db.delete_organization(&organization_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_tax_rates(
    organization_id: String,
    db: State<'_, Database>,
) -> Result<Vec<TaxRate>, String> {
    db.get_tax_rates(&organization_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_tax_rate(tax_rate_id: String, db: State<'_, Database>) -> Result<Option<TaxRate>, String> {
    db.get_tax_rate(&tax_rate_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_tax_rate(
    tax_rate: CreateTaxRateRequest,
    db: State<'_, Database>,
) -> Result<TaxRate, String> {
    db.create_tax_rate(tax_rate)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_tax_rate(
    tax_rate_id: String,
    updates: UpdateTaxRateRequest,
    db: State<'_, Database>,
) -> Result<TaxRate, String> {
    db.update_tax_rate(&tax_rate_id, updates)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_tax_rate(tax_rate_id: String, db: State<'_, Database>) -> Result<bool, String> {
    db.delete_tax_rate(&tax_rate_id)
        .await
        .map_err(|e| e.to_string())
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