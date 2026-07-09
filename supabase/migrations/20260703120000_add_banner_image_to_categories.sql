-- Add banner_image_url to categories so banner can differ from thumbnail
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS banner_image_url text;

-- Optional: backfill banner_image_url with existing image_url for now
UPDATE public.categories SET banner_image_url = image_url WHERE banner_image_url IS NULL;
