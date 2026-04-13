-- -----------------------------------------------------------------------------
-- Insert 6 branch / overall / transition categories for VPA 2026
-- Safe to re-run: skips rows that already exist for the same program + slug.
--
-- NOTE: Do NOT use three separate unnest() in one SELECT — PostgreSQL does not
-- zip them; you get a Cartesian product. Use one unnest(a,b,c) or VALUES (...).
-- -----------------------------------------------------------------------------

INSERT INTO public.award_categories (program_id, name, slug, description, sort_order)
SELECT
  ap.id,
  u.name,
  u.slug,
  NULL::text AS description,
  u.sort_order
FROM public.award_programs ap
CROSS JOIN LATERAL (
  SELECT *
  FROM unnest(
    ARRAY[
      'Best Overall Veteran Podcast',
      'Best Army Veteran Podcast',
      'Best Navy Veteran Podcast',
      'Best Marine Corps Veteran Podcast',
      'Best Air Force Veteran Podcast',
      'Best Military Transition Podcast'
    ]::text[],
    ARRAY[
      'best-overall-veteran-podcast',
      'best-army-veteran-podcast',
      'best-navy-veteran-podcast',
      'best-marine-corps-veteran-podcast',
      'best-air-force-veteran-podcast',
      'best-military-transition-podcast'
    ]::text[],
    ARRAY[11, 12, 13, 14, 15, 16]::int[]
  ) AS u(name, slug, sort_order)
) u
WHERE ap.name = 'Veteran Podcast Awards 2026'
  AND NOT EXISTS (
    SELECT 1
    FROM public.award_categories c
    WHERE c.program_id = ap.id
      AND c.slug = u.slug
  );
