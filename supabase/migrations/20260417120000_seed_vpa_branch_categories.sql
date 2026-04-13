-- Additional VPA 2026 categories (branch / overall / transition) — idempotent per slug
WITH prog AS (
  SELECT id FROM public.award_programs
  WHERE year = 2026 AND name = 'Veteran Podcast Awards 2026'
  LIMIT 1
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
  (11, 'best-overall-veteran-podcast', 'Best Overall Veteran Podcast', 'Top veteran-focused podcast across all formats and branches.'),
  (12, 'best-army-veteran-podcast', 'Best Army Veteran Podcast', 'Excellence in Army veteran stories, culture, and community.'),
  (13, 'best-navy-veteran-podcast', 'Best Navy Veteran Podcast', 'Outstanding Navy veteran voices and maritime military themes.'),
  (14, 'best-marine-corps-veteran-podcast', 'Best Marine Corps Veteran Podcast', 'Marine Corps veteran perspective, history, and storytelling.'),
  (15, 'best-air-force-veteran-podcast', 'Best Air Force Veteran Podcast', 'Air Force veteran content, aviation, and service life.'),
  (16, 'best-military-transition-podcast', 'Best Military Transition Podcast', 'Resources and stories for the transition from service to civilian life.')
) AS v(sort_order, slug, name, description)
WHERE NOT EXISTS (
  SELECT 1 FROM public.award_categories c WHERE c.program_id = (SELECT id FROM prog) AND c.slug = v.slug
);
