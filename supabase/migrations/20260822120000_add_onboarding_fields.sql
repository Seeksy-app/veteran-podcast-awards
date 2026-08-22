-- Add onboarding fields to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS podcast_name text,
  ADD COLUMN IF NOT EXISTS podcast_rss text,
  ADD COLUMN IF NOT EXISTS podcast_image_url text,
  ADD COLUMN IF NOT EXISTS podchaser_id integer,
  ADD COLUMN IF NOT EXISTS hosting_platform text,
  ADD COLUMN IF NOT EXISTS distribution_platforms text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS has_ad_agency boolean,
  ADD COLUMN IF NOT EXISTS interested_in_opportunities boolean,
  ADD COLUMN IF NOT EXISTS military_branch text,
  ADD COLUMN IF NOT EXISTS military_affiliation text,
  ADD COLUMN IF NOT EXISTS selected_categories text[] DEFAULT '{}';
