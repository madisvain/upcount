-- Fix isDefault column type in taxRates table
-- Convert TEXT values to INTEGER (1 for true, 0 for false)

UPDATE taxRates 
SET isDefault = CASE 
    WHEN isDefault = 'true' THEN 1
    WHEN isDefault = 'false' THEN 0
    ELSE 0
END
WHERE typeof(isDefault) = 'text';