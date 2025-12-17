-- Create engagement events table for detailed timeline tracking
CREATE TABLE public.investor_engagement_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  investor_access_id UUID REFERENCES public.investor_access(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'portal_opened', 'tab_clicked', 'video_progress'
  event_data JSONB DEFAULT '{}'::jsonb, -- stores tab_id, video_progress_percent, video_id, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.investor_engagement_events ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anyone (events are tracked without auth)
CREATE POLICY "Anyone can insert engagement events"
ON public.investor_engagement_events
FOR INSERT
WITH CHECK (true);

-- Only admins can view engagement events
CREATE POLICY "Admins can view engagement events"
ON public.investor_engagement_events
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete engagement events
CREATE POLICY "Admins can delete engagement events"
ON public.investor_engagement_events
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries by investor
CREATE INDEX idx_investor_engagement_email ON public.investor_engagement_events(email);
CREATE INDEX idx_investor_engagement_type ON public.investor_engagement_events(event_type);
CREATE INDEX idx_investor_engagement_created ON public.investor_engagement_events(created_at DESC);