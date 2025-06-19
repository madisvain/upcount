-- Convert ISO date strings to unix timestamps (milliseconds)
UPDATE invoices 
SET date = CAST(strftime('%s', substr(date, 1, 19)) AS INTEGER) * 1000
WHERE typeof(date) = 'text';

UPDATE invoices 
SET dueDate = CAST(strftime('%s', substr(dueDate, 1, 19)) AS INTEGER) * 1000
WHERE typeof(dueDate) = 'text' AND dueDate IS NOT NULL;