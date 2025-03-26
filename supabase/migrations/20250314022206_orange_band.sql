/*
  # Update User Profiles RLS Policies

  1. Changes
    - Drop existing policies that may conflict
    - Create new policies that properly handle both admin and user access
    - Ensure users can update their own profiles while admins can update any profile

  2. Security
    - Users can only view and update their own profiles
    - Admins can view and update all profiles
    - Password reset and status management restricted to admins
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Only admins can delete user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Only admins can update admin status" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage user status and password reset" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own status" ON user_profiles;

-- Create new policies

-- Select policy: Users can view their own profile, admins can view all
CREATE POLICY "Enable read access for users and admins"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR 
    (SELECT is_admin FROM user_profiles WHERE id = auth.uid())
  );

-- Insert policy: Users can only insert their own profile
CREATE POLICY "Enable insert access for users"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Update policy: Users can update their own non-admin fields, admins can update everything
CREATE POLICY "Enable update access for users and admins"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    -- User can access their own profile OR admin can access any profile
    auth.uid() = id OR 
    (SELECT is_admin FROM user_profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    CASE
      -- Admins can update any field
      WHEN (SELECT is_admin FROM user_profiles WHERE id = auth.uid()) THEN
        true
      -- Regular users can only update non-admin fields of their own profile
      WHEN auth.uid() = id THEN
        -- Ensure admin status and other restricted fields aren't being changed
        coalesce(is_admin, false) = (SELECT is_admin FROM user_profiles WHERE id = auth.uid()) AND
        coalesce(status, 'active') = (SELECT status FROM user_profiles WHERE id = auth.uid()) AND
        coalesce(password_reset_required, false) = (SELECT password_reset_required FROM user_profiles WHERE id = auth.uid())
      ELSE
        false
    END
  );

-- Delete policy: Only admins can delete profiles
CREATE POLICY "Enable delete access for admins"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING ((SELECT is_admin FROM user_profiles WHERE id = auth.uid()));