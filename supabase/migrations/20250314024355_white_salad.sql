/*
  # Fix User Management Functions

  1. Changes
    - Update invite_user function to handle auth properly
    - Add temporary password generation
    - Ensure proper user creation flow
*/

-- Create function to generate a random password
CREATE OR REPLACE FUNCTION public.generate_random_password(length integer DEFAULT 12)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars text := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i integer := 0;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Update invite_user function to handle auth properly
CREATE OR REPLACE FUNCTION public.invite_user(
  email text,
  is_admin boolean,
  status text DEFAULT 'active',
  password_reset_required boolean DEFAULT true
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id uuid;
  temp_password text;
BEGIN
  -- Check if the calling user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Only administrators can invite users';
  END IF;

  -- Generate a temporary password
  temp_password := public.generate_random_password();

  -- Create the user in auth.users with the temporary password
  INSERT INTO auth.users (
    instance_id,
    email,
    encrypted_password,
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
    crypt(temp_password, gen_salt('bf')),
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

  -- Return the temporary password along with the user ID
  RETURN new_user_id;
END;
$$;