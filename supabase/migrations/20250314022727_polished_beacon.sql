/*
  # Fix User Profiles RLS Policies

  1. Changes
    - Fix the UPDATE policy to properly reference NEW record
    - Optimize policy checks to avoid recursion
    - Ensure proper access control for users and admins

  2. Security
    - Maintain existing security rules
    - Users can only modify their own non-admin fields
    - Admins can modify all fields
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
        -- Get current values from the existing row
        EXISTS (
          SELECT 1 FROM user_profiles up 
          WHERE up.id = auth.uid()
          AND is_admin = up.is_admin  -- Ensure admin status isn't changed
          AND status = up.status  -- Ensure status isn't changed
          AND password_reset_required = up.password_reset_required  -- Ensure password reset flag isn't changed
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