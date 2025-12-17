-- Create investor access table
CREATE TABLE public.investor_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  access_code text NOT NULL UNIQUE,
  allowed_tabs text[] NOT NULL DEFAULT '{}',
  expires_at timestamp with time zone NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  last_accessed_at timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.investor_access ENABLE ROW LEVEL SECURITY;

-- Only admins can manage investor access
CREATE POLICY "Admins can manage investor access"
ON public.investor_access
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Public can read their own access by code (for verification)
CREATE POLICY "Anyone can verify their access code"
ON public.investor_access
FOR SELECT
USING (true);

-- Create investor videos table
CREATE TABLE public.investor_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.investor_videos ENABLE ROW LEVEL SECURITY;

-- Admins can manage videos
CREATE POLICY "Admins can manage investor videos"
ON public.investor_videos
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can view active videos (controlled at application level via access code)
CREATE POLICY "Anyone can view active investor videos"
ON public.investor_videos
FOR SELECT
USING (is_active = true);