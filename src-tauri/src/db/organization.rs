use serde::{Deserialize, Serialize};
use sqlx::FromRow;

use super::Database;

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
    #[serde(rename = "overdueCharge")]
    #[sqlx(rename = "overdueCharge")]
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
    pub date_format: Option<String>,
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
    #[serde(rename = "overdueCharge")]
    pub overdue_charge: Option<f64>,
    #[serde(rename = "customerNotes")]
    pub customer_notes: Option<String>,
    pub logo: Option<Vec<u8>>,
    #[serde(rename = "invoiceNumberFormat")]
    pub invoice_number_format: Option<String>,
    pub date_format: Option<String>,
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
    #[serde(rename = "overdueCharge")]
    pub overdue_charge: Option<f64>,
    #[serde(rename = "customerNotes")]
    pub customer_notes: Option<String>,
    pub logo: Option<Vec<u8>>,
    #[serde(rename = "invoiceNumberFormat")]
    pub invoice_number_format: Option<String>,
    #[serde(rename = "invoiceNumberCounter")]
    pub invoice_number_counter: Option<i64>,
    pub date_format: Option<String>,
}

impl Database {
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
                minimum_fraction_digits, due_days, overdueCharge, 
                customerNotes, logo, invoice_number_format, date_format
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        .bind(&organization.date_format)
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
                overdueCharge = COALESCE(?, overdueCharge),
                customerNotes = COALESCE(?, customerNotes),
                logo = COALESCE(?, logo),
                invoice_number_format = COALESCE(?, invoice_number_format),
                invoice_number_counter = COALESCE(?, invoice_number_counter),
                date_format = COALESCE(?, date_format)
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
        .bind(&updates.date_format)
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
}