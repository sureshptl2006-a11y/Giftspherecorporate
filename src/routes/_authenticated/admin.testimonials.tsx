import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Save, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/admin/ImageUpload";

export const Route = createFileRoute("/_authenticated/admin/testimonials")({
  component: TestimonialsAdmin,
});

function TestimonialsAdmin() {
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [logo, setLogo] = useState("");

  const { data: items, isLoading } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: async () => (await supabase.from("testimonials").select("*").order("display_order")).data ?? [],
  });

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      reviewer_name: String(fd.get("reviewer_name")),
      designation: String(fd.get("designation") || "") || null,
      company: String(fd.get("company") || "") || null,
      quote: String(fd.get("quote")),
      rating: Number(fd.get("rating") || 5),
      company_logo: logo || null,
      active: true,
      display_order: Number(fd.get("display_order") || 0),
    };
    const { error } = await supabase.from("testimonials").insert(payload as any);
    if (error) { toast.error(error.message); return; }
    toast.success("Review added");
    setAdding(false); setLogo("");
    qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
  }

  async function toggleActive(id: string, active: boolean) {
    await supabase.from("testimonials").update({ active }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
  }
  async function del(id: string) {
    if (!confirm("Delete testimonial?")) return;
    await supabase.from("testimonials").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Testimonials</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage client reviews and case study quotes.</p>
        </div>
        <Button onClick={() => setAdding((v) => !v)} className="bg-navy text-navy-foreground hover:bg-navy/90">
          <Plus className="mr-2 h-4 w-4" /> {adding ? "Cancel" : "Add review"}
        </Button>
      </div>

      {adding && (
        <form onSubmit={add} className="mt-6 grid gap-4 rounded-xl border border-border bg-ivory/30 p-6 md:grid-cols-2">
          <div><Label>Reviewer name</Label><Input name="reviewer_name" required className="mt-1.5" /></div>
          <div><Label>Designation</Label><Input name="designation" placeholder="HR Director" className="mt-1.5" /></div>
          <div><Label>Company</Label><Input name="company" className="mt-1.5" /></div>
          <div><Label>Display order</Label><Input name="display_order" type="number" defaultValue={0} className="mt-1.5" /></div>
          <div className="md:col-span-2"><Label>Quote</Label><Textarea name="quote" required rows={4} className="mt-1.5" /></div>
          <div><Label>Rating (1–5)</Label><Input name="rating" type="number" min={1} max={5} defaultValue={5} className="mt-1.5" /></div>
          <div className="md:col-span-2"><Label>Company logo</Label><div className="mt-1.5"><ImageUpload value={logo} onChange={setLogo} folder="logos" /></div></div>
          <div className="md:col-span-2">
            <Button type="submit" className="gradient-gold text-gold-foreground hover:opacity-90">
              <Save className="mr-2 h-4 w-4" /> Save review
            </Button>
          </div>
        </form>
      )}

      <div className="mt-6 space-y-3">
        {isLoading && <p className="text-muted-foreground">Loading…</p>}
        {items?.map((t: any) => (
          <div key={t.id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {t.company_logo && <img src={t.company_logo} alt={t.company} className="h-10 w-10 rounded object-contain" />}
                <div>
                  <h3 className="font-medium">{t.reviewer_name}{t.designation && <span className="text-muted-foreground"> · {t.designation}</span>}</h3>
                  <p className="text-xs text-muted-foreground">{t.company}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center text-gold">
                  {Array.from({ length: t.rating ?? 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
                </div>
                <div className="flex items-center gap-1 text-xs"><span>Active</span><Switch checked={t.active} onCheckedChange={(v) => toggleActive(t.id, v)} /></div>
                <Button size="icon" variant="ghost" onClick={() => del(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground/85">"{t.quote}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}
