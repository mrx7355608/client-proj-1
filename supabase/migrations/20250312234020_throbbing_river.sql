/*
  # Add recurring expenses tracking for clients

  1. New Tables
    - `client_expenses`
      - Track recurring expenses per client
      - Store amount, description, and recurrence interval
      - Link to client via foreign key
  
  2. Security
    - Enable RLS on new table
    - Add policies for authenticated users
*/

-- Create expense_interval enum
CREATE TYPE expense_interval AS ENUM ('monthly', 'quarterly', 'yearly');

-- Create client_expenses table
CREATE TABLE IF NOT EXISTS client_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  description text NOT NULL,
  amount decimal(10,2) NOT NULL DEFAULT 0.00,
  interval expense_interval NOT NULL DEFAULT 'monthly',
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE client_expenses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view client expenses"
  ON client_expenses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create client expenses"
  ON client_expenses
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update client expenses"
  ON client_expenses
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete client expenses"
  ON client_expenses
  FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_client_expenses_updated_at
    BEFORE UPDATE ON client_expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();