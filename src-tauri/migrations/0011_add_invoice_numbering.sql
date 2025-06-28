-- Add invoice numbering configuration to organizations table
ALTER TABLE organizations ADD COLUMN invoice_number_format TEXT DEFAULT 'INV-{year}-{number}';
ALTER TABLE organizations ADD COLUMN invoice_number_counter INTEGER DEFAULT 0;