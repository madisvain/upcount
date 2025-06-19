// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod database;

use include_dir::{include_dir, Dir};
use tauri::Manager;
use tauri_plugin_sql::{Migration, MigrationKind};

fn load_migrations() -> Vec<Migration> {
  static MIGRATIONS_DIR: Dir = include_dir!("$CARGO_MANIFEST_DIR/migrations");

  let mut migrations: Vec<Migration> = vec![];

  for file in MIGRATIONS_DIR.files() {
    let file_name = file.path().file_name().unwrap().to_str().unwrap();

    let version = file_name[0..4].parse::<i64>().expect("Failed to parse version number");
    let sql = file.contents_utf8().expect("Migration file should not be empty");

    migrations.push(Migration {
      version,
      description: file_name,
      sql,
      kind: MigrationKind::Up,
    });
  }

  migrations
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_updater::Builder::new().build())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_sql::Builder::default().add_migrations("sqlite:sqlite.db", load_migrations()).build())
    .setup(|app| {
      // Get the app data directory where tauri-plugin-sql stores the database
      let app_dir = app.path().app_data_dir().expect("Failed to get app data dir");
      let db_path = app_dir.join("sqlite.db");
      let db_url = format!("sqlite://{}", db_path.display());
      
      let db = tauri::async_runtime::block_on(async move {
        database::Database::new(&db_url).await.expect("Failed to initialize database")
      });
      
      app.manage(db);
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
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
