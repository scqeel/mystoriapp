-- Backfill any remaining unconfirmed email users.
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email IS NOT NULL
  AND email_confirmed_at IS NULL;

-- Force email confirmation timestamp for future email signups.
CREATE OR REPLACE FUNCTION public.force_email_confirm_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
BEGIN
  IF NEW.email IS NOT NULL AND NEW.email_confirmed_at IS NULL THEN
    NEW.email_confirmed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_force_email_confirm_on_signup ON auth.users;
CREATE TRIGGER trg_force_email_confirm_on_signup
BEFORE INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.force_email_confirm_on_signup();
