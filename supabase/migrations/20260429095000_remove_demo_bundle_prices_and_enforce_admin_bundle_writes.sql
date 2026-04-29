-- Remove seeded demo package prices so packages are only what admins add intentionally.
UPDATE public.bundles
SET active = false;

-- Keep bundle creation/edit/delete strictly admin-only.
DROP POLICY IF EXISTS "Admins manage bundles" ON public.bundles;
CREATE POLICY "Admins manage bundles" ON public.bundles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
