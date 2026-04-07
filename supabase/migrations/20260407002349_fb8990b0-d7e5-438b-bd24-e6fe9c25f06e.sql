CREATE POLICY "Public can view profiles"
ON public.profiles
FOR SELECT
TO anon
USING (true);