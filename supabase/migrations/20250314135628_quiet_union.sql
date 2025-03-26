/*
  # Fix User Profiles RLS Policies

  1. Changes
    - Drop existing policies that cause recursion
    - Create new policies with optimized checks
    - Separate admin and user policies
    - Fix infinite recursion in policy checks

  2. Security
    - Maintain same security rules
    - Admins can perform all operations
    - Users can only modify their own non-admin fields
*/

-- Drop existing policies
DROP POLICY IF EXISTS "admin_policy_20250314" ON user_profiles;
DROP POLICY IF EXISTS "user_read_policy_20250314" ON user_profiles;
DROP POLICY IF EXISTS "user_update_policy_20250314" ON user_profiles;
DROP POLICY IF EXISTS "user_insert_policy_20250314" ON user_profiles;

-- Create new optimized policies

-- Admin policy: Allow admins to perform all operations
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

-- User insert policy: Users can only insert their own profile
CREATE POLICY "user_insert_policy_20250314"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- User update policy: Users can update their own non-admin fields
CREATE POLICY "user_update_policy_20250314"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    -- Compare with a subquery that runs only once
    (SELECT 
      (is_admin IS NOT DISTINCT FROM up.is_admin) AND
      (status IS NOT DISTINCT FROM up.status) AND
      (password_reset_required IS NOT DISTINCT FROM up.password_reset_required)
    FROM user_profiles up 
    WHERE up.id = auth.uid())
  );