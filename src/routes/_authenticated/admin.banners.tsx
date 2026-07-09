import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/admin/ImageUpload";

export const Route = createFileRoute("/_authenticated/admin/banners")({
  component: BannersAdmin,
});

type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  cta_label: string | null;
  cta_href: string | null;
  image_url: string;
  location: string;
  active: boolean;
  display_order: number;
};

function BannersAdmin() {
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [img, setImg] = useState("");

  const { data: banners, isLoading } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () =>
      ((await supabase.from("site_banners").select("*").order("display_order")).data ?? []) as Banner[],
  });

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (!img) { toast.error("Add an image"); return; }
    const { error } = await supabase.from("site_banners").insert({
      title: String(fd.get("title")),
      subtitle: String(fd.get("subtitle") || "") || null,
      cta_label: String(fd.get("cta_label") || "") || null,
      cta_href: String(fd.get("cta_href") || "") || null,
      image_url: img,
      location: String(fd.get("location") || "home"),
      display_order: Number(fd.get("display_order") || 0),
      active: true,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Banner added");
    setAdding(false); setImg("");
    qc.invalidateQueries({ queryKey: ["admin-banners"] });
  }

  async function toggle(id: string, active: boolean) {
    await supabase.from("site_banners").update({ active }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-banners"] });
  }
  async function del(id: string) {
    if (!confirm("Delete banner?")) return;
    await supabase.from("site_banners").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-banners"] });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Banners</h1>
          <p className="mt-1 text-sm text-muted-foreground">Hero slides and promotional images.</p>
        </div>
        <Button onClick={() => setAdding((v) => !v)} className="bg-navy text-navy-foreground hover:bg-navy/90">
          <Plus className="mr-2 h-4 w-4" /> {adding ? "Cancel" : "Add banner"}
        </Button>
      </div>

      {adding && (
        <form onSubmit={add} className="mt-6 grid gap-4 rounded-xl border border-border bg-ivory/30 p-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label>Image</Label>
            <div className="mt-1.5"><ImageUpload value={img} onChange={setImg} folder="banners" /></div>
          </div>
          <div><Label>Title</Label><Input name="title" required className="mt-1.5" /></div>
          <div><Label>Location</Label><Input name="location" defaultValue="home" className="mt-1.5" /></div>
          <div className="md:col-span-2"><Label>Subtitle</Label><Textarea name="subtitle" className="mt-1.5" /></div>
          <div><Label>Button label</Label><Input name="cta_label" placeholder="Shop now" className="mt-1.5" /></div>
          <div><Label>Button link</Label><Input name="cta_href" placeholder="/collections" className="mt-1.5" /></div>
          <div><Label>Display order</Label><Input name="display_order" type="number" defaultValue={0} className="mt-1.5" /></div>
          <div className="md:col-span-2">
            <Button type="submit" className="gradient-gold text-gold-foreground hover:opacity-90">
              <Save className="mr-2 h-4 w-4" /> Save banner
            </Button>
          </div>
        </form>
      )}

      <div className="mt-6 space-y-3">
        {isLoading && <p className="text-muted-foreground">Loading…</p>}
        {banners?.length === 0 && !isLoading && <p className="text-muted-foreground">No banners yet.</p>}
        {banners?.map((b) => (
          <div key={b.id} className="flex items-start gap-4 rounded-xl border border-border bg-card p-4">
            <img src={b.image_url} alt={b.title} className="h-20 w-32 rounded-md object-cover" />
            <div className="flex-1">
              <h3 className="font-display text-lg">{b.title}</h3>
              <p className="text-sm text-muted-foreground">{b.subtitle}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {b.location} · order {b.display_order}{b.cta_label && ` · ${b.cta_label} → ${b.cta_href}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={b.active} onCheckedChange={(v) => toggle(b.id, v)} />
              <Button size="icon" variant="ghost" onClick={() => del(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
