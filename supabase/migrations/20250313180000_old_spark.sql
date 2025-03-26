/*
  # Add Partners Schema

  1. New Types
    - `partner_type` enum for categorizing partners
      - vendor
      - distributor
      - manufacturer
      - service_provider
    - `partner_status` enum for partner status
      - active
      - inactive

  2. New Tables
    - `partners`
      - Basic partner information
      - Contact details
      - Status tracking
    - `partner_documents`
      - Store document metadata for partners
    - `partner_revenue_shares`
      - Track revenue sharing between partners and clients
      - Store percentage and start date

  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create enums
CREATE TYPE partner_type AS ENUM (
  'vendor',
  'distributor',
  'manufacturer',
  'service_provider'
);

CREATE TYPE partner_status AS ENUM (
  'active',
  'inactive'
);

-- Create partners table
CREATE TABLE IF NOT EXISTS partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type partner_type NOT NULL,
  website text,
  contact_name text NOT NULL,
  contact_email text,
  contact_phone text,
  contact_phone_ext text,
  status partner_status NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create partner_documents table
CREATE TABLE IF NOT EXISTS partner_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid REFERENCES partners(id) ON DELETE CASCADE,
  name text NOT NULL,
  type document_type NOT NULL DEFAULT 'other',
  url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create partner_revenue_shares table
CREATE TABLE IF NOT EXISTS partner_revenue_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid REFERENCES partners(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  percentage decimal(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(partner_id, client_id)
);

-- Enable RLS
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_revenue_shares ENABLE ROW LEVEL SECURITY;

-- Create policies for partners
CREATE POLICY "Users can view partners"
  ON partners FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create partners"
  ON partners FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update partners"
  ON partners FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete partners"
  ON partners FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for partner_documents
CREATE POLICY "Users can view partner documents"
  ON partner_documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create partner documents"
  ON partner_documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update partner documents"
  ON partner_documents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete partner documents"
  ON partner_documents FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for partner_revenue_shares
CREATE POLICY "Users can view partner revenue shares"
  ON partner_revenue_shares FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create partner revenue shares"
  ON partner_revenue_shares FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update partner revenue shares"
  ON partner_revenue_shares FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete partner revenue shares"
  ON partner_revenue_shares FOR DELETE
  TO authenticated
  USING (true);

-- Create triggers
CREATE TRIGGER update_partners_updated_at
    BEFORE UPDATE ON partners
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_documents_updated_at
    BEFORE UPDATE ON partner_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_revenue_shares_updated_at
    BEFORE UPDATE ON partner_revenue_shares
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for partner documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('partner-documents', 'partner-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for partner documents
CREATE POLICY "Allow authenticated users to manage partner documents"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'partner-documents')
  WITH CHECK (bucket_id = 'partner-documents');