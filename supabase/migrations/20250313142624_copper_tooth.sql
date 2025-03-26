/*
  # Create Global Expenses Table

  1. New Types
    - `expense_category` enum for categorizing expenses
      - payroll
      - rent
      - software
      - utilities
      - insurance
      - marketing
      - office_supplies
      - other

  2. New Tables
    - `global_expenses`
      - Track company-wide recurring expenses
      - Store amount, category, and date range
      - Include description field for additional details

  3. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Drop existing trigger if it exists
DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_global_expenses_updated_at ON global_expenses;
EXCEPTION
  WHEN undefined_table THEN null;
END $$;

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view global expenses" ON global_expenses;
  DROP POLICY IF EXISTS "Users can create global expenses" ON global_expenses;
  DROP POLICY IF EXISTS "Users can update global expenses" ON global_expenses;
  DROP POLICY IF EXISTS "Users can delete global expenses" ON global_expenses;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

-- Create expense_category enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE expense_category AS ENUM (
    'payroll',
    'rent',
    'software',
    'utilities',
    'insurance',
    'marketing',
    'office_supplies',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create global_expenses table
CREATE TABLE IF NOT EXISTS global_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category expense_category NOT NULL,
  amount decimal(10,2) NOT NULL DEFAULT 0.00,
  description text,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE global_expenses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view global expenses"
  ON global_expenses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create global expenses"
  ON global_expenses
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update global expenses"
  ON global_expenses
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete global expenses"
  ON global_expenses
  FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_global_expenses_updated_at
    BEFORE UPDATE ON global_expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();