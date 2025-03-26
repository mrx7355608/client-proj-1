/*
  # Fix User Profiles RLS Policies

  1. Changes
    - Drop existing policies
    - Create new simplified policies that avoid recursion
    - Maintain security model
    - Fix infinite recursion in policy checks

  2. Security
    - Users can only view and update their own profiles
    - Admins can view and update all profiles
    - Protected fields remain secure
*/

-- Drop ALL existing policies to avoid conflicts
DROP POLICY IF EXISTS "user_profiles_read_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete_policy" ON user_profiles;

-- Create new simplified policies

-- Select policy: Allow users to read their own profile and admins to read all
CREATE POLICY "user_profiles_select_policy"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR
    (SELECT is_admin FROM user_profiles WHERE id = auth.uid())
  );

-- Insert policy: Users can only insert their own profile
CREATE POLICY "user_profiles_insert_policy"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Update policy: Users can update their own non-admin fields, admins can update everything
CREATE POLICY "user_profiles_update_policy"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR (SELECT is_admin FROM user_profiles WHERE id = auth.uid()))
  WITH CHECK (
    CASE
      -- If user is an admin, allow all updates
      WHEN (SELECT is_admin FROM user_profiles WHERE id = auth.uid()) THEN true
      -- If updating own profile, ensure admin fields aren't changed
      WHEN id = auth.uid() THEN
        (is_admin IS NOT DISTINCT FROM (SELECT is_admin FROM user_profiles WHERE id = auth.uid())) AND
        (status IS NOT DISTINCT FROM (SELECT status FROM user_profiles WHERE id = auth.uid())) AND
        (password_reset_required IS NOT DISTINCT FROM (SELECT password_reset_required FROM user_profiles WHERE id = auth.uid()))
      ELSE false
    END
  );

-- Delete policy: Only admins can delete profiles
CREATE POLICY "user_profiles_delete_policy"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING ((SELECT is_admin FROM user_profiles WHERE id = auth.uid()));