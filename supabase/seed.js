
// This file can be used to create a new admin account for your betting application
// Run it with the Supabase Functions CLI

/*
Steps to create an admin account:
1. Sign up a new user with email and password
2. Update the user's role in the profiles table to be 'admin'
3. Set the user as approved

Example SQL:
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES
  ('00000000-0000-0000-0000-000000000000', '6102564c-9981-45d1-a773-7dff8ef27fd1', 'authenticated', 'authenticated', 'admin@bettickets.com', '$2a$10$CvXACY1DNDxDumqj5Dn4XeSMQwakYSZZnW2.9eRqjK3YYQUFhXQJa', '2023-01-01 00:00:00+00', null, '2023-01-01 00:00:00+00', '{"provider": "email", "providers": ["email"]}', '{}', '2023-01-01 00:00:00+00', '2023-01-01 00:00:00+00', '', null, '', '');

-- Update the profile to be an admin
UPDATE public.profiles
SET role = 'admin', approved = true
WHERE id = '6102564c-9981-45d1-a773-7dff8ef27fd1';
*/

// Admin credentials to use for login:
// Email: admin@bettickets.com
// Password: AdminPassword123!
