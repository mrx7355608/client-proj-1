/*
  # Simplify expense categories

  1. Changes
    - Drop accounting_category column from global_expenses table
    - Drop accounting_category enum type
  
  2. Security
    - Maintain existing RLS policies
*/

-- Drop accounting_category column
ALTER TABLE global_expenses 
DROP COLUMN IF EXISTS accounting_category;

-- Drop accounting_category enum type
DROP TYPE IF EXISTS accounting_category;