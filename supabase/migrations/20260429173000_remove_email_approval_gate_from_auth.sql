-- Remove email approval gating from auth signup flow.
DROP TRIGGER IF EXISTS enforce_allowed_signup_email ON auth.users;
DROP FUNCTION IF EXISTS public.validate_signup_email();
