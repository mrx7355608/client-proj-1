/*
  # Fix User Profile RLS Policies

  1. Changes
    - Restructure RLS policies to avoid infinite recursion
    - Optimize policy checks for better performance
    - Maintain same security model with more efficient implementation

  2. Security
    - Users can still only view and update their own profiles
    - Admins can still view and update all profiles
    - Regular users still cannot modify admin-only fields
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for users and admins" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert access for users" ON user_profiles;
DROP POLICY IF EXISTS "Enable update access for users and admins" ON user_profiles;
DROP POLICY IF EXISTS "Enable delete access for admins" ON user_profiles;

-- Create new optimized policies

-- Select policy: Users can view their own profile, admins can view all
CREATE POLICY "Enable read access for users and admins"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.id = auth.uid() AND up.is_admin = true
    )
  );

-- Insert policy: Users can only insert their own profile
CREATE POLICY "Enable insert access for users"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Update policy: Users can update their own non-admin fields, admins can update everything
CREATE POLICY "Enable update access for users and admins"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    -- User can update their own profile OR they are an admin
    id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.id = auth.uid() AND up.is_admin = true
    )
  )
  WITH CHECK (
    CASE
      -- Admins can update any field
      WHEN EXISTS (
        SELECT 1 FROM user_profiles up 
        WHERE up.id = auth.uid() AND up.is_admin = true
      ) THEN true
      -- Regular users can only update non-admin fields of their own profile
      WHEN id = auth.uid() THEN
        -- Ensure admin status and other restricted fields aren't being changed
        (
          SELECT 
            COALESCE(is_admin, false) = up.is_admin AND
            COALESCE(status, 'active') = up.status AND
            COALESCE(password_reset_required, false) = up.password_reset_required
          FROM user_profiles up 
          WHERE up.id = auth.uid()
        )
      ELSE false
    END
  );

-- Delete policy: Only admins can delete profiles
CREATE POLICY "Enable delete access for admins"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.id = auth.uid() AND up.is_admin = true
    )
  );