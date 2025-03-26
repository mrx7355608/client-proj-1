-- Drop existing policies
DROP POLICY IF EXISTS "auth_select_policy" ON user_profiles;
DROP POLICY IF EXISTS "auth_insert_policy" ON user_profiles;
DROP POLICY IF EXISTS "auth_update_policy" ON user_profiles;
DROP POLICY IF EXISTS "auth_delete_policy" ON user_profiles;

-- Create new simplified policies

-- Select policy: Allow all authenticated users to read profiles
CREATE POLICY "auth_select_policy"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert policy: Users can only insert their own profile
CREATE POLICY "auth_insert_policy"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Update policy: Split into two policies for clarity
-- 1. Admin update policy
CREATE POLICY "auth_admin_update_policy"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 2. User update policy (for non-admin users)
CREATE POLICY "auth_user_update_policy"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid() AND NOT EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  )
  WITH CHECK (
    -- Ensure admin-only fields aren't being changed
    (is_admin IS NOT DISTINCT FROM (SELECT is_admin FROM user_profiles WHERE id = id)) AND
    (status IS NOT DISTINCT FROM (SELECT status FROM user_profiles WHERE id = id)) AND
    (password_reset_required IS NOT DISTINCT FROM (SELECT password_reset_required FROM user_profiles WHERE id = id))
  );

-- Delete policy: Only admins can delete profiles
CREATE POLICY "auth_delete_policy"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );