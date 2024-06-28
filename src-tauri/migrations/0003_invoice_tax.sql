-- Add tax column to invoices table
ALTER TABLE invoices
ADD COLUMN taxTotal NUMERIC NOT NULL DEFAULT 0;
