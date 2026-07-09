import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Calculator, ArrowRight, IndianRupee, Users, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/calculator")({
  head: () => ({
    meta: [
      { title: "Bulk Order Calculator — GiftSphere" },
      { name: "description", content: "Estimate your corporate gifting budget. Enter employees and per-employee budget — get recommended packages and total project cost." },
      { property: "og:title", content: "Bulk Gifting Calculator" },
      { property: "og:url", content: "/calculator" },
    ],
    links: [{ rel: "canonical", href: "/calculator" }],
  }),
  component: CalculatorPage,
});

function CalculatorPage() {
  const [employees, setEmployees] = useState(250);
  const [budget, setBudget] = useState(1500);

  const total = employees * budget;
  const tier =
    budget < 700 ? "Essentials" : budget < 1500 ? "Premium" : budget < 3000 ? "Executive" : "Luxury";
  const recommendations = REC[tier];

  return (
    <>
      <section className="bg-navy text-ivory">
        <div className="container-page py-16">
          <span className="eyebrow">Bulk calculator</span>
          <h1 className="mt-3 font-display text-4xl md:text-5xl">Estimate your gifting budget in seconds.</h1>
          <p className="mt-3 max-w-xl text-ivory/75">Move the inputs to see total project cost and a recommended package tier.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page grid gap-10 lg:grid-cols-5">
          {/* Inputs */}
          <div className="rounded-2xl border border-border bg-card p-8 shadow-soft lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-gold">
                <Calculator className="h-5 w-5 text-gold-foreground" />
              </div>
              <h2 className="font-display text-2xl">Your project</h2>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <Label className="flex items-center gap-2"><Users className="h-4 w-4 text-gold" /> Number of employees</Label>
                <Input
                  type="number" min={1} value={employees}
                  onChange={(e) => setEmployees(Math.max(1, Number(e.target.value) || 0))}
                  className="mt-2"
                />
                <input
                  type="range" min={10} max={5000} step={10} value={employees}
                  onChange={(e) => setEmployees(Number(e.target.value))}
                  className="mt-3 w-full accent-[var(--gold)]"
                />
              </div>
              <div>
                <Label className="flex items-center gap-2"><IndianRupee className="h-4 w-4 text-gold" /> Budget per employee (₹)</Label>
                <Input
                  type="number" min={1} value={budget}
                  onChange={(e) => setBudget(Math.max(1, Number(e.target.value) || 0))}
                  className="mt-2"
                />
                <input
                  type="range" min={200} max={5000} step={50} value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="mt-3 w-full accent-[var(--gold)]"
                />
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6 lg:col-span-3">
            <div className="gradient-navy rounded-2xl p-8 text-ivory shadow-elegant">
              <p className="text-xs uppercase tracking-[0.18em] text-gold">Total project cost</p>
              <p className="mt-2 font-display text-5xl md:text-6xl">₹{total.toLocaleString("en-IN")}</p>
              <p className="mt-3 text-ivory/70">
                For <strong className="text-ivory">{employees.toLocaleString("en-IN")}</strong> employees at
                <strong className="text-ivory"> ₹{budget.toLocaleString("en-IN")}</strong> per employee.
              </p>
              <p className="mt-1 text-xs text-ivory/55">Excludes GST and dispatch. Volume discounts unlocked above 500 units.</p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8 shadow-soft">
              <div className="flex items-center gap-3">
                <Gift className="h-5 w-5 text-gold" />
                <h3 className="font-display text-2xl">Recommended tier: <span className="text-gold">{tier}</span></h3>
              </div>
              <ul className="mt-4 grid gap-2 text-sm text-foreground/85 sm:grid-cols-2">
                {recommendations.map((r) => (
                  <li key={r} className="flex items-start gap-2">
                    <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-gold" /> {r}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-6 gradient-gold border-0 text-gold-foreground hover:opacity-90">
                <Link to="/quote" search={{ employees, budget }}>
                  Get a custom proposal <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const REC: Record<string, string[]> = {
  Essentials: ["Branded ceramic mug", "Notebook + metal pen combo", "Cotton tote bag", "Personalised welcome card"],
  Premium: ["Insulated steel bottle", "Bound leather diary", "Engraved metal pen", "Custom gift box packaging"],
  Executive: ["Luxury leather diary", "Premium pen set in wooden case", "Curated dry fruit hamper", "Branded magnetic gift box"],
  Luxury: ["Full executive gift hamper", "Premium leather portfolio", "Luxury pen set with personalisation", "Gourmet basket with handwritten note"],
};
