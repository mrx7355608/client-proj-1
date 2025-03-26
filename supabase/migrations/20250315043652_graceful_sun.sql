/*
  # Add Invoicing System Schema

  1. Changes
    - Drop existing foreign key constraint if it exists
    - Add foreign key constraint with proper error handling
    - Maintain all other schema changes

  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing foreign key constraint if it exists
ALTER TABLE invoices
DROP CONSTRAINT IF EXISTS invoices_agreement_id_fkey;

-- Add foreign key constraint
ALTER TABLE invoices
ADD CONSTRAINT invoices_agreement_id_fkey
FOREIGN KEY (agreement_id) REFERENCES agreements(id) ON DELETE SET NULL;

-- Create updated_at triggers if they don't exist
DO $$ BEGIN
  CREATE TRIGGER update_invoices_updated_at
      BEFORE UPDATE ON invoices
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_invoice_items_updated_at
      BEFORE UPDATE ON invoice_items
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_agreements_updated_at
      BEFORE UPDATE ON agreements
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_agreement_services_updated_at
      BEFORE UPDATE ON agreement_services
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;