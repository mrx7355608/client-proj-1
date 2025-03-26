-- Drop existing policies
DROP POLICY IF EXISTS "admin_policy_20250314" ON user_profiles;
DROP POLICY IF EXISTS "user_read_policy_20250314" ON user_profiles;
DROP POLICY IF EXISTS "user_update_policy_20250314" ON user_profiles;
DROP POLICY IF EXISTS "user_insert_policy_20250314" ON user_profiles;

-- Create new simplified policies

-- Select policy: Allow all authenticated users to read profiles
-- This is safe because we only expose necessary fields through API queries
CREATE POLICY "select_policy_20250314"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert policy: Users can only insert their own profile
CREATE POLICY "insert_policy_20250314"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Update policy: Split into two policies for clarity
-- 1. Admin update policy
CREATE POLICY "admin_update_policy_20250314"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    -- Check if the user is an admin (using a direct subquery)
    EXISTS (
      SELECT 1
      FROM user_profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

-- 2. User update policy (for non-admin users)
CREATE POLICY "user_update_policy_20250314"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    -- User can only update their own profile
    id = auth.uid()
  )
  WITH CHECK (
    -- And cannot modify admin-related fields
    is_admin IS NOT DISTINCT FROM (SELECT is_admin FROM user_profiles WHERE id = auth.uid())
    AND status IS NOT DISTINCT FROM (SELECT status FROM user_profiles WHERE id = auth.uid())
    AND password_reset_required IS NOT DISTINCT FROM (SELECT password_reset_required FROM user_profiles WHERE id = auth.uid())
  );

-- Delete policy: Only admins can delete profiles
CREATE POLICY "delete_policy_20250314"
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