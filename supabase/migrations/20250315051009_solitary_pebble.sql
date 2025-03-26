/*
  # Add inventory check-in/out functions

  1. Changes
    - Create check_in_inventory function
    - Create check_out_inventory function
    - Add proper validation and error handling
*/

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