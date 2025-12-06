-- Add new columns to podcast_contacts
ALTER TABLE public.podcast_contacts 
ADD COLUMN IF NOT EXISTS contact_type TEXT DEFAULT 'Military Podcast',
ADD COLUMN IF NOT EXISTS podcast_url TEXT,
ADD COLUMN IF NOT EXISTS host_name TEXT,
ADD COLUMN IF NOT EXISTS is_on_vpn BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS linked_podcast_id UUID REFERENCES public.podcasts(id) ON DELETE SET NULL;

-- Rename 'name' to be more clear it's the host
COMMENT ON COLUMN public.podcast_contacts.name IS 'Contact name (usually host name)';
COMMENT ON COLUMN public.podcast_contacts.host_name IS 'Host name from spreadsheet (backup field)';
COMMENT ON COLUMN public.podcast_contacts.is_on_vpn IS 'Whether this podcast is listed on the VPN page';
COMMENT ON COLUMN public.podcast_contacts.linked_podcast_id IS 'Reference to podcast in our network if matched';