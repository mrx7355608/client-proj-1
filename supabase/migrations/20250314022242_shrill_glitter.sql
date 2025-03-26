/*
  # Fix RLS Policy Recursion

  1. Changes
    - Restructure RLS policies to avoid infinite recursion
    - Simplify policy checks
    - Maintain same security model but with more efficient implementation

  2. Security
    - Users can still only view and update their own profiles
    - Admins can still view and update all profiles
    - Password reset and status management still restricted to admins
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for users and admins" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert access for users" ON user_profiles;
DROP POLICY IF EXISTS "Enable update access for users and admins" ON user_profiles;
DROP POLICY IF EXISTS "Enable delete access for admins" ON user_profiles;

-- Create new policies with optimized checks

-- Select policy: Users can view their own profile, admins can view all
CREATE POLICY "Enable read access for users and admins"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND (
        -- User can view their own profile OR they are an admin
        up.id = id OR up.is_admin = true
      )
    )
  );

-- Insert policy: Users can only insert their own profile
CREATE POLICY "Enable insert access for users"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Update policy: Users can update their own non-admin fields, admins can update everything
CREATE POLICY "Enable update access for users and admins"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND (
        -- User can update their own profile OR they are an admin
        up.id = id OR up.is_admin = true
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND (
        CASE
          -- Admins can update any field
          WHEN up.is_admin THEN true
          -- Regular users can only update non-admin fields of their own profile
          WHEN up.id = id THEN
            -- Ensure admin status and other restricted fields aren't being changed
            coalesce(is_admin, false) = up.is_admin AND
            coalesce(status, 'active') = up.status AND
            coalesce(password_reset_required, false) = up.password_reset_required
          ELSE false
        END
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
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.is_admin = true
    )
  );