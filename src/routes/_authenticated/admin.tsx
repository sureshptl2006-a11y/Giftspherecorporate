import { createFileRoute, Link, useNavigate, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { LogOut, LayoutDashboard, Inbox, Package, FileText, MessageSquare, Image as ImageIcon, Star, Layers, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { claimFirstAdmin } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const NAV: { to: any; label: string; icon: any; exact?: boolean }[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/quotes", label: "Quotes / CRM", icon: Inbox },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Layers },
  { to: "/admin/banners", label: "Banners", icon: ImageIcon },
  { to: "/admin/testimonials", label: "Reviews", icon: Star },
  { to: "/admin/posts", label: "Blog", icon: FileText },
  { to: "/admin/settings", label: "Site settings", icon: Settings },
];

function AdminLayout() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const claim = useServerFn(claimFirstAdmin);

  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      setEmail(user.email ?? "");
      const { data, error } = await supabase
        .from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();

      if (error) {
        console.error("Admin role lookup error:", error);
        throw new Error(`Admin role lookup failed: ${error.message}`);
      }

      if (!data) {
        try {
          const r = await claim({});
          if (r.ok) {
            qc.invalidateQueries({ queryKey: ["is-admin"] });
            return true;
          }
        } catch (err) {
          console.error("Initial admin claim failed in admin layout:", err);
        }
      }

      return !!data;
    },
  });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (isLoading) return <div className="container-page py-20 text-center text-muted-foreground">Loading…</div>;

  if (!isAdmin) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="font-display text-3xl">Access denied</h1>
        <p className="mt-2 text-muted-foreground">Your account does not have admin privileges yet.</p>
        <Button onClick={signOut} className="mt-6"><LogOut className="mr-2 h-4 w-4" /> Sign out</Button>
      </div>
    );
  }

  return (
    <div className="bg-ivory/30">
      <div className="container-page grid gap-8 py-10 md:grid-cols-[220px_1fr]">
        <aside>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="px-2 pb-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Signed in</div>
              <div className="truncate text-sm font-medium">{email}</div>
            </div>
            <nav className="flex flex-col gap-1">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  activeOptions={{ exact: n.exact }}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground/75 hover:bg-muted"
                  activeProps={{ className: "bg-navy text-navy-foreground hover:bg-navy" }}
                >
                  <n.icon className="h-4 w-4" /> {n.label}
                </Link>
              ))}
            </nav>
            <Button variant="outline" onClick={signOut} className="mt-3 w-full">
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </div>
        </aside>
        <section className="rounded-2xl border border-border bg-card p-8 shadow-soft">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
