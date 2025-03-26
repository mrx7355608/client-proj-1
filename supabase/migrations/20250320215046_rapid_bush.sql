-- Drop all existing versions of the invite_user function
DO $$ 
BEGIN
  DROP FUNCTION IF EXISTS public.invite_user(text, boolean, text, boolean, text, text, text, text, text);
  DROP FUNCTION IF EXISTS public.invite_user(text, boolean, text, boolean);
  DROP FUNCTION IF EXISTS public.invite_user(text, boolean);
EXCEPTION
  WHEN others THEN null;
END $$;

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

-- Recreate the invite_user function with explicit parameter names
CREATE OR REPLACE FUNCTION public.invite_user(
  IN p_email text,
  IN p_is_admin boolean,
  IN p_status text DEFAULT 'active',
  IN p_reset_required boolean DEFAULT false,
  IN p_first_name text DEFAULT NULL,
  IN p_last_name text DEFAULT NULL,
  IN p_company text DEFAULT NULL,
  IN p_phone text DEFAULT NULL,
  IN p_password text DEFAULT NULL
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
  IF p_password IS NULL OR length(p_password) < 6 THEN
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
    p_email,                                    -- email
    crypt(p_password, gen_salt('bf')),          -- encrypted_password
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
    encode(gen_random_bytes(32), 'base64'),     -- confirmation_token
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
      'email', p_email,
      'email_verified', true
    ),
    'email',
    p_email,
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
    p_first_name,
    p_last_name,
    p_company,
    p_phone,
    p_is_admin,
    p_status,
    p_reset_required
  );

  -- Set up default permissions
  INSERT INTO user_page_permissions (user_id, page_id, has_access)
  SELECT new_user_id, id, true
  FROM pages;

  INSERT INTO user_feature_permissions (user_id, feature_id, enabled)
  SELECT new_user_id, id, true
  FROM features;

  RETURN new_user_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.generate_random_password TO authenticated;
GRANT EXECUTE ON FUNCTION public.invite_user TO authenticated;