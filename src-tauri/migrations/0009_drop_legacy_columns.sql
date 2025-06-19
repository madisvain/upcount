-- Drop legacy columns after successful migration to cents
-- SQLite 3.35+ supports DROP COLUMN

-- Drop legacy columns from invoices table
ALTER TABLE invoices DROP COLUMN total_legacy;
ALTER TABLE invoices DROP COLUMN taxTotal_legacy;
ALTER TABLE invoices DROP COLUMN subTotal_legacy;

-- Drop legacy column from invoiceLineItems table
ALTER TABLE invoiceLineItems DROP COLUMN unitPrice_legacy;