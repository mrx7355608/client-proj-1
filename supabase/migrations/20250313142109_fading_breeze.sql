/*
  # Add global expenses tracking

  1. New Tables
    - `global_expenses`
      - Track company-wide expenses
      - Categories for different expense types
      - Monthly recurring costs
  
  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create expense_category enum
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