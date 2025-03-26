/*
  # Add start date field to clients table

  1. Changes
    - Add start_date column to clients table
    - Set default value to created_at for existing records
    - Make start_date required for new records
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add start_date column
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS start_date date NOT NULL DEFAULT CURRENT_DATE;

-- Update existing records to use created_at as start_date
UPDATE clients
SET start_date = created_at::date
WHERE start_date = CURRENT_DATE;