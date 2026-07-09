import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/site";

export type ContactInfo = { phone: string; whatsapp: string; email: string; address: string };
export type HeroInfo = { eyebrow: string; title: string; highlight: string; subtitle: string };

const DEFAULT_HERO: HeroInfo = {
  eyebrow: "For modern businesses",
  title: "Premium Corporate Gifting",
  highlight: "For Modern Businesses",
  subtitle:
    "Employee welcome kits, wellness gifts, festival hampers, and custom corporate merchandise — designed, branded and delivered across India by one trusted partner.",
};

export function useSiteSettings() {
  return useQuery({
    queryKey: ["site-settings-public"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("key,value");
      const map: Record<string, any> = {};
      (data ?? []).forEach((r: any) => { map[r.key] = r.value; });
      return map;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useContact(): ContactInfo {
  const { data } = useSiteSettings();
  return {
    phone: data?.contact?.phone || SITE.phone,
    whatsapp: data?.contact?.whatsapp || SITE.whatsapp,
    email: data?.contact?.email || SITE.email,
    address: data?.contact?.address || SITE.address,
  };
}

export function useHero(): HeroInfo {
  const { data } = useSiteSettings();
  return { ...DEFAULT_HERO, ...(data?.hero || {}) };
}
