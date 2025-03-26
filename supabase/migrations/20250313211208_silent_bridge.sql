/*
  # Database Restore Point - March 2025

  This migration serves as a restore point, documenting the complete database schema as of March 2025.
  It includes all tables, enums, constraints, and policies in their current state.

  1. Enums
    - client_status: active, disconnected, suspended
    - partner_type: vendor, distributor, manufacturer, service_provider, partner
    - document_type: contract, invoice, proposal, other
    - expense_interval: monthly, quarterly, yearly
    - expense_category: payroll, rent, software, utilities, insurance, marketing, office_supplies, other, accounting
    - client_type: msp, unm
    - partner_status: active, inactive

  2. Tables
    - clients: Main client information
    - contacts: Client contact details
    - services: Available services
    - client_services: Services assigned to clients
    - documents: Client documents
    - client_expenses: Client-specific expenses
    - global_expenses: Company-wide expenses
    - image_folders: Image organization for clients
    - gallery_images: Client images
    - client_notes: Client notes and records
    - partners: Partner information
    - partner_documents: Partner-related documents
    - partner_revenue_shares: Revenue sharing agreements

  3. Security
    - Row Level Security (RLS) enabled on all tables
    - Policies for authenticated users
*/

-- Create types if they don't exist
DO $$ BEGIN
    CREATE TYPE client_status AS ENUM ('active', 'disconnected', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE partner_type AS ENUM ('vendor', 'distributor', 'manufacturer', 'service_provider', 'partner');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_type AS ENUM ('contract', 'invoice', 'proposal', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE expense_interval AS ENUM ('monthly', 'quarterly', 'yearly');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE expense_category AS ENUM ('payroll', 'rent', 'software', 'utilities', 'insurance', 'marketing', 'office_supplies', 'other', 'accounting');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE client_type AS ENUM ('msp', 'unm');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE partner_status AS ENUM ('active', 'inactive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS clients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    company_name text,
    mrr numeric(10,2) DEFAULT 0.00,
    status client_status NOT NULL DEFAULT 'active',
    client_type client_type NOT NULL DEFAULT 'msp',
    street_address text,
    city text,
    state text,
    postal_code text,
    country text,
    start_date date NOT NULL DEFAULT CURRENT_DATE,
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

CREATE TABLE IF NOT EXISTS services (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    base_price numeric(10,2) DEFAULT 0.00,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS client_services (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
    service_id uuid REFERENCES services(id) ON DELETE CASCADE,
    custom_price numeric(10,2),
    start_date timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    UNIQUE(client_id, service_id)
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
    amount numeric(10,2),
    percentage numeric(5,2),
    interval expense_interval NOT NULL DEFAULT 'monthly',
    start_date date NOT NULL DEFAULT CURRENT_DATE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT client_expenses_amount_or_percentage_check 
        CHECK ((amount IS NOT NULL AND percentage IS NULL) OR (amount IS NULL AND percentage IS NOT NULL)),
    CONSTRAINT client_expenses_percentage_check 
        CHECK (percentage IS NULL OR (percentage >= 0 AND percentage <= 100))
);

CREATE TABLE IF NOT EXISTS global_expenses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    category expense_category NOT NULL,
    amount numeric(10,2) NOT NULL DEFAULT 0.00,
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

CREATE TABLE IF NOT EXISTS client_notes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
    subject text NOT NULL,
    body text NOT NULL,
    document_id uuid REFERENCES documents(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS partner_documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id uuid REFERENCES partners(id) ON DELETE CASCADE,
    name text NOT NULL,
    type document_type NOT NULL DEFAULT 'other',
    url text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS partner_revenue_shares (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id uuid REFERENCES partners(id) ON DELETE CASCADE,
    client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
    percentage numeric(5,2),
    flat_rate numeric(10,2),
    priority_order integer NOT NULL DEFAULT 0,
    start_date date NOT NULL DEFAULT CURRENT_DATE,
    end_date date,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(partner_id, client_id),
    CONSTRAINT partner_revenue_shares_percentage_check 
        CHECK (percentage >= 0 AND percentage <= 100),
    CONSTRAINT partner_revenue_shares_percentage_or_flat_rate_check 
        CHECK ((percentage IS NOT NULL AND flat_rate IS NULL) OR (percentage IS NULL AND flat_rate IS NOT NULL)),
    CONSTRAINT partner_revenue_shares_flat_rate_check 
        CHECK (flat_rate >= 0)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS partner_revenue_shares_priority_order_idx ON partner_revenue_shares (priority_order);

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_revenue_shares ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DO $$ 
DECLARE
    table_name text;
BEGIN
    FOR table_name IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'clients', 'contacts', 'services', 'client_services',
            'documents', 'client_expenses', 'global_expenses',
            'image_folders', 'gallery_images', 'client_notes',
            'partners', 'partner_documents', 'partner_revenue_shares'
        )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Enable read for authenticated users" ON %I', table_name);
        EXECUTE format('DROP POLICY IF EXISTS "Enable insert for authenticated users" ON %I', table_name);
        EXECUTE format('DROP POLICY IF EXISTS "Enable update for authenticated users" ON %I', table_name);
        EXECUTE format('DROP POLICY IF EXISTS "Enable delete for authenticated users" ON %I', table_name);
    END LOOP;
END $$;

-- Create policies for each table
DO $$ 
DECLARE
    table_name text;
BEGIN
    FOR table_name IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'clients', 'contacts', 'services', 'client_services',
            'documents', 'client_expenses', 'global_expenses',
            'image_folders', 'gallery_images', 'client_notes',
            'partners', 'partner_documents', 'partner_revenue_shares'
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
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ 
DECLARE
    table_name text;
BEGIN
    FOR table_name IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'clients', 'contacts', 'documents', 'client_expenses',
            'global_expenses', 'image_folders', 'gallery_images',
            'client_notes', 'partners', 'partner_documents',
            'partner_revenue_shares'
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