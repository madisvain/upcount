use serde::{Deserialize, Serialize};
use sqlx::{FromRow, SqlitePool, sqlite::SqliteConnectOptions, migrate::MigrateDatabase};
use std::str::FromStr;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Client {
    pub id: String,
    #[serde(rename = "organizationId")]
    #[sqlx(rename = "organizationId")]
    pub organization_id: String,
    pub name: Option<String>,
    pub code: Option<String>,
    pub address: Option<String>,
    pub emails: Option<String>,
    pub phone: Option<String>,
    pub website: Option<String>,
    pub registration_number: Option<String>,
    pub vatin: Option<String>,
    #[serde(rename = "createdAt")]
    #[sqlx(rename = "createdAt")]
    pub created_at: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateClientRequest {
    pub id: String,
    #[serde(rename = "organizationId")]
    pub organization_id: String,
    pub name: Option<String>,
    pub code: Option<String>,
    pub address: Option<String>,
    pub emails: Option<String>,
    pub phone: Option<String>,
    pub website: Option<String>,
    pub registration_number: Option<String>,
    pub vatin: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Invoice {
    pub id: String,
    #[serde(rename = "organizationId")]
    #[sqlx(rename = "organizationId")]
    pub organization_id: String,
    pub number: String,
    pub state: String,
    #[serde(rename = "clientId")]
    #[sqlx(rename = "clientId")]
    pub client_id: String,
    pub date: i64,
    #[serde(rename = "dueDate")]
    #[sqlx(rename = "dueDate")]
    pub due_date: Option<i64>,
    pub currency: String,
    #[serde(rename = "customerNotes")]
    #[sqlx(rename = "customerNotes")]
    pub customer_notes: Option<String>,
    pub total: i64,  // Stored as cents
    #[serde(rename = "taxTotal")]
    #[sqlx(rename = "taxTotal")]
    pub tax_total: i64,  // Stored as cents
    #[serde(rename = "subTotal")]
    #[sqlx(rename = "subTotal")]
    pub sub_total: i64,  // Stored as cents
    #[serde(rename = "createdAt")]
    #[sqlx(rename = "createdAt")]
    pub created_at: Option<String>,
    // Only for joined queries
    #[serde(rename = "clientName")]
    #[sqlx(rename = "clientName")]
    pub client_name: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct InvoiceLineItem {
    pub id: String,
    #[serde(rename = "invoiceId")]
    #[sqlx(rename = "invoiceId")]
    pub invoice_id: String,
    pub description: Option<String>,
    pub quantity: f64,
    #[serde(rename = "unitPrice")]
    #[sqlx(rename = "unitPrice")]
    pub unit_price: i64,  // Stored as cents
    #[serde(rename = "taxRate")]
    #[sqlx(rename = "taxRate")]
    pub tax_rate: Option<String>,
    #[serde(rename = "createdAt")]
    #[sqlx(rename = "createdAt")]
    pub created_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Organization {
    pub id: String,
    pub name: Option<String>,
    pub country: Option<String>,
    pub address: Option<String>,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub website: Option<String>,
    pub registration_number: Option<String>,
    pub vatin: Option<String>,
    pub bank_name: Option<String>,
    pub iban: Option<String>,
    pub currency: Option<String>,
    pub minimum_fraction_digits: Option<i64>,
    pub due_days: Option<i64>,
    pub overdue_charge: Option<f64>,
    #[serde(rename = "customerNotes")]
    #[sqlx(rename = "customerNotes")]
    pub customer_notes: Option<String>,
    #[serde(rename = "createdAt")]
    #[sqlx(rename = "createdAt")]
    pub created_at: Option<String>,
    pub logo: Option<Vec<u8>>,
    #[serde(rename = "invoiceNumberFormat")]
    #[sqlx(rename = "invoice_number_format")]
    pub invoice_number_format: Option<String>,
    #[serde(rename = "invoiceNumberCounter")]
    #[sqlx(rename = "invoice_number_counter")]
    pub invoice_number_counter: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct CreateOrganizationRequest {
    pub id: String,
    pub name: Option<String>,
    pub country: Option<String>,
    pub address: Option<String>,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub website: Option<String>,
    pub registration_number: Option<String>,
    pub vatin: Option<String>,
    pub bank_name: Option<String>,
    pub iban: Option<String>,
    pub currency: Option<String>,
    pub minimum_fraction_digits: Option<i64>,
    pub due_days: Option<i64>,
    pub overdue_charge: Option<f64>,
    #[serde(rename = "customerNotes")]
    pub customer_notes: Option<String>,
    pub logo: Option<Vec<u8>>,
    #[serde(rename = "invoiceNumberFormat")]
    pub invoice_number_format: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateOrganizationRequest {
    pub name: Option<String>,
    pub country: Option<String>,
    pub address: Option<String>,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub website: Option<String>,
    pub registration_number: Option<String>,
    pub vatin: Option<String>,
    pub bank_name: Option<String>,
    pub iban: Option<String>,
    pub currency: Option<String>,
    pub minimum_fraction_digits: Option<i64>,
    pub due_days: Option<i64>,
    pub overdue_charge: Option<f64>,
    #[serde(rename = "customerNotes")]
    pub customer_notes: Option<String>,
    pub logo: Option<Vec<u8>>,
    #[serde(rename = "invoiceNumberFormat")]
    pub invoice_number_format: Option<String>,
    #[serde(rename = "invoiceNumberCounter")]
    pub invoice_number_counter: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct TaxRate {
    pub id: String,
    #[serde(rename = "organizationId")]
    #[sqlx(rename = "organizationId")]
    pub organization_id: String,
    pub name: String,
    pub description: Option<String>,
    pub percentage: f64,
    #[serde(rename = "isDefault")]
    #[sqlx(rename = "isDefault")]
    pub is_default: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct CreateTaxRateRequest {
    pub id: String,
    #[serde(rename = "organizationId")]
    pub organization_id: String,
    pub name: String,
    pub description: Option<String>,
    pub percentage: f64,
    #[serde(rename = "isDefault")]
    pub is_default: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateTaxRateRequest {
    pub name: Option<String>,
    pub description: Option<String>,
    pub percentage: Option<f64>,
    #[serde(rename = "isDefault")]
    pub is_default: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct CreateInvoiceRequest {
    pub id: String,
    #[serde(rename = "organizationId")]
    pub organization_id: String,
    pub number: String,
    pub state: String,
    #[serde(rename = "clientId")]
    pub client_id: String,
    pub date: i64,
    #[serde(rename = "dueDate")]
    pub due_date: Option<i64>,
    pub currency: String,
    #[serde(rename = "customerNotes")]
    pub customer_notes: Option<String>,
    pub total: i64,  // Stored as cents
    #[serde(rename = "taxTotal")]
    pub tax_total: i64,  // Stored as cents
    #[serde(rename = "subTotal")]
    pub sub_total: i64,  // Stored as cents
    #[serde(rename = "lineItems")]
    pub line_items: Vec<CreateInvoiceLineItemRequest>,
}

#[derive(Debug, Deserialize)]
pub struct CreateInvoiceLineItemRequest {
    pub description: Option<String>,
    pub quantity: f64,
    #[serde(rename = "unitPrice")]
    pub unit_price: f64,
    #[serde(rename = "taxRate")]
    pub tax_rate: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateInvoiceRequest {
    pub number: Option<String>,
    pub state: Option<String>,
    #[serde(rename = "clientId")]
    pub client_id: Option<String>,
    pub date: Option<i64>,
    #[serde(rename = "dueDate")]
    pub due_date: Option<i64>,
    pub currency: Option<String>,
    #[serde(rename = "customerNotes")]
    pub customer_notes: Option<String>,
    pub total: Option<i64>,  // Stored as cents
    #[serde(rename = "taxTotal")]
    pub tax_total: Option<i64>,  // Stored as cents
    #[serde(rename = "subTotal")]
    pub sub_total: Option<i64>,  // Stored as cents
    #[serde(rename = "lineItems")]
    pub line_items: Option<Vec<CreateInvoiceLineItemRequest>>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateClientRequest {
    pub name: Option<String>,
    pub code: Option<String>,
    pub address: Option<String>,
    pub emails: Option<String>,
    pub phone: Option<String>,
    pub website: Option<String>,
    pub registration_number: Option<String>,
    pub vatin: Option<String>,
}

// Time Tracking Models
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Tag {
    pub id: String,
    #[serde(rename = "organizationId")]
    #[sqlx(rename = "organizationId")]
    pub organization_id: String,
    pub name: String,
    pub color: String,
    #[serde(rename = "createdAt")]
    #[sqlx(rename = "createdAt")]
    pub created_at: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateTagRequest {
    pub id: String,
    #[serde(rename = "organizationId")]
    pub organization_id: String,
    pub name: String,
    pub color: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateTagRequest {
    pub name: Option<String>,
    pub color: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct TimeEntry {
    pub id: String,
    #[serde(rename = "organizationId")]
    #[sqlx(rename = "organizationId")]
    pub organization_id: String,
    #[serde(rename = "clientId")]
    #[sqlx(rename = "clientId")]
    pub client_id: Option<String>,
    pub description: Option<String>,
    #[serde(rename = "startTime")]
    #[sqlx(rename = "startTime")]
    pub start_time: i64,
    #[serde(rename = "endTime")]
    #[sqlx(rename = "endTime")]
    pub end_time: Option<i64>,
    pub duration: i64,
    pub tags: Option<String>, // JSON array of tag names
    #[serde(rename = "isBillable")]
    #[sqlx(rename = "isBillable")]
    pub is_billable: i64,
    #[serde(rename = "hourlyRate")]
    #[sqlx(rename = "hourlyRate")]
    pub hourly_rate: Option<f64>,
    #[serde(rename = "createdAt")]
    #[sqlx(rename = "createdAt")]
    pub created_at: Option<String>,
    // Only for joined queries
    #[serde(rename = "clientName")]
    #[sqlx(rename = "clientName")]
    pub client_name: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateTimeEntryRequest {
    pub id: String,
    #[serde(rename = "organizationId")]
    pub organization_id: String,
    #[serde(rename = "clientId")]
    pub client_id: Option<String>,
    pub description: Option<String>,
    #[serde(rename = "startTime")]
    pub start_time: i64,
    #[serde(rename = "endTime")]
    pub end_time: Option<i64>,
    pub duration: i64,
    pub tags: Option<String>, // JSON array of tag names
    #[serde(rename = "isBillable")]
    pub is_billable: i64,
    #[serde(rename = "hourlyRate")]
    pub hourly_rate: Option<f64>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateTimeEntryRequest {
    #[serde(rename = "clientId")]
    pub client_id: Option<String>,
    pub description: Option<String>,
    #[serde(rename = "startTime")]
    pub start_time: Option<i64>,
    #[serde(rename = "endTime")]
    pub end_time: Option<i64>,
    pub duration: Option<i64>,
    pub tags: Option<String>, // JSON array of tag names
    #[serde(rename = "isBillable")]
    pub is_billable: Option<i64>,
    #[serde(rename = "hourlyRate")]
    pub hourly_rate: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Project {
    pub id: String,
    #[serde(rename = "organizationId")]
    #[sqlx(rename = "organizationId")]
    pub organization_id: String,
    pub name: String,
    #[serde(rename = "clientId")]
    #[sqlx(rename = "clientId")]
    pub client_id: Option<String>,
    #[serde(rename = "startDate")]
    #[sqlx(rename = "startDate")]
    pub start_date: Option<i64>,
    #[serde(rename = "endDate")]
    #[sqlx(rename = "endDate")]
    pub end_date: Option<i64>,
    #[serde(rename = "archivedAt")]
    #[sqlx(rename = "archivedAt")]
    pub archived_at: Option<i64>,
    #[serde(rename = "createdAt")]
    #[sqlx(rename = "createdAt")]
    pub created_at: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateProjectRequest {
    pub id: String,
    #[serde(rename = "organizationId")]
    pub organization_id: String,
    pub name: String,
    #[serde(rename = "clientId")]
    pub client_id: Option<String>,
    #[serde(rename = "startDate")]
    pub start_date: Option<i64>,
    #[serde(rename = "endDate")]
    pub end_date: Option<i64>,
    #[serde(rename = "archivedAt")]
    pub archived_at: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProjectRequest {
    pub name: Option<String>,
    #[serde(rename = "clientId")]
    pub client_id: Option<String>,
    #[serde(rename = "startDate")]
    pub start_date: Option<i64>,
    #[serde(rename = "endDate")]
    pub end_date: Option<i64>,
    #[serde(rename = "archivedAt")]
    pub archived_at: Option<i64>,
}

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

    pub async fn get_clients(&self, organization_id: &str) -> Result<Vec<Client>, sqlx::Error> {
        sqlx::query_as::<_, Client>(
            r#"
            SELECT *
            FROM clients
            WHERE organizationId = ?
            ORDER BY name ASC
            "#,
        )
        .bind(organization_id)
        .fetch_all(&self.pool)
        .await
    }

    pub async fn get_client(&self, client_id: &str) -> Result<Option<Client>, sqlx::Error> {
        sqlx::query_as::<_, Client>(
            r#"
            SELECT *
            FROM clients
            WHERE id = ?
            LIMIT 1
            "#,
        )
        .bind(client_id)
        .fetch_optional(&self.pool)
        .await
    }

    pub async fn create_client(&self, client: CreateClientRequest) -> Result<Client, sqlx::Error> {
        sqlx::query(
            r#"
            INSERT INTO clients (id, organizationId, name, code, address, emails, phone, website, registration_number, vatin)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(&client.id)
        .bind(&client.organization_id)
        .bind(&client.name)
        .bind(&client.code)
        .bind(&client.address)
        .bind(&client.emails)
        .bind(&client.phone)
        .bind(&client.website)
        .bind(&client.registration_number)
        .bind(&client.vatin)
        .execute(&self.pool)
        .await?;

        self.get_client(&client.id).await?
            .ok_or_else(|| sqlx::Error::RowNotFound)
    }

    pub async fn update_client(
        &self,
        client_id: &str,
        updates: UpdateClientRequest,
    ) -> Result<Client, sqlx::Error> {
        sqlx::query(
            r#"
            UPDATE clients
            SET name = ?, code = ?, address = ?, emails = ?, phone = ?, website = ?, registration_number = ?, vatin = ?
            WHERE id = ?
            "#,
        )
        .bind(&updates.name)
        .bind(&updates.code)
        .bind(&updates.address)
        .bind(&updates.emails)
        .bind(&updates.phone)
        .bind(&updates.website)
        .bind(&updates.registration_number)
        .bind(&updates.vatin)
        .bind(client_id)
        .execute(&self.pool)
        .await?;

        self.get_client(client_id).await?
            .ok_or_else(|| sqlx::Error::RowNotFound)
    }

    pub async fn delete_client(&self, client_id: &str) -> Result<bool, sqlx::Error> {
        let result = sqlx::query("DELETE FROM clients WHERE id = ?")
            .bind(client_id)
            .execute(&self.pool)
            .await?;

        Ok(result.rows_affected() > 0)
    }

    pub async fn get_client_invoice_count(&self, client_id: &str) -> Result<i64, sqlx::Error> {
        let result = sqlx::query_scalar::<_, i64>(
            "SELECT COUNT(*) FROM invoices WHERE clientId = ?"
        )
        .bind(client_id)
        .fetch_one(&self.pool)
        .await?;

        Ok(result)
    }

    pub async fn get_invoices(&self, organization_id: &str) -> Result<Vec<Invoice>, sqlx::Error> {
        sqlx::query_as::<_, Invoice>(
            r#"
            SELECT
                invoices.*,
                clients.name AS clientName
            FROM
                invoices
            INNER JOIN
                clients ON invoices.clientId = clients.id
            WHERE
                invoices.organizationId = ?
            ORDER BY
                invoices.date DESC
            "#,
        )
        .bind(organization_id)
        .fetch_all(&self.pool)
        .await
    }

    pub async fn get_invoice(&self, invoice_id: &str) -> Result<Option<Invoice>, sqlx::Error> {
        sqlx::query_as::<_, Invoice>(
            r#"
            SELECT
                invoices.*,
                clients.name AS clientName
            FROM
                invoices
            INNER JOIN
                clients ON invoices.clientId = clients.id
            WHERE
                invoices.id = ?
            LIMIT 1
            "#,
        )
        .bind(invoice_id)
        .fetch_optional(&self.pool)
        .await
    }

    pub async fn get_invoice_line_items(&self, invoice_id: &str) -> Result<Vec<InvoiceLineItem>, sqlx::Error> {
        sqlx::query_as::<_, InvoiceLineItem>(
            r#"
            SELECT *
            FROM invoiceLineItems
            WHERE invoiceId = ?
            ORDER BY createdAt ASC
            "#,
        )
        .bind(invoice_id)
        .fetch_all(&self.pool)
        .await
    }

    pub async fn create_invoice(&self, invoice: CreateInvoiceRequest) -> Result<Invoice, sqlx::Error> {
        let mut tx = self.pool.begin().await?;

        // Insert invoice
        sqlx::query(
            r#"
            INSERT INTO invoices (
                id, organizationId, number, state, clientId, date, dueDate, 
                currency, customerNotes, total, taxTotal, subTotal
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(&invoice.id)
        .bind(&invoice.organization_id)
        .bind(&invoice.number)
        .bind(&invoice.state)
        .bind(&invoice.client_id)
        .bind(&invoice.date)
        .bind(&invoice.due_date)
        .bind(&invoice.currency)
        .bind(&invoice.customer_notes)
        .bind(&invoice.total)
        .bind(&invoice.tax_total)
        .bind(&invoice.sub_total)
        .execute(&mut *tx)
        .await?;

        // Insert line items
        for line_item in &invoice.line_items {
            let line_item_id = nanoid::nanoid!();
            sqlx::query(
                r#"
                INSERT INTO invoiceLineItems (id, invoiceId, description, quantity, unitPrice, taxRate)
                VALUES (?, ?, ?, ?, ?, ?)
                "#,
            )
            .bind(&line_item_id)
            .bind(&invoice.id)
            .bind(&line_item.description)
            .bind(&line_item.quantity)
            .bind(&line_item.unit_price)
            .bind(&line_item.tax_rate)
            .execute(&mut *tx)
            .await?;
        }

        // Increment the invoice counter for the organization
        sqlx::query("UPDATE organizations SET invoice_number_counter = invoice_number_counter + 1 WHERE id = ?")
            .bind(&invoice.organization_id)
            .execute(&mut *tx)
            .await?;

        tx.commit().await?;

        self.get_invoice(&invoice.id).await?
            .ok_or_else(|| sqlx::Error::RowNotFound)
    }

    pub async fn update_invoice(
        &self,
        invoice_id: &str,
        updates: UpdateInvoiceRequest,
    ) -> Result<Invoice, sqlx::Error> {
        let mut tx = self.pool.begin().await?;

        // Update invoice fields (using all fields with Option checks)
        sqlx::query(
            r#"
            UPDATE invoices
            SET number = COALESCE(?, number),
                state = COALESCE(?, state),
                clientId = COALESCE(?, clientId),
                date = COALESCE(?, date),
                dueDate = COALESCE(?, dueDate),
                currency = COALESCE(?, currency),
                customerNotes = COALESCE(?, customerNotes),
                total = COALESCE(?, total),
                taxTotal = COALESCE(?, taxTotal),
                subTotal = COALESCE(?, subTotal)
            WHERE id = ?
            "#,
        )
        .bind(&updates.number)
        .bind(&updates.state)
        .bind(&updates.client_id)
        .bind(&updates.date)
        .bind(&updates.due_date)
        .bind(&updates.currency)
        .bind(&updates.customer_notes)
        .bind(&updates.total)
        .bind(&updates.tax_total)
        .bind(&updates.sub_total)
        .bind(invoice_id)
        .execute(&mut *tx)
        .await?;

        // Update line items if provided
        if let Some(line_items) = updates.line_items {
            // Delete existing line items
            sqlx::query("DELETE FROM invoiceLineItems WHERE invoiceId = ?")
                .bind(invoice_id)
                .execute(&mut *tx)
                .await?;

            // Insert new line items
            for line_item in &line_items {
                let line_item_id = nanoid::nanoid!();
                sqlx::query(
                    r#"
                    INSERT INTO invoiceLineItems (id, invoiceId, description, quantity, unitPrice, taxRate)
                    VALUES (?, ?, ?, ?, ?, ?)
                    "#,
                )
                .bind(&line_item_id)
                .bind(invoice_id)
                .bind(&line_item.description)
                .bind(&line_item.quantity)
                .bind(&line_item.unit_price)
                .bind(&line_item.tax_rate)
                .execute(&mut *tx)
                .await?;
            }
        }

        tx.commit().await?;

        self.get_invoice(invoice_id).await?
            .ok_or_else(|| sqlx::Error::RowNotFound)
    }

    pub async fn delete_invoice(&self, invoice_id: &str) -> Result<bool, sqlx::Error> {
        let mut tx = self.pool.begin().await?;

        // Delete line items first (foreign key constraint)
        sqlx::query("DELETE FROM invoiceLineItems WHERE invoiceId = ?")
            .bind(invoice_id)
            .execute(&mut *tx)
            .await?;

        // Delete invoice
        let result = sqlx::query("DELETE FROM invoices WHERE id = ?")
            .bind(invoice_id)
            .execute(&mut *tx)
            .await?;

        tx.commit().await?;

        Ok(result.rows_affected() > 0)
    }

    pub async fn get_organizations(&self) -> Result<Vec<Organization>, sqlx::Error> {
        sqlx::query_as::<_, Organization>(
            r#"
            SELECT *
            FROM organizations
            ORDER BY name ASC
            "#,
        )
        .fetch_all(&self.pool)
        .await
    }

    pub async fn get_organization(&self, organization_id: &str) -> Result<Option<Organization>, sqlx::Error> {
        sqlx::query_as::<_, Organization>(
            r#"
            SELECT *
            FROM organizations
            WHERE id = ?
            LIMIT 1
            "#,
        )
        .bind(organization_id)
        .fetch_optional(&self.pool)
        .await
    }

    pub async fn create_organization(&self, organization: CreateOrganizationRequest) -> Result<Organization, sqlx::Error> {
        sqlx::query(
            r#"
            INSERT INTO organizations (
                id, name, country, address, email, phone, website, 
                registration_number, vatin, bank_name, iban, currency,
                minimum_fraction_digits, due_days, overdue_charge, 
                customerNotes, logo, invoice_number_format
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(&organization.id)
        .bind(&organization.name)
        .bind(&organization.country)
        .bind(&organization.address)
        .bind(&organization.email)
        .bind(&organization.phone)
        .bind(&organization.website)
        .bind(&organization.registration_number)
        .bind(&organization.vatin)
        .bind(&organization.bank_name)
        .bind(&organization.iban)
        .bind(&organization.currency)
        .bind(&organization.minimum_fraction_digits)
        .bind(&organization.due_days)
        .bind(&organization.overdue_charge)
        .bind(&organization.customer_notes)
        .bind(&organization.logo)
        .bind(&organization.invoice_number_format)
        .execute(&self.pool)
        .await?;

        self.get_organization(&organization.id).await?
            .ok_or_else(|| sqlx::Error::RowNotFound)
    }

    pub async fn update_organization(
        &self,
        organization_id: &str,
        updates: UpdateOrganizationRequest,
    ) -> Result<Organization, sqlx::Error> {
        sqlx::query(
            r#"
            UPDATE organizations
            SET name = COALESCE(?, name),
                country = COALESCE(?, country),
                address = COALESCE(?, address),
                email = COALESCE(?, email),
                phone = COALESCE(?, phone),
                website = COALESCE(?, website),
                registration_number = COALESCE(?, registration_number),
                vatin = COALESCE(?, vatin),
                bank_name = COALESCE(?, bank_name),
                iban = COALESCE(?, iban),
                currency = COALESCE(?, currency),
                minimum_fraction_digits = COALESCE(?, minimum_fraction_digits),
                due_days = COALESCE(?, due_days),
                overdue_charge = COALESCE(?, overdue_charge),
                customerNotes = COALESCE(?, customerNotes),
                logo = COALESCE(?, logo),
                invoice_number_format = COALESCE(?, invoice_number_format),
                invoice_number_counter = COALESCE(?, invoice_number_counter)
            WHERE id = ?
            "#,
        )
        .bind(&updates.name)
        .bind(&updates.country)
        .bind(&updates.address)
        .bind(&updates.email)
        .bind(&updates.phone)
        .bind(&updates.website)
        .bind(&updates.registration_number)
        .bind(&updates.vatin)
        .bind(&updates.bank_name)
        .bind(&updates.iban)
        .bind(&updates.currency)
        .bind(&updates.minimum_fraction_digits)
        .bind(&updates.due_days)
        .bind(&updates.overdue_charge)
        .bind(&updates.customer_notes)
        .bind(&updates.logo)
        .bind(&updates.invoice_number_format)
        .bind(&updates.invoice_number_counter)
        .bind(organization_id)
        .execute(&self.pool)
        .await?;

        self.get_organization(organization_id).await?
            .ok_or_else(|| sqlx::Error::RowNotFound)
    }

    pub async fn delete_organization(&self, organization_id: &str) -> Result<bool, sqlx::Error> {
        let result = sqlx::query("DELETE FROM organizations WHERE id = ?")
            .bind(organization_id)
            .execute(&self.pool)
            .await?;

        Ok(result.rows_affected() > 0)
    }

    pub async fn get_tax_rates(&self, organization_id: &str) -> Result<Vec<TaxRate>, sqlx::Error> {
        sqlx::query_as::<_, TaxRate>(
            r#"
            SELECT *
            FROM taxRates
            WHERE organizationId = ?
            ORDER BY name ASC
            "#,
        )
        .bind(organization_id)
        .fetch_all(&self.pool)
        .await
    }

    pub async fn get_tax_rate(&self, tax_rate_id: &str) -> Result<Option<TaxRate>, sqlx::Error> {
        sqlx::query_as::<_, TaxRate>(
            r#"
            SELECT *
            FROM taxRates
            WHERE id = ?
            LIMIT 1
            "#,
        )
        .bind(tax_rate_id)
        .fetch_optional(&self.pool)
        .await
    }

    pub async fn create_tax_rate(&self, tax_rate: CreateTaxRateRequest) -> Result<TaxRate, sqlx::Error> {
        sqlx::query(
            r#"
            INSERT INTO taxRates (id, organizationId, name, description, percentage, isDefault)
            VALUES (?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(&tax_rate.id)
        .bind(&tax_rate.organization_id)
        .bind(&tax_rate.name)
        .bind(&tax_rate.description)
        .bind(&tax_rate.percentage)
        .bind(&tax_rate.is_default)
        .execute(&self.pool)
        .await?;

        self.get_tax_rate(&tax_rate.id).await?
            .ok_or_else(|| sqlx::Error::RowNotFound)
    }

    pub async fn update_tax_rate(
        &self,
        tax_rate_id: &str,
        updates: UpdateTaxRateRequest,
    ) -> Result<TaxRate, sqlx::Error> {
        sqlx::query(
            r#"
            UPDATE taxRates
            SET name = COALESCE(?, name),
                description = COALESCE(?, description),
                percentage = COALESCE(?, percentage),
                isDefault = COALESCE(?, isDefault)
            WHERE id = ?
            "#,
        )
        .bind(&updates.name)
        .bind(&updates.description)
        .bind(&updates.percentage)
        .bind(&updates.is_default)
        .bind(tax_rate_id)
        .execute(&self.pool)
        .await?;

        self.get_tax_rate(tax_rate_id).await?
            .ok_or_else(|| sqlx::Error::RowNotFound)
    }

    pub async fn delete_tax_rate(&self, tax_rate_id: &str) -> Result<bool, sqlx::Error> {
        let result = sqlx::query("DELETE FROM taxRates WHERE id = ?")
            .bind(tax_rate_id)
            .execute(&self.pool)
            .await?;

        Ok(result.rows_affected() > 0)
    }

    // Time Tracking Methods
    
    // Tags
    pub async fn get_tags(&self, organization_id: &str) -> Result<Vec<Tag>, sqlx::Error> {
        sqlx::query_as::<_, Tag>("SELECT * FROM tags WHERE organizationId = ? ORDER BY name")
            .bind(organization_id)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn get_tag(&self, tag_id: &str) -> Result<Option<Tag>, sqlx::Error> {
        sqlx::query_as::<_, Tag>("SELECT * FROM tags WHERE id = ?")
            .bind(tag_id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn create_tag(&self, tag: CreateTagRequest) -> Result<Tag, sqlx::Error> {
        sqlx::query(
            "INSERT INTO tags (id, organizationId, name, color) VALUES (?, ?, ?, ?)"
        )
        .bind(&tag.id)
        .bind(&tag.organization_id)
        .bind(&tag.name)
        .bind(&tag.color)
        .execute(&self.pool)
        .await?;

        self.get_tag(&tag.id).await?
            .ok_or_else(|| sqlx::Error::RowNotFound)
    }

    pub async fn update_tag(&self, tag_id: &str, updates: UpdateTagRequest) -> Result<Tag, sqlx::Error> {
        sqlx::query(
            "UPDATE tags SET name = COALESCE(?, name), color = COALESCE(?, color) WHERE id = ?"
        )
        .bind(&updates.name)
        .bind(&updates.color)
        .bind(tag_id)
        .execute(&self.pool)
        .await?;

        self.get_tag(tag_id).await?
            .ok_or_else(|| sqlx::Error::RowNotFound)
    }

    pub async fn delete_tag(&self, tag_id: &str) -> Result<bool, sqlx::Error> {
        let result = sqlx::query("DELETE FROM tags WHERE id = ?")
            .bind(tag_id)
            .execute(&self.pool)
            .await?;

        Ok(result.rows_affected() > 0)
    }

    // Time Entries
    pub async fn get_time_entries(&self, organization_id: &str) -> Result<Vec<TimeEntry>, sqlx::Error> {
        sqlx::query_as::<_, TimeEntry>(
            "SELECT t.*, c.name as clientName 
             FROM timeEntries t 
             LEFT JOIN clients c ON t.clientId = c.id 
             WHERE t.organizationId = ? 
             ORDER BY t.startTime DESC"
        )
        .bind(organization_id)
        .fetch_all(&self.pool)
        .await
    }

    pub async fn get_time_entry(&self, time_entry_id: &str) -> Result<Option<TimeEntry>, sqlx::Error> {
        sqlx::query_as::<_, TimeEntry>(
            "SELECT t.*, c.name as clientName 
             FROM timeEntries t 
             LEFT JOIN clients c ON t.clientId = c.id 
             WHERE t.id = ?"
        )
        .bind(time_entry_id)
        .fetch_optional(&self.pool)
        .await
    }

    pub async fn create_time_entry(&self, time_entry: CreateTimeEntryRequest) -> Result<TimeEntry, sqlx::Error> {
        sqlx::query(
            "INSERT INTO timeEntries (id, organizationId, clientId, description, startTime, endTime, duration, tags, isBillable, hourlyRate) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(&time_entry.id)
        .bind(&time_entry.organization_id)
        .bind(&time_entry.client_id)
        .bind(&time_entry.description)
        .bind(&time_entry.start_time)
        .bind(&time_entry.end_time)
        .bind(&time_entry.duration)
        .bind(&time_entry.tags)
        .bind(&time_entry.is_billable)
        .bind(&time_entry.hourly_rate)
        .execute(&self.pool)
        .await?;

        self.get_time_entry(&time_entry.id).await?
            .ok_or_else(|| sqlx::Error::RowNotFound)
    }

    pub async fn update_time_entry(&self, time_entry_id: &str, updates: UpdateTimeEntryRequest) -> Result<TimeEntry, sqlx::Error> {
        sqlx::query(
            "UPDATE timeEntries SET 
             clientId = COALESCE(?, clientId),
             description = COALESCE(?, description),
             startTime = COALESCE(?, startTime),
             endTime = COALESCE(?, endTime),
             duration = COALESCE(?, duration),
             tags = COALESCE(?, tags),
             isBillable = COALESCE(?, isBillable),
             hourlyRate = COALESCE(?, hourlyRate)
             WHERE id = ?"
        )
        .bind(&updates.client_id)
        .bind(&updates.description)
        .bind(&updates.start_time)
        .bind(&updates.end_time)
        .bind(&updates.duration)
        .bind(&updates.tags)
        .bind(&updates.is_billable)
        .bind(&updates.hourly_rate)
        .bind(time_entry_id)
        .execute(&self.pool)
        .await?;

        self.get_time_entry(time_entry_id).await?
            .ok_or_else(|| sqlx::Error::RowNotFound)
    }

    pub async fn delete_time_entry(&self, time_entry_id: &str) -> Result<bool, sqlx::Error> {
        let result = sqlx::query("DELETE FROM timeEntries WHERE id = ?")
            .bind(time_entry_id)
            .execute(&self.pool)
            .await?;

        Ok(result.rows_affected() > 0)
    }

    // Project methods
    pub async fn get_projects(&self, organization_id: &str) -> Result<Vec<Project>, sqlx::Error> {
        let projects = sqlx::query_as::<_, Project>(
            "SELECT * FROM projects WHERE organizationId = ? ORDER BY name ASC"
        )
        .bind(organization_id)
        .fetch_all(&self.pool)
        .await?;

        Ok(projects)
    }

    pub async fn get_project(&self, project_id: &str) -> Result<Option<Project>, sqlx::Error> {
        let project = sqlx::query_as::<_, Project>(
            "SELECT * FROM projects WHERE id = ?"
        )
        .bind(project_id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(project)
    }

    pub async fn create_project(&self, project: CreateProjectRequest) -> Result<Project, sqlx::Error> {
        sqlx::query(
            r#"
            INSERT INTO projects (id, organizationId, name, clientId, startDate, endDate, archivedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(&project.id)
        .bind(&project.organization_id)
        .bind(&project.name)
        .bind(&project.client_id)
        .bind(&project.start_date)
        .bind(&project.end_date)
        .bind(&project.archived_at)
        .execute(&self.pool)
        .await?;

        let created_project = self.get_project(&project.id).await?;
        Ok(created_project.unwrap())
    }

    pub async fn update_project(&self, project_id: &str, updates: UpdateProjectRequest) -> Result<Project, sqlx::Error> {
        // Use individual queries for each field to avoid complex dynamic binding
        if let Some(name) = &updates.name {
            sqlx::query("UPDATE projects SET name = ? WHERE id = ?")
                .bind(name)
                .bind(project_id)
                .execute(&self.pool)
                .await?;
        }
        if updates.client_id.is_some() {
            sqlx::query("UPDATE projects SET clientId = ? WHERE id = ?")
                .bind(&updates.client_id)
                .bind(project_id)
                .execute(&self.pool)
                .await?;
        }
        if updates.start_date.is_some() {
            sqlx::query("UPDATE projects SET startDate = ? WHERE id = ?")
                .bind(&updates.start_date)
                .bind(project_id)
                .execute(&self.pool)
                .await?;
        }
        if updates.end_date.is_some() {
            sqlx::query("UPDATE projects SET endDate = ? WHERE id = ?")
                .bind(&updates.end_date)
                .bind(project_id)
                .execute(&self.pool)
                .await?;
        }
        if updates.archived_at.is_some() {
            sqlx::query("UPDATE projects SET archivedAt = ? WHERE id = ?")
                .bind(&updates.archived_at)
                .bind(project_id)
                .execute(&self.pool)
                .await?;
        }

        let updated_project = self.get_project(project_id).await?;
        Ok(updated_project.unwrap())
    }
}