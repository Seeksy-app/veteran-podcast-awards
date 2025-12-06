-- Add user_type enum if not exists
DO $$ BEGIN
  CREATE TYPE public.user_type AS ENUM ('podcaster', 'voter', 'fan');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add columns to profiles for enhanced features
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS podcast_id uuid REFERENCES public.podcasts(id),
ADD COLUMN IF NOT EXISTS custom_voting_link text UNIQUE,
ADD COLUMN IF NOT EXISTS social_twitter text,
ADD COLUMN IF NOT EXISTS social_instagram text,
ADD COLUMN IF NOT EXISTS social_linkedin text;

-- Create votes table for tracking votes
CREATE TABLE public.votes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id text NOT NULL,
  nominee_id uuid NOT NULL REFERENCES public.podcasts(id) ON DELETE CASCADE,
  year integer NOT NULL DEFAULT EXTRACT(YEAR FROM now()),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, category_id, year)
);

-- Enable RLS on votes
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Users can view their own votes
CREATE POLICY "Users can view their own votes"
ON public.votes
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own votes
CREATE POLICY "Users can insert their own votes"
ON public.votes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own votes
CREATE POLICY "Users can update their own votes"
ON public.votes
FOR UPDATE
USING (auth.uid() = user_id);

-- Create table for vote statistics (public facing)
CREATE TABLE public.vote_counts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  podcast_id uuid NOT NULL REFERENCES public.podcasts(id) ON DELETE CASCADE,
  category_id text NOT NULL,
  vote_count integer NOT NULL DEFAULT 0,
  year integer NOT NULL DEFAULT EXTRACT(YEAR FROM now()),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(podcast_id, category_id, year)
);

-- Enable RLS on vote_counts
ALTER TABLE public.vote_counts ENABLE ROW LEVEL SECURITY;

-- Anyone can view vote counts
CREATE POLICY "Anyone can view vote counts"
ON public.vote_counts
FOR SELECT
USING (true);

-- Only admins can modify vote counts
CREATE POLICY "Admins can manage vote counts"
ON public.vote_counts
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create function to update vote counts
CREATE OR REPLACE FUNCTION public.update_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.vote_counts (podcast_id, category_id, year, vote_count)
    VALUES (NEW.nominee_id, NEW.category_id, NEW.year, 1)
    ON CONFLICT (podcast_id, category_id, year)
    DO UPDATE SET vote_count = vote_counts.vote_count + 1, updated_at = now();
  ELSIF TG_OP = 'UPDATE' THEN
    -- Decrement old
    UPDATE public.vote_counts
    SET vote_count = vote_count - 1, updated_at = now()
    WHERE podcast_id = OLD.nominee_id AND category_id = OLD.category_id AND year = OLD.year;
    -- Increment new
    INSERT INTO public.vote_counts (podcast_id, category_id, year, vote_count)
    VALUES (NEW.nominee_id, NEW.category_id, NEW.year, 1)
    ON CONFLICT (podcast_id, category_id, year)
    DO UPDATE SET vote_count = vote_counts.vote_count + 1, updated_at = now();
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.vote_counts
    SET vote_count = vote_count - 1, updated_at = now()
    WHERE podcast_id = OLD.nominee_id AND category_id = OLD.category_id AND year = OLD.year;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for vote count updates
CREATE TRIGGER on_vote_change
  AFTER INSERT OR UPDATE OR DELETE ON public.votes
  FOR EACH ROW EXECUTE FUNCTION public.update_vote_count();

-- Create promotional_assets table for podcasters
CREATE TABLE public.promotional_assets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  podcast_id uuid NOT NULL REFERENCES public.podcasts(id) ON DELETE CASCADE,
  asset_type text NOT NULL,
  asset_url text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promotional_assets ENABLE ROW LEVEL SECURITY;

-- Anyone can view promotional assets
CREATE POLICY "Anyone can view promotional assets"
ON public.promotional_assets
FOR SELECT
USING (true);

-- Admins can manage promotional assets
CREATE POLICY "Admins can manage promotional assets"
ON public.promotional_assets
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create storage bucket for profile avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);