
-- Banners (home/page hero slides)
CREATE TABLE public.site_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  cta_label text,
  cta_href text,
  image_url text NOT NULL,
  location text NOT NULL DEFAULT 'home',
  active boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_banners TO authenticated;
GRANT ALL ON public.site_banners TO service_role;
ALTER TABLE public.site_banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active banners" ON public.site_banners FOR SELECT TO anon, authenticated USING (active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin manage banners" ON public.site_banners FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER tg_site_banners_updated BEFORE UPDATE ON public.site_banners FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Key/value site settings (contact info, hero copy, social links, etc.)
CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin manage settings" ON public.site_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER tg_site_settings_updated BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Seed defaults
INSERT INTO public.site_settings(key,value) VALUES
  ('contact', '{"phone":"+91 85915 51051","whatsapp":"918591551051","email":"sales@giftsphere.example","address":"13/A-wing, Manali Building, Evershine Nagar, Malad West, Mumbai 400064, Maharashtra"}'::jsonb),
  ('hero', '{"eyebrow":"For modern businesses","title":"Premium Corporate Gifting","highlight":"For Modern Businesses","subtitle":"Employee welcome kits, wellness gifts, festival hampers, and custom corporate merchandise — designed, branded and delivered across India by one trusted partner."}'::jsonb);
