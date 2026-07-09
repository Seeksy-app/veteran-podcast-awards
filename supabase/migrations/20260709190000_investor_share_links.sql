-- Magic-link sharing for the investor portal.
-- A share link is not tied to an email: anyone holding the link enters their
-- own email, a visit is logged, and an investor_access row is upserted so the
-- existing /prospectus portal (session restore, engagement tracking) works as-is.

CREATE TABLE public.investor_share_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  label text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.investor_share_link_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_link_id uuid NOT NULL REFERENCES public.investor_share_links(id) ON DELETE CASCADE,
  email text NOT NULL,
  visited_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_share_link_visits_link ON public.investor_share_link_visits(share_link_id);

ALTER TABLE public.investor_share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_share_link_visits ENABLE ROW LEVEL SECURITY;

-- Admins manage links and read visits; visitors only interact through the
-- SECURITY DEFINER functions below (same pattern as verify_investor_access).
CREATE POLICY "Admins can manage share links"
ON public.investor_share_links
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view share link visits"
ON public.investor_share_link_visits
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete share link visits"
ON public.investor_share_link_visits
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Status probe for the landing page: shows "link expired" before asking for
-- an email. Revoked and expired both report their state; unknown tokens
-- report not_found (the client renders the same page for all three).
CREATE OR REPLACE FUNCTION public.get_investor_share_link_status(p_token text)
RETURNS TABLE(label text, status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_link record;
BEGIN
  SELECT sl.label, sl.expires_at, sl.is_active
  INTO v_link
  FROM public.investor_share_links sl
  WHERE sl.token = btrim(p_token)
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::text, 'not_found'::text;
  ELSIF NOT v_link.is_active THEN
    RETURN QUERY SELECT v_link.label, 'revoked'::text;
  ELSIF v_link.expires_at <= now() THEN
    RETURN QUERY SELECT v_link.label, 'expired'::text;
  ELSE
    RETURN QUERY SELECT v_link.label, 'valid'::text;
  END IF;
END;
$$;

-- Redeem a share link: log the visit and grant portal access for the email.
-- Existing investor_access rows keep their is_active flag (a link never
-- re-enables an investor an admin explicitly disabled) but get their expiry
-- extended to at least the link's expiry.
CREATE OR REPLACE FUNCTION public.redeem_investor_share_link(p_token text, p_email text)
RETURNS TABLE(status text, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_link record;
  v_email text := LOWER(btrim(p_email));
  v_access record;
BEGIN
  SELECT sl.id, sl.expires_at, sl.is_active
  INTO v_link
  FROM public.investor_share_links sl
  WHERE sl.token = btrim(p_token)
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY SELECT 'not_found'::text, NULL::text;
    RETURN;
  END IF;

  IF NOT v_link.is_active THEN
    RETURN QUERY SELECT 'revoked'::text, NULL::text;
    RETURN;
  END IF;

  IF v_link.expires_at <= now() THEN
    RETURN QUERY SELECT 'expired'::text, NULL::text;
    RETURN;
  END IF;

  IF v_email IS NULL OR v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' THEN
    RETURN QUERY SELECT 'invalid_email'::text, NULL::text;
    RETURN;
  END IF;

  INSERT INTO public.investor_share_link_visits (share_link_id, email)
  VALUES (v_link.id, v_email);

  SELECT ia.id, ia.expires_at
  INTO v_access
  FROM public.investor_access ia
  WHERE LOWER(btrim(ia.email)) = v_email
  LIMIT 1;

  IF FOUND THEN
    UPDATE public.investor_access
    SET expires_at = GREATEST(investor_access.expires_at, v_link.expires_at),
        last_accessed_at = now()
    WHERE investor_access.id = v_access.id;
  ELSE
    INSERT INTO public.investor_access (email, access_code, allowed_tabs, expires_at, last_accessed_at)
    VALUES (
      v_email,
      UPPER(SUBSTRING(md5(gen_random_uuid()::text || clock_timestamp()::text) FROM 1 FOR 8)),
      ARRAY['video', 'opportunity', 'metrics', 'tech-stack', 'security'],
      v_link.expires_at,
      now()
    );
  END IF;

  RETURN QUERY SELECT 'valid'::text, v_email;
END;
$$;
