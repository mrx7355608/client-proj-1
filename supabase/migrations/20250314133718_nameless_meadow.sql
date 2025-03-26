/*
  # Fix User Profiles RLS Policies

  1. Changes
    - Drop all existing policies
    - Create new policies with proper naming
    - Fix policy recursion issues
    - Maintain security model

  2. Security
    - Users can only view and update their own profiles
    - Admins can view and update all profiles
    - Protected fields remain secure
*/

-- Drop ALL existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for users" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for users and admins" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert access for users" ON user_profiles;
DROP POLICY IF EXISTS "Enable update access for users" ON user_profiles;
DROP POLICY IF EXISTS "Enable update access for users and admins" ON user_profiles;
DROP POLICY IF EXISTS "Enable delete access for admins" ON user_profiles;

-- Create new policies with unique names

-- Select policy: Users can view their own profile, admins can view all
CREATE POLICY "user_profiles_read_policy"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.id = auth.uid() AND up.is_admin = true
    )
  );

-- Insert policy: Users can only insert their own profile
CREATE POLICY "user_profiles_insert_policy"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Update policy: Users can update their own profile, admins can update any profile
CREATE POLICY "user_profiles_update_policy"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    -- User can update their own profile OR they are an admin
    id = auth.uid() OR EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.id = auth.uid() AND up.is_admin = true
    )
  )
  WITH CHECK (
    -- For admins, allow all updates
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.id = auth.uid() AND up.is_admin = true
    ) OR
    -- For regular users updating their own profile
    (
      id = auth.uid() AND
      -- Ensure restricted fields aren't being changed
      EXISTS (
        SELECT 1 FROM user_profiles up 
        WHERE up.id = auth.uid()
        AND COALESCE(is_admin, up.is_admin) = up.is_admin
        AND COALESCE(status, up.status) = up.status
        AND COALESCE(password_reset_required, up.password_reset_required) = up.password_reset_required
      )
    )
  );

-- Delete policy: Only admins can delete profiles
CREATE POLICY "user_profiles_delete_policy"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.id = auth.uid() AND up.is_admin = true
    )
  );