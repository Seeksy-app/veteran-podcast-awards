-- Create table for VPA Deck engagement tracking
CREATE TABLE public.deck_engagement_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  page_url TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deck_engagement_events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert engagement events (public tracking)
CREATE POLICY "Anyone can insert deck engagement events"
ON public.deck_engagement_events
FOR INSERT
WITH CHECK (true);

-- Only admins can view engagement events
CREATE POLICY "Admins can view deck engagement events"
ON public.deck_engagement_events
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete engagement events
CREATE POLICY "Admins can delete deck engagement events"
ON public.deck_engagement_events
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_deck_engagement_session ON public.deck_engagement_events(session_id);
CREATE INDEX idx_deck_engagement_type ON public.deck_engagement_events(event_type);
CREATE INDEX idx_deck_engagement_created ON public.deck_engagement_events(created_at DESC);