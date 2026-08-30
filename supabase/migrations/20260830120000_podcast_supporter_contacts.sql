-- Opt-in contact sharing: when a voter/fan follows or votes for a podcast,
-- they can choose to share their name + email with that podcaster. This is
-- deliberately a separate table from podcast_contacts (VPA's own admin
-- outreach list) because one supporter can share with many podcasts —
-- podcast_contacts is unique-by-email with a single linked_podcast_id, which
-- can't model a many-to-many "who shared with whom" relationship.

CREATE TABLE public.podcast_supporter_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  podcast_id UUID NOT NULL REFERENCES public.podcasts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT NOT NULL,
  sources TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (podcast_id, user_id)
);

ALTER TABLE public.podcast_supporter_contacts ENABLE ROW LEVEL SECURITY;

-- Podcasters can view supporters who opted in to share with their own podcast.
CREATE POLICY "Podcasters can view their own supporter contacts"
ON public.podcast_supporter_contacts
FOR SELECT
TO authenticated
USING (
  podcast_id IN (SELECT podcast_id FROM public.profiles WHERE id = auth.uid())
);

-- A supporter can create/update/withdraw their own share — this is what
-- "opt in" (and opt back out) means in practice.
CREATE POLICY "Users can manage their own contact shares"
ON public.podcast_supporter_contacts
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can see/manage everything (support + data cleanup).
CREATE POLICY "Admins can manage all supporter contacts"
ON public.podcast_supporter_contacts
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_podcast_supporter_contacts_updated_at
BEFORE UPDATE ON public.podcast_supporter_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
