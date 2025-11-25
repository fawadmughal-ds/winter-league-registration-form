-- Migration script to add discount column to existing database
-- Run this if you have an existing database without the discount column

ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS discount DECIMAL(10, 2) DEFAULT 0;

-- Add comment
COMMENT ON COLUMN registrations.discount IS 'Discount amount applied (e.g., 200 means Rs. 200 off)';

