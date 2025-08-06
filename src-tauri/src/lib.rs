// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod db;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_updater::Builder::new().build())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_process::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_http::init())
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
        db::Database::new(&db_url).await
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
      commands::update_invoice_state,
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
      commands::backup_database,
      commands::restore_database,
      commands::get_tags,
      commands::get_tag,
      commands::create_tag,
      commands::update_tag,
      commands::delete_tag,
      commands::get_time_entries,
      commands::get_time_entry,
      commands::create_time_entry,
      commands::update_time_entry,
      commands::delete_time_entry,
      commands::get_projects,
      commands::get_project,
      commands::create_project,
      commands::update_project,
    ])
    .run(tauri::generate_context!())
    .map_err(|e| {
      sentry::capture_error(&e);
      e
    })
    .expect("error while running tauri application");
}
