import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Save, Pencil, X, ChevronDown, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MultiImageUpload } from "@/components/admin/MultiImageUpload";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: ProductsAdmin,
});

type Product = any;

function ProductsAdmin() {
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newImages, setNewImages] = useState<string[]>([]);
  const [editImages, setEditImages] = useState<string[]>([]);
  const [newFeaturedHomepage, setNewFeaturedHomepage] = useState(false);
  const [editFeaturedHomepage, setEditFeaturedHomepage] = useState(false);
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({});
  const [defaultCatForNew, setDefaultCatForNew] = useState<string>("");

  const { data: cats } = useQuery({
    queryKey: ["admin-cats"],
    queryFn: async () => (await supabase.from("categories").select("*").order("display_order")).data ?? [],
  });

  const { data: supportsFeaturedHomepage } = useQuery({
    queryKey: ["products", "supports-featured-homepage"],
    queryFn: async () => {
      const { error } = await supabase.from("products").select("featured_homepage").limit(1);
      if (error) {
        if ((error as any).code === "42703" || /Could not find the 'featured_homepage' column/.test(String(error.message))) {
          return false;
        }
        throw error;
      }
      return true;
    },
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => (await supabase.from("products").select("*").order("display_order")).data ?? [],
  });

  const grouped = useMemo(() => {
    const map = new Map<string, { name: string; items: Product[] }>();
    (cats ?? []).forEach((c: any) => map.set(c.id, { name: c.name, items: [] }));
    map.set("__none", { name: "Uncategorised", items: [] });
    (products ?? []).forEach((p: Product) => {
      const key = p.category_id && map.has(p.category_id) ? p.category_id : "__none";
      map.get(key)!.items.push(p);
    });
    return Array.from(map.entries()).filter(([, v]) => v.items.length > 0);
  }, [cats, products]);

  function startAdding(catId?: string) {
    setDefaultCatForNew(catId ?? "");
    setNewImages([]);
    setNewFeaturedHomepage(false);
    setAdding(true);
  }

  async function addProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "");
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now().toString(36);
    const payload: any = {
      slug,
      name,
      description: String(fd.get("description") || ""),
      category_id: String(fd.get("category_id") || "") || null,
      moq: Number(fd.get("moq") || 50),
      bulk_quantity: Number(fd.get("bulk_quantity") || 100),
      price_single: fd.get("price_single") ? Number(fd.get("price_single")) : null,
      price_bulk: fd.get("price_bulk") ? Number(fd.get("price_bulk")) : null,
      price_per_unit: fd.get("price_bulk") ? Number(fd.get("price_bulk")) : null,
      image_url: newImages[0] || null,
      image_urls: newImages,
      active: true,
    };
    if (supportsFeaturedHomepage) {
      payload.featured_homepage = newFeaturedHomepage;
    }
    const { error } = await supabase.from("products").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Product added");
    setAdding(false); setNewImages([]);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    const list = (p.image_urls && p.image_urls.length > 0)
      ? p.image_urls
      : (p.image_url ? [p.image_url] : []);
    setEditImages(list);
    setEditFeaturedHomepage(Boolean(p.featured_homepage));
  }

  async function saveEdit(id: string, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const update: any = {
      name: String(fd.get("name")),
      description: String(fd.get("description") || ""),
      category_id: String(fd.get("category_id") || "") || null,
      moq: Number(fd.get("moq") || 1),
      bulk_quantity: Number(fd.get("bulk_quantity") || 100),
      price_single: fd.get("price_single") ? Number(fd.get("price_single")) : null,
      price_bulk: fd.get("price_bulk") ? Number(fd.get("price_bulk")) : null,
      price_per_unit: fd.get("price_bulk") ? Number(fd.get("price_bulk")) : null,
      image_url: editImages[0] || null,
      image_urls: editImages,
    };
    if (supportsFeaturedHomepage) {
      update.featured_homepage = editFeaturedHomepage;
    }
    const { error } = await supabase.from("products").update(update).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    setEditingId(null);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  }

  async function toggleActive(id: string, active: boolean) {
    await supabase.from("products").update({ active }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  }

  async function del(id: string) {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Grouped by category. Each product supports multiple images — the first is the main thumbnail.
          </p>
        </div>
        <Button onClick={() => (adding ? setAdding(false) : startAdding())} className="bg-navy text-navy-foreground hover:bg-navy/90">
          <Plus className="mr-2 h-4 w-4" /> {adding ? "Cancel" : "Add product"}
        </Button>
      </div>

      {adding && (
        <form onSubmit={addProduct} className="mt-6 grid gap-4 rounded-xl border border-border bg-ivory/30 p-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label>Name</Label>
            <Input name="name" required className="mt-1.5" />
          </div>
          <div className="md:col-span-2">
            <Label>Description</Label>
            <Textarea name="description" className="mt-1.5" />
          </div>
          <div>
            <Label>Category</Label>
            <Select name="category_id" defaultValue={defaultCatForNew || undefined}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{cats?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>MOQ</Label><Input name="moq" type="number" defaultValue={50} className="mt-1.5" /></div>
            <div><Label>Bulk qty threshold</Label><Input name="bulk_quantity" type="number" defaultValue={100} className="mt-1.5" /></div>
          </div>
          {supportsFeaturedHomepage && (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
              <Switch checked={newFeaturedHomepage} onCheckedChange={setNewFeaturedHomepage} />
              <div>
                <Label>Feature on homepage</Label>
                <p className="text-xs text-muted-foreground">Show this product in the homepage trending section.</p>
              </div>
            </div>
          )}
          <div>
            <Label>Single-unit price (₹) — higher</Label>
            <Input name="price_single" type="number" step="0.01" placeholder="e.g. 1400" className="mt-1.5" />
          </div>
          <div>
            <Label>Bulk price (₹) — lower</Label>
            <Input name="price_bulk" type="number" step="0.01" placeholder="e.g. 1000" className="mt-1.5" />
          </div>
          <div className="md:col-span-2">
            <Label>Product images</Label>
            <div className="mt-1.5">
              <MultiImageUpload value={newImages} onChange={setNewImages} folder="products" />
            </div>
          </div>
          <Button type="submit" className="gradient-gold text-gold-foreground hover:opacity-90 md:col-span-2">
            <Save className="mr-2 h-4 w-4" /> Save product
          </Button>
        </form>
      )}

      <div className="mt-8 space-y-4">
        {isLoading && <p className="text-muted-foreground">Loading…</p>}
        {grouped.map(([catId, group]) => {
          const isOpen = openCats[catId] ?? true;
          return (
            <div key={catId} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between bg-ivory/40 px-4 py-3">
                <button
                  type="button"
                  onClick={() => setOpenCats((s) => ({ ...s, [catId]: !isOpen }))}
                  className="flex items-center gap-2 font-display text-lg"
                >
                  {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  {group.name}
                  <span className="rounded-full bg-navy/10 px-2 py-0.5 text-xs font-sans text-navy">{group.items.length}</span>
                </button>
                {catId !== "__none" && (
                  <Button size="sm" variant="ghost" onClick={() => startAdding(catId)}>
                    <Plus className="mr-1 h-3.5 w-3.5" /> Add to {group.name}
                  </Button>
                )}
              </div>
              {isOpen && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="p-3 w-20">Image</th>
                        <th className="p-3">Product</th>
                        <th className="p-3">MOQ → Bulk@</th>
                        <th className="p-3">Price (single → bulk)</th>
                        <th className="p-3">Homepage</th>
                        <th className="p-3">Active</th>
                        <th className="p-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.items.map((p: Product) => (
                        editingId === p.id ? (
                          <tr key={p.id} className="border-t border-border bg-ivory/20">
                            <td colSpan={6} className="p-4">
                              <form onSubmit={(e) => saveEdit(p.id, e)} className="grid gap-3 md:grid-cols-2">
                                <div className="md:col-span-2">
                                  <Label>Name</Label>
                                  <Input name="name" defaultValue={p.name} required className="mt-1.5" />
                                </div>
                                <div className="md:col-span-2">
                                  <Label>Description</Label>
                                  <Textarea name="description" defaultValue={p.description ?? ""} className="mt-1.5" />
                                </div>
                                <div>
                                  <Label>Category</Label>
                                  <Select name="category_id" defaultValue={p.category_id ?? undefined}>
                                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>{cats?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                                  </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div><Label>MOQ</Label><Input name="moq" type="number" defaultValue={p.moq ?? 50} className="mt-1.5" /></div>
                                  <div><Label>Bulk qty threshold</Label><Input name="bulk_quantity" type="number" defaultValue={p.bulk_quantity ?? 100} className="mt-1.5" /></div>
                                </div>
                                {supportsFeaturedHomepage && (
                                  <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                                    <Switch checked={editFeaturedHomepage} onCheckedChange={setEditFeaturedHomepage} />
                                    <div>
                                      <Label>Feature on homepage</Label>
                                      <p className="text-xs text-muted-foreground">Show this product in the homepage trending section.</p>
                                    </div>
                                  </div>
                                )}
                                <div>
                                  <Label>Single-unit price (₹)</Label>
                                  <Input name="price_single" type="number" step="0.01" defaultValue={p.price_single ?? ""} className="mt-1.5" />
                                </div>
                                <div>
                                  <Label>Bulk price (₹)</Label>
                                  <Input name="price_bulk" type="number" step="0.01" defaultValue={p.price_bulk ?? p.price_per_unit ?? ""} className="mt-1.5" />
                                </div>
                                <div className="md:col-span-2">
                                  <Label>Product images</Label>
                                  <div className="mt-1.5">
                                    <MultiImageUpload value={editImages} onChange={setEditImages} folder="products" />
                                  </div>
                                </div>
                                <div className="flex gap-2 md:col-span-2">
                                  <Button type="submit" className="gradient-gold text-gold-foreground hover:opacity-90">
                                    <Save className="mr-2 h-4 w-4" /> Save changes
                                  </Button>
                                  <Button type="button" variant="outline" onClick={() => setEditingId(null)}>
                                    <X className="mr-2 h-4 w-4" /> Cancel
                                  </Button>
                                </div>
                              </form>
                            </td>
                          </tr>
                        ) : (
                          <tr key={p.id} className="border-t border-border">
                            <td className="p-3">
                              {(() => {
                                const main = (p.image_urls?.[0]) || p.image_url;
                                return main ? (
                                  <img src={main} alt={p.name} className="h-12 w-12 rounded-md border border-border object-cover" />
                                ) : (
                                  <div className="h-12 w-12 rounded-md border border-dashed border-border" />
                                );
                              })()}
                            </td>
                            <td className="p-3">
                              <div className="font-medium">{p.name}</div>
                              <div className="text-xs text-muted-foreground line-clamp-1">{p.description}</div>
                              {p.image_urls?.length > 1 && (
                                <div className="mt-1 text-[10px] uppercase tracking-wider text-gold">{p.image_urls.length} photos</div>
                              )}
                            </td>
                            <td className="p-3">{p.moq} → {p.bulk_quantity ?? "—"}</td>
                            <td className="p-3">
                              {p.price_single ? `₹${p.price_single}` : "—"}
                              <span className="mx-1 text-muted-foreground">→</span>
                              {p.price_bulk ?? p.price_per_unit ? `₹${p.price_bulk ?? p.price_per_unit}` : "—"}
                            </td>
                            <td className="p-3">
                              {p.featured_homepage ? (
                                <span className="rounded-full bg-gold/10 px-2 py-1 text-[11px] font-medium text-gold">Featured</span>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="p-3"><Switch checked={p.active} onCheckedChange={(v) => toggleActive(p.id, v)} /></td>
                            <td className="p-3 text-right">
                              <Button size="icon" variant="ghost" onClick={() => startEdit(p)}><Pencil className="h-4 w-4" /></Button>
                              <Button size="icon" variant="ghost" onClick={() => del(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </td>
                          </tr>
                        )
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
