-- Switch to using cents columns after verification
-- This migration should only be run after verifying that all _cents columns contain correct values

-- Backup original columns by renaming them
ALTER TABLE invoices RENAME COLUMN total TO total_legacy;
ALTER TABLE invoices RENAME COLUMN taxTotal TO taxTotal_legacy;
ALTER TABLE invoices RENAME COLUMN subTotal TO subTotal_legacy;

ALTER TABLE invoiceLineItems RENAME COLUMN unitPrice TO unitPrice_legacy;

-- Rename cents columns to be the primary columns
ALTER TABLE invoices RENAME COLUMN total_cents TO total;
ALTER TABLE invoices RENAME COLUMN taxTotal_cents TO taxTotal;
ALTER TABLE invoices RENAME COLUMN subTotal_cents TO subTotal;

ALTER TABLE invoiceLineItems RENAME COLUMN unitPrice_cents TO unitPrice;

-- Note: The legacy columns can be dropped later with:
-- ALTER TABLE invoices DROP COLUMN total_legacy;
-- ALTER TABLE invoices DROP COLUMN taxTotal_legacy;
-- ALTER TABLE invoices DROP COLUMN subTotal_legacy;
-- ALTER TABLE invoiceLineItems DROP COLUMN unitPrice_legacy;