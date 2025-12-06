-- Create function to increment campaign opened count
CREATE OR REPLACE FUNCTION public.increment_campaign_opened(campaign_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.email_campaigns
  SET opened_count = opened_count + 1
  WHERE id = campaign_id;
END;
$$;

-- Create function to increment campaign clicked count
CREATE OR REPLACE FUNCTION public.increment_campaign_clicked(campaign_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.email_campaigns
  SET clicked_count = clicked_count + 1
  WHERE id = campaign_id;
END;
$$;