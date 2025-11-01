-- Fix infinite recursion in profiles_select_admin policy
-- The issue is that the policy queries the profiles table within itself

-- Drop the problematic policy
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;

-- Create a helper function to check if user is admin
-- This function uses SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = user_id;
  
  RETURN user_role = 'admin';
END;
$$;

-- Recreate the admin policy using the helper function
CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
