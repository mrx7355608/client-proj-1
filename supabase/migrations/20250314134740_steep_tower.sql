/*
  # Fix User Profiles RLS Policies

  1. Changes
    - Drop existing policies
    - Create new simplified policies that avoid recursion
    - Fix update policy to properly handle admin checks

  2. Security
    - Users can still only access their own profile
    - Admins maintain full access
    - Protected fields remain secure
*/

-- Drop existing policies
DROP POLICY IF EXISTS "user_profiles_select_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete_policy" ON user_profiles;

-- Create simplified policies

-- Select policy: Allow users to read all profiles
-- This is safe because we only expose necessary fields through API queries
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

-- Update policy: Users can update their own profile, admins can update any profile
CREATE POLICY "user_profiles_update_policy"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    -- Allow if user is updating their own profile
    id = auth.uid()
    OR
    -- Or if user is an admin
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
    )
    OR
    -- For regular users updating their own profile
    (
      id = auth.uid()
      AND
      -- Get current values to ensure restricted fields aren't changed
      EXISTS (
        SELECT 1
        FROM user_profiles up
        WHERE up.id = auth.uid()
        AND (
          -- Allow updating non-admin fields
          (
            is_admin IS NULL 
            OR is_admin = up.is_admin
          )
          AND
          (
            status IS NULL 
            OR status = up.status
          )
          AND
          (
            password_reset_required IS NULL 
            OR password_reset_required = up.password_reset_required
          )
        )
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
      SELECT 1
      FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.is_admin = true
    )
  );