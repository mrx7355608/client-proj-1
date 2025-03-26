/*
  # Fix User Creation Migration

  1. Changes
    - Fix ambiguous column reference in WHERE clause
    - Properly handle user creation and identity setup
    - Ensure correct password hashing
    - Set up user profile

  2. Security
    - Maintain password security
    - Preserve user data integrity
*/

DO $$ 
DECLARE
  v_user_id uuid := '7f9c3e5d-1a2b-4c3d-9e8f-7a6b5c4d3e2f';
  v_user_email text := 'ezenuni@voytel.com';
  v_default_instance_id uuid := '00000000-0000-0000-0000-000000000000';
BEGIN
  -- Check if user exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = v_user_email) THEN
    -- Update existing user's password
    UPDATE auth.users
    SET 
      encrypted_password = crypt('987128', extensions.gen_salt('bf')),
      updated_at = now()
    WHERE email = v_user_email
    RETURNING id INTO v_user_id;
  ELSE
    -- Create new user
    INSERT INTO auth.users (
      id,
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
      v_user_id,
      v_default_instance_id,
      v_user_email,
      crypt('987128', extensions.gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      false,
      'authenticated'::text
    );

    -- Create identities record
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid(),
      v_user_id,
      jsonb_build_object(
        'sub', v_user_id::text,
        'email', v_user_email,
        'email_verified', true
      ),
      'email',
      v_user_email,
      now(),
      now()
    );
  END IF;

  -- Update or create user profile
  INSERT INTO user_profiles (
    id,
    first_name,
    last_name,
    phone,
    is_admin,
    status,
    password_reset_required
  )
  VALUES (
    v_user_id,
    'Joah',
    'Zenuni',
    '407-693-1240',
    false,
    'active',
    true
  )
  ON CONFLICT (id) DO UPDATE
  SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    is_admin = EXCLUDED.is_admin,
    status = EXCLUDED.status,
    password_reset_required = EXCLUDED.password_reset_required;
END $$;