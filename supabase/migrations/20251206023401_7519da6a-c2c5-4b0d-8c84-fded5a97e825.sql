-- Create storage bucket for videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true);

-- Allow public read access to videos
CREATE POLICY "Videos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'videos');

-- Allow authenticated users to upload videos (for admin use)
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'videos');

-- Allow authenticated users to update videos
CREATE POLICY "Authenticated users can update videos"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'videos');

-- Allow authenticated users to delete videos
CREATE POLICY "Authenticated users can delete videos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'videos');