-- Create featured_nominees table for admin to manage featured content
CREATE TABLE public.featured_nominees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  podcast_name TEXT NOT NULL,
  host_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  podcast_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.featured_nominees ENABLE ROW LEVEL SECURITY;

-- Public can view active featured nominees
CREATE POLICY "Anyone can view active featured nominees"
ON public.featured_nominees
FOR SELECT
USING (is_active = true);

-- Create index for active nominees
CREATE INDEX idx_featured_nominees_active ON public.featured_nominees(is_active, display_order);