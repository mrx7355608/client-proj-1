/*
  # Add Notes Table for Clients

  1. New Tables
    - `client_notes`
      - `id` (uuid, primary key)
      - `client_id` (uuid, references clients)
      - `subject` (text)
      - `body` (text)
      - `document_id` (uuid, optional reference to documents)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create client_notes table
CREATE TABLE IF NOT EXISTS client_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  subject text NOT NULL,
  body text NOT NULL,
  document_id uuid REFERENCES documents(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view client notes"
  ON client_notes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create client notes"
  ON client_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update client notes"
  ON client_notes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete client notes"
  ON client_notes
  FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_client_notes_updated_at
    BEFORE UPDATE ON client_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();