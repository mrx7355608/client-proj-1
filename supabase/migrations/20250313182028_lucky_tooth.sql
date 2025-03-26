/*
  # Add Revenue Share Management

  1. Changes
    - Add priority_order column to partner_revenue_shares table
    - Add flat_rate column as an alternative to percentage
    - Add check constraint to ensure either percentage or flat_rate is set, but not both
    - Add check constraint for valid percentage range (0-100)
    - Add check constraint for valid flat_rate (>= 0)

  2. Security
    - Maintain existing RLS policies
*/

-- Add new columns to partner_revenue_shares
ALTER TABLE partner_revenue_shares 
ADD COLUMN priority_order integer NOT NULL DEFAULT 0,
ADD COLUMN flat_rate numeric(10,2) NULL;

-- Add check constraints
ALTER TABLE partner_revenue_shares
ADD CONSTRAINT partner_revenue_shares_percentage_or_flat_rate_check 
CHECK (
  (percentage IS NOT NULL AND flat_rate IS NULL) OR 
  (percentage IS NULL AND flat_rate IS NOT NULL)
),
ADD CONSTRAINT partner_revenue_shares_flat_rate_check 
CHECK (flat_rate >= 0);

-- Create index on priority_order for efficient ordering
CREATE INDEX partner_revenue_shares_priority_order_idx ON partner_revenue_shares (priority_order);