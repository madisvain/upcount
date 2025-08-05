-- Add overdueCharge column to invoices table
ALTER TABLE invoices ADD COLUMN overdueCharge REAL DEFAULT 0;