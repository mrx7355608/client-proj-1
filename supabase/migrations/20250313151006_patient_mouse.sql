/*
  # Update clients table with separate address fields

  1. Changes
    - Add separate columns for address components
    - Migrate existing address data
    - Remove old address column
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add new address columns
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS street_address text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS postal_code text,
ADD COLUMN IF NOT EXISTS country text;

-- Migrate existing address data if needed
-- Note: This is a basic migration that assumes addresses are in a simple format
UPDATE clients
SET 
  street_address = address,
  city = NULL,
  state = NULL,
  postal_code = NULL,
  country = NULL
WHERE address IS NOT NULL;

-- Remove old address column
ALTER TABLE clients
DROP COLUMN IF EXISTS address;