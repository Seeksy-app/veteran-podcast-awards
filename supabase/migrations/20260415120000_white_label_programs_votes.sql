-- =============================================================================
-- WHITE-LABEL: Program branding, votes/vote_counts scoped by program_id
-- Run in Supabase SQL editor (project zkruwrpkfxehbwxtjhdz) if not using CLI push
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Award program branding
-- -----------------------------------------------------------------------------
ALTER TABLE public.award_programs ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#B8860B';
ALTER TABLE public.award_programs ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE public.award_programs ADD COLUMN IF NOT EXISTS tagline text;
ALTER TABLE public.award_programs ADD COLUMN IF NOT EXISTS website_url text;
ALTER TABLE public.award_programs ADD COLUMN IF NOT EXISTS organization_name text;

-- -----------------------------------------------------------------------------
-- 2) Votes: program_id (required for isolation when slugs repeat across programs)
-- -----------------------------------------------------------------------------
ALTER TABLE public.votes ADD COLUMN IF NOT EXISTS program_id uuid REFERENCES public.award_programs(id) ON DELETE CASCADE;

UPDATE public.votes v
SET program_id = sub.program_id
FROM (
  SELECT DISTINCT ON (v2.id)
    v2.id AS vote_id,
    ac.program_id
  FROM public.votes v2
  INNER JOIN public.award_categories ac ON ac.slug = v2.category_id
  INNER JOIN public.award_programs ap ON ap.id = ac.program_id AND ap.year = v2.year
  ORDER BY v2.id, ac.program_id
) sub
WHERE v.id = sub.vote_id
  AND v.program_id IS NULL;

-- Any stray rows (should not exist): attach to single program for that year if unique
UPDATE public.votes v
SET program_id = (SELECT id FROM public.award_programs ap WHERE ap.year = v.year ORDER BY ap.created_at LIMIT 1)
WHERE v.program_id IS NULL;

ALTER TABLE public.votes ALTER COLUMN program_id SET NOT NULL;

DROP TRIGGER IF EXISTS on_vote_change ON public.votes;

ALTER TABLE public.votes DROP CONSTRAINT IF EXISTS votes_user_category_year_slot_key;
ALTER TABLE public.votes DROP CONSTRAINT IF EXISTS votes_user_id_category_id_year_key;

ALTER TABLE public.votes
  ADD CONSTRAINT votes_user_program_category_slot_key
  UNIQUE (user_id, program_id, category_id, vote_slot);

CREATE INDEX IF NOT EXISTS idx_votes_program_category ON public.votes(program_id, category_id);

-- -----------------------------------------------------------------------------
-- 3) Vote counts: program_id + unique (podcast, category slug, year, program)
-- -----------------------------------------------------------------------------
ALTER TABLE public.vote_counts ADD COLUMN IF NOT EXISTS program_id uuid REFERENCES public.award_programs(id) ON DELETE CASCADE;

UPDATE public.vote_counts vc
SET program_id = sub.program_id
FROM (
  SELECT DISTINCT ON (vc2.id)
    vc2.id AS vc_id,
    ac.program_id
  FROM public.vote_counts vc2
  INNER JOIN public.award_categories ac ON ac.slug = vc2.category_id
  INNER JOIN public.award_programs ap ON ap.id = ac.program_id AND ap.year = vc2.year
  ORDER BY vc2.id, ac.program_id
) sub
WHERE vc.id = sub.vc_id
  AND vc.program_id IS NULL;

UPDATE public.vote_counts vc
SET program_id = (SELECT id FROM public.award_programs ap WHERE ap.year = vc.year ORDER BY ap.created_at LIMIT 1)
WHERE vc.program_id IS NULL;

ALTER TABLE public.vote_counts ALTER COLUMN program_id SET NOT NULL;

ALTER TABLE public.vote_counts DROP CONSTRAINT IF EXISTS vote_counts_podcast_id_category_id_year_key;

ALTER TABLE public.vote_counts
  ADD CONSTRAINT vote_counts_podcast_category_year_program_key
  UNIQUE (podcast_id, category_id, year, program_id);

CREATE INDEX IF NOT EXISTS idx_vote_counts_program_category ON public.vote_counts(program_id, category_id);

-- -----------------------------------------------------------------------------
-- 4) Trigger: maintain vote_counts including program_id
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.vote_counts (podcast_id, category_id, year, vote_count, program_id)
    VALUES (NEW.nominee_id, NEW.category_id, NEW.year, 1, NEW.program_id)
    ON CONFLICT (podcast_id, category_id, year, program_id)
    DO UPDATE SET vote_count = public.vote_counts.vote_count + 1, updated_at = now();
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.vote_counts
    SET vote_count = vote_count - 1, updated_at = now()
    WHERE podcast_id = OLD.nominee_id AND category_id = OLD.category_id AND year = OLD.year AND program_id = OLD.program_id;
    INSERT INTO public.vote_counts (podcast_id, category_id, year, vote_count, program_id)
    VALUES (NEW.nominee_id, NEW.category_id, NEW.year, 1, NEW.program_id)
    ON CONFLICT (podcast_id, category_id, year, program_id)
    DO UPDATE SET vote_count = public.vote_counts.vote_count + 1, updated_at = now();
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.vote_counts
    SET vote_count = vote_count - 1, updated_at = now()
    WHERE podcast_id = OLD.nominee_id AND category_id = OLD.category_id AND year = OLD.year AND program_id = OLD.program_id;
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_vote_change
  AFTER INSERT OR UPDATE OR DELETE ON public.votes
  FOR EACH ROW EXECUTE FUNCTION public.update_vote_count();

-- -----------------------------------------------------------------------------
-- 5) Admin RPC: scope flat voter export by program
-- -----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.admin_category_votes_flat(integer, text);

CREATE OR REPLACE FUNCTION public.admin_category_votes_flat(
  p_program_id uuid,
  p_category_slug text
)
RETURNS TABLE (
  voter_email text,
  voter_name text,
  nominee_podcast text,
  nominee_id uuid,
  vote_slot smallint,
  voted_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    au.email::text AS voter_email,
    pr.full_name::text AS voter_name,
    pod.title::text AS nominee_podcast,
    v.nominee_id,
    v.vote_slot,
    v.created_at AS voted_at
  FROM public.votes v
  JOIN auth.users au ON au.id = v.user_id
  LEFT JOIN public.profiles pr ON pr.id = v.user_id
  JOIN public.podcasts pod ON pod.id = v.nominee_id
  WHERE v.program_id = p_program_id
    AND v.category_id = p_category_slug
    AND public.has_role(auth.uid(), 'admin'::public.app_role);
$$;

REVOKE ALL ON FUNCTION public.admin_category_votes_flat(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_category_votes_flat(uuid, text) TO authenticated;

-- -----------------------------------------------------------------------------
-- 6) Demo: MVA Awards 2026 (draft) + categories with unique slugs
-- -----------------------------------------------------------------------------
INSERT INTO public.award_programs (
  name, year, status, nominations_open_at, voting_open_at, ceremony_at,
  tagline, organization_name, primary_color
)
SELECT
  'MVA Awards 2026',
  2026,
  'draft'::public.award_program_status,
  '2026-06-01T12:00:00Z'::timestamptz,
  '2026-09-01T12:00:00Z'::timestamptz,
  '2026-11-15'::date,
  'Honoring military voices in media',
  'VetStream TV',
  '#1B4F8A'
WHERE NOT EXISTS (
  SELECT 1 FROM public.award_programs p WHERE p.name = 'MVA Awards 2026' AND p.year = 2026
);

WITH prog AS (
  SELECT id FROM public.award_programs WHERE name = 'MVA Awards 2026' AND year = 2026 LIMIT 1
)
INSERT INTO public.award_categories (program_id, slug, name, description, sort_order)
SELECT
  prog.id,
  v.slug,
  v.name,
  v.description,
  v.ord
FROM prog
CROSS JOIN (VALUES
  (1, 'best-military-news-podcast', 'Best Military News Podcast', 'Military news and current affairs.'),
  (2, 'best-veteran-affairs-show', 'Best Veteran Affairs Show', 'VA benefits, policy, and veteran issues.'),
  (3, 'best-military-history-series', 'Best Military History Series', 'Historical storytelling and documentary.'),
  (4, 'best-active-duty-perspective', 'Best Active Duty Perspective', 'Voices from those currently serving.'),
  (5, 'best-gold-star-family-show', 'Best Gold Star Family Show', 'Stories and support for Gold Star families.'),
  (6, 'best-military-comedy', 'Best Military Comedy', 'Humor from the military community.'),
  (7, 'best-defense-security-show', 'Best Defense & Security Show', 'Defense policy and global security.'),
  (8, 'media-personality-of-the-year', 'Media Personality of the Year', 'Outstanding host or media voice.')
) AS v(ord, slug, name, description)
WHERE NOT EXISTS (
  SELECT 1 FROM public.award_categories c WHERE c.program_id = (SELECT id FROM prog) AND c.slug = v.slug
);
