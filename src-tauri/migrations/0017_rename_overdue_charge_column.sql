-- Add new overdueCharge column with camelCase naming
ALTER TABLE organizations ADD COLUMN overdueCharge REAL DEFAULT 0;

-- Copy data from old column to new column
UPDATE organizations SET overdueCharge = overdue_charge;

-- Drop the old snake_case column
ALTER TABLE organizations DROP COLUMN overdue_charge;