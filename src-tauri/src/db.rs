// Modern Rust 2018+ module structure
// Splits the large database.rs file into manageable modules

pub mod client;
pub mod project;
pub mod organization;
pub mod invoice;
pub mod tax_rate;
pub mod time_tracking;

// Re-export all public types for easy access
pub use client::*;
pub use project::*;
pub use organization::*;
pub use invoice::*;
pub use tax_rate::*;
pub use time_tracking::*;

use sqlx::{SqlitePool, sqlite::SqliteConnectOptions, migrate::MigrateDatabase};
use std::str::FromStr;

/// Main Database struct that holds the connection pool
pub struct Database {
    pool: SqlitePool,
}

impl Database {
    pub async fn new(database_url: &str) -> Result<Self, sqlx::Error> {
        // Ensure database exists
        let db_exists = sqlx::Sqlite::database_exists(database_url).await
            .map_err(|e| sqlx::Error::Configuration(format!("Failed to check if database exists: {}", e).into()))?;
        
        if !db_exists {
            println!("Creating new database at: {}", database_url);
            sqlx::Sqlite::create_database(database_url).await
                .map_err(|e| sqlx::Error::Configuration(format!("Failed to create database: {}", e).into()))?;
        }
        
        let options = SqliteConnectOptions::from_str(database_url)?
            .create_if_missing(true);
        let pool = SqlitePool::connect_with(options).await?;
        
        // Check SQLite version before running migrations
        let sqlite_version = sqlx::query_scalar::<_, String>("SELECT sqlite_version()")
            .fetch_one(&pool)
            .await?;
        
        println!("SQLite version: {}", sqlite_version);
        
        // Check if SQLite version supports required features (minimum 3.35 for DROP COLUMN)
        let version_parts: Vec<u32> = sqlite_version
            .split('.')
            .take(3)
            .filter_map(|s| s.parse().ok())
            .collect();
        
        if version_parts.len() >= 2 {
            let major = version_parts[0];
            let minor = version_parts.get(1).unwrap_or(&0);
            let _patch = version_parts.get(2).unwrap_or(&0);
            
            if major < 3 || (major == 3 && minor < &35) {
                eprintln!("Warning: SQLite version {} may not support all migration features. Minimum recommended: 3.35", sqlite_version);
            }
        }
        
        // Run migrations - use embedded migrations for production builds
        let migrator = sqlx::migrate!("./migrations");
        
        migrator.run(&pool).await
            .map_err(|e| sqlx::Error::Configuration(format!("Migration failed: {}", e).into()))?;
        
        Ok(Self { pool })
    }
}

// Usage example:
// Instead of:
//   use crate::database::{Database, Client, Project, CreateClientRequest};
// 
// You can now use:
//   use crate::db::{Database, Client, Project, CreateClientRequest};
// 
// And the file structure would be:
// src/
// ├── db.rs                    <- Module definition and Database struct
// ├── db/
// │   ├── client.rs           <- Client, CreateClientRequest, UpdateClientRequest + methods
// │   ├── project.rs          <- Project, CreateProjectRequest, UpdateProjectRequest + methods  
// │   ├── organization.rs     <- Organization + methods
// │   ├── invoice.rs          <- Invoice, InvoiceLineItem + methods
// │   ├── tax_rate.rs         <- TaxRate + methods
// │   └── time_tracking.rs    <- Tag, TimeEntry + methods (or split further)
// ├── commands.rs
// ├── lib.rs
// └── main.rs