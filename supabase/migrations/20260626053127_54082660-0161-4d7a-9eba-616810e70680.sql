ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS price_single numeric,
  ADD COLUMN IF NOT EXISTS price_bulk numeric,
  ADD COLUMN IF NOT EXISTS bulk_quantity integer DEFAULT 100;

-- Backfill: use existing price_per_unit as bulk price; single = 1.4x bulk as a sensible default
UPDATE public.products
SET price_bulk = COALESCE(price_bulk, price_per_unit),
    price_single = COALESCE(price_single, ROUND(price_per_unit * 1.4, 2)),
    bulk_quantity = COALESCE(bulk_quantity, GREATEST(moq, 100))
WHERE price_per_unit IS NOT NULL;