-- Reset Database Script
-- WARNING: This will delete ALL data from the database!
-- Use with caution in production

-- Drop all tables in correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS admin_sessions CASCADE;
DROP TABLE IF EXISTS esports_settings CASCADE;
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS games_pricing CASCADE;

-- Drop sequences
DROP SEQUENCE IF EXISTS registration_number_seq;

-- Now recreate everything from scratch
-- This will run the initialization script
-- Run init-db.sql after this

