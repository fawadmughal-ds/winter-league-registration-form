-- Migration script to add team_members column to existing database
-- Run this if you have an existing database without the team_members column

ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS team_members TEXT;

-- Add comment
COMMENT ON COLUMN registrations.team_members IS 'JSON object: { gameName: [{ name, rollNumber, contactNumber }] }';

