-- Category sponsorship: attach a sponsor to the category they own
ALTER TABLE public.sponsors ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.award_categories(id);

-- Share-click tracking: every arrival on a voting page via a shared link
CREATE TABLE IF NOT EXISTS public.share_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nomination_id uuid,
  category_id uuid,
  ref text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.share_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log share clicks" ON public.share_clicks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins read share clicks" ON public.share_clicks
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
