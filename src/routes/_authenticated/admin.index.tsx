import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Overview,
});

function Overview() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [q, c, p, m] = await Promise.all([
        supabase.from("quote_requests").select("status", { count: "exact" }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("handled", false),
      ]);
      const byStatus: Record<string, number> = {};
      q.data?.forEach((r) => { byStatus[r.status] = (byStatus[r.status] ?? 0) + 1; });
      return {
        quotes: q.count ?? 0,
        categories: c.count ?? 0,
        products: p.count ?? 0,
        pendingMessages: m.count ?? 0,
        byStatus,
      };
    },
  });

  const stats = [
    { label: "Total quote requests", value: data?.quotes ?? "—" },
    { label: "Active products", value: data?.products ?? "—" },
    { label: "Categories", value: data?.categories ?? "—" },
    { label: "Unread messages", value: data?.pendingMessages ?? "—" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Quick overview of your gifting business.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-ivory/30 p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
            <div className="mt-2 font-display text-3xl">{s.value}</div>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-display text-xl">Lead pipeline</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {["new", "contacted", "proposal_sent", "negotiation", "won", "lost"].map((s) => (
          <div key={s} className="rounded-lg border border-border p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.replace("_", " ")}</div>
            <div className="mt-1 font-display text-2xl text-navy">{data?.byStatus[s] ?? 0}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
