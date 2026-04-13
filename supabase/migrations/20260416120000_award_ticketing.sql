-- =============================================================================
-- Award ceremony ticketing (Stripe checkout + optional external URL fallback)
-- =============================================================================

ALTER TABLE public.award_programs
  ADD COLUMN IF NOT EXISTS external_ticket_url text;

CREATE TABLE IF NOT EXISTS public.award_ticket_types (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id uuid NOT NULL REFERENCES public.award_programs(id) ON DELETE CASCADE,
  ticket_kind text NOT NULL DEFAULT 'custom'
    CHECK (ticket_kind IN ('general_admission', 'vip', 'sponsor_table', 'custom')),
  name text NOT NULL,
  description text,
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  quantity_total integer,
  quantity_sold integer NOT NULL DEFAULT 0 CHECK (quantity_sold >= 0),
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT award_ticket_types_qty CHECK (
    quantity_total IS NULL OR quantity_total >= 0
  ),
  CONSTRAINT award_ticket_types_sold_lte_total CHECK (
    quantity_total IS NULL OR quantity_sold <= quantity_total
  )
);

CREATE INDEX IF NOT EXISTS idx_award_ticket_types_program_id ON public.award_ticket_types(program_id);

CREATE TABLE IF NOT EXISTS public.award_ticket_purchases (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id uuid NOT NULL REFERENCES public.award_programs(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
  buyer_name text NOT NULL,
  buyer_email text NOT NULL,
  line_items jsonb NOT NULL,
  total_amount_cents integer NOT NULL CHECK (total_amount_cents >= 0),
  qr_token uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  stripe_checkout_session_id text UNIQUE,
  stripe_payment_intent_id text,
  stripe_event_id text UNIQUE,
  checked_in_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_award_ticket_purchases_program ON public.award_ticket_purchases(program_id);
CREATE INDEX IF NOT EXISTS idx_award_ticket_purchases_email ON public.award_ticket_purchases(buyer_email);

ALTER TABLE public.award_ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.award_ticket_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active ticket types" ON public.award_ticket_types;
CREATE POLICY "Public read active ticket types"
ON public.award_ticket_types
FOR SELECT
USING (
  is_active = true
  AND EXISTS (
    SELECT 1 FROM public.award_programs p
    WHERE p.id = program_id AND p.status = 'active'
  )
);

DROP POLICY IF EXISTS "Admins manage ticket types" ON public.award_ticket_types;
CREATE POLICY "Admins manage ticket types"
ON public.award_ticket_types
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins read ticket purchases" ON public.award_ticket_purchases;
CREATE POLICY "Admins read ticket purchases"
ON public.award_ticket_purchases
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins update ticket purchases" ON public.award_ticket_purchases;
CREATE POLICY "Admins update ticket purchases"
ON public.award_ticket_purchases
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Service role inserts purchases via Edge Functions (no anon insert policy)

-- Public ticket pass lookup (QR / link bearer token)
CREATE OR REPLACE FUNCTION public.get_award_ticket_pass(p_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r public.award_ticket_purchases%ROWTYPE;
  prog record;
BEGIN
  SELECT * INTO r FROM public.award_ticket_purchases WHERE qr_token = p_token AND status = 'completed';
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  SELECT id, name, ceremony_at INTO prog FROM public.award_programs WHERE id = r.program_id;
  RETURN jsonb_build_object(
    'program_name', prog.name,
    'ceremony_at', prog.ceremony_at,
    'buyer_name', r.buyer_name,
    'line_items', r.line_items,
    'checked_in_at', r.checked_in_at
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_award_ticket_pass(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_award_ticket_pass(uuid) TO anon, authenticated;
