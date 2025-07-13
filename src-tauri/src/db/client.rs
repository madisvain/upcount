use serde::{Deserialize, Serialize};
use sqlx::FromRow;

use super::Database;

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

impl Database {
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
}