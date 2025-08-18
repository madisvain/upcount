-- Add date format preference to organizations table
ALTER TABLE organizations ADD COLUMN date_format TEXT DEFAULT NULL;