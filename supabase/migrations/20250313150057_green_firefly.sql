/*
  # Add Accounting category to expense_category enum

  1. Changes
    - Add 'accounting' as a new option to expense_category enum
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add new value to expense_category enum
ALTER TYPE expense_category ADD VALUE IF NOT EXISTS 'accounting';