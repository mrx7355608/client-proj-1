/*
  # Add Inventory Management Schema

  1. New Tables
    - `inventory_items`
      - Track product details and stock levels
      - Store product images and vendor info
      - Track costs and pricing
    - `inventory_transactions`
      - Log all check-ins and check-outs
      - Track who performed the action
    - `inventory_vendors`
      - Store vendor information
      - Track vendor relationships

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create inventory_vendors table
CREATE TABLE inventory_vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_name text,
  contact_email text,
  contact_phone text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create inventory_items table
CREATE TABLE inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  sku text UNIQUE,
  vendor_id uuid REFERENCES inventory_vendors(id) ON DELETE SET NULL,
  category text NOT NULL,
  subcategory text,
  unit_price numeric(10,2) NOT NULL DEFAULT 0,
  cost_price numeric(10,2) NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 0,
  min_quantity integer NOT NULL DEFAULT 0,
  location text,
  image_url text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT positive_prices CHECK (
    unit_price >= 0 AND
    cost_price >= 0
  ),
  CONSTRAINT valid_quantities CHECK (
    quantity >= 0 AND
    min_quantity >= 0
  )
);

-- Create inventory_transactions table
CREATE TABLE inventory_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES inventory_items(id) ON DELETE CASCADE,
  user_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('check_in', 'check_out')),
  quantity integer NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT positive_quantity CHECK (quantity > 0)
);

-- Enable RLS
ALTER TABLE inventory_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read for authenticated users"
  ON inventory_vendors FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON inventory_vendors FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON inventory_vendors FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
  ON inventory_vendors FOR DELETE TO authenticated USING (true);

CREATE POLICY "Enable read for authenticated users"
  ON inventory_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON inventory_items FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON inventory_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
  ON inventory_items FOR DELETE TO authenticated USING (true);

CREATE POLICY "Enable read for authenticated users"
  ON inventory_transactions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON inventory_transactions FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON inventory_transactions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
  ON inventory_transactions FOR DELETE TO authenticated USING (true);

-- Create updated_at triggers
CREATE TRIGGER update_inventory_vendors_updated_at
    BEFORE UPDATE ON inventory_vendors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at
    BEFORE UPDATE ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to check in inventory
CREATE OR REPLACE FUNCTION check_in_inventory(
  p_item_id uuid,
  p_quantity integer,
  p_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transaction_id uuid;
BEGIN
  -- Validate quantity
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'Quantity must be greater than 0';
  END IF;

  -- Create transaction record
  INSERT INTO inventory_transactions (
    item_id,
    user_id,
    type,
    quantity,
    notes
  )
  VALUES (
    p_item_id,
    auth.uid(),
    'check_in',
    p_quantity,
    p_notes
  )
  RETURNING id INTO v_transaction_id;

  -- Update item quantity
  UPDATE inventory_items
  SET 
    quantity = quantity + p_quantity,
    updated_at = now()
  WHERE id = p_item_id;

  RETURN v_transaction_id;
END;
$$;

-- Create function to check out inventory
CREATE OR REPLACE FUNCTION check_out_inventory(
  p_item_id uuid,
  p_quantity integer,
  p_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_quantity integer;
  v_transaction_id uuid;
BEGIN
  -- Get current quantity
  SELECT quantity INTO v_current_quantity
  FROM inventory_items
  WHERE id = p_item_id;

  -- Validate quantity
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'Quantity must be greater than 0';
  END IF;

  IF p_quantity > v_current_quantity THEN
    RAISE EXCEPTION 'Insufficient quantity available';
  END IF;

  -- Create transaction record
  INSERT INTO inventory_transactions (
    item_id,
    user_id,
    type,
    quantity,
    notes
  )
  VALUES (
    p_item_id,
    auth.uid(),
    'check_out',
    p_quantity,
    p_notes
  )
  RETURNING id INTO v_transaction_id;

  -- Update item quantity
  UPDATE inventory_items
  SET 
    quantity = quantity - p_quantity,
    updated_at = now()
  WHERE id = p_item_id;

  RETURN v_transaction_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_in_inventory TO authenticated;
GRANT EXECUTE ON FUNCTION check_out_inventory TO authenticated;