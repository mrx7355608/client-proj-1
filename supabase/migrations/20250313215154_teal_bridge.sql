/*
  # Fix Revenue Shares Schema

  1. Changes
    - Remove not-null constraint from percentage column in partner_revenue_shares
    - Add check constraint to ensure either percentage or flat_rate is provided
    - Add check constraint to ensure percentage is between 0 and 100
    - Add check constraint to ensure flat_rate is non-negative

  2. Security
    - No changes to RLS policies
*/

-- Drop existing constraints
ALTER TABLE partner_revenue_shares
DROP CONSTRAINT IF EXISTS partner_revenue_shares_percentage_check,
DROP CONSTRAINT IF EXISTS partner_revenue_shares_percentage_or_flat_rate_check,
DROP CONSTRAINT IF EXISTS partner_revenue_shares_flat_rate_check;

-- Make percentage column nullable
ALTER TABLE partner_revenue_shares
ALTER COLUMN percentage DROP NOT NULL;

-- Add new constraints
ALTER TABLE partner_revenue_shares
ADD CONSTRAINT partner_revenue_shares_percentage_check 
CHECK (percentage IS NULL OR (percentage >= 0 AND percentage <= 100)),
ADD CONSTRAINT partner_revenue_shares_percentage_or_flat_rate_check 
CHECK (
  (percentage IS NOT NULL AND flat_rate IS NULL) OR 
  (percentage IS NULL AND flat_rate IS NOT NULL)
),
ADD CONSTRAINT partner_revenue_shares_flat_rate_check 
CHECK (flat_rate IS NULL OR flat_rate >= 0);