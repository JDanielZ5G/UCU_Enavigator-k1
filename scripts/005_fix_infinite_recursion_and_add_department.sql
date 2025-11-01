-- Fix infinite recursion in profiles policy and add department column
-- This script addresses the "infinite recursion detected in policy" error
-- and implements department-based admin access control

-- Step 1: Drop the problematic admin policy that causes infinite recursion
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;

-- Step 2: Drop the old role constraint FIRST before making any changes
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Step 3: Add department column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS department TEXT;

-- Step 4: Update existing 'user' roles to 'student' (now safe without constraint)
UPDATE public.profiles 
SET role = 'student' 
WHERE role = 'user';

-- Step 5: Add the NEW constraint that allows 'student' and 'admin'
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('student', 'admin'));

-- Step 6: Update role column default to 'student'
ALTER TABLE public.profiles 
ALTER COLUMN role SET DEFAULT 'student';

-- Step 7: Create a helper function to check admin status (prevents recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Create the new admin policy using the helper function
CREATE POLICY "profiles_select_all_for_admin"
  ON public.profiles FOR SELECT
  USING (is_admin());

-- Step 9: Update the trigger function to assign roles based on hardcoded admin emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
  user_dept TEXT;
  -- Hardcoded list of 3 department admin emails
  admin_emails TEXT[] := ARRAY[
    'wasikejamesdaniel@gmail.com',
    'admin2@example.com',
    'admin3@example.com'
  ];
BEGIN
  -- Assign role and department based on email
  IF new.email = ANY(admin_emails) THEN
    user_role := 'admin';
    -- Determine department based on which admin email
    CASE new.email
      WHEN 'wasikejamesdaniel@gmail.com' THEN user_dept := 'Computing and Technology';
      WHEN 'admin2@example.com' THEN user_dept := 'Visual Art and Design';
      WHEN 'admin3@example.com' THEN user_dept := 'Engineering';
      ELSE user_dept := NULL;
    END CASE;
  ELSE
    user_role := 'student';
    user_dept := NULL;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role, department)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    user_role,
    user_dept
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- Step 10: Update existing admin policies on events table to use the helper function
DROP POLICY IF EXISTS "events_select_admin" ON public.events;
DROP POLICY IF EXISTS "events_update_admin" ON public.events;
DROP POLICY IF EXISTS "events_delete_admin" ON public.events;
DROP POLICY IF EXISTS "events_insert_authenticated" ON public.events;

-- Create new policies that use the is_admin() function to prevent recursion
CREATE POLICY "events_select_admin"
  ON public.events FOR SELECT
  USING (is_admin());

CREATE POLICY "events_update_admin"
  ON public.events FOR UPDATE
  USING (is_admin());

CREATE POLICY "events_delete_admin"
  ON public.events FOR DELETE
  USING (is_admin());

-- Restrict event creation to admins only
CREATE POLICY "events_insert_admin_only"
  ON public.events FOR INSERT
  WITH CHECK (is_admin());

-- Add helpful comments for documentation
COMMENT ON FUNCTION public.is_admin() IS 
'Helper function to check if current user is an admin. Used to prevent infinite recursion in RLS policies.';

COMMENT ON COLUMN public.profiles.department IS 
'Department assigned to admin users: Computing and Technology, Visual Art and Design, or Engineering. NULL for students.';
