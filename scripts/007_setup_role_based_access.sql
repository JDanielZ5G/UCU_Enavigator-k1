-- =====================================================
-- Role-Based Access Control Setup
-- =====================================================
-- This script sets up proper role-based access control with the 3 hardcoded admin emails
-- and fixes the infinite recursion error in RLS policies

-- Step 1: Drop existing problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "profiles_select_admin" ON profiles;

-- Step 2: Create a helper function to check if user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- Step 3: Create new admin select policy using the helper function
CREATE POLICY "profiles_select_admin" ON profiles
  FOR SELECT
  TO authenticated
  USING (
    is_admin(auth.uid())
  );

-- Step 4: Update the trigger function to assign roles based on hardcoded admin emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
  user_role text;
BEGIN
  -- Get the user's email from auth.users
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = NEW.id;

  -- Determine role based on hardcoded admin emails
  IF user_email IN (
    'wasikejamesdaniel@gmail.com',
    'wjdaniel379@gmail.com',
    'trizzydaniels352@gmail.com'
  ) THEN
    user_role := 'admin';
  ELSE
    user_role := 'student';
  END IF;

  -- Insert profile with determined role
  INSERT INTO public.profiles (id, email, role, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    user_email,
    user_role,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$;

-- Step 5: Update existing users to have correct roles
UPDATE profiles
SET role = 'admin'
WHERE email IN (
  'wasikejamesdaniel@gmail.com',
  'wjdaniel379@gmail.com',
  'trizzydaniels352@gmail.com'
);

UPDATE profiles
SET role = 'student'
WHERE email NOT IN (
  'wasikejamesdaniel@gmail.com',
  'wjdaniel379@gmail.com',
  'trizzydaniels352@gmail.com'
)
AND role != 'admin';

-- Step 6: Update events policies to use the helper function
DROP POLICY IF EXISTS "events_select_admin" ON events;
DROP POLICY IF EXISTS "events_update_admin" ON events;
DROP POLICY IF EXISTS "events_delete_admin" ON events;

-- Admin can see all events
CREATE POLICY "events_select_admin" ON events
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Admin can update all events
CREATE POLICY "events_update_admin" ON events
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Admin can delete all events
CREATE POLICY "events_delete_admin" ON events
  FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Step 7: Add policy to prevent role tampering
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND role = (SELECT role FROM profiles WHERE id = auth.uid()) -- Prevent role changes
  );

-- Step 8: Grant execute permission on helper function
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

COMMENT ON FUNCTION public.is_admin IS 'Helper function to check if a user is an admin. Uses SECURITY DEFINER to bypass RLS.';
