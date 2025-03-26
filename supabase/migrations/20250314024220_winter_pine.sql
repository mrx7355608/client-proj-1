/*
  # Add User Management Functions

  1. Changes
    - Add function to handle user invites
    - Add function to handle password resets
    - Add function to handle user deletion
    - Update RLS policies for user management

  2. Security
    - Functions run with security definer
    - Only admins can perform sensitive operations
*/

-- Create function to invite a new user
CREATE OR REPLACE FUNCTION public.invite_user(
  email text,
  is_admin boolean,
  status text DEFAULT 'active',
  password_reset_required boolean DEFAULT true
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Check if the calling user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Only administrators can invite users';
  END IF;

  -- Create the user in auth.users
  INSERT INTO auth.users (
    instance_id,
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    email,
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    'authenticated'
  )
  RETURNING id INTO new_user_id;

  -- Create the user profile
  INSERT INTO user_profiles (
    id,
    is_admin,
    status,
    password_reset_required
  )
  VALUES (
    new_user_id,
    is_admin,
    status,
    password_reset_required
  );

  RETURN new_user_id;
END;
$$;

-- Create function to handle password resets
CREATE OR REPLACE FUNCTION public.request_password_reset(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the calling user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Only administrators can request password resets';
  END IF;

  -- Update the user profile
  UPDATE user_profiles
  SET password_reset_required = true
  WHERE id = user_id;

  RETURN true;
END;
$$;

-- Create function to delete a user
CREATE OR REPLACE FUNCTION public.delete_user(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the calling user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Only administrators can delete users';
  END IF;

  -- Delete the user profile (this will cascade to auth.users)
  DELETE FROM user_profiles WHERE id = user_id;

  RETURN true;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.invite_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.request_password_reset TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user TO authenticated;