import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Save, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_authenticated/admin/posts")({
  component: PostsAdmin,
});

function PostsAdmin() {
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);

  const { data: posts } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: async () => (await supabase.from("blog_posts").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  async function addPost(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const slug = String(fd.get("title")).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now().toString(36);
    const { error } = await supabase.from("blog_posts").insert({
      slug,
      title: String(fd.get("title")),
      excerpt: String(fd.get("excerpt")),
      content: String(fd.get("content")),
      published: true,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Post created");
    setAdding(false);
    qc.invalidateQueries({ queryKey: ["admin-posts"] });
  }

  async function togglePub(id: string, published: boolean) {
    await supabase.from("blog_posts").update({ published }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-posts"] });
  }

  async function del(id: string) {
    if (!confirm("Delete this post?")) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-posts"] });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Blog posts</h1>
          <p className="mt-1 text-sm text-muted-foreground">Publish insights and SEO-friendly content.</p>
        </div>
        <Button onClick={() => setAdding((v) => !v)} className="bg-navy text-navy-foreground hover:bg-navy/90">
          <Plus className="mr-2 h-4 w-4" /> {adding ? "Cancel" : "New post"}
        </Button>
      </div>

      {adding && (
        <form onSubmit={addPost} className="mt-6 grid gap-4 rounded-xl border border-border bg-ivory/30 p-6">
          <div><Label>Title</Label><Input name="title" required className="mt-1.5" /></div>
          <div><Label>Excerpt</Label><Input name="excerpt" maxLength={200} className="mt-1.5" /></div>
          <div><Label>Content (Markdown-lite: blank-line paragraphs, ## headings, - lists, **bold**)</Label>
            <Textarea name="content" required rows={14} className="mt-1.5 font-mono text-sm" /></div>
          <Button type="submit" className="gradient-gold text-gold-foreground hover:opacity-90">
            <Save className="mr-2 h-4 w-4" /> Publish
          </Button>
        </form>
      )}

      <div className="mt-6 space-y-3">
        {posts?.map((p) => (
          <div key={p.id} className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-5">
            <div>
              <h3 className="font-display text-lg">{p.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>
              <p className="mt-2 text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString("en-IN", { dateStyle: "long" })}</p>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={p.published} onCheckedChange={(v) => togglePub(p.id, v)} />
              <Button variant="ghost" size="icon" onClick={() => del(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
