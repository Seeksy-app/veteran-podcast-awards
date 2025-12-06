-- Add username slug to profiles for custom URLs
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username_slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS allow_contact BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username_slug ON public.profiles(username_slug);

-- Create podcaster messages table for contact inbox
CREATE TABLE public.podcaster_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.podcaster_messages ENABLE ROW LEVEL SECURITY;

-- Podcasters can view their own messages
CREATE POLICY "Users can view their own messages"
ON public.podcaster_messages
FOR SELECT
USING (auth.uid() = recipient_id);

-- Podcasters can update (mark as read) their own messages
CREATE POLICY "Users can update their own messages"
ON public.podcaster_messages
FOR UPDATE
USING (auth.uid() = recipient_id);

-- Podcasters can delete their own messages
CREATE POLICY "Users can delete their own messages"
ON public.podcaster_messages
FOR DELETE
USING (auth.uid() = recipient_id);

-- Anyone can send a message (insert)
CREATE POLICY "Anyone can send messages"
ON public.podcaster_messages
FOR INSERT
WITH CHECK (true);

-- Create active awards configuration table
CREATE TABLE public.awards_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  year INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  voting_open BOOLEAN NOT NULL DEFAULT false,
  nominations_open BOOLEAN NOT NULL DEFAULT false,
  event_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(year)
);

-- Enable RLS
ALTER TABLE public.awards_config ENABLE ROW LEVEL SECURITY;

-- Anyone can view awards config
CREATE POLICY "Anyone can view awards config"
ON public.awards_config
FOR SELECT
USING (true);

-- Only admins can manage
CREATE POLICY "Admins can manage awards config"
ON public.awards_config
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Insert default 2026 awards config
INSERT INTO public.awards_config (name, year, is_active, voting_open, nominations_open, event_date)
VALUES ('VPA 2026', 2026, true, false, true, '2026-10-05')
ON CONFLICT (year) DO NOTHING;

-- Update profiles RLS to allow public viewing of public profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (is_public = true OR auth.uid() = id);