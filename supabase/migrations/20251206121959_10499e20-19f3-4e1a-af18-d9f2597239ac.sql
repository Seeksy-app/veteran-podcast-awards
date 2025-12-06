-- Create smart lists table for dynamic filtering
CREATE TABLE public.smart_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  filters JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.smart_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage smart lists"
ON public.smart_lists
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_smart_lists_updated_at
BEFORE UPDATE ON public.smart_lists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add some example smart lists
INSERT INTO public.smart_lists (name, description, filters) VALUES
  ('Uncontacted Podcasters', 'Podcasters we haven''t reached out to yet', '{"status": "uncontacted", "contact_type": "Military Podcast"}'),
  ('On VPN Network', 'Contacts whose podcasts are on our network', '{"is_on_vpn": true}'),
  ('Needs Follow-up', 'Contacted but no response', '{"status": "contacted"}');