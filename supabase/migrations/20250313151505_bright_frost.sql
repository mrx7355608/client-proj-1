/*
  # Add contacts table and update clients table

  1. New Tables
    - `contacts`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key to clients)
      - `name` (text)
      - `role` (text)
      - `email` (text)
      - `phone` (text)
      - `phone_ext` (text)
      - `is_primary` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Changes
    - Remove phone and email from clients table as they'll be stored in contacts
    - Add foreign key constraint from contacts to clients
    - Add RLS policies for contacts table

  3. Security
    - Enable RLS on contacts table
    - Add policies for authenticated users
*/

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL,
  email text,
  phone text,
  phone_ext text,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view contacts"
  ON contacts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert contacts"
  ON contacts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update contacts"
  ON contacts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete contacts"
  ON contacts
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger to update updated_at
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Migrate existing client data to contacts
INSERT INTO contacts (client_id, name, email, phone, role, is_primary)
SELECT 
  id as client_id,
  name,
  email,
  phone,
  'Primary Contact' as role,
  true as is_primary
FROM clients
WHERE name IS NOT NULL;

-- Remove email and phone columns from clients
ALTER TABLE clients 
  DROP COLUMN email,
  DROP COLUMN phone;