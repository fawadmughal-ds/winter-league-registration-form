-- Add created_date column for easier date filtering
-- This migration is safe and won't lose any data

-- Step 1: Add the new column (nullable first)
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS created_date DATE;

-- Step 2: Backfill existing data from created_at
UPDATE registrations 
SET created_date = DATE(created_at)
WHERE created_date IS NULL;

-- Step 3: Make the column NOT NULL (now that all rows have values)
ALTER TABLE registrations 
ALTER COLUMN created_date SET NOT NULL;

-- Step 4: Set default value for future inserts
ALTER TABLE registrations 
ALTER COLUMN created_date SET DEFAULT CURRENT_DATE;

-- Step 5: Create a trigger to automatically set created_date from created_at
-- This ensures new records always have the date set correctly
CREATE OR REPLACE FUNCTION set_created_date_from_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_date IS NULL AND NEW.created_at IS NOT NULL THEN
    NEW.created_date := DATE(NEW.created_at);
  ELSIF NEW.created_date IS NULL THEN
    NEW.created_date := CURRENT_DATE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists, then create it
DROP TRIGGER IF EXISTS trigger_set_created_date ON registrations;
CREATE TRIGGER trigger_set_created_date
  BEFORE INSERT OR UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION set_created_date_from_timestamp();

-- Step 6: Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_registrations_created_date ON registrations(created_date);

-- Verify the migration
SELECT 
  COUNT(*) as total_rows,
  COUNT(created_date) as rows_with_date,
  MIN(created_date) as earliest_date,
  MAX(created_date) as latest_date
FROM registrations;

