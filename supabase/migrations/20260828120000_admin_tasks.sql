-- Admin project-management tasks for the awards runway
CREATE TABLE IF NOT EXISTS public.admin_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
  priority text NOT NULL DEFAULT 'P2' CHECK (priority IN ('P0', 'P1', 'P2', 'P3')),
  assignee text,
  due_date date,
  area text,
  link text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_tasks ENABLE ROW LEVEL SECURITY;

-- Admins only
CREATE POLICY "Admins manage tasks" ON public.admin_tasks
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Seed: runway to Oct 5 voting and Nov 11 ceremony
INSERT INTO public.admin_tasks (title, description, status, priority, assignee, due_date, area) VALUES
  ('Finalize award categories & judges panel', 'Lock category list and confirm judging panel commitments.', 'todo', 'P1', 'Andrew', '2026-09-08', 'Awards'),
  ('LinkedIn: swap to VPA-branded app', 'Create VPA LinkedIn app tied to the company page; update Supabase provider credentials.', 'todo', 'P2', 'Andrew', '2026-09-05', 'Auth'),
  ('Google OAuth consent approval', 'Finish Google consent screen review; re-add Google sign-in button.', 'todo', 'P2', 'Andrew', '2026-09-05', 'Auth'),
  ('Apple Sign In setup', 'Complete Apple Developer Console config; add Apple button.', 'todo', 'P3', 'Andrew', '2026-09-12', 'Auth'),
  ('Terms & Conditions / Privacy review', 'Review T&C and Privacy pages to cover registration, voting, and nominations.', 'todo', 'P1', NULL, '2026-09-10', 'Legal'),
  ('Network outreach: invite to register', 'Email campaign to Podcast Network list — claim your show and register for the awards.', 'todo', 'P1', NULL, '2026-09-09', 'Marketing'),
  ('Registered podcaster audit', 'Verify every registered podcaster has RSS confirmed, categories selected, public page live.', 'todo', 'P2', NULL, '2026-09-22', 'Product'),
  ('Voting flow end-to-end test', 'Full ballot walk-through: vote casting, counts, duplicate/fraud guards, mobile.', 'todo', 'P0', NULL, '2026-09-25', 'Product'),
  ('Voting pages content review', 'Category pages, nominee cards, and share links reviewed and polished.', 'todo', 'P1', NULL, '2026-09-29', 'Product'),
  ('Voting opens announcement', 'Email + social blast the morning voting opens on National Military Podcast Day.', 'todo', 'P0', NULL, '2026-10-05', 'Marketing'),
  ('Podcast Day livestream setup', 'Livestream page, stream key, and schedule ready for Oct 5.', 'todo', 'P1', NULL, '2026-10-05', 'Event'),
  ('Weekly vote-progress emails', 'Recurring updates to registered podcasters during voting window.', 'todo', 'P2', NULL, '2026-10-12', 'Marketing'),
  ('Close voting & certify results', 'Freeze ballots, validate counts, archive raw data.', 'todo', 'P0', NULL, '2026-11-01', 'Awards'),
  ('Judges final review — winners locked', 'Panel confirms winners across all categories.', 'todo', 'P0', NULL, '2026-11-04', 'Awards'),
  ('Winner assets & graphics', 'Winner badges, social graphics, lower-thirds for the show.', 'todo', 'P1', NULL, '2026-11-06', 'Design'),
  ('Ceremony run-of-show + rehearsal', 'Script, presenter order, and full rehearsal.', 'todo', 'P0', NULL, '2026-11-09', 'Event'),
  ('Ceremony livestream tech check', 'Final stream test: audio, overlays, backup encoder.', 'todo', 'P0', NULL, '2026-11-10', 'Event'),
  ('Awards Ceremony — Veterans Day', 'Showtime. 6 PM ET live worldwide.', 'todo', 'P0', NULL, '2026-11-11', 'Event'),
  ('Post-show winner announcements', 'Winner emails, site updates, press outreach.', 'todo', 'P1', NULL, '2026-11-12', 'Marketing'),
  ('Sponsor deliverables recap', 'Wrap-up report to sponsors: reach, mentions, media.', 'todo', 'P2', NULL, '2026-11-18', 'Sponsors');
