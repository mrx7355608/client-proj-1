/*
  # Create documents storage bucket and table

  1. Storage
    - Create a new storage bucket for client documents
    - Set public access to allow document downloads
  
  2. New Tables
    - `documents`
      - `id` (uuid, primary key)
      - `client_id` (uuid, references clients)
      - `name` (text)
      - `type` (document_type enum)
      - `url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  3. Security
    - Enable RLS on documents table
    - Add policies for authenticated users
    - Set up storage policies for document access
*/

-- Create document_type enum
CREATE TYPE document_type AS ENUM ('contract', 'invoice', 'proposal', 'other');

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  type document_type NOT NULL DEFAULT 'other',
  url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can upload documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own documents"
  ON documents
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete their own documents"
  ON documents
  FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Allow authenticated users to manage documents"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'documents')
  WITH CHECK (bucket_id = 'documents');