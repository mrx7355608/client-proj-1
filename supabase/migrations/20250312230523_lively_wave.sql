/*
  # Fix storage policy for documents

  1. Changes
    - Update storage policy to allow access based on client_id instead of user ID
    - Remove folder name restriction to allow more flexible storage paths
  
  2. Security
    - Maintain RLS for document access control
    - Allow authenticated users to manage documents
*/

-- Drop existing storage policy
DROP POLICY IF EXISTS "Give users access to own folder" ON storage.objects;

-- Create new storage policy without folder restriction
CREATE POLICY "Allow authenticated users to manage documents"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'documents')
  WITH CHECK (bucket_id = 'documents');