/*
  # Fix User Profiles RLS Policies

  1. Changes
    - Drop existing policies
    - Create new policies with unique names
    - Allow admins full access
    - Restrict regular users to their own profiles
  
  2. Security
    - Admins can perform all operations
    - Regular users can only modify their own non-admin fields
*/

-- Drop existing policies
DROP POLICY IF EXISTS "admin_full_access" ON user_profiles;
DROP POLICY IF EXISTS "user_read_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "user_update_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "user_insert_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_select_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_admin_update_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_user_update_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete_policy" ON user_profiles;

-- Create new policies with unique names

-- Admin policy: Full access for admins
CREATE POLICY "admin_policy_20250314"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.is_admin = true
    )
  );

-- User read policy: Users can read their own profile
CREATE POLICY "user_read_policy_20250314"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- User update policy: Users can update their own non-admin fields
CREATE POLICY "user_update_policy_20250314"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    -- Ensure admin-only fields aren't being modified
    (is_admin IS NULL OR is_admin = (SELECT is_admin FROM user_profiles WHERE id = auth.uid())) AND
    (status IS NULL OR status = (SELECT status FROM user_profiles WHERE id = auth.uid())) AND
    (password_reset_required IS NULL OR password_reset_required = (SELECT password_reset_required FROM user_profiles WHERE id = auth.uid()))
  );

-- User insert policy: Users can only insert their own profile
CREATE POLICY "user_insert_policy_20250314"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());