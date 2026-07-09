import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/messages")({
  component: MessagesAdmin,
});

function MessagesAdmin() {
  const qc = useQueryClient();
  const { data: msgs, isLoading } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => (await supabase.from("contact_messages").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  async function markHandled(id: string) {
    await supabase.from("contact_messages").update({ handled: true }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-messages"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
  }

  async function del(id: string) {
    if (!confirm("Delete message?")) return;
    await supabase.from("contact_messages").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-messages"] });
  }

  return (
    <div>
      <h1 className="font-display text-3xl">Contact messages</h1>
      <p className="mt-1 text-sm text-muted-foreground">Inbound enquiries from the contact form.</p>

      <div className="mt-6 space-y-3">
        {isLoading && <p className="text-muted-foreground">Loading…</p>}
        {msgs?.length === 0 && <p className="text-muted-foreground">No messages yet.</p>}
        {msgs?.map((m) => (
          <div key={m.id} className={`rounded-xl border border-border p-5 ${m.handled ? "bg-ivory/30 opacity-60" : "bg-card"}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-medium">{m.name}{m.company && <span className="text-muted-foreground"> · {m.company}</span>}</h3>
                <p className="text-xs text-muted-foreground">
                  <a className="hover:text-navy" href={`mailto:${m.email}`}>{m.email}</a>{m.phone && ` · ${m.phone}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!m.handled && <Button size="sm" variant="outline" onClick={() => markHandled(m.id)}><Check className="mr-1 h-3.5 w-3.5" /> Mark handled</Button>}
                <Button size="icon" variant="ghost" onClick={() => del(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground/85">{m.message}</p>
            <p className="mt-2 text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString("en-IN")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
