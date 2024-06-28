-- Add total column to invoices table
ALTER TABLE invoices
ADD COLUMN total NUMERIC NOT NULL DEFAULT 0;