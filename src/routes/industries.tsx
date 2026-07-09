import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Code2, Stethoscope, Pill, Landmark, ShieldCheck,
  GraduationCap, Rocket, Factory,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { INDUSTRIES } from "@/lib/site";
import { QuoteCTA } from "@/components/site/QuoteCTA";

export const Route = createFileRoute("/industries")({
  head: () => ({
    meta: [
      { title: "Industries We Serve — GiftSphere" },
      { name: "description", content: "Corporate gifting tailored for IT, healthcare, banking, pharma, insurance, education, startups and manufacturing." },
      { property: "og:title", content: "Industries We Serve — GiftSphere" },
      { property: "og:url", content: "/industries" },
    ],
    links: [{ rel: "canonical", href: "/industries" }],
  }),
  component: IndustriesPage,
});

const ICONS: Record<string, any> = {
  Code2, Stethoscope, Pill, Landmark, ShieldCheck, GraduationCap, Rocket, Factory,
};

function IndustriesPage() {
  return (
    <>
      <section className="bg-navy text-ivory">
        <div className="container-page py-20">
          <span className="eyebrow">Industries</span>
          <h1 className="mt-3 font-display text-4xl md:text-5xl">Trusted across every sector</h1>
          <p className="mt-4 max-w-2xl text-ivory/75">
            From 10-person startups to 50,000-strong enterprises — gifting programs designed for the way your industry actually works.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container-page grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {INDUSTRIES.map((i) => {
            const Icon = ICONS[i.icon];
            return (
              <div key={i.name} className="rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy">
                  <Icon className="h-6 w-6 text-gold" />
                </div>
                <h3 className="mt-5 font-display text-xl">{i.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{i.blurb}</p>
              </div>
            );
          })}
        </div>
      </section>

      <QuoteCTA />
    </>
  );
}
