-- Aggregates for investor portal metrics tab (anon cannot SELECT podcast_submissions or all votes under RLS).
CREATE OR REPLACE FUNCTION public.investor_platform_metrics()
RETURNS TABLE (
  active_podcasts bigint,
  total_votes bigint,
  podcast_submissions bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
STABLE
AS $$
  SELECT
    (SELECT count(*)::bigint FROM public.podcasts WHERE is_active = true),
    (SELECT count(*)::bigint FROM public.votes),
    (SELECT count(*)::bigint FROM public.podcast_submissions);
$$;

GRANT EXECUTE ON FUNCTION public.investor_platform_metrics() TO anon, authenticated;
