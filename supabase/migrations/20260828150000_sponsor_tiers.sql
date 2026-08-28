-- Sponsorship packages: name, price, and limited slot inventory
CREATE TABLE IF NOT EXISTS public.sponsor_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10,2),
  slots_total integer NOT NULL DEFAULT 1,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sponsor_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sponsor tiers" ON public.sponsor_tiers
  FOR SELECT USING (true);

CREATE POLICY "Admins manage sponsor tiers" ON public.sponsor_tiers
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Link sponsors to a package
ALTER TABLE public.sponsors ADD COLUMN IF NOT EXISTS tier_id uuid REFERENCES public.sponsor_tiers(id);

-- Seed packages (prices and slot counts are editable in the admin UI)
INSERT INTO public.sponsor_tiers (name, description, price, slots_total, sort_order) VALUES
  ('Sponsor Title', 'Title sponsor of the 2026 Veteran Podcast Awards — top billing across the site, emails, and ceremony.', 10000, 1, 1),
  ('Sponsor Livestream', 'Presenting sponsor of the Oct 5 Podcast Day and Nov 11 ceremony livestreams.', 5000, 2, 2),
  ('Award Category', 'Sponsor a specific award category — your name on the award and a ceremony mention.', 2500, 16, 3),
  ('Best Of', 'Sponsor of the "Best of" showcase segments.', 1500, 4, 4);
