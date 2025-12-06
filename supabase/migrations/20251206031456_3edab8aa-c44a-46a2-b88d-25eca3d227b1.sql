-- Add user_type column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN user_type text CHECK (user_type IN ('podcaster', 'voter', 'both'));

-- Update the handle_new_user function to include user_type from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, user_type)
  VALUES (
    new.id, 
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    new.raw_user_meta_data ->> 'user_type'
  );
  RETURN new;
END;
$$;