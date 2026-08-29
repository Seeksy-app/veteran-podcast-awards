-- Find-or-create the caller's podcasts row from their profile RSS and link it.
-- Lets podcasters self-link without opening podcasts INSERT to everyone.
CREATE OR REPLACE FUNCTION public.claim_my_podcast()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  prof record;
  pid uuid;
BEGIN
  SELECT id, podcast_id, podcast_name, podcast_rss, podcast_image_url, full_name
    INTO prof
    FROM public.profiles
   WHERE id = auth.uid();

  IF prof.id IS NULL THEN
    RAISE EXCEPTION 'No profile for current user';
  END IF;
  IF prof.podcast_id IS NOT NULL THEN
    RETURN prof.podcast_id;
  END IF;
  IF COALESCE(prof.podcast_rss, '') = '' THEN
    RETURN NULL; -- nothing to claim without an RSS feed
  END IF;

  SELECT id INTO pid
    FROM public.podcasts
   WHERE lower(trim(rss_url)) = lower(trim(prof.podcast_rss))
   LIMIT 1;

  IF pid IS NULL THEN
    INSERT INTO public.podcasts (title, rss_url, image_url, author, is_active)
    VALUES (
      COALESCE(prof.podcast_name, 'Untitled Podcast'),
      prof.podcast_rss,
      prof.podcast_image_url,
      prof.full_name,
      true
    )
    RETURNING id INTO pid;
  END IF;

  UPDATE public.profiles SET podcast_id = pid WHERE id = auth.uid();
  RETURN pid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_my_podcast() TO authenticated;
