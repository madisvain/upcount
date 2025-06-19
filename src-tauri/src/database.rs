use serde::{Deserialize, Serialize};
use sqlx::{FromRow, SqlitePool};

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Client {
    pub id: String,
    #[serde(rename = "organizationId")]
    #[sqlx(rename = "organizationId")]
    pub organization_id: String,
    pub name: Option<String>,
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
    pub address: Option<String>,
    pub emails: Option<String>,
    pub phone: Option<String>,
    pub website: Option<String>,
    pub registration_number: Option<String>,
    pub vatin: Option<String>,
}

pub struct Database {
    pool: SqlitePool,
}

impl Database {
    pub async fn new(database_url: &str) -> Result<Self, sqlx::Error> {
        let pool = SqlitePool::connect(database_url).await?;
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
            INSERT INTO clients (id, organizationId, name, address, emails, phone, website, registration_number, vatin)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(&client.id)
        .bind(&client.organization_id)
        .bind(&client.name)
        .bind(&client.address)
        .bind(&client.emails)
        .bind(&client.phone)
        .bind(&client.website)
        .bind(&client.registration_number)
        .bind(&client.vatin)
        .execute(&self.pool)
        .await?;

        self.get_client(&client.id).await.map(|c| c.unwrap())
    }

    pub async fn update_client(
        &self,
        client_id: &str,
        updates: UpdateClientRequest,
    ) -> Result<Client, sqlx::Error> {
        sqlx::query(
            r#"
            UPDATE clients
            SET name = ?, address = ?, emails = ?, phone = ?, website = ?, registration_number = ?, vatin = ?
            WHERE id = ?
            "#,
        )
        .bind(&updates.name)
        .bind(&updates.address)
        .bind(&updates.emails)
        .bind(&updates.phone)
        .bind(&updates.website)
        .bind(&updates.registration_number)
        .bind(&updates.vatin)
        .bind(client_id)
        .execute(&self.pool)
        .await?;

        self.get_client(client_id).await.map(|c| c.unwrap())
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

        tx.commit().await?;

        self.get_invoice(&invoice.id).await.map(|i| i.unwrap())
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

        self.get_invoice(invoice_id).await.map(|i| i.unwrap())
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
}