-- Create pre-registrations table for email signups
CREATE TABLE public.pre_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  interested_in TEXT[], -- categories they might be interested in
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pre_registrations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public signup)
CREATE POLICY "Anyone can pre-register"
ON public.pre_registrations
FOR INSERT
WITH CHECK (true);

-- Only allow reading own registration (for future use)
CREATE POLICY "Users cannot read registrations"
ON public.pre_registrations
FOR SELECT
USING (false);

-- Create index for faster email lookups
CREATE INDEX idx_pre_registrations_email ON public.pre_registrations(email);