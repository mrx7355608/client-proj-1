/*
  # Add Accounting Category to Global Expenses

  1. Changes
    - Add accounting_category enum type
    - Add accounting_category column to global_expenses table
    - Set default value for existing records
  
  2. Security
    - Maintain existing RLS policies
*/

-- Create accounting_category enum
DO $$ BEGIN
  CREATE TYPE accounting_category AS ENUM (
    'operating_expenses',
    'cost_of_goods_sold',
    'administrative',
    'sales_marketing',
    'research_development',
    'capital_expenditure',
    'tax_payments',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add accounting_category column to global_expenses
ALTER TABLE global_expenses 
ADD COLUMN IF NOT EXISTS accounting_category accounting_category NOT NULL DEFAULT 'operating_expenses';