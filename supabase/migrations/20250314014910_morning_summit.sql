/*
  # Make user admin

  1. Changes
    - Set is_admin to true for specified user profile
*/

UPDATE user_profiles
SET is_admin = true
WHERE id IN (
  SELECT id 
  FROM auth.users 
  WHERE email = 'ezenuni@itxsolutions.com'
);