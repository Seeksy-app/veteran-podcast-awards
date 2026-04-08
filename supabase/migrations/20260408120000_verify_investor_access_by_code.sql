-- Allow investor links that only pass ?code= (no email) to verify via SECURITY DEFINER RPC.
CREATE OR REPLACE FUNCTION public.verify_investor_access_by_code(p_access_code text)
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
  SELECT
    ia.id,
    ia.email,
    ia.allowed_tabs,
    ia.expires_at,
    ia.is_active
  INTO v_record
  FROM public.investor_access ia
  WHERE UPPER(btrim(ia.access_code)) = UPPER(btrim(p_access_code))
  LIMIT 1;

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

  RETURN QUERY SELECT
    v_record.id,
    v_record.email,
    v_record.allowed_tabs,
    v_record.expires_at,
    v_record.is_active,
    'valid'::text;
END;
$$;
