/*
  # Improve Delete User Function

  1. Changes
    - Update delete_user function to handle both auth and profile deletion
    - Add proper error handling
    - Ensure admin-only access
*/

-- Update the delete_user function to handle complete user removal
CREATE OR REPLACE FUNCTION public.delete_user(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the calling user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Only administrators can delete users';
  END IF;

  -- Delete from auth.users (this will cascade to user_profiles)
  DELETE FROM auth.users WHERE id = user_id;

  RETURN true;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user TO authenticated;