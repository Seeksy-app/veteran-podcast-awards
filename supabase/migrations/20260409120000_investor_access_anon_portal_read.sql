-- Allow anon (and any role) to read only active, unexpired investor_access rows so the portal can use
-- .from('investor_access').select().eq('access_code', ...) from the browser.
-- Rows are still scoped in the app by access_code + filters; avoid storing long-lived secrets in codes.
CREATE POLICY "Active unexpired investor_access readable for portal"
ON public.investor_access
FOR SELECT
TO anon, authenticated
USING (is_active = true AND expires_at > now());

-- Let the portal bump last_accessed_at after a successful lookup (same row visibility as SELECT).
CREATE POLICY "Portal can update last_accessed_at on valid investor_access"
ON public.investor_access
FOR UPDATE
TO anon, authenticated
USING (is_active = true AND expires_at > now())
WITH CHECK (is_active = true AND expires_at > now());
