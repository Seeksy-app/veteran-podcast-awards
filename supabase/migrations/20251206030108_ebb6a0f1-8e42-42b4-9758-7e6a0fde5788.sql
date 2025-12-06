-- Create podcasts table for caching RSS data
CREATE TABLE public.podcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  rss_url TEXT NOT NULL UNIQUE,
  website_url TEXT,
  author TEXT,
  episodes JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  last_fetched_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;

-- Everyone can view active podcasts
CREATE POLICY "Anyone can view active podcasts"
ON public.podcasts
FOR SELECT
USING (is_active = true);

-- Admins can manage podcasts
CREATE POLICY "Admins can manage podcasts"
ON public.podcasts
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create index
CREATE INDEX idx_podcasts_active ON public.podcasts(is_active);
CREATE INDEX idx_podcasts_order ON public.podcasts(display_order);

-- Create updated_at trigger
CREATE TRIGGER update_podcasts_updated_at
BEFORE UPDATE ON public.podcasts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();