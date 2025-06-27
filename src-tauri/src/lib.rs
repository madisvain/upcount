// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod database;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_updater::Builder::new().build())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_process::init())
    .plugin(tauri_plugin_fs::init())
    .setup(|app| {
      // Get the app data directory for the database with fallback options
      let app_dir = app.path().app_data_dir()
        .or_else(|_| {
          eprintln!("Warning: Could not access app data directory, falling back to local data dir");
          app.path().app_local_data_dir()
        })
        .or_else(|_| {
          eprintln!("Warning: Could not access local data directory, falling back to temp dir");
          app.path().temp_dir()
        })
        .map_err(|e| format!("Cannot access any writable directory: {}", e))?;
      
      // Ensure the directory exists
      std::fs::create_dir_all(&app_dir)
        .map_err(|e| format!("Failed to create app data directory '{}': {}", app_dir.display(), e))?;
      
      let db_path = app_dir.join("sqlite.db");
      let db_url = format!("sqlite://{}", db_path.display());
      
      println!("Initializing database at: {}", db_url);
      
      let db = tauri::async_runtime::block_on(async move {
        database::Database::new(&db_url).await
          .map_err(|e| format!("Failed to initialize database at '{}': {}", db_url, e))
      })?;
      
      app.manage(db);
      println!("Database initialized successfully");
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      commands::get_clients,
      commands::get_client,
      commands::create_client,
      commands::update_client,
      commands::delete_client,
      commands::get_client_invoice_count,
      commands::get_invoices,
      commands::get_invoice,
      commands::get_invoice_line_items,
      commands::create_invoice,
      commands::update_invoice,
      commands::delete_invoice,
      commands::get_organizations,
      commands::get_organization,
      commands::create_organization,
      commands::update_organization,
      commands::delete_organization,
      commands::get_tax_rates,
      commands::get_tax_rate,
      commands::create_tax_rate,
      commands::update_tax_rate,
      commands::delete_tax_rate,
      commands::get_next_invoice_number,
      commands::backup_database,
      commands::restore_database,
    ])
    .run(tauri::generate_context!())
    .map_err(|e| {
      sentry::capture_error(&e);
      e
    })
    .expect("error while running tauri application");
}
