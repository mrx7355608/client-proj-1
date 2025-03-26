/*
  # Add Invoicing System Schema

  1. New Types
    - `invoice_status` enum for tracking invoice states
    - `agreement_type` enum for different types of agreements
    - `payment_terms` enum for standard payment terms

  2. New Tables
    - `invoices`: Store invoice details
    - `invoice_items`: Line items for invoices
    - `agreements`: Store contractual agreements
    - `agreement_services`: Services included in agreements

  3. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create enums
CREATE TYPE invoice_status AS ENUM (
  'draft',
  'sent',
  'paid',
  'overdue',
  'cancelled'
);

CREATE TYPE agreement_type AS ENUM (
  'msp',
  'unm',
  'project',
  'maintenance'
);

CREATE TYPE payment_terms AS ENUM (
  'net_15',
  'net_30',
  'net_45',
  'net_60',
  'due_on_receipt'
);

-- Create invoices table
CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  agreement_id uuid,  -- Will be linked after agreements table is created
  invoice_number text NOT NULL,
  status invoice_status NOT NULL DEFAULT 'draft',
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date NOT NULL,
  payment_terms payment_terms NOT NULL DEFAULT 'net_30',
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  tax_rate numeric(5,2) NOT NULL DEFAULT 0,
  tax_amount numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT positive_amounts CHECK (
    subtotal >= 0 AND
    tax_rate >= 0 AND
    tax_amount >= 0 AND
    total >= 0
  )
);

-- Create invoice items table
CREATE TABLE invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity numeric(10,2) NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  amount numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT positive_values CHECK (
    quantity > 0 AND
    unit_price >= 0 AND
    amount >= 0
  )
);

-- Create agreements table
CREATE TABLE agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  agreement_number text NOT NULL,
  type agreement_type NOT NULL,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  auto_renew boolean NOT NULL DEFAULT false,
  renewal_term_months integer,
  monthly_amount numeric(10,2) NOT NULL DEFAULT 0,
  setup_fee numeric(10,2) NOT NULL DEFAULT 0,
  payment_terms payment_terms NOT NULL DEFAULT 'net_30',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'active', 'expired', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT positive_amounts CHECK (
    monthly_amount >= 0 AND
    setup_fee >= 0
  ),
  CONSTRAINT valid_dates CHECK (
    end_date IS NULL OR end_date > start_date
  ),
  CONSTRAINT valid_renewal CHECK (
    (auto_renew = false AND renewal_term_months IS NULL) OR
    (auto_renew = true AND renewal_term_months > 0)
  )
);

-- Add foreign key to invoices table
ALTER TABLE invoices
ADD CONSTRAINT invoices_agreement_id_fkey
FOREIGN KEY (agreement_id) REFERENCES agreements(id) ON DELETE SET NULL;

-- Create agreement services table
CREATE TABLE agreement_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id uuid REFERENCES agreements(id) ON DELETE CASCADE,
  service_id uuid REFERENCES services(id) ON DELETE RESTRICT,
  quantity numeric(10,2) NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  amount numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT positive_values CHECK (
    quantity > 0 AND
    unit_price >= 0 AND
    amount >= 0
  )
);

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE agreement_services ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read for authenticated users"
  ON invoices FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON invoices FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON invoices FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
  ON invoices FOR DELETE TO authenticated USING (true);

-- Repeat for other tables
CREATE POLICY "Enable read for authenticated users"
  ON invoice_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON invoice_items FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON invoice_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
  ON invoice_items FOR DELETE TO authenticated USING (true);

CREATE POLICY "Enable read for authenticated users"
  ON agreements FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON agreements FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON agreements FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
  ON agreements FOR DELETE TO authenticated USING (true);

CREATE POLICY "Enable read for authenticated users"
  ON agreement_services FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON agreement_services FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON agreement_services FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
  ON agreement_services FOR DELETE TO authenticated USING (true);

-- Create updated_at triggers
CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_items_updated_at
    BEFORE UPDATE ON invoice_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agreements_updated_at
    BEFORE UPDATE ON agreements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agreement_services_updated_at
    BEFORE UPDATE ON agreement_services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate next invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  year text := to_char(CURRENT_DATE, 'YYYY');
  next_number integer;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '\d+') AS INTEGER)), 0) + 1
  INTO next_number
  FROM invoices
  WHERE invoice_number LIKE year || '-%';
  
  RETURN year || '-' || LPAD(next_number::text, 6, '0');
END;
$$;

-- Create function to generate next agreement number
CREATE OR REPLACE FUNCTION generate_agreement_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  year text := to_char(CURRENT_DATE, 'YYYY');
  next_number integer;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(agreement_number FROM '\d+') AS INTEGER)), 0) + 1
  INTO next_number
  FROM agreements
  WHERE agreement_number LIKE 'AGR-' || year || '-%';
  
  RETURN 'AGR-' || year || '-' || LPAD(next_number::text, 4, '0');
END;
$$;

-- Create function to create client from agreement
CREATE OR REPLACE FUNCTION create_client_from_agreement(agreement_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_agreement agreements;
  v_client_id uuid;
BEGIN
  -- Get agreement details
  SELECT * INTO v_agreement
  FROM agreements
  WHERE id = agreement_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Agreement not found';
  END IF;

  -- Only proceed if agreement is in 'accepted' status
  IF v_agreement.status != 'accepted' THEN
    RAISE EXCEPTION 'Agreement must be accepted before creating client';
  END IF;

  -- Create new client
  INSERT INTO clients (
    name,
    client_type,
    mrr,
    start_date,
    status
  )
  VALUES (
    'New Client from Agreement ' || v_agreement.agreement_number,
    v_agreement.type::client_type,
    v_agreement.monthly_amount,
    v_agreement.start_date,
    'active'
  )
  RETURNING id INTO v_client_id;

  -- Update agreement with new client_id
  UPDATE agreements
  SET 
    client_id = v_client_id,
    status = 'active'
  WHERE id = agreement_id;

  -- Create client services from agreement services
  INSERT INTO client_services (client_id, service_id, custom_price, start_date)
  SELECT 
    v_client_id,
    service_id,
    unit_price,
    v_agreement.start_date
  FROM agreement_services
  WHERE agreement_id = agreement_id;

  RETURN v_client_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION generate_invoice_number TO authenticated;
GRANT EXECUTE ON FUNCTION generate_agreement_number TO authenticated;
GRANT EXECUTE ON FUNCTION create_client_from_agreement TO authenticated;