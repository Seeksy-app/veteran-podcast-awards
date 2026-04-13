-- Award programs & categories (admin-managed; slugs align with votes.category_id / vote_counts.category_id)

DO $$ BEGIN
  CREATE TYPE public.award_program_status AS ENUM ('draft', 'active', 'closed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.award_programs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  year integer NOT NULL,
  status public.award_program_status NOT NULL DEFAULT 'draft',
  nominations_open_at timestamp with time zone,
  voting_open_at timestamp with time zone,
  ceremony_at date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_award_programs_year ON public.award_programs(year);

CREATE TABLE IF NOT EXISTS public.award_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id uuid NOT NULL REFERENCES public.award_programs(id) ON DELETE CASCADE,
  slug text NOT NULL,
  name text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (program_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_award_categories_program_id ON public.award_categories(program_id);

CREATE TABLE IF NOT EXISTS public.award_nominations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid NOT NULL REFERENCES public.award_categories(id) ON DELETE CASCADE,
  podcast_id uuid NOT NULL REFERENCES public.podcasts(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (category_id, podcast_id)
);

CREATE INDEX IF NOT EXISTS idx_award_nominations_category_id ON public.award_nominations(category_id);

ALTER TABLE public.award_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.award_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.award_nominations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view award programs" ON public.award_programs;
CREATE POLICY "Anyone can view award programs"
ON public.award_programs
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can manage award programs" ON public.award_programs;
CREATE POLICY "Admins can manage award programs"
ON public.award_programs
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Anyone can view award categories" ON public.award_categories;
CREATE POLICY "Anyone can view award categories"
ON public.award_categories
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can manage award categories" ON public.award_categories;
CREATE POLICY "Admins can manage award categories"
ON public.award_categories
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Anyone can view award nominations" ON public.award_nominations;
CREATE POLICY "Anyone can view award nominations"
ON public.award_nominations
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can manage award nominations" ON public.award_nominations;
CREATE POLICY "Admins can manage award nominations"
ON public.award_nominations
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Seed: Veteran Podcast Awards 2026 + categories (idempotent)
INSERT INTO public.award_programs (name, year, status, nominations_open_at, voting_open_at, ceremony_at)
SELECT 'Veteran Podcast Awards 2026', 2026, 'active'::public.award_program_status,
  '2026-01-01T12:00:00Z'::timestamptz, '2026-06-01T12:00:00Z'::timestamptz, '2026-10-05'::date
WHERE NOT EXISTS (
  SELECT 1 FROM public.award_programs p WHERE p.year = 2026 AND p.name = 'Veteran Podcast Awards 2026'
);

WITH prog AS (
  SELECT id FROM public.award_programs WHERE year = 2026 AND name = 'Veteran Podcast Awards 2026' LIMIT 1
)
INSERT INTO public.award_categories (program_id, slug, name, description, sort_order)
SELECT
  prog.id,
  v.slug,
  v.name,
  v.description,
  v.sort_order
FROM prog
CROSS JOIN (VALUES
  (1, 'best-interview-show', 'Best Interview Show', 'Excellence in long-form or episodic interview content.'),
  (2, 'best-solo-show', 'Best Solo Show', 'Outstanding single-host or solo narrative podcast.'),
  (3, 'best-comedy', 'Best Comedy', 'Humor, satire, and entertainment.'),
  (4, 'best-educational', 'Best Educational', 'Teaching, skills, and informative programming.'),
  (5, 'best-newcomer', 'Best Newcomer', 'Breakthrough podcast in its first qualifying period.'),
  (6, 'best-veteran-storyteller', 'Best Veteran Storyteller', 'Personal stories and narrative from those who served.'),
  (7, 'best-military-family-show', 'Best Military Family Show', 'Content centered on military and veteran families.'),
  (8, 'best-true-crime', 'Best True Crime', 'Investigative and narrative true crime.'),
  (9, 'podcaster-of-the-year', 'Podcaster of the Year', 'Overall excellence in hosting and production.'),
  (10, 'lifetime-achievement', 'Lifetime Achievement', 'Sustained impact and contribution to the community.')
) AS v(sort_order, slug, name, description)
WHERE NOT EXISTS (
  SELECT 1 FROM public.award_categories c WHERE c.program_id = prog.id AND c.slug = v.slug
);
