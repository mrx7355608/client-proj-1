/*
  # Update clients table RLS policies

  1. Changes
    - Drop existing RLS policy for clients table
    - Create separate policies for SELECT, INSERT, UPDATE, and DELETE operations
    - Ensure authenticated users can perform all operations on clients table

  2. Security
    - Maintain RLS enabled on clients table
    - Add granular policies for each operation type
    - Ensure proper access control for authenticated users
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Allow authenticated users full access to clients" ON clients;

-- Create separate policies for each operation
CREATE POLICY "Enable read access for authenticated users"
ON clients FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert access for authenticated users"
ON clients FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
ON clients FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users"
ON clients FOR DELETE
TO authenticated
USING (true);