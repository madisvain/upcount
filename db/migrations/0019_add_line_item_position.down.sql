-- SQLite does not support DROP COLUMN before version 3.35.0.
-- Recreate the table without the position column.
CREATE TABLE invoiceLineItems_new (
  id TEXT(21) PRIMARY KEY NOT NULL,
  invoiceId TEXT NOT NULL,
  description TEXT,
  quantity REAL NOT NULL DEFAULT 1,
  unitPrice INTEGER NOT NULL DEFAULT 0,
  taxRate TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (taxRate) REFERENCES taxRates(id) ON DELETE CASCADE,
  FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE
);
INSERT INTO invoiceLineItems_new SELECT id, invoiceId, description, quantity, unitPrice, taxRate, createdAt FROM invoiceLineItems;
DROP TABLE invoiceLineItems;
ALTER TABLE invoiceLineItems_new RENAME TO invoiceLineItems;
