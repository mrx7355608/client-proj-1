/*
  # Add Revenue Share Index

  1. Changes
    - Add index on priority_order for efficient ordering
    - Skip constraints that already exist

  Note: The constraints are already present in the database, so we only need to add the index.
*/

-- Create index on priority_order for efficient ordering
CREATE INDEX IF NOT EXISTS partner_revenue_shares_priority_order_idx ON partner_revenue_shares (priority_order);