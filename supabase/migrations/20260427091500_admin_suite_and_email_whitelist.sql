-- Admin suite support: email whitelist + user pricing

CREATE TABLE IF NOT EXISTS public.allowed_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT true,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.allowed_emails ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'allowed_emails' AND policyname = 'Public read allowed emails'
  ) THEN
    CREATE POLICY "Public read allowed emails"
      ON public.allowed_emails FOR SELECT TO anon, authenticated
      USING (active = true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'allowed_emails' AND policyname = 'Admins manage allowed emails'
  ) THEN
    CREATE POLICY "Admins manage allowed emails"
      ON public.allowed_emails FOR ALL TO authenticated
      USING (public.has_role(auth.uid(), 'admin'))
      WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

ALTER TABLE public.bundles
  ADD COLUMN IF NOT EXISTS user_price NUMERIC(10,2);

UPDATE public.bundles
SET user_price = base_price
WHERE user_price IS NULL;

ALTER TABLE public.bundles
  ALTER COLUMN user_price SET NOT NULL;

ALTER TABLE public.profiles
  ALTER COLUMN phone DROP NOT NULL;

UPDATE public.profiles
SET phone = NULL
WHERE phone = '';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, full_name, email, username)
  VALUES (
    NEW.id,
    NULLIF(COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone, ''), ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'username'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.validate_signup_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS NULL OR length(trim(NEW.email)) = 0 THEN
    RAISE EXCEPTION 'Email is required';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.allowed_emails ae
    WHERE ae.active = true
      AND lower(ae.email) = lower(NEW.email)
  ) THEN
    RAISE EXCEPTION 'Email is not authorized for signup';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_allowed_signup_email ON auth.users;
CREATE TRIGGER enforce_allowed_signup_email
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_signup_email();
