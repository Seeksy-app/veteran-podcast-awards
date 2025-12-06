-- Create table for podcast contacts (outreach/marketing list)
CREATE TABLE public.podcast_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  podcast_name TEXT,
  rss_url TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'uncontacted',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.podcast_contacts ENABLE ROW LEVEL SECURITY;

-- Only admins can manage contacts (sensitive contact data)
CREATE POLICY "Admins can manage podcast contacts"
ON public.podcast_contacts
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_podcast_contacts_updated_at
BEFORE UPDATE ON public.podcast_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();