-- Drop and recreate the function to return more detailed status
DROP FUNCTION IF EXISTS public.verify_investor_access(text, text);

CREATE OR REPLACE FUNCTION public.verify_investor_access(p_email text, p_access_code text)
RETURNS TABLE(
  id uuid, 
  email text, 
  allowed_tabs text[], 
  expires_at timestamp with time zone, 
  is_active boolean,
  status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_record record;
BEGIN
  -- First, try to find the record by email and code (case insensitive)
  SELECT 
    ia.id,
    ia.email,
    ia.allowed_tabs,
    ia.expires_at,
    ia.is_active
  INTO v_record
  FROM public.investor_access ia
  WHERE LOWER(ia.email) = LOWER(p_email)
    AND UPPER(ia.access_code) = UPPER(p_access_code)
  LIMIT 1;

  -- If no record found, return not_found status
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      NULL::uuid,
      NULL::text,
      NULL::text[],
      NULL::timestamp with time zone,
      NULL::boolean,
      'not_found'::text;
    RETURN;
  END IF;

  -- Check if disabled
  IF NOT v_record.is_active THEN
    RETURN QUERY SELECT 
      v_record.id,
      v_record.email,
      v_record.allowed_tabs,
      v_record.expires_at,
      v_record.is_active,
      'disabled'::text;
    RETURN;
  END IF;

  -- Check if expired
  IF v_record.expires_at <= now() THEN
    RETURN QUERY SELECT 
      v_record.id,
      v_record.email,
      v_record.allowed_tabs,
      v_record.expires_at,
      v_record.is_active,
      'expired'::text;
    RETURN;
  END IF;

  -- Valid access
  RETURN QUERY SELECT 
    v_record.id,
    v_record.email,
    v_record.allowed_tabs,
    v_record.expires_at,
    v_record.is_active,
    'valid'::text;
END;
$$;