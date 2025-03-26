/*
  # Add Partner Type to Enum

  1. Changes
    - Add 'partner' as a valid value to the partner_type enum
*/

-- Create a new enum type with the additional value
CREATE TYPE partner_type_new AS ENUM ('vendor', 'distributor', 'manufacturer', 'service_provider', 'partner');

-- Update the existing data to use the new type
ALTER TABLE partners 
  ALTER COLUMN type TYPE partner_type_new 
  USING type::text::partner_type_new;

-- Drop the old type
DROP TYPE partner_type;

-- Rename the new type to the original name
ALTER TYPE partner_type_new RENAME TO partner_type;