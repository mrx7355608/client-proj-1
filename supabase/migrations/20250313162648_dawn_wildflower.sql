/*
  # Add client type field

  1. Changes
    - Add client_type enum for MSP and UNM clients
    - Add client_type column to clients table
    - Set default value for existing records
  
  2. Security
    - Maintain existing RLS policies
*/

-- Create client_type enum
DO $$ BEGIN
  CREATE TYPE client_type AS ENUM ('msp', 'unm');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add client_type column
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS client_type client_type NOT NULL DEFAULT 'msp';