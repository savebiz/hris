-- Run this command in your Supabase SQL Editor to promote your user to Admin
-- Replace 'YOUR_EMAIL_ADDRESS' with your actual email

UPDATE public.profiles
SET role = 'hr_admin'
WHERE email = 'YOUR_EMAIL_ADDRESS';
