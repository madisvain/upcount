-- Add projectId column to timeEntries table
ALTER TABLE timeEntries 
ADD COLUMN projectId TEXT;

-- Add foreign key constraint
CREATE INDEX idx_timeEntries_projectId ON timeEntries(projectId);

-- Note: Foreign key constraint will be handled at the application level
-- to avoid SQLite limitations with adding foreign keys to existing tables