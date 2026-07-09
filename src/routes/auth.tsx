import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { Lock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { claimFirstAdmin } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Admin Sign In — GiftSphere" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const claim = useServerFn(claimFirstAdmin);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
      else setChecked(true);
    });
  }, [navigate]);

  async function ensureAuthSession() {
    for (let i = 0; i < 5; i += 1) {
      const { data } = await supabase.auth.getSession();
      if (data.session) return data.session;
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
    return null;
  }

  async function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(fd.get("email")), password: String(fd.get("password")),
    });
    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }

    const session = await ensureAuthSession();
    if (session) {
      try {
        const r = await claim({});
        if (r.ok) {
          toast.success("Welcome — admin account created.");
        } else {
          toast.message("Sign-in successful. Admin claim was not executed.");
          console.warn("claimFirstAdmin returned ok=false during sign in", r);
        }
      } catch (err) {
        console.error("Admin claim failed after sign in:", err);
        toast.error("Sign-in succeeded but admin claim failed. Check console for details.");
      }
    }

    setLoading(false);
    navigate({ to: "/admin" });
  }

  async function signUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: String(fd.get("email")),
      password: String(fd.get("password")),
      options: { emailRedirectTo: window.location.origin + "/admin" },
    });
    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }

    if (data?.session) {
      const session = await ensureAuthSession();
      if (session) {
        try {
          const r = await claim({});
          if (r.ok) toast.success("Welcome — admin account created.");
          else {
            toast.message("Account created. An existing admin must grant access.");
            console.warn("claimFirstAdmin returned ok=false after signup", r);
          }
        } catch (err) {
          console.error("Admin claim failed after signup:", err);
          toast.error("Account created, but initial admin claim failed. Please sign in again.");
        }
      } else {
        toast.success("Account created. Please confirm your email before signing in.");
      }
      setLoading(false);
      navigate({ to: "/admin" });
      return;
    }

    setLoading(false);
    toast.success("Account created. Please confirm your email before signing in.");
  }

  if (!checked) return null;

  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-ivory/30 py-16">
      <div className="container-page mx-auto max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-elegant">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-gold">
            <Lock className="h-5 w-5 text-gold-foreground" />
          </div>
          <h1 className="mt-4 font-display text-3xl">Admin access</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to manage quotes, products and content.</p>

          <Tabs defaultValue="signin" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">First-time setup</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={signIn} className="space-y-4">
                <div>
                  <Label htmlFor="se">Email</Label>
                  <Input id="se" name="email" type="email" required className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="sp">Password</Label>
                  <Input id="sp" name="password" type="password" required minLength={8} className="mt-1.5" />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-navy text-navy-foreground hover:bg-navy/90">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={signUp} className="space-y-4">
                <div>
                  <Label htmlFor="ue">Email</Label>
                  <Input id="ue" name="email" type="email" required className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="up">Password (8+ chars)</Label>
                  <Input id="up" name="password" type="password" required minLength={8} className="mt-1.5" />
                </div>
                <Button type="submit" disabled={loading} className="w-full gradient-gold border-0 text-gold-foreground hover:opacity-90">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Only the first registered user automatically becomes admin. After that, ask an existing admin to grant access.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-navy">← Back to site</Link>
        </p>
      </div>
    </section>
  );
}
