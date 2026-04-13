-- =============================================================================
-- MIGRATION: Public nominations + up to 3 votes per category per voter
-- Project: zkruwrpkfxehbwxtjhdz (paste in Supabase SQL editor if needed)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Nominations (podcaster self-nomination per category)
--    Replaces award_nominations (podcast-only) with user-linked rows.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.nominations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid NOT NULL REFERENCES public.award_categories(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  podcast_id uuid NOT NULL REFERENCES public.podcasts(id) ON DELETE CASCADE,
  podcast_name text NOT NULL,
  podcaster_name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT nominations_user_category_unique UNIQUE (user_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_nominations_user_id ON public.nominations(user_id);
CREATE INDEX IF NOT EXISTS idx_nominations_category_id ON public.nominations(category_id);
CREATE INDEX IF NOT EXISTS idx_nominations_podcast_id ON public.nominations(podcast_id);

ALTER TABLE public.nominations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view nominations" ON public.nominations;
CREATE POLICY "Anyone can view nominations"
ON public.nominations
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can insert own nominations" ON public.nominations;
CREATE POLICY "Users can insert own nominations"
ON public.nominations
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.profiles pr
    WHERE pr.id = auth.uid()
      AND pr.podcast_id = nominations.podcast_id
  )
);

DROP POLICY IF EXISTS "Users can delete own nominations" ON public.nominations;
CREATE POLICY "Users can delete own nominations"
ON public.nominations
FOR DELETE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage nominations" ON public.nominations;
CREATE POLICY "Admins can manage nominations"
ON public.nominations
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Migrate award_nominations -> nominations (if legacy table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'award_nominations'
  ) THEN
    INSERT INTO public.nominations (category_id, user_id, podcast_id, podcast_name, podcaster_name)
    SELECT DISTINCT ON (an.category_id, pr.id)
      an.category_id,
      pr.id,
      an.podcast_id,
      COALESCE(p.title, 'Podcast'),
      COALESCE(pr.full_name, p.author, '')
    FROM public.award_nominations an
    JOIN public.podcasts p ON p.id = an.podcast_id
    JOIN public.profiles pr ON pr.podcast_id = an.podcast_id
    ORDER BY an.category_id, pr.id, pr.created_at
    ON CONFLICT (user_id, category_id) DO NOTHING;
  END IF;
END $$;

DROP TABLE IF EXISTS public.award_nominations CASCADE;

-- -----------------------------------------------------------------------------
-- 2) Votes: allow 3 rows per (user, category, year) via vote_slot 1..3
-- -----------------------------------------------------------------------------
ALTER TABLE public.votes DROP CONSTRAINT IF EXISTS votes_user_id_category_id_year_key;

ALTER TABLE public.votes
  ADD COLUMN IF NOT EXISTS vote_slot smallint NOT NULL DEFAULT 1;

UPDATE public.votes SET vote_slot = 1 WHERE vote_slot IS NULL;

ALTER TABLE public.votes
  DROP CONSTRAINT IF EXISTS votes_vote_slot_check;
ALTER TABLE public.votes
  ADD CONSTRAINT votes_vote_slot_check CHECK (vote_slot >= 1 AND vote_slot <= 3);

ALTER TABLE public.votes
  DROP CONSTRAINT IF EXISTS votes_user_category_year_slot_key;
ALTER TABLE public.votes
  ADD CONSTRAINT votes_user_category_year_slot_key UNIQUE (user_id, category_id, year, vote_slot);

DROP POLICY IF EXISTS "Users can delete their own votes" ON public.votes;
CREATE POLICY "Users can delete their own votes"
ON public.votes
FOR DELETE
USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 3) Admin-only: flat vote rows with voter email (for leaderboard + CSV)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_category_votes_flat(
  p_year integer,
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
  WHERE v.year = p_year
    AND v.category_id = p_category_slug
    AND public.has_role(auth.uid(), 'admin'::public.app_role);
$$;

REVOKE ALL ON FUNCTION public.admin_category_votes_flat(integer, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_category_votes_flat(integer, text) TO authenticated;
