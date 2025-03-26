/*
  # Create Employee User

  1. Create User
    - Add new user with specified details
    - Set up employee role with restricted access

  2. Security
    - Set initial password
    - Require password change on first login
*/

-- First, create the auth user
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
  '7f9c3e5d-1a2b-4c3d-9e8f-7a6b5c4d3e2f',
  '00000000-0000-0000-0000-000000000000',
  'ezenuni@voytel.com',
  crypt('987128', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  'authenticated'
);

-- Then create the user profile
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
  '7f9c3e5d-1a2b-4c3d-9e8f-7a6b5c4d3e2f',
  'Joah',
  'Zenuni',
  '407-693-1240',
  false,
  'active',
  true
);