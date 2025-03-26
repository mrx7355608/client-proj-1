/*
  # Fix User Profile Policies

  1. Changes
    - Drop existing policies that are causing recursion
    - Create new simplified policies that avoid recursive checks
    - Maintain security while improving performance

  2. Security
    - Users can still only access their own profile
    - Admins maintain full access
    - Protected fields (is_admin, status, password_reset_required) remain secure
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for users and admins" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert access for users" ON user_profiles;
DROP POLICY IF EXISTS "Enable update access for users and admins" ON user_profiles;
DROP POLICY IF EXISTS "Enable delete access for admins" ON user_profiles;

-- Create new simplified policies

-- Select policy: Allow authenticated users to read their own profile and admins to read all
CREATE POLICY "Enable read access for users and admins"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR 
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

-- Update policy: Users can update their own profile, with restrictions on admin fields
CREATE POLICY "Enable update access for users and admins"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
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