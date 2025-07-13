use serde::{Deserialize, Serialize};
use sqlx::FromRow;

use super::Database;

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
    #[serde(rename = "clientName")]
    #[sqlx(rename = "clientName")]
    pub client_name: Option<String>,
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

impl Database {
    // Project methods
    pub async fn get_projects(&self, organization_id: &str) -> Result<Vec<Project>, sqlx::Error> {
        let projects = sqlx::query_as::<_, Project>(
            "SELECT p.id, p.organizationId, p.name, p.clientId, c.name as clientName, p.startDate, p.endDate, p.archivedAt, p.createdAt 
             FROM projects p 
             LEFT JOIN clients c ON p.clientId = c.id 
             WHERE p.organizationId = ? 
             ORDER BY p.name ASC"
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