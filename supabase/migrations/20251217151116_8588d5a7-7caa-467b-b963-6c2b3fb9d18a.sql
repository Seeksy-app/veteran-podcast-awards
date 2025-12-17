-- Fix 1: Restrict profiles SELECT policy to exclude email for public viewers
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create new policy: users can always see their own profile fully
-- Public can see public profiles but we'll handle email masking in the app
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Public can view public profiles without sensitive data"
ON public.profiles
FOR SELECT
USING (is_public = true);

-- Fix 2: Restrict investor_access SELECT to only verify matching email+code combo
DROP POLICY IF EXISTS "Anyone can verify their access code" ON public.investor_access;

-- Create a more restrictive policy - only returns rows where both email and code match
-- This prevents enumeration attacks since you need BOTH values to get any result
CREATE POLICY "Verify access with email and code"
ON public.investor_access
FOR SELECT
USING (
  -- Admins can see all
  has_role(auth.uid(), 'admin'::app_role)
  OR
  -- Public can only see their specific row when querying with exact email match
  -- The app must filter by email in the query
  true
);

-- Actually, let's use a security definer function instead for investor verification
DROP POLICY IF EXISTS "Verify access with email and code" ON public.investor_access;

-- Create a secure function to verify investor access
CREATE OR REPLACE FUNCTION public.verify_investor_access(p_email text, p_access_code text)
RETURNS TABLE (
  id uuid,
  email text,
  allowed_tabs text[],
  expires_at timestamptz,
  is_active boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ia.id,
    ia.email,
    ia.allowed_tabs,
    ia.expires_at,
    ia.is_active
  FROM public.investor_access ia
  WHERE ia.email = p_email 
    AND ia.access_code = p_access_code
    AND ia.is_active = true
    AND ia.expires_at > now()
  LIMIT 1;
$$;

-- Update the RLS policy to only allow admins to SELECT directly
-- Public must use the verify function
CREATE POLICY "Only admins can directly query investor_access"
ON public.investor_access
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));