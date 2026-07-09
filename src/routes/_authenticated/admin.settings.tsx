import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsAdmin,
});

type Contact = { phone: string; whatsapp: string; email: string; address: string };
type Hero = { eyebrow: string; title: string; highlight: string; subtitle: string };

function SettingsAdmin() {
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("*");
      const map: Record<string, any> = {};
      (data ?? []).forEach((r: any) => { map[r.key] = r.value; });
      return map;
    },
  });

  const [contact, setContact] = useState<Contact>({ phone: "", whatsapp: "", email: "", address: "" });
  const [hero, setHero] = useState<Hero>({ eyebrow: "", title: "", highlight: "", subtitle: "" });

  useEffect(() => {
    if (data?.contact) setContact({ ...contact, ...data.contact });
    if (data?.hero) setHero({ ...hero, ...data.hero });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  async function save(key: string, value: any) {
    const { error } = await supabase.from("site_settings").upsert({ key, value });
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    qc.invalidateQueries({ queryKey: ["site-settings"] });
    qc.invalidateQueries({ queryKey: ["site-settings-public"] });
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl">Site settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Contact info and hero copy used across the site.</p>
      </div>

      <section className="rounded-xl border border-border bg-ivory/30 p-6">
        <h2 className="font-display text-xl">Contact details</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div><Label>Phone</Label><Input className="mt-1.5" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} /></div>
          <div><Label>WhatsApp (digits only, with country code)</Label><Input className="mt-1.5" value={contact.whatsapp} onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })} /></div>
          <div><Label>Email</Label><Input className="mt-1.5" type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>Address</Label><Textarea className="mt-1.5" value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} /></div>
        </div>
        <Button onClick={() => save("contact", contact)} className="mt-4 gradient-gold text-gold-foreground hover:opacity-90">
          <Save className="mr-2 h-4 w-4" /> Save contact info
        </Button>
      </section>

      <section className="rounded-xl border border-border bg-ivory/30 p-6">
        <h2 className="font-display text-xl">Homepage hero</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div><Label>Eyebrow</Label><Input className="mt-1.5" value={hero.eyebrow} onChange={(e) => setHero({ ...hero, eyebrow: e.target.value })} /></div>
          <div><Label>Title</Label><Input className="mt-1.5" value={hero.title} onChange={(e) => setHero({ ...hero, title: e.target.value })} /></div>
          <div><Label>Title highlight (gold)</Label><Input className="mt-1.5" value={hero.highlight} onChange={(e) => setHero({ ...hero, highlight: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>Subtitle</Label><Textarea className="mt-1.5" value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} /></div>
        </div>
        <Button onClick={() => save("hero", hero)} className="mt-4 gradient-gold text-gold-foreground hover:opacity-90">
          <Save className="mr-2 h-4 w-4" /> Save hero
        </Button>
      </section>
    </div>
  );
}
