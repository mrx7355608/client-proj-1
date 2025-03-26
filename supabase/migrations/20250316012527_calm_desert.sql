/*
  # Fix Inventory Constraints and Add Site Functions

  1. Changes
    - Update valid_quantities constraint to allow zero quantity
    - Add check constraints for site-specific quantities
    - Update inventory functions to handle site-specific operations

  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing check constraint
ALTER TABLE inventory_items
DROP CONSTRAINT IF EXISTS valid_quantities;

-- Add new check constraint that allows zero quantity
ALTER TABLE inventory_items
ADD CONSTRAINT valid_quantities CHECK (
  quantity >= 0 AND
  min_quantity >= 0
);

-- Update check_in_inventory_at_site function to properly handle site quantities
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
  v_current_quantity integer;
BEGIN
  -- Validate quantity
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'Quantity must be greater than 0';
  END IF;

  -- Get current site quantity and max limit
  SELECT 
    quantity,
    max_quantity 
  INTO v_current_quantity, v_max_quantity
  FROM inventory_site_items
  WHERE item_id = p_item_id AND site_id = p_site_id;

  -- Check max quantity limit if set
  IF v_max_quantity IS NOT NULL THEN
    IF COALESCE(v_current_quantity, 0) + p_quantity > v_max_quantity THEN
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

  -- Update or insert site item quantity
  INSERT INTO inventory_site_items (
    site_id,
    item_id,
    quantity,
    min_quantity
  )
  VALUES (
    p_site_id,
    p_item_id,
    p_quantity,
    0
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

-- Update check_out_inventory_from_site function to properly handle site quantities
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

  IF p_quantity > COALESCE(v_site_quantity, 0) THEN
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_in_inventory_at_site TO authenticated;
GRANT EXECUTE ON FUNCTION check_out_inventory_from_site TO authenticated;