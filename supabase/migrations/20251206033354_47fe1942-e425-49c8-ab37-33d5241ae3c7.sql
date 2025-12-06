-- Create table for podcast submissions
CREATE TABLE public.podcast_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  rss_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.podcast_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a podcast
CREATE POLICY "Anyone can submit a podcast"
ON public.podcast_submissions
FOR INSERT
WITH CHECK (true);

-- Users cannot read submissions (admin only via service role)
CREATE POLICY "Users cannot read submissions"
ON public.podcast_submissions
FOR SELECT
USING (false);