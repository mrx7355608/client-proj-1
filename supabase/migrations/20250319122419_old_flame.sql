/*
  # Add Partner Notes Table

  1. New Tables
    - `partner_notes`
      - Track notes for partners
      - Store title, content, and dates
      - Link to documents (optional)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create partner_notes table
CREATE TABLE partner_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid REFERENCES partners(id) ON DELETE CASCADE,
  subject text NOT NULL,
  body text NOT NULL,
  document_id uuid REFERENCES partner_documents(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE partner_notes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read for authenticated users"
  ON partner_notes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON partner_notes FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON partner_notes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
  ON partner_notes FOR DELETE TO authenticated USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_partner_notes_updated_at
    BEFORE UPDATE ON partner_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();