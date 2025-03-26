-- Update invite_user function to handle additional fields
CREATE OR REPLACE FUNCTION public.invite_user(
  email text,
  is_admin boolean,
  status text DEFAULT 'active',
  password_reset_required boolean DEFAULT true,
  first_name text DEFAULT NULL,
  last_name text DEFAULT NULL,
  company text DEFAULT NULL,
  phone text DEFAULT NULL,
  initial_password text DEFAULT NULL
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

  -- Use provided password or generate one
  temp_password := COALESCE(initial_password, public.generate_random_password());

  -- Create the user in auth.users with the password
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

  -- Create the user profile with all fields
  INSERT INTO user_profiles (
    id,
    first_name,
    last_name,
    company,
    phone,
    is_admin,
    status,
    password_reset_required
  )
  VALUES (
    new_user_id,
    first_name,
    last_name,
    company,
    phone,
    is_admin,
    status,
    password_reset_required
  );

  RETURN new_user_id;
END;
$$;