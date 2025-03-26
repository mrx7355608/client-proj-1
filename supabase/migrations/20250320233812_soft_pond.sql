-- Drop existing policies
DROP POLICY IF EXISTS "auth_select_policy" ON user_profiles;
DROP POLICY IF EXISTS "auth_insert_policy" ON user_profiles;
DROP POLICY IF EXISTS "auth_admin_update_policy" ON user_profiles;
DROP POLICY IF EXISTS "auth_user_update_policy" ON user_profiles;
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

-- Single update policy that handles both admin and user cases
CREATE POLICY "auth_update_policy"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    -- User can update their own profile OR they are an admin
    id = auth.uid() OR EXISTS (
      SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true
    )
  )
  WITH CHECK (
    -- For admins, allow all updates
    EXISTS (
      SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true
    )
    OR
    -- For regular users updating their own profile
    (
      -- Must be updating their own profile
      id = auth.uid()
      AND
      -- Must not change admin status
      (is_admin IS NULL OR is_admin = (SELECT is_admin FROM user_profiles WHERE id = auth.uid()))
      AND
      -- Must not change status
      (status IS NULL OR status = (SELECT status FROM user_profiles WHERE id = auth.uid()))
      AND
      -- Must not change password reset flag
      (password_reset_required IS NULL OR password_reset_required = (SELECT password_reset_required FROM user_profiles WHERE id = auth.uid()))
    )
  );

-- Delete policy: Only admins can delete profiles
CREATE POLICY "auth_delete_policy"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true
    )
  );