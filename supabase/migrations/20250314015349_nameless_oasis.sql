/*
  # Fix User Management Functions and Policies

  1. Changes
    - Drop existing policies that depend on auth.is_admin
    - Create new functions in public schema
    - Create new policies using public functions
    - Grant necessary permissions

  2. Security
    - Functions run with SECURITY DEFINER
    - Policies ensure only admins can manage users
*/

-- First drop the policies that depend on the function
DROP POLICY IF EXISTS "Only admins can delete user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Only admins can update admin status" ON public.user_profiles;

-- Now we can safely drop the functions
DROP FUNCTION IF EXISTS auth.is_admin();
DROP FUNCTION IF EXISTS auth.get_users();

-- Create function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
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
CREATE OR REPLACE FUNCTION public.get_users()
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz
) AS $$
BEGIN
  IF (SELECT public.is_admin()) THEN
    RETURN QUERY SELECT u.id, u.email::text, u.created_at
    FROM auth.users u;
  ELSE
    RETURN QUERY SELECT u.id, u.email::text, u.created_at
    FROM auth.users u
    WHERE u.id = auth.uid();
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_users TO authenticated;

-- Create new policies using the public schema functions
CREATE POLICY "Only admins can delete user profiles"
  ON public.user_profiles
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Only admins can update admin status"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());