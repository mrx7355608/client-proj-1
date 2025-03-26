/*
  # Fix User Profiles RLS Policies

  1. Changes
    - Drop existing policies
    - Create new simplified policies that properly handle both admin and user access
    - Remove complex WITH CHECK clauses that were causing issues
    - Add separate policies for admin and user updates
  
  2. Security
    - Maintain proper access control
    - Allow admins to update any profile
    - Allow users to update their own non-admin fields
*/

-- Drop existing policies
DROP POLICY IF EXISTS "user_profiles_select_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete_policy" ON user_profiles;

-- Create new policies

-- Select policy: Allow users to read all profiles
CREATE POLICY "user_profiles_select_policy"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert policy: Users can only insert their own profile
CREATE POLICY "user_profiles_insert_policy"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Admin update policy: Admins can update any profile
CREATE POLICY "user_profiles_admin_update_policy"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.is_admin = true
    )
  );

-- User update policy: Users can update their own non-admin fields
CREATE POLICY "user_profiles_user_update_policy"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid()
    AND NOT EXISTS (
      SELECT 1
      FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.is_admin = true
    )
  )
  WITH CHECK (
    -- Ensure admin-only fields aren't being changed
    is_admin IS NULL
    AND status IS NULL
    AND password_reset_required IS NULL
  );

-- Delete policy: Only admins can delete profiles
CREATE POLICY "user_profiles_delete_policy"
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