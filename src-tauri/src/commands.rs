use crate::database::{Client, CreateClientRequest, Database, UpdateClientRequest};
use tauri::State;

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