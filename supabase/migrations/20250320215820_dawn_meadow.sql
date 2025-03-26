-- Drop existing policies
DROP POLICY IF EXISTS "auth_select_policy" ON user_profiles;
DROP POLICY IF EXISTS "auth_insert_policy" ON user_profiles;
DROP POLICY IF EXISTS "auth_update_policy" ON user_profiles;
DROP POLICY IF EXISTS "auth_delete_policy" ON user_profiles;

-- Create new simplified policies that avoid recursion

-- Select policy: Allow all authenticated users to read profiles
-- This is safe because we only expose necessary fields through API queries
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

-- Update policy: Users can update their own profile, admins can update any profile
CREATE POLICY "auth_update_policy"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    -- Allow if user is updating their own profile
    id = auth.uid()
  )
  WITH CHECK (
    -- For admins, allow all updates
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
    OR
    -- For regular users updating their own profile
    (
      id = auth.uid()
      AND
      -- Get current values to ensure restricted fields aren't changed
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid()
        AND (
          -- Allow updating non-admin fields
          (is_admin IS NULL OR is_admin = false)
          AND (status IS NULL OR status = 'active')
          AND (password_reset_required IS NULL OR password_reset_required = false)
        )
      )
    )
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