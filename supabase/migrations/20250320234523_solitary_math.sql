-- Drop existing function
DROP FUNCTION IF EXISTS public.invite_user(text, boolean, text, boolean, text, text, text, text, text);

-- Recreate function with correct auth.users schema
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

  -- Start transaction
  BEGIN
    -- Check for existing email first
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = LOWER(user_email)) THEN
      RAISE EXCEPTION 'Email already exists: %', user_email;
    END IF;

    -- Generate UUID for new user
    new_user_id := gen_random_uuid();
    
    -- Validate password
    IF user_password IS NULL OR length(user_password) < 6 THEN
      RAISE EXCEPTION 'Password must be at least 6 characters long';
    END IF;

    -- Create user in auth.users
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
      updated_at
    )
    VALUES (
      new_user_id,
      default_instance_id,
      'authenticated',
      'authenticated',
      LOWER(user_email),  -- Normalize email
      crypt(user_password, gen_salt('bf')),
      now(),
      now(),
      '{"provider": "email"}'::jsonb,  -- Explicit app metadata
      '{}'::jsonb,  -- Empty user metadata by default
      false,  -- Explicit super admin setting
      now(),
      now()
    );

    -- Create identity
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
        'email', LOWER(user_email),
        'email_verified', true,
        'aud', 'authenticated',
        'role', 'authenticated',
        'provider', 'email'
      ),
      'email',
      LOWER(user_email),
      now(),
      now(),
      now()
    );

    -- Create profile
    INSERT INTO user_profiles (
      id,
      first_name,
      last_name,
      company,
      phone,
      is_admin,
      status,
      password_reset_required,
      updated_at,
      created_at
    )
    VALUES (
      new_user_id,
      INITCAP(user_first_name),  -- Standardize capitalization
      INITCAP(user_last_name),
      user_company,
      user_phone,
      COALESCE(admin_status, false),  -- Default to false
      COALESCE(user_status, 'active'),  -- Default status
      COALESCE(reset_required, false),  -- Default to false
      now(),
      now()
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
  -- End transaction
  EXCEPTION WHEN others THEN
    RAISE;
  END;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.invite_user TO authenticated;