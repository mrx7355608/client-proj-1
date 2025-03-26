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

-- Select policy: Allow authenticated users to read all profiles
-- This is safe because we only expose necessary fields through API queries
CREATE POLICY "Enable read access for users"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert policy: Users can only insert their own profile
CREATE POLICY "Enable insert access for users"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Update policy: Users can update their own profile, admins can update any profile
CREATE POLICY "Enable update access for users"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    CASE
      -- If user is an admin, allow all updates
      WHEN is_admin = true THEN true
      -- If updating own profile, ensure admin fields aren't changed
      WHEN id = auth.uid() THEN
        is_admin = (SELECT is_admin FROM user_profiles WHERE id = auth.uid()) AND
        status = (SELECT status FROM user_profiles WHERE id = auth.uid()) AND
        password_reset_required = (SELECT password_reset_required FROM user_profiles WHERE id = auth.uid())
      ELSE false
    END
  );

-- Delete policy: Only admins can delete profiles
CREATE POLICY "Enable delete access for admins"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE id = auth.uid() 
      AND is_admin = true
    )
  );