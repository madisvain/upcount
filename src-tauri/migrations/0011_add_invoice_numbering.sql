-- Add invoice numbering configuration to organizations table
ALTER TABLE organizations ADD COLUMN invoice_number_start INTEGER DEFAULT 1;
ALTER TABLE organizations ADD COLUMN invoice_number_digits INTEGER DEFAULT 4;
ALTER TABLE organizations ADD COLUMN invoice_number_prefix TEXT DEFAULT 'INV';
ALTER TABLE organizations ADD COLUMN invoice_number_separator TEXT DEFAULT '-';
ALTER TABLE organizations ADD COLUMN invoice_number_suffix TEXT DEFAULT '';