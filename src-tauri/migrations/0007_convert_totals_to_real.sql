-- Add new columns for cents values to safely migrate monetary data
-- This allows verification before switching over

-- Add new columns to invoices table for cents values
ALTER TABLE invoices ADD COLUMN total_cents INTEGER;
ALTER TABLE invoices ADD COLUMN taxTotal_cents INTEGER;
ALTER TABLE invoices ADD COLUMN subTotal_cents INTEGER;

-- Add new column to invoiceLineItems for cents values
ALTER TABLE invoiceLineItems ADD COLUMN unitPrice_cents INTEGER;

-- Populate cents columns with converted values
-- Convert ALL values to cents regardless of type
UPDATE invoices 
SET total_cents = CAST(ROUND(total * 100) AS INTEGER);

UPDATE invoices 
SET taxTotal_cents = CAST(ROUND(taxTotal * 100) AS INTEGER);

UPDATE invoices 
SET subTotal_cents = CAST(ROUND(subTotal * 100) AS INTEGER);

-- Convert line item prices
-- Convert ALL values to cents regardless of type
UPDATE invoiceLineItems
SET unitPrice_cents = CAST(ROUND(unitPrice * 100) AS INTEGER);

-- Add verification query as a comment for manual checking
-- SELECT id, number, total, total_cents, total_cents/100.0 as total_dollars,
--        taxTotal, taxTotal_cents, subTotal, subTotal_cents 
-- FROM invoices;