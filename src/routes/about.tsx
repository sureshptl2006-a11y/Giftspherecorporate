import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Compass, Heart, Sparkles, Target, Truck, Users, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuoteCTA } from "@/components/site/QuoteCTA";
import { WHY_US } from "@/lib/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About GiftSphere — India's Premium Corporate Gifting Partner" },
      { name: "description", content: "Our story, mission and the team behind India's most trusted B2B gifting partner — serving 800+ companies with custom-branded gifts." },
      { property: "og:title", content: "About GiftSphere Corporate Solutions" },
      { property: "og:description", content: "Mission, vision and what makes us India's most trusted B2B gifting partner." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <section className="bg-navy text-ivory">
        <div className="container-page py-20 md:py-28">
          <span className="eyebrow">About us</span>
          <h1 className="mt-4 max-w-3xl font-display text-4xl md:text-5xl lg:text-6xl">
            Helping India's best companies <span className="text-gold">show appreciation, at scale.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-ivory/75">
            We started GiftSphere in 2017 with a simple belief — corporate gifting should feel personal,
            premium and effortlessly executed, no matter the headcount. Today, we partner with 800+ companies
            across IT, banking, healthcare, pharma, and manufacturing.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container-page grid gap-12 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-soft">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-gold">
              <Target className="h-6 w-6 text-gold-foreground" />
            </div>
            <h2 className="mt-5 font-display text-2xl">Our Mission</h2>
            <p className="mt-3 text-muted-foreground">
              To make appreciation effortless. We give HR, procurement and leadership teams a single
              partner for every gifting need — with the curation, branding and logistics handled end-to-end.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-8 shadow-soft">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-gold">
              <Compass className="h-6 w-6 text-gold-foreground" />
            </div>
            <h2 className="mt-5 font-display text-2xl">Our Vision</h2>
            <p className="mt-3 text-muted-foreground">
              To be the gifting partner of choice for every growing Indian company — and to redefine
              what "corporate gifting" can mean when it's done with craft, purpose and personalisation.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-ivory/40 py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Why choose us</span>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">Built for procurement and HR teams</h2>
            <span className="gold-divider mt-5 inline-block" />
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {WHY_US.map((w, i) => {
              const Icon = [Truck, Sparkles, Users, Award, Users, Heart][i % 6];
              return (
                <div key={w.title} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy">
                    <Icon className="h-5 w-5 text-gold" />
                  </div>
                  <h3 className="mt-4 font-display text-xl">{w.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{w.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-page grid items-center gap-10 md:grid-cols-2">
          <div>
            <span className="eyebrow">How we work</span>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">From brief to doorstep — in four steps</h2>
          </div>
          <ol className="space-y-5">
            {[
              "Share your brief: occasion, employees, budget, timelines.",
              "We curate 2–3 proposals with branded mockups and indicative pricing.",
              "Approve, place PO, and we handle procurement, kitting and QC.",
              "Pan-India dispatch with tracking, plus delivery report on completion.",
            ].map((step, i) => (
              <li key={i} className="flex gap-4 rounded-xl border border-border bg-card p-5 shadow-soft">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full gradient-gold font-display text-gold-foreground">
                  {i + 1}
                </span>
                <p className="text-foreground/85">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <QuoteCTA />
    </>
  );
}
