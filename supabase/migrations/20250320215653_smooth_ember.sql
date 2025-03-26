-- Drop existing policies
DROP POLICY IF EXISTS "auth_select_policy" ON user_profiles;
DROP POLICY IF EXISTS "auth_insert_policy" ON user_profiles;
DROP POLICY IF EXISTS "auth_update_policy" ON user_profiles;
DROP POLICY IF EXISTS "auth_delete_policy" ON user_profiles;

-- Create new policies with proper access controls

-- Select policy: Allow users to read their own profile and admins to read all
CREATE POLICY "auth_select_policy"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.is_admin = true
    )
  );

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
    -- User can update their own profile OR they are an admin
    id = auth.uid() OR EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.is_admin = true
    )
  );

-- Delete policy: Only admins can delete profiles
CREATE POLICY "auth_delete_policy"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid() AND up.is_admin = true
  ));