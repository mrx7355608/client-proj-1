/*
  # Add User Status and Password Reset Fields

  1. Changes
    - Add status column to user_profiles
    - Add password_reset_required column to user_profiles
    - Add function to check if password reset is required
    - Add policy for admin-only status updates

  2. Security
    - Only admins can update user status
    - Users can see their own password reset status
*/

-- Add status and password reset columns
DO $$ BEGIN
  ALTER TABLE user_profiles 
  ADD COLUMN status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  ADD COLUMN password_reset_required boolean NOT NULL DEFAULT false;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

-- Create function to check if password reset is required
CREATE OR REPLACE FUNCTION public.needs_password_reset()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
    AND password_reset_required = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.needs_password_reset TO authenticated;

-- Create policy for status and password reset management
CREATE POLICY "Admins can manage user status and password reset"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    CASE 
      WHEN public.is_admin() THEN true
      WHEN auth.uid() = id AND 
           status = 'active' AND 
           password_reset_required = false THEN true
      ELSE false
    END
  );

-- Create policy for viewing status
CREATE POLICY "Users can view their own status"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_admin());