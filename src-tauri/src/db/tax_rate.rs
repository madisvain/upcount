use serde::{Deserialize, Serialize};
use sqlx::FromRow;

use super::Database;

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

impl Database {
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
        let mut tx = self.pool.begin().await?;

        // If this tax rate is being set as default, unset all others for this organization
        if tax_rate.is_default == Some(1) {
            sqlx::query(
                r#"
                UPDATE taxRates
                SET isDefault = 0
                WHERE organizationId = ? AND isDefault = 1
                "#,
            )
            .bind(&tax_rate.organization_id)
            .execute(&mut *tx)
            .await?;
        }

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
        .execute(&mut *tx)
        .await?;

        tx.commit().await?;

        self.get_tax_rate(&tax_rate.id).await?
            .ok_or_else(|| sqlx::Error::RowNotFound)
    }

    pub async fn update_tax_rate(
        &self,
        tax_rate_id: &str,
        updates: UpdateTaxRateRequest,
    ) -> Result<TaxRate, sqlx::Error> {
        let mut tx = self.pool.begin().await?;

        // If this tax rate is being set as default, first get its organization ID
        // and unset all others for this organization
        if updates.is_default == Some(1) {
            // Get the organization ID for this tax rate
            let tax_rate_row = sqlx::query_as::<_, TaxRate>(
                "SELECT * FROM taxRates WHERE id = ? LIMIT 1"
            )
            .bind(tax_rate_id)
            .fetch_optional(&mut *tx)
            .await?
            .ok_or_else(|| sqlx::Error::RowNotFound)?;
            
            sqlx::query(
                r#"
                UPDATE taxRates
                SET isDefault = 0
                WHERE organizationId = ? AND id != ? AND isDefault = 1
                "#,
            )
            .bind(&tax_rate_row.organization_id)
            .bind(tax_rate_id)
            .execute(&mut *tx)
            .await?;
        }

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
        .execute(&mut *tx)
        .await?;

        tx.commit().await?;

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
}