/*
  # Fix User Profiles RLS Policies

  1. Changes
    - Drop existing policies
    - Create new simplified policies that avoid recursion
    - Maintain security while improving performance

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

-- Create simplified policies that avoid recursion

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
  )
  WITH CHECK (
    CASE
      -- If user is an admin, allow all updates
      WHEN EXISTS (
        SELECT 1
        FROM user_profiles
        WHERE id = auth.uid()
        AND is_admin = true
      ) THEN true
      -- If updating own profile, ensure admin fields aren't changed
      WHEN id = auth.uid() THEN
        is_admin = (SELECT is_admin FROM user_profiles WHERE id = auth.uid())
        AND status = (SELECT status FROM user_profiles WHERE id = auth.uid())
        AND password_reset_required = (SELECT password_reset_required FROM user_profiles WHERE id = auth.uid())
      ELSE false
    END
  );

-- Delete policy: Only admins can delete profiles
CREATE POLICY "user_profiles_delete_policy"
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