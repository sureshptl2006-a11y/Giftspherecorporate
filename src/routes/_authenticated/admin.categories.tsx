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
import { ImageUpload } from "@/components/admin/ImageUpload";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: CategoriesAdmin,
});

function CategoriesAdmin() {
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [img, setImg] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<any>(null);
  const [banner, setBanner] = useState("");

  const { data: cats, isLoading } = useQuery({
    queryKey: ["admin-cats-full"],
    queryFn: async () => (await supabase.from("categories").select("*").order("display_order")).data ?? [],
  });

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name"));
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const { error } = await supabase.from("categories").insert({
      slug,
      name,
      description: String(fd.get("description") || "") || null,
      image_url: img || null,
      banner_image_url: banner || null,
      display_order: Number(fd.get("display_order") || 0),
    } as any);
    if (error) { toast.error(error.message); return; }
    toast.success("Category added");
    setAdding(false); setImg(""); setBanner("");
    qc.invalidateQueries({ queryKey: ["admin-cats-full"] });
  }

  async function del(id: string) {
    if (!confirm("Delete category? Products in it will lose their category.")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin-cats-full"] });
  }

  function startEdit(c: any) {
    setEditingId(c.id);
    setEditFields({
      name: c.name || "",
      description: c.description || "",
      image_url: c.image_url || "",
      banner_image_url: c.banner_image_url || "",
      display_order: c.display_order ?? 0,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditFields(null);
  }

  async function saveEdit(id: string) {
    const payload: any = {
      name: editFields.name,
      description: editFields.description || null,
      image_url: editFields.image_url || null,
      banner_image_url: editFields.banner_image_url || null,
      display_order: Number(editFields.display_order) || 0,
    };
    const { error } = await supabase.from("categories").update(payload).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Category updated");
    setEditingId(null);
    setEditFields(null);
    qc.invalidateQueries({ queryKey: ["admin-cats-full"] });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">Top-level collections for your catalogue.</p>
        </div>
        <Button onClick={() => setAdding((v) => !v)} className="bg-navy text-navy-foreground hover:bg-navy/90">
          <Plus className="mr-2 h-4 w-4" /> {adding ? "Cancel" : "Add category"}
        </Button>
      </div>

      {adding && (
        <form onSubmit={add} className="mt-6 grid gap-4 rounded-xl border border-border bg-ivory/30 p-6 md:grid-cols-2">
          <div><Label>Name</Label><Input name="name" required className="mt-1.5" /></div>
          <div><Label>Display order</Label><Input name="display_order" type="number" defaultValue={0} className="mt-1.5" /></div>
          <div className="md:col-span-2"><Label>Description</Label><Textarea name="description" className="mt-1.5" /></div>
          <div className="md:col-span-2"><Label>Image</Label><div className="mt-1.5"><ImageUpload value={img} onChange={setImg} folder="categories" /></div></div>
          <div className="md:col-span-2"><Label>Banner image (hero)</Label><div className="mt-1.5"><ImageUpload value={banner} onChange={setBanner} folder="categories/banners" /></div></div>
          <div className="md:col-span-2">
            <Button type="submit" className="gradient-gold text-gold-foreground hover:opacity-90">
              <Save className="mr-2 h-4 w-4" /> Save
            </Button>
          </div>
        </form>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {isLoading && <p className="text-muted-foreground">Loading…</p>}
        {cats?.map((c: any) => (
          <div key={c.id} className="rounded-xl border border-border bg-card p-4">
            {editingId === c.id && editFields ? (
              <form className="grid gap-3 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); saveEdit(c.id); }}>
                <div className="md:col-span-2"><Label>Name</Label><Input value={editFields.name} onChange={(e) => setEditFields({ ...editFields, name: e.target.value })} className="mt-1.5" /></div>
                <div><Label>Display order</Label><Input type="number" value={editFields.display_order} onChange={(e) => setEditFields({ ...editFields, display_order: Number(e.target.value) })} className="mt-1.5" /></div>
                <div className="md:col-span-2"><Label>Description</Label><Textarea value={editFields.description} onChange={(e) => setEditFields({ ...editFields, description: e.target.value })} className="mt-1.5" /></div>
                <div className="md:col-span-2"><Label>Image</Label><div className="mt-1.5"><ImageUpload value={editFields.image_url} onChange={(url) => setEditFields({ ...editFields, image_url: url })} folder="categories" /></div></div>
                <div className="md:col-span-2"><Label>Banner image (hero)</Label><div className="mt-1.5"><ImageUpload value={editFields.banner_image_url} onChange={(url) => setEditFields({ ...editFields, banner_image_url: url })} folder="categories/banners" /></div></div>
                <div className="md:col-span-2 flex gap-2 justify-end">
                  <Button type="button" variant="ghost" onClick={cancelEdit}>Cancel</Button>
                  <Button type="submit" className="gradient-gold text-gold-foreground"><Save className="mr-2 h-4 w-4" />Save</Button>
                </div>
              </form>
            ) : (
              <div className="flex items-start gap-3">
                {c.image_url && <img src={c.image_url} alt={c.name} className="h-16 w-16 rounded-md object-cover" />}
                <div className="flex-1">
                  <h3 className="font-display text-lg">{c.name}</h3>
                  <p className="text-xs text-muted-foreground">/{c.slug}</p>
                  {c.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => startEdit(c)}>Edit</Button>
                  <Button size="icon" variant="ghost" onClick={() => del(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
