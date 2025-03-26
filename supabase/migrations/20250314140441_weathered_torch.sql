-- Drop existing function
DROP FUNCTION IF EXISTS public.invite_user(text, boolean, text, boolean, text, text, text, text, text);

-- Recreate the function with proper user creation handling
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
  temp_password text;
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
  
  -- Use provided password or generate one
  temp_password := COALESCE(user_password, public.generate_random_password());

  -- Create the user in auth.users with the password
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at,
    role
  )
  VALUES (
    new_user_id,                                -- id
    default_instance_id,                        -- instance_id
    user_email,                                 -- email
    crypt(temp_password, gen_salt('bf')),       -- encrypted_password
    now(),                                      -- email_confirmed_at
    NULL,                                       -- confirmation_token
    NULL,                                       -- confirmation_sent_at
    NULL,                                       -- recovery_token
    NULL,                                       -- recovery_sent_at
    NULL,                                       -- email_change_token_new
    NULL,                                       -- email_change
    NULL,                                       -- email_change_sent_at
    NULL,                                       -- last_sign_in_at
    jsonb_build_object(                         -- raw_app_meta_data
      'provider', 'email',
      'providers', ARRAY['email']
    ),
    '{}'::jsonb,                               -- raw_user_meta_data
    false,                                      -- is_super_admin
    now(),                                      -- created_at
    now(),                                      -- updated_at
    NULL,                                       -- phone
    NULL,                                       -- phone_confirmed_at
    NULL,                                       -- phone_change
    NULL,                                       -- phone_change_token
    NULL,                                       -- phone_change_sent_at
    NULL,                                       -- email_change_token_current
    0,                                          -- email_change_confirm_status
    NULL,                                       -- banned_until
    NULL,                                       -- reauthentication_token
    NULL,                                       -- reauthentication_sent_at
    false,                                      -- is_sso_user
    NULL,                                       -- deleted_at
    'authenticated'                             -- role
  );

  -- Create identities record with provider_id
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
      'email_verified', true
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

  RETURN new_user_id;
END;
$$;