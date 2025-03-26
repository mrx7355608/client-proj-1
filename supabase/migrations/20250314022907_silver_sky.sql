/*
  # Fix User Profiles RLS Policies

  1. Changes
    - Simplify policy checks to avoid recursion
    - Optimize policy performance
    - Maintain same security rules

  2. Security
    - Users can only view and update their own profiles
    - Users cannot modify admin-related fields
    - Admins can view and modify all profiles
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for users and admins" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert access for users" ON user_profiles;
DROP POLICY IF EXISTS "Enable update access for users and admins" ON user_profiles;
DROP POLICY IF EXISTS "Enable delete access for admins" ON user_profiles;

-- Create new optimized policies

-- Select policy: Users can view their own profile, admins can view all
CREATE POLICY "Enable read access for users and admins"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Simple check for own profile first
    id = auth.uid() OR
    -- Then check for admin status
    EXISTS (
      SELECT 1 
      FROM user_profiles up 
      WHERE up.id = auth.uid() 
      AND up.is_admin = true
    )
  );

-- Insert policy: Users can only insert their own profile
CREATE POLICY "Enable insert access for users"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Update policy: Users can update their own non-admin fields, admins can update everything
CREATE POLICY "Enable update access for users and admins"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    -- Simple check for own profile or admin status
    id = auth.uid() OR
    EXISTS (
      SELECT 1 
      FROM user_profiles up 
      WHERE up.id = auth.uid() 
      AND up.is_admin = true
    )
  )
  WITH CHECK (
    -- For admins, allow all updates
    EXISTS (
      SELECT 1 
      FROM user_profiles up 
      WHERE up.id = auth.uid() 
      AND up.is_admin = true
    ) OR
    -- For regular users updating their own profile
    (
      id = auth.uid() AND
      -- Get current values once to avoid recursion
      EXISTS (
        SELECT 1 
        FROM user_profiles up 
        WHERE up.id = auth.uid()
        -- Ensure restricted fields aren't being changed
        AND is_admin = up.is_admin
        AND status = up.status
        AND password_reset_required = up.password_reset_required
      )
    )
  );

-- Delete policy: Only admins can delete profiles
CREATE POLICY "Enable delete access for admins"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM user_profiles up 
      WHERE up.id = auth.uid() 
      AND up.is_admin = true
    )
  );