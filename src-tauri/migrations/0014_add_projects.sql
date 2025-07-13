-- Create projects table
CREATE TABLE projects (
  id TEXT(21) PRIMARY KEY NOT NULL,
  organizationId TEXT NOT NULL,
  name TEXT NOT NULL,
  clientId TEXT,
  startDate INTEGER,
  endDate INTEGER,
  archivedAt INTEGER,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organizationId) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE SET NULL
);
CREATE INDEX idx_projects_organizationId ON projects(organizationId);
CREATE INDEX idx_projects_clientId ON projects(clientId);
CREATE INDEX idx_projects_name ON projects(name);
CREATE INDEX idx_projects_archivedAt ON projects(archivedAt);