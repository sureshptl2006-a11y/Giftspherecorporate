ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS featured_homepage boolean NOT NULL DEFAULT false;
