import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Activity, Brain, Smile, Users, TrendingUp } from "lucide-react";
import wellnessImg from "@/assets/cat-wellness.jpg";
import { Button } from "@/components/ui/button";
import { QuoteCTA } from "@/components/site/QuoteCTA";

export const Route = createFileRoute("/wellness")({
  head: () => ({
    meta: [
      { title: "Corporate Wellness Gifting — GiftSphere" },
      { name: "description", content: "Wellness gifting programs that improve employee satisfaction, reduce fatigue, support posture and lift retention. Ergonomic kits delivered at scale." },
      { property: "og:title", content: "Corporate Wellness Gifting Programs" },
      { property: "og:url", content: "/wellness" },
    ],
    links: [{ rel: "canonical", href: "/wellness" }],
  }),
  component: WellnessPage,
});

const BENEFITS = [
  { icon: Smile, title: "Improved satisfaction", desc: "Tangible care signals lift engagement scores within one quarter." },
  { icon: Activity, title: "Reduced workplace fatigue", desc: "Ergonomic cushions and supports measurably reduce reported discomfort." },
  { icon: Brain, title: "Better focus & posture", desc: "Lumbar, neck and eye-care kits keep teams comfortable through long days." },
  { icon: Heart, title: "Mental wellness", desc: "Mindfulness journals, aromatherapy and stress-relief kits as part of broader programs." },
  { icon: Users, title: "Stronger retention", desc: "Wellness gifting at milestones correlates with significantly better first-year retention." },
  { icon: TrendingUp, title: "Visible ROI", desc: "Track engagement, NPS and absenteeism — wellness gifting moves all three." },
];

function WellnessPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-navy text-ivory">
        <img src={wellnessImg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" aria-hidden />
        <div className="container-page relative py-20 md:py-24">
          <span className="eyebrow">Wellness solutions</span>
          <h1 className="mt-4 max-w-3xl font-display text-4xl md:text-5xl">
            Corporate wellness gifting that <span className="text-gold">actually moves the needle.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-ivory/80">
            From ergonomic seat cushions and lumbar supports to mindfulness kits and eye-care boxes —
            we help HR teams design wellness programs employees genuinely use.
          </p>
          <Button asChild size="lg" className="mt-7 gradient-gold border-0 text-gold-foreground hover:opacity-90">
            <Link to="/quote">Build a wellness program</Link>
          </Button>
        </div>
      </section>

      <section className="py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Why wellness gifting works</span>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">Six measurable outcomes</h2>
            <span className="gold-divider mt-5 inline-block" />
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b) => (
              <div key={b.title} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-gold">
                  <b.icon className="h-5 w-5 text-gold-foreground" />
                </div>
                <h3 className="mt-4 font-display text-xl">{b.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ivory/40 py-20">
        <div className="container-page text-center">
          <h2 className="font-display text-3xl md:text-4xl">Featured wellness products</h2>
          <span className="gold-divider mt-4 inline-block" />
          <div className="mt-10">
            <Button asChild size="lg" className="bg-navy text-navy-foreground hover:bg-navy/90">
              <Link to="/collections/$slug" params={{ slug: "wellness" }}>Browse Wellness Collection</Link>
            </Button>
          </div>
        </div>
      </section>

      <QuoteCTA />
    </>
  );
}
