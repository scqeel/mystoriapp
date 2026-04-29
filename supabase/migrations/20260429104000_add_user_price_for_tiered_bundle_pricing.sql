ALTER TABLE public.bundles
  ADD COLUMN IF NOT EXISTS user_price NUMERIC(10,2);

UPDATE public.bundles
SET user_price = base_price
WHERE user_price IS NULL;
