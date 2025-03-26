/*
  # Add Partner Contacts Table

  1. New Tables
    - `partner_contacts`
      - Store multiple contacts per partner
      - Track contact roles and details
      - Maintain primary contact flag

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create partner_contacts table
CREATE TABLE partner_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid REFERENCES partners(id) ON DELETE CASCADE,
  role text NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  phone_ext text,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_role CHECK (
    role IN ('Owner', 'Manager', 'Agent', 'Finance')
  )
);

-- Enable RLS
ALTER TABLE partner_contacts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read for authenticated users"
  ON partner_contacts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON partner_contacts FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON partner_contacts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
  ON partner_contacts FOR DELETE TO authenticated USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_partner_contacts_updated_at
    BEFORE UPDATE ON partner_contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();