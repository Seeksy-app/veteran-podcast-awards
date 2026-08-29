-- Sponsors can own multiple categories (up to 5 regular + 1 branch, enforced in UI).
-- UNIQUE(category_id) enforces exclusivity: one sponsor per category.
CREATE TABLE IF NOT EXISTS public.sponsor_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL REFERENCES public.sponsors(id) ON DELETE CASCADE,
  category_id uuid NOT NULL UNIQUE REFERENCES public.award_categories(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sponsor_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sponsor categories" ON public.sponsor_categories
  FOR SELECT USING (true);

CREATE POLICY "Admins manage sponsor categories" ON public.sponsor_categories
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Carry over any existing single-category assignments
INSERT INTO public.sponsor_categories (sponsor_id, category_id)
  SELECT id, category_id FROM public.sponsors WHERE category_id IS NOT NULL
  ON CONFLICT (category_id) DO NOTHING;
