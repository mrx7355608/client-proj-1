/*
  # Add status field to clients table

  1. Changes
    - Add status enum type for client states
    - Add status column to clients table with default value
    - Update existing clients to have 'active' status

  2. Security
    - Maintain existing RLS policies
*/

-- Create enum for client status
CREATE TYPE client_status AS ENUM ('active', 'disconnected', 'suspended');

-- Add status column to clients table
ALTER TABLE clients 
ADD COLUMN status client_status NOT NULL DEFAULT 'active';

-- Update existing clients to have 'active' status
UPDATE clients SET status = 'active' WHERE status IS NULL;