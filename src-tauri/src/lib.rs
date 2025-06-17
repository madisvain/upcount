// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use include_dir::{include_dir, Dir};
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
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
