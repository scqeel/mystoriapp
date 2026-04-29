-- Ensure one payment reference maps to one order.
-- If duplicates already exist, keep the first row's payment_reference and move later ones
-- to a suffixed value so we can enforce uniqueness safely.
WITH ranked AS (
  SELECT
    id,
    payment_reference,
    ROW_NUMBER() OVER (
      PARTITION BY payment_reference
      ORDER BY created_at ASC, id ASC
    ) AS rn
  FROM public.orders
  WHERE payment_reference IS NOT NULL
)
UPDATE public.orders o
SET payment_reference = o.payment_reference || '-dup-' || substring(o.id::text, 1, 8)
FROM ranked r
WHERE o.id = r.id
  AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS orders_payment_reference_unique_idx
  ON public.orders(payment_reference)
  WHERE payment_reference IS NOT NULL;
