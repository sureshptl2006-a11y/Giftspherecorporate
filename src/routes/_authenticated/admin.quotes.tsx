import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Download, Trash2, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin/quotes")({
  component: QuotesAdmin,
});

const STATUSES = ["new", "contacted", "proposal_sent", "negotiation", "won", "lost"] as const;

function QuotesAdmin() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>("all");

  const { data: quotes, isLoading } = useQuery({
    queryKey: ["admin-quotes", filter],
    queryFn: async () => {
      let q = supabase.from("quote_requests").select("*").order("created_at", { ascending: false });
      if (filter !== "all") q = q.eq("status", filter as any);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("quote_requests").update({ status: status as any }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin-quotes"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
  }

  async function del(id: string) {
    if (!confirm("Delete this quote request?")) return;
    const { error } = await supabase.from("quote_requests").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin-quotes"] });
  }

  function exportCsv() {
    if (!quotes?.length) return;
    const cols = ["created_at", "company_name", "contact_person", "email", "phone", "industry", "num_employees", "budget_per_employee", "product_category", "delivery_date", "status", "additional_notes"];
    const csv = [
      cols.join(","),
      ...quotes.map((q: any) =>
        cols.map((c) => `"${String(q[c] ?? "").replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = `quotes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Quote requests / CRM</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage incoming leads through your pipeline.</p>
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={exportCsv} variant="outline"><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-ivory/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Company</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Project</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading…</td></tr>}
            {!isLoading && quotes?.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No quote requests yet.</td></tr>}
            {quotes?.map((q: any) => (
              <tr key={q.id} className="border-t border-border align-top">
                <td className="p-3 text-xs text-muted-foreground">{new Date(q.created_at).toLocaleDateString("en-IN")}</td>
                <td className="p-3">
                  <div className="font-medium">{q.company_name}</div>
                  <div className="text-xs text-muted-foreground">{q.industry}</div>
                </td>
                <td className="p-3">
                  <div>{q.contact_person}</div>
                  <a className="text-xs text-navy hover:underline" href={`mailto:${q.email}`}>{q.email}</a>
                  <div className="text-xs text-muted-foreground">{q.phone}</div>
                </td>
                <td className="p-3">
                  <div className="text-xs text-muted-foreground">{q.product_category || "—"}</div>
                  <div>{q.num_employees} × ₹{q.budget_per_employee}</div>
                  <div className="text-xs text-gold">₹{(q.num_employees * q.budget_per_employee).toLocaleString("en-IN")}</div>
                </td>
                <td className="p-3">
                  <Select value={q.status} onValueChange={(v) => setStatus(q.id, v)}>
                    <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-3 text-right">
                  <Button size="icon" variant="ghost" onClick={() => del(q.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
