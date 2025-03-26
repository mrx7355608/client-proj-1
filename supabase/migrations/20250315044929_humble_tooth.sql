/*
  # Add Inventory Sites and Locations

  1. New Tables
    - `inventory_sites`
      - Track different inventory locations/sites
      - Store site details and type
    - `inventory_site_items`
      - Junction table for items at each site
      - Track quantity per site
      - Maintain min/max levels per site

  2. Changes
    - Add site_id to inventory_transactions
    - Add constraints and policies
    - Add functions for site-specific operations

  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Drop existing functions first
DROP FUNCTION IF EXISTS public.check_in_inventory(uuid, integer, text);
DROP FUNCTION IF EXISTS public.check_out_inventory(uuid, integer, text);
DROP FUNCTION IF EXISTS public.check_in_inventory(uuid, uuid, integer, text);
DROP FUNCTION IF EXISTS public.check_out_inventory(uuid, uuid, integer, text);
DROP FUNCTION IF EXISTS public.transfer_inventory(uuid, uuid, uuid, integer, text);

-- Create site type enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE site_type AS ENUM (
    'warehouse',
    'office',
    'client_site',
    'project_site'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create inventory_sites table
CREATE TABLE IF NOT EXISTS inventory_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type site_type NOT NULL,
  description text,
  address text,
  city text,
  state text,
  postal_code text,
  country text,
  contact_name text,
  contact_email text,
  contact_phone text,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create inventory_site_items table
CREATE TABLE IF NOT EXISTS inventory_site_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES inventory_sites(id) ON DELETE CASCADE,
  item_id uuid REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 0,
  min_quantity integer NOT NULL DEFAULT 0,
  max_quantity integer,
  location text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT positive_quantities CHECK (
    quantity >= 0 AND
    min_quantity >= 0 AND
    (max_quantity IS NULL OR max_quantity >= min_quantity)
  ),
  UNIQUE(site_id, item_id)
);

-- Add site_id to inventory_transactions if it doesn't exist
DO $$ BEGIN
  ALTER TABLE inventory_transactions
  ADD COLUMN site_id uuid REFERENCES inventory_sites(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

-- Enable RLS
ALTER TABLE inventory_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_site_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read for authenticated users"
  ON inventory_sites FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON inventory_sites FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON inventory_sites FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
  ON inventory_sites FOR DELETE TO authenticated USING (true);

CREATE POLICY "Enable read for authenticated users"
  ON inventory_site_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON inventory_site_items FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON inventory_site_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
  ON inventory_site_items FOR DELETE TO authenticated USING (true);

-- Create updated_at triggers
DO $$ BEGIN
  CREATE TRIGGER update_inventory_sites_updated_at
      BEFORE UPDATE ON inventory_sites
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_inventory_site_items_updated_at
      BEFORE UPDATE ON inventory_site_items
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create function to check in inventory at a specific site
CREATE OR REPLACE FUNCTION check_in_inventory_at_site(
  p_item_id uuid,
  p_site_id uuid,
  p_quantity integer,
  p_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transaction_id uuid;
  v_max_quantity integer;
BEGIN
  -- Validate quantity
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'Quantity must be greater than 0';
  END IF;

  -- Check max quantity limit if set
  SELECT max_quantity INTO v_max_quantity
  FROM inventory_site_items
  WHERE item_id = p_item_id AND site_id = p_site_id;

  IF v_max_quantity IS NOT NULL THEN
    IF (
      SELECT quantity + p_quantity
      FROM inventory_site_items
      WHERE item_id = p_item_id AND site_id = p_site_id
    ) > v_max_quantity THEN
      RAISE EXCEPTION 'Check-in would exceed maximum quantity limit of %', v_max_quantity;
    END IF;
  END IF;

  -- Create transaction record
  INSERT INTO inventory_transactions (
    item_id,
    site_id,
    user_id,
    type,
    quantity,
    notes
  )
  VALUES (
    p_item_id,
    p_site_id,
    auth.uid(),
    'check_in',
    p_quantity,
    p_notes
  )
  RETURNING id INTO v_transaction_id;

  -- Update site item quantity
  INSERT INTO inventory_site_items (
    site_id,
    item_id,
    quantity
  )
  VALUES (
    p_site_id,
    p_item_id,
    p_quantity
  )
  ON CONFLICT (site_id, item_id) DO UPDATE
  SET quantity = inventory_site_items.quantity + p_quantity;

  -- Update total item quantity
  UPDATE inventory_items
  SET 
    quantity = quantity + p_quantity,
    updated_at = now()
  WHERE id = p_item_id;

  RETURN v_transaction_id;
END;
$$;

-- Create function to check out inventory from a specific site
CREATE OR REPLACE FUNCTION check_out_inventory_from_site(
  p_item_id uuid,
  p_site_id uuid,
  p_quantity integer,
  p_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_site_quantity integer;
  v_transaction_id uuid;
BEGIN
  -- Get current quantity at site
  SELECT quantity INTO v_site_quantity
  FROM inventory_site_items
  WHERE item_id = p_item_id AND site_id = p_site_id;

  -- Validate quantity
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'Quantity must be greater than 0';
  END IF;

  IF p_quantity > v_site_quantity THEN
    RAISE EXCEPTION 'Insufficient quantity available at this site';
  END IF;

  -- Create transaction record
  INSERT INTO inventory_transactions (
    item_id,
    site_id,
    user_id,
    type,
    quantity,
    notes
  )
  VALUES (
    p_item_id,
    p_site_id,
    auth.uid(),
    'check_out',
    p_quantity,
    p_notes
  )
  RETURNING id INTO v_transaction_id;

  -- Update site item quantity
  UPDATE inventory_site_items
  SET quantity = quantity - p_quantity
  WHERE item_id = p_item_id AND site_id = p_site_id;

  -- Update total item quantity
  UPDATE inventory_items
  SET 
    quantity = quantity - p_quantity,
    updated_at = now()
  WHERE id = p_item_id;

  RETURN v_transaction_id;
END;
$$;

-- Create function to transfer inventory between sites
CREATE OR REPLACE FUNCTION transfer_inventory_between_sites(
  p_item_id uuid,
  p_from_site_id uuid,
  p_to_site_id uuid,
  p_quantity integer,
  p_notes text DEFAULT NULL
)
RETURNS uuid[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_checkout_id uuid;
  v_checkin_id uuid;
BEGIN
  -- Check out from source site
  v_checkout_id := check_out_inventory_from_site(p_item_id, p_from_site_id, p_quantity, 
    'Transfer to ' || (SELECT name FROM inventory_sites WHERE id = p_to_site_id) || 
    CASE WHEN p_notes IS NOT NULL THEN ': ' || p_notes ELSE '' END
  );

  -- Check in to destination site
  v_checkin_id := check_in_inventory_at_site(p_item_id, p_to_site_id, p_quantity,
    'Transfer from ' || (SELECT name FROM inventory_sites WHERE id = p_from_site_id) || 
    CASE WHEN p_notes IS NOT NULL THEN ': ' || p_notes ELSE '' END
  );

  RETURN ARRAY[v_checkout_id, v_checkin_id];
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_in_inventory_at_site TO authenticated;
GRANT EXECUTE ON FUNCTION check_out_inventory_from_site TO authenticated;
GRANT EXECUTE ON FUNCTION transfer_inventory_between_sites TO authenticated;