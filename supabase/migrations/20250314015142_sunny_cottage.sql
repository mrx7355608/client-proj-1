/*
  # Admin Access Functions and Policies

  1. Functions
    - Create function to check admin status
    - Create function to get user data
  2. Security
    - Add RLS policies for admin access
*/

-- Create function to check if a user is an admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user data
CREATE OR REPLACE FUNCTION auth.get_users()
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz
) AS $$
BEGIN
  IF auth.is_admin() THEN
    RETURN QUERY SELECT u.id, u.email::text, u.created_at
    FROM auth.users u;
  ELSE
    RETURN QUERY SELECT u.id, u.email::text, u.created_at
    FROM auth.users u
    WHERE u.id = auth.uid();
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policies for user_profiles to restrict admin operations
CREATE POLICY "Only admins can delete user profiles"
  ON public.user_profiles
  FOR DELETE
  TO authenticated
  USING (auth.is_admin());

CREATE POLICY "Only admins can update admin status"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT EXECUTE ON FUNCTION auth.is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION auth.get_users TO authenticated;