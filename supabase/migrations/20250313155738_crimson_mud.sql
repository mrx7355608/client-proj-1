/*
  # Schema Restore Point - March 2025

  This migration serves as a restore point for the database schema, capturing the complete structure as of March 2025.

  1. Tables
    - clients
    - contacts
    - documents
    - client_expenses
    - global_expenses
    - image_folders
    - gallery_images
    - services
    - client_services

  2. Enums
    - client_status
    - document_type
    - expense_interval
    - expense_category

  3. Security
    - RLS enabled on all tables
    - Policies for authenticated users
*/

-- Create enums if they don't exist
DO $$ 
BEGIN
  CREATE TYPE client_status AS ENUM ('active', 'disconnected', 'suspended');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ 
BEGIN
  CREATE TYPE document_type AS ENUM ('contract', 'invoice', 'proposal', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ 
BEGIN
  CREATE TYPE expense_interval AS ENUM ('monthly', 'quarterly', 'yearly');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ 
BEGIN
  CREATE TYPE expense_category AS ENUM (
    'payroll',
    'rent',
    'software',
    'utilities',
    'insurance',
    'marketing',
    'office_supplies',
    'accounting',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create or update tables
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company_name text,
  street_address text,
  city text,
  state text,
  postal_code text,
  country text,
  mrr decimal(10,2) DEFAULT 0.00,
  status client_status NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  type document_type NOT NULL DEFAULT 'other',
  url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS global_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category expense_category NOT NULL,
  amount decimal(10,2) NOT NULL DEFAULT 0.00,
  description text,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS image_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id uuid REFERENCES image_folders(id) ON DELETE CASCADE,
  url text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  base_price decimal(10,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS client_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  service_id uuid REFERENCES services(id) ON DELETE CASCADE,
  custom_price decimal(10,2),
  start_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(client_id, service_id)
);

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_services ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON clients;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON clients;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON clients;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON clients;

DROP POLICY IF EXISTS "Users can view contacts" ON contacts;
DROP POLICY IF EXISTS "Users can insert contacts" ON contacts;
DROP POLICY IF EXISTS "Users can update contacts" ON contacts;
DROP POLICY IF EXISTS "Users can delete contacts" ON contacts;

DROP POLICY IF EXISTS "Users can view their own documents" ON documents;
DROP POLICY IF EXISTS "Users can upload documents" ON documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON documents;

DROP POLICY IF EXISTS "Users can view client expenses" ON client_expenses;
DROP POLICY IF EXISTS "Users can create client expenses" ON client_expenses;
DROP POLICY IF EXISTS "Users can update client expenses" ON client_expenses;
DROP POLICY IF EXISTS "Users can delete client expenses" ON client_expenses;

DROP POLICY IF EXISTS "Users can view global expenses" ON global_expenses;
DROP POLICY IF EXISTS "Users can create global expenses" ON global_expenses;
DROP POLICY IF EXISTS "Users can update global expenses" ON global_expenses;
DROP POLICY IF EXISTS "Users can delete global expenses" ON global_expenses;

DROP POLICY IF EXISTS "Users can view image folders" ON image_folders;
DROP POLICY IF EXISTS "Users can create image folders" ON image_folders;
DROP POLICY IF EXISTS "Users can update image folders" ON image_folders;
DROP POLICY IF EXISTS "Users can delete image folders" ON image_folders;

DROP POLICY IF EXISTS "Users can view gallery images" ON gallery_images;
DROP POLICY IF EXISTS "Users can create gallery images" ON gallery_images;
DROP POLICY IF EXISTS "Users can update gallery images" ON gallery_images;
DROP POLICY IF EXISTS "Users can delete gallery images" ON gallery_images;

DROP POLICY IF EXISTS "Allow authenticated users full access to services" ON services;
DROP POLICY IF EXISTS "Allow authenticated users full access to client_services" ON client_services;

-- Create policies for clients
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

-- Create policies for contacts
CREATE POLICY "Users can view contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert contacts"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete contacts"
  ON contacts FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for documents
CREATE POLICY "Users can view their own documents"
  ON documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can upload documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own documents"
  ON documents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete their own documents"
  ON documents FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for client expenses
CREATE POLICY "Users can view client expenses"
  ON client_expenses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create client expenses"
  ON client_expenses FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update client expenses"
  ON client_expenses FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete client expenses"
  ON client_expenses FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for global expenses
CREATE POLICY "Users can view global expenses"
  ON global_expenses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create global expenses"
  ON global_expenses FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update global expenses"
  ON global_expenses FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete global expenses"
  ON global_expenses FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for image folders
CREATE POLICY "Users can view image folders"
  ON image_folders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create image folders"
  ON image_folders FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update image folders"
  ON image_folders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete image folders"
  ON image_folders FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for gallery images
CREATE POLICY "Users can view gallery images"
  ON gallery_images FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create gallery images"
  ON gallery_images FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update gallery images"
  ON gallery_images FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete gallery images"
  ON gallery_images FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for services and client services
CREATE POLICY "Allow authenticated users full access to services"
  ON services FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to client_services"
  ON client_services FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('documents', 'documents', true),
  ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Allow authenticated users to manage documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to manage gallery images" ON storage.objects;

-- Create storage policies
CREATE POLICY "Allow authenticated users to manage documents"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'documents')
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow authenticated users to manage gallery images"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'gallery')
  WITH CHECK (bucket_id = 'gallery');

-- Create updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
DO $$
BEGIN
  CREATE TRIGGER update_clients_updated_at
      BEFORE UPDATE ON clients
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
  CREATE TRIGGER update_contacts_updated_at
      BEFORE UPDATE ON contacts
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
  CREATE TRIGGER update_documents_updated_at
      BEFORE UPDATE ON documents
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
  CREATE TRIGGER update_client_expenses_updated_at
      BEFORE UPDATE ON client_expenses
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
  CREATE TRIGGER update_global_expenses_updated_at
      BEFORE UPDATE ON global_expenses
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
  CREATE TRIGGER update_image_folders_updated_at
      BEFORE UPDATE ON image_folders
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
  CREATE TRIGGER update_gallery_images_updated_at
      BEFORE UPDATE ON gallery_images
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;