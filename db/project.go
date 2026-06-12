package db

import "fmt"

// Project mirrors the projects table (with an optional joined clientName).
type Project struct {
	ID             string  `db:"id"             json:"id"`
	OrganizationID string  `db:"organizationId" json:"organizationId"`
	Name           string  `db:"name"           json:"name"`
	ClientID       *string `db:"clientId"       json:"clientId"`
	ClientName     *string `db:"clientName"     json:"clientName"`
	StartDate      *int64  `db:"startDate"      json:"startDate"`
	EndDate        *int64  `db:"endDate"        json:"endDate"`
	ArchivedAt     *int64  `db:"archivedAt"     json:"archivedAt"`
	CreatedAt      *string `db:"createdAt"      json:"createdAt"`
}

// CreateProjectRequest is the payload for creating a project.
type CreateProjectRequest struct {
	ID             string  `json:"id"`
	OrganizationID string  `json:"organizationId"`
	Name           string  `json:"name"`
	ClientID       *string `json:"clientId"`
	StartDate      *int64  `json:"startDate"`
	EndDate        *int64  `json:"endDate"`
	ArchivedAt     *int64  `json:"archivedAt"`
}

// UpdateProjectRequest is the payload for updating a project.
type UpdateProjectRequest struct {
	Name       *string `json:"name"`
	ClientID   *string `json:"clientId"`
	StartDate  *int64  `json:"startDate"`
	EndDate    *int64  `json:"endDate"`
	ArchivedAt *int64  `json:"archivedAt"`
}

func (d *Database) GetProjects(organizationID string) ([]Project, error) {
	projects := []Project{}
	err := d.DB.Select(&projects, `
		SELECT p.id, p.organizationId, p.name, p.clientId, c.name AS clientName,
		       p.startDate, p.endDate, p.archivedAt, p.createdAt
		FROM projects p
		LEFT JOIN clients c ON p.clientId = c.id
		WHERE p.organizationId = ?
		ORDER BY p.name ASC`,
		organizationID,
	)
	if err != nil {
		return nil, fmt.Errorf("get_projects: %w", err)
	}
	return projects, nil
}

func (d *Database) GetProject(projectID string) (*Project, error) {
	var project Project
	err := d.DB.Get(&project, `
		SELECT p.id, p.organizationId, p.name, p.clientId, c.name AS clientName,
		       p.startDate, p.endDate, p.archivedAt, p.createdAt
		FROM projects p
		LEFT JOIN clients c ON p.clientId = c.id
		WHERE p.id = ?`,
		projectID,
	)
	if err != nil {
		return nil, fmt.Errorf("get_project: %w", err)
	}
	return &project, nil
}

func (d *Database) CreateProject(req CreateProjectRequest) (*Project, error) {
	_, err := d.DB.Exec(`
		INSERT INTO projects (id, organizationId, name, clientId, startDate, endDate, archivedAt)
		VALUES (?, ?, ?, ?, ?, ?, ?)`,
		req.ID, req.OrganizationID, req.Name, req.ClientID,
		req.StartDate, req.EndDate, req.ArchivedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("create_project: %w", err)
	}
	return d.GetProject(req.ID)
}

func (d *Database) DeleteProject(projectID string) (bool, error) {
	tx, err := d.DB.Beginx()
	if err != nil {
		return false, fmt.Errorf("delete_project begin: %w", err)
	}
	defer tx.Rollback() //nolint:errcheck

	// projectId has no DB-level FK on timeEntries (migration 0015); null it out manually.
	if _, err = tx.Exec(`UPDATE timeEntries SET projectId = NULL WHERE projectId = ?`, projectID); err != nil {
		return false, fmt.Errorf("delete_project nullify_entries: %w", err)
	}

	res, err := tx.Exec(`DELETE FROM projects WHERE id = ?`, projectID)
	if err != nil {
		return false, fmt.Errorf("delete_project: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return false, fmt.Errorf("delete_project commit: %w", err)
	}

	n, _ := res.RowsAffected()
	return n > 0, nil
}

func (d *Database) UpdateProject(projectID string, updates UpdateProjectRequest) (*Project, error) {
	if updates.Name != nil {
		if _, err := d.DB.Exec(`UPDATE projects SET name = ? WHERE id = ?`, updates.Name, projectID); err != nil {
			return nil, fmt.Errorf("update_project name: %w", err)
		}
	}
	if updates.ClientID != nil {
		if _, err := d.DB.Exec(`UPDATE projects SET clientId = ? WHERE id = ?`, updates.ClientID, projectID); err != nil {
			return nil, fmt.Errorf("update_project clientId: %w", err)
		}
	}
	if updates.StartDate != nil {
		if _, err := d.DB.Exec(`UPDATE projects SET startDate = ? WHERE id = ?`, updates.StartDate, projectID); err != nil {
			return nil, fmt.Errorf("update_project startDate: %w", err)
		}
	}
	if updates.EndDate != nil {
		if _, err := d.DB.Exec(`UPDATE projects SET endDate = ? WHERE id = ?`, updates.EndDate, projectID); err != nil {
			return nil, fmt.Errorf("update_project endDate: %w", err)
		}
	}
	if updates.ArchivedAt != nil {
		if _, err := d.DB.Exec(`UPDATE projects SET archivedAt = ? WHERE id = ?`, updates.ArchivedAt, projectID); err != nil {
			return nil, fmt.Errorf("update_project archivedAt: %w", err)
		}
	}
	return d.GetProject(projectID)
}
