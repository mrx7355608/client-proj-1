/*
  # Quote Management System Schema

  1. Changes
    - Check for existing types before creating
    - Create tables and functions
    - Set up RLS policies
    - Add necessary constraints

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create enums if they don't exist
DO $$ BEGIN
  CREATE TYPE quote_status AS ENUM (
    'draft',
    'sent',
    'signed',
    'ordered',
    'fulfilled',
    'expired',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE quote_template_type AS ENUM (
    'managed_services',
    'unm',
    'cybersecurity',
    'network_buildout',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE quote_section_type AS ENUM (
    'header',
    'introduction',
    'scope',
    'pricing',
    'terms',
    'signature',
    'custom'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create quote_templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS quote_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type quote_template_type NOT NULL,
  version integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create quote_sections table if it doesn't exist
CREATE TABLE IF NOT EXISTS quote_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES quote_templates(id) ON DELETE CASCADE,
  type quote_section_type NOT NULL,
  name text NOT NULL,
  content text NOT NULL,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(template_id, order_index)
);

-- Create quotes table if it doesn't exist
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES quote_templates(id),
  quote_number text NOT NULL UNIQUE,
  title text NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  status quote_status NOT NULL DEFAULT 'draft',
  valid_until date,
  total_mrr numeric(10,2) NOT NULL DEFAULT 0,
  total_nrc numeric(10,2) NOT NULL DEFAULT 0,
  term_months integer,
  notes text,
  created_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT positive_amounts CHECK (
    total_mrr >= 0 AND
    total_nrc >= 0
  ),
  CONSTRAINT valid_term CHECK (
    term_months IS NULL OR term_months > 0
  )
);

-- Create quote_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS quote_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid REFERENCES quotes(id) ON DELETE CASCADE,
  inventory_item_id uuid REFERENCES inventory_items(id),
  description text NOT NULL,
  quantity numeric(10,2) NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  is_recurring boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT positive_values CHECK (
    quantity > 0 AND
    unit_price >= 0
  )
);

-- Create quote_variables table if it doesn't exist
CREATE TABLE IF NOT EXISTS quote_variables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid REFERENCES quotes(id) ON DELETE CASCADE,
  name text NOT NULL,
  value text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(quote_id, name)
);

-- Create quote_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS quote_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid REFERENCES quotes(id) ON DELETE CASCADE,
  status quote_status NOT NULL,
  notes text,
  changed_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE quote_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
DECLARE
  table_name text;
BEGIN
  FOR table_name IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN (
      'quote_templates',
      'quote_sections',
      'quotes',
      'quote_items',
      'quote_variables',
      'quote_history'
    )
  LOOP
    EXECUTE format('
      DROP POLICY IF EXISTS "Enable read for authenticated users" ON %I;
      DROP POLICY IF EXISTS "Enable insert for authenticated users" ON %I;
      DROP POLICY IF EXISTS "Enable update for authenticated users" ON %I;
      DROP POLICY IF EXISTS "Enable delete for authenticated users" ON %I;
    ', table_name, table_name, table_name, table_name);
  END LOOP;
END $$;

-- Create new policies
DO $$ 
DECLARE
  table_name text;
BEGIN
  FOR table_name IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN (
      'quote_templates',
      'quote_sections',
      'quotes',
      'quote_items',
      'quote_variables',
      'quote_history'
    )
  LOOP
    EXECUTE format('
      CREATE POLICY "Enable read for authenticated users" ON %I FOR SELECT TO authenticated USING (true);
      CREATE POLICY "Enable insert for authenticated users" ON %I FOR INSERT TO authenticated WITH CHECK (true);
      CREATE POLICY "Enable update for authenticated users" ON %I FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
      CREATE POLICY "Enable delete for authenticated users" ON %I FOR DELETE TO authenticated USING (true);
    ', table_name, table_name, table_name, table_name);
  END LOOP;
END $$;

-- Create updated_at triggers
DO $$ 
DECLARE
  table_name text;
BEGIN
  FOR table_name IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN (
      'quote_templates',
      'quote_sections',
      'quotes',
      'quote_items',
      'quote_variables'
    )
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
      CREATE TRIGGER update_%I_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    ', table_name, table_name, table_name, table_name);
  END LOOP;
END $$;

-- Create or replace function to generate quote number
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  year text := to_char(CURRENT_DATE, 'YYYY');
  next_number integer;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(quote_number FROM '\d+') AS INTEGER)), 0) + 1
  INTO next_number
  FROM quotes
  WHERE quote_number LIKE 'Q' || year || '-%';
  
  RETURN 'Q' || year || '-' || LPAD(next_number::text, 6, '0');
END;
$$;

-- Create or replace function to create quote from template
CREATE OR REPLACE FUNCTION create_quote_from_template(
  p_template_id uuid,
  p_client_id uuid,
  p_title text,
  p_term_months integer DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_quote_id uuid;
  v_section record;
  v_client record;
BEGIN
  -- Generate new quote number
  INSERT INTO quotes (
    template_id,
    client_id,
    quote_number,
    title,
    term_months,
    created_by
  )
  VALUES (
    p_template_id,
    p_client_id,
    generate_quote_number(),
    p_title,
    p_term_months,
    auth.uid()
  )
  RETURNING id INTO v_quote_id;

  -- Get client details
  SELECT * INTO v_client
  FROM clients
  WHERE id = p_client_id;

  -- Create default variables
  INSERT INTO quote_variables (quote_id, name, value)
  VALUES
    (v_quote_id, 'company_name', v_client.company_name),
    (v_quote_id, 'client_name', v_client.name),
    (v_quote_id, 'date', to_char(CURRENT_DATE, 'Month DD, YYYY')),
    (v_quote_id, 'address', NULLIF(CONCAT_WS(', ',
      v_client.street_address,
      v_client.city,
      v_client.state,
      v_client.postal_code
    ), '')),
    (v_quote_id, 'term_months', p_term_months::text);

  -- Create quote history entry
  INSERT INTO quote_history (
    quote_id,
    status,
    changed_by
  )
  VALUES (
    v_quote_id,
    'draft',
    auth.uid()
  );

  RETURN v_quote_id;
END;
$$;

-- Create or replace function to update quote status
CREATE OR REPLACE FUNCTION update_quote_status(
  p_quote_id uuid,
  p_status quote_status,
  p_notes text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update quote status
  UPDATE quotes
  SET 
    status = p_status,
    updated_at = now()
  WHERE id = p_quote_id;

  -- Create history entry
  INSERT INTO quote_history (
    quote_id,
    status,
    notes,
    changed_by
  )
  VALUES (
    p_quote_id,
    p_status,
    p_notes,
    auth.uid()
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION generate_quote_number TO authenticated;
GRANT EXECUTE ON FUNCTION create_quote_from_template TO authenticated;
GRANT EXECUTE ON FUNCTION update_quote_status TO authenticated;