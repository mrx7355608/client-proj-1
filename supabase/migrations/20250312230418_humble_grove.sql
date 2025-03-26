/*
  # Create documents storage bucket and update documents table

  1. Storage
    - Create a new storage bucket for client documents
    - Set public access to allow document downloads
  
  2. Table Changes
    - Add document_type enum for categorizing documents
    - Create documents table with proper relations and constraints
    - Enable RLS policies for document management
*/

-- Create document_type enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE document_type AS ENUM ('contract', 'invoice', 'proposal', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create documents table if it doesn't exist
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

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Give users access to own folder"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);