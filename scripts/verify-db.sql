-- Quick verification script
-- Run this in your Neon SQL Editor to check your database structure

-- 1. Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'registrations'
) as table_exists;

-- 2. Check table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'registrations'
ORDER BY ordinal_position;

-- 3. Check if sequence exists
SELECT EXISTS (
  SELECT FROM pg_sequences 
  WHERE sequencename = 'registration_number_seq'
) as sequence_exists;

-- 4. If table has old columns, you may need to drop and recreate
-- (Only run this if you're sure you want to delete all data!)
-- DROP TABLE IF EXISTS registrations CASCADE;
-- Then run init-db.sql again

