import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { testimonialsQuery } from "@/lib/queries";
import { QuoteCTA } from "@/components/site/QuoteCTA";

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    meta: [
      { title: "Client Testimonials — GiftSphere" },
      { name: "description", content: "Stories from HR, procurement and leadership teams across India who trust GiftSphere with their corporate gifting." },
      { property: "og:title", content: "Testimonials — GiftSphere" },
      { property: "og:url", content: "/testimonials" },
    ],
    links: [{ rel: "canonical", href: "/testimonials" }],
  }),
  component: TestimonialsPage,
});

function TestimonialsPage() {
  const { data } = useSuspenseQuery(testimonialsQuery);
  return (
    <>
      <section className="bg-navy text-ivory">
        <div className="container-page py-16">
          <span className="eyebrow">Testimonials</span>
          <h1 className="mt-3 font-display text-4xl md:text-5xl">Stories from teams we serve.</h1>
          <p className="mt-6 max-w-3xl text-lg text-ivory/80">From HR and procurement to leadership and operations, these stories show how GiftSphere helps teams build memorable gifting programs that drive engagement, simplify logistics, and strengthen relationships.</p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-ivory/12 bg-slate-950/80 p-6">
              <h2 className="font-medium text-lg text-ivory">HR teams</h2>
              <p className="mt-3 text-sm text-ivory/70">Trusted for onboarding kits, wellness gifts and employee recognition programs that feel premium yet turnkey.</p>
            </div>
            <div className="rounded-3xl border border-ivory/12 bg-slate-950/80 p-6">
              <h2 className="font-medium text-lg text-ivory">Procurement teams</h2>
              <p className="mt-3 text-sm text-ivory/70">Rated for reliability, transparent pricing and scalable fulfilment across offices and remote teams.</p>
            </div>
            <div className="rounded-3xl border border-ivory/12 bg-slate-950/80 p-6">
              <h2 className="font-medium text-lg text-ivory">Leadership teams</h2>
              <p className="mt-3 text-sm text-ivory/70">Delighted leaders use our gifting programs to reinforce culture, client relationships and high-performance recognition.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page grid gap-6 md:grid-cols-2">
          {data.map((t) => (
            <figure key={t.id} className="rounded-2xl border border-border bg-card p-8 shadow-soft">
              <div className="flex gap-0.5 text-gold">
                {Array.from({ length: t.rating }).map((_, i) => <Star key={i} fill="currentColor" className="h-4 w-4" />)}
              </div>
              <blockquote className="mt-5 font-display text-xl leading-snug text-foreground/90">"{t.quote}"</blockquote>
              <figcaption className="mt-6 border-t border-border pt-4">
                <div className="font-medium">{t.reviewer_name}</div>
                <div className="text-sm text-muted-foreground">{t.designation} · {t.company}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <QuoteCTA />
    </>
  );
}
