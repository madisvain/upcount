-- Create organizations table
CREATE TABLE organizations (
  id TEXT(21) PRIMARY KEY NOT NULL,
  name TEXT,
  country TEXT,
  address TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  registration_number TEXT,
  vatin TEXT,
  bank_name TEXT,
  iban TEXT,
  currency TEXT DEFAULT 'EUR',
  minimum_fraction_digits INTEGER DEFAULT 2,
  due_days INTEGER DEFAULT 7,
  overdue_charge REAL DEFAULT 0,
  customerNotes TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_organizations_name ON organizations(name);

-- Create clients table
CREATE TABLE clients (
  id TEXT(21) PRIMARY KEY NOT NULL,
  organizationId TEXT NOT NULL,
  name TEXT,
  address TEXT,
  emails TEXT DEFAULT '[]',
  phone TEXT,
  website TEXT,
  registration_number TEXT,
  vatin TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organizationId) REFERENCES organizations(id) ON DELETE CASCADE
);
CREATE INDEX idx_clients_organizationId ON clients(organizationId);
CREATE INDEX idx_clients_name ON clients(name);

-- Create taxRates table
CREATE TABLE taxRates (
  id TEXT(21) PRIMARY KEY NOT NULL,
  organizationId TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  percentage REAL NOT NULL,
  isDefault INTEGER DEFAULT 0,
  FOREIGN KEY (organizationId) REFERENCES organizations(id) ON DELETE CASCADE
);
CREATE INDEX idx_taxRates_organizationId ON taxRates(organizationId);

-- Create invoices table
CREATE TABLE invoices (
  id TEXT(21) PRIMARY KEY NOT NULL,
  organizationId TEXT NOT NULL,
  number TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'draft',
  clientId TEXT NOT NULL,
  date INTEGER NOT NULL,
  dueDate INTEGER,
  currency TEXT NOT NULL DEFAULT 'EUR',
  customerNotes TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organizationId) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE
);
CREATE INDEX idx_invoices_organizationId ON invoices(organizationId);
CREATE INDEX idx_invoices_clientId ON invoices(clientId);
CREATE INDEX idx_invoices_number ON invoices(number);

-- Create invoiceLineItems table
CREATE TABLE invoiceLineItems (
  id TEXT(21) PRIMARY KEY NOT NULL,
  invoiceId TEXT NOT NULL,
  description TEXT,
  quantity REAL NOT NULL DEFAULT 1,
  unitPrice REAL NOT NULL,
  taxRate TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (taxRate) REFERENCES taxRates(id) ON DELETE CASCADE,
  FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE
);
CREATE INDEX idx_invoiceLineItems_invoiceId ON invoiceLineItems(invoiceId);
CREATE INDEX idx_invoiceLineItems_taxRate ON invoiceLineItems(taxRate);

PRAGMA foreign_keys = ON;