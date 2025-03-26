-- Add web_link column to inventory_items table
ALTER TABLE inventory_items
ADD COLUMN IF NOT EXISTS web_link text;

-- Refresh schema cache
SELECT pg_notify('pgrst', 'reload schema');