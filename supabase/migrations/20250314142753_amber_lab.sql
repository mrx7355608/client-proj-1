/*
  # Fix Authentication Issues

  1. Changes
    - Update RLS policies to ensure proper access during authentication
    - Fix user creation function to properly set up auth fields
    - Add missing auth schema permissions

  2. Security
    - Maintain existing security model
    - Ensure proper access control
*/

-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Drop existing function to recreate it
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
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    role,
    confirmation_token,
    email_change_confirm_status,
    aud,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at
  )
  VALUES (
    new_user_id,                                -- id
    default_instance_id,                        -- instance_id
    user_email,                                 -- email
    crypt(user_password, gen_salt('bf')),       -- encrypted_password
    now(),                                      -- email_confirmed_at
    jsonb_build_object(                         -- raw_app_meta_data
      'provider', 'email',
      'providers', ARRAY['email']::text[]
    ),
    '{}'::jsonb,                               -- raw_user_meta_data
    false,                                      -- is_super_admin
    now(),                                      -- created_at
    now(),                                      -- updated_at
    'authenticated',                            -- role
    NULL,                                       -- confirmation_token
    0,                                          -- email_change_confirm_status
    'authenticated',                            -- aud
    NULL,                                       -- confirmation_sent_at
    NULL,                                       -- recovery_token
    NULL,                                       -- recovery_sent_at
    NULL,                                       -- email_change_token_new
    NULL,                                       -- email_change
    NULL,                                       -- email_change_sent_at
    now(),                                      -- last_sign_in_at
    NULL,                                       -- phone
    NULL,                                       -- phone_confirmed_at
    NULL,                                       -- phone_change
    NULL,                                       -- phone_change_token
    NULL,                                       -- phone_change_sent_at
    NULL,                                       -- email_change_token_current
    NULL,                                       -- banned_until
    NULL,                                       -- reauthentication_token
    NULL,                                       -- reauthentication_sent_at
    false,                                      -- is_sso_user
    NULL                                        -- deleted_at
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

  RETURN new_user_id;
END;
$$;

-- Drop existing policies
DROP POLICY IF EXISTS "user_profiles_select_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete_policy" ON user_profiles;
DROP POLICY IF EXISTS "admin_policy_20250314" ON user_profiles;
DROP POLICY IF EXISTS "user_read_policy_20250314" ON user_profiles;
DROP POLICY IF EXISTS "user_update_policy_20250314" ON user_profiles;
DROP POLICY IF EXISTS "user_insert_policy_20250314" ON user_profiles;
DROP POLICY IF EXISTS "select_policy_20250314" ON user_profiles;
DROP POLICY IF EXISTS "insert_policy_20250314" ON user_profiles;
DROP POLICY IF EXISTS "admin_update_policy_20250314" ON user_profiles;
DROP POLICY IF EXISTS "user_update_policy_20250314" ON user_profiles;
DROP POLICY IF EXISTS "delete_policy_20250314" ON user_profiles;

-- Create new simplified policies
CREATE POLICY "auth_select_policy"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "auth_insert_policy"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "auth_update_policy"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true
  ))
  WITH CHECK (
    CASE
      WHEN EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
        THEN true
      WHEN id = auth.uid()
        THEN (
          is_admin IS NOT DISTINCT FROM (SELECT is_admin FROM user_profiles WHERE id = auth.uid()) AND
          status IS NOT DISTINCT FROM (SELECT status FROM user_profiles WHERE id = auth.uid()) AND
          password_reset_required IS NOT DISTINCT FROM (SELECT password_reset_required FROM user_profiles WHERE id = auth.uid())
        )
      ELSE false
    END
  );

CREATE POLICY "auth_delete_policy"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true
  ));

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.role() TO authenticated;