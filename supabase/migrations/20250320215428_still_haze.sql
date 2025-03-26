-- Drop existing function to avoid conflicts
DROP FUNCTION IF EXISTS public.invite_user(text, boolean, text, boolean, text, text, text, text, text);

-- Create function to generate random password if needed
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

-- Recreate the invite_user function with proper auth setup
CREATE OR REPLACE FUNCTION public.invite_user(
  user_email text,
  admin_status boolean,
  user_status text DEFAULT 'active',
  reset_required boolean DEFAULT false,
  user_first_name text DEFAULT NULL,
  user_last_name text DEFAULT NULL,
  user_company text DEFAULT NULL,
  user_phone text DEFAULT NULL,
  user_password text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = extensions, public, auth
AS $$
DECLARE
  new_user_id uuid;
  default_instance_id uuid := '00000000-0000-0000-0000-000000000000'::uuid;
BEGIN
  -- Check if the calling user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid() AND up.is_admin = true
  ) THEN
    RAISE EXCEPTION 'Only administrators can invite users';
  END IF;

  -- Generate UUID for new user
  new_user_id := gen_random_uuid();
  
  -- Validate password
  IF user_password IS NULL OR length(user_password) < 6 THEN
    RAISE EXCEPTION 'Password must be at least 6 characters long';
  END IF;

  -- Create the user in auth.users with the password
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    confirmation_token,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at
  )
  VALUES (
    new_user_id,                                -- id
    default_instance_id,                        -- instance_id
    'authenticated',                            -- aud
    'authenticated',                            -- role
    user_email,                                 -- email
    crypt(user_password, gen_salt('bf')),       -- encrypted_password
    now(),                                      -- email_confirmed_at
    now(),                                      -- last_sign_in_at
    jsonb_build_object(                         -- raw_app_meta_data
      'provider', 'email',
      'providers', ARRAY['email']
    ),
    '{}'::jsonb,                               -- raw_user_meta_data
    false,                                      -- is_super_admin
    now(),                                      -- created_at
    now(),                                      -- updated_at
    NULL,                                       -- confirmation_token
    0,                                          -- email_change_confirm_status
    NULL,                                       -- banned_until
    NULL,                                       -- reauthentication_token
    NULL,                                       -- reauthentication_sent_at
    false,                                      -- is_sso_user
    NULL                                        -- deleted_at
  );

  -- Create identities record
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    created_at,
    updated_at,
    last_sign_in_at
  )
  VALUES (
    gen_random_uuid(),
    new_user_id,
    jsonb_build_object(
      'sub', new_user_id::text,
      'email', user_email,
      'email_verified', true,
      'aud', 'authenticated',
      'role', 'authenticated'
    ),
    'email',
    user_email,
    now(),
    now(),
    now()
  );

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
    user_first_name,
    user_last_name,
    user_company,
    user_phone,
    admin_status,
    user_status,
    reset_required
  );

  -- Set up default permissions if tables exist
  BEGIN
    INSERT INTO user_page_permissions (user_id, page_id, has_access)
    SELECT new_user_id, id, true
    FROM pages;
  EXCEPTION
    WHEN undefined_table THEN
      NULL;
  END;

  BEGIN
    INSERT INTO user_feature_permissions (user_id, feature_id, enabled)
    SELECT new_user_id, id, true
    FROM features;
  EXCEPTION
    WHEN undefined_table THEN
      NULL;
  END;

  RETURN new_user_id;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_random_password TO authenticated;
GRANT EXECUTE ON FUNCTION public.invite_user TO authenticated;