use serde::{Deserialize, Serialize};
use sqlx::FromRow;

use super::Database;

// Tags
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

// Time Entries
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

impl Database {
    // Tag methods
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

    // Time Entry methods
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
}