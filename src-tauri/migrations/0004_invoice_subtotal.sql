-- Add subTotal column to invoices table
ALTER TABLE invoices
ADD COLUMN subTotal NUMERIC NOT NULL DEFAULT 0;