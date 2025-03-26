/*
  # Roll back document changes

  1. Changes
    - Delete all objects in the documents storage bucket
    - Remove storage bucket and policies
    - Drop documents table
    - Drop document_type enum
*/

-- First, delete all objects in the documents bucket
DELETE FROM storage.objects WHERE bucket_id = 'documents';

-- Remove storage bucket
DELETE FROM storage.buckets WHERE id = 'documents';

-- Remove storage bucket policies
DROP POLICY IF EXISTS "Allow authenticated users to manage documents" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder" ON storage.objects;

-- Drop the documents table
DROP TABLE IF EXISTS documents;

-- Drop the document_type enum
DROP TYPE IF EXISTS document_type;