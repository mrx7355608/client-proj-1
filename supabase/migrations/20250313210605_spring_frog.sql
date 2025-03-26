/*
  # Add percentage option to client expenses

  1. Changes
    - Add percentage column to client_expenses table
    - Add check constraint to ensure either amount or percentage is set, but not both
    - Add check constraint to ensure percentage is between 0 and 100
*/

-- Add percentage column
ALTER TABLE client_expenses 
ADD COLUMN percentage numeric(5,2) NULL;

-- Add check constraints
ALTER TABLE client_expenses
ADD CONSTRAINT client_expenses_amount_or_percentage_check 
CHECK (
  (amount IS NOT NULL AND percentage IS NULL) OR 
  (amount IS NULL AND percentage IS NOT NULL)
),
ADD CONSTRAINT client_expenses_percentage_check 
CHECK (percentage IS NULL OR (percentage >= 0 AND percentage <= 100));

-- Make amount column nullable
ALTER TABLE client_expenses 
ALTER COLUMN amount DROP NOT NULL;