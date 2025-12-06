-- Allow admins to view all podcast submissions
CREATE POLICY "Admins can view all submissions"
ON public.podcast_submissions
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Allow admins to update submission status
CREATE POLICY "Admins can update submissions"
ON public.podcast_submissions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Allow admins to delete submissions
CREATE POLICY "Admins can delete submissions"
ON public.podcast_submissions
FOR DELETE
USING (has_role(auth.uid(), 'admin'));