import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Sparkles, Gift, ArrowRight, Loader2 } from "lucide-react";
import { recommendGifts, type Recommendation } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/recommender")({
  head: () => ({
    meta: [
      { title: "AI Gift Recommender — GiftSphere" },
      { name: "description", content: "Get an AI-curated corporate gifting package for your industry, occasion and budget — in seconds." },
      { property: "og:title", content: "AI Gift Recommender" },
      { property: "og:url", content: "/recommender" },
    ],
    links: [{ rel: "canonical", href: "/recommender" }],
  }),
  component: RecommenderPage,
});

const INDUSTRIES = ["IT & Software", "Hospitals & Healthcare", "Pharmaceuticals", "Banks & Financial Services", "Insurance", "Education", "Startups", "Manufacturing"];
const OCCASIONS = ["Employee onboarding", "Work anniversary", "Diwali / festival", "New Year", "Client gifting", "Conference / event", "Leadership recognition", "Wellness program"];

function RecommenderPage() {
  const recommend = useServerFn(recommendGifts);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Recommendation | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      industry: String(fd.get("industry") || ""),
      occasion: String(fd.get("occasion") || ""),
      employees: Number(fd.get("employees") || 0),
      budget: Number(fd.get("budget") || 0),
      notes: String(fd.get("notes") || ""),
    };
    if (!data.industry || !data.occasion || !data.employees || !data.budget) {
      toast.error("Please fill all required fields"); return;
    }
    setLoading(true); setResult(null);
    try {
      const res = await recommend(data);
      if ("error" in res) {
        if (res.error === "rate_limited") toast.error("Too many requests. Try again in a minute.");
        else if (res.error === "credits_exhausted") toast.error("AI credits exhausted. Please contact admin.");
        else toast.error("Couldn't generate recommendation — try again.");
      } else {
        setResult(res.recommendation);
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="bg-navy text-ivory">
        <div className="container-page py-16">
          <span className="eyebrow inline-flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> AI-powered</span>
          <h1 className="mt-3 font-display text-4xl md:text-5xl">Get a curated gifting package in seconds.</h1>
          <p className="mt-3 max-w-2xl text-ivory/75">
            Our AI recommender suggests a tailored package based on your industry, occasion and budget.
            Use it as a starting point — then refine with our team.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page grid gap-10 lg:grid-cols-5">
          <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-8 shadow-soft lg:col-span-2">
            <div>
              <Label>Industry *</Label>
              <Select name="industry" required>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Choose industry" /></SelectTrigger>
                <SelectContent>{INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Occasion *</Label>
              <Select name="occasion" required>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="What's the occasion?" /></SelectTrigger>
                <SelectContent>{OCCASIONS.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employees">Recipients *</Label>
                <Input id="employees" name="employees" type="number" min={1} defaultValue={100} required className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="budget">Budget/person (₹) *</Label>
                <Input id="budget" name="budget" type="number" min={100} defaultValue={1500} required className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Anything specific?</Label>
              <Textarea id="notes" name="notes" maxLength={500} placeholder="Eco-friendly, photographable, includes hamper..." className="mt-1.5" />
            </div>
            <Button type="submit" disabled={loading} className="w-full gradient-gold border-0 text-gold-foreground shadow-gold hover:opacity-90">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…</> : <><Sparkles className="mr-2 h-4 w-4" /> Generate Recommendation</>}
            </Button>
          </form>

          <div className="lg:col-span-3">
            {!result && !loading && (
              <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-ivory/30 p-10 text-center">
                <Gift className="h-12 w-12 text-gold" strokeWidth={1.4} />
                <h3 className="mt-4 font-display text-xl">Your package will appear here</h3>
                <p className="mt-2 text-sm text-muted-foreground">Fill the brief and we'll generate a curated recommendation.</p>
              </div>
            )}
            {loading && (
              <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-2xl border border-border bg-card p-10">
                <Loader2 className="h-10 w-10 animate-spin text-gold" />
                <p className="mt-4 text-sm text-muted-foreground">Curating your package…</p>
              </div>
            )}
            {result && (
              <div className="rounded-2xl border border-border bg-card p-8 shadow-elegant">
                <span className="eyebrow">Recommended package</span>
                <h2 className="mt-3 font-display text-3xl">{result.package_name}</h2>
                <p className="mt-1 text-muted-foreground">{result.tagline}</p>
                <p className="mt-4 inline-flex items-baseline gap-2 rounded-lg gradient-gold px-4 py-2 text-gold-foreground">
                  <span className="text-xs uppercase tracking-wider">Estimated total</span>
                  <span className="font-display text-2xl">₹{result.estimated_total?.toLocaleString("en-IN")}</span>
                </p>
                <h3 className="mt-6 font-display text-lg">Curated items</h3>
                <ul className="mt-3 space-y-3">
                  {result.items?.map((it, i) => (
                    <li key={i} className="rounded-lg border border-border bg-ivory/30 p-4">
                      <div className="font-medium">{it.name}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{it.why}</div>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-border p-4">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Branding</div>
                    <div className="mt-1 text-sm">{result.branding}</div>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Notes</div>
                    <div className="mt-1 text-sm">{result.notes}</div>
                  </div>
                </div>
                <Button asChild className="mt-6 bg-navy text-navy-foreground hover:bg-navy/90">
                  <a href="/quote">Refine with our team <ArrowRight className="ml-2 h-4 w-4" /></a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
