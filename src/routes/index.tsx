import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Gift,
  Sparkles,
  Truck,
  Users,
} from "lucide-react";
import heroImg from "@/assets/hero-gifts.jpg";
import { Button } from "@/components/ui/button";
import { QuoteCTA } from "@/components/site/QuoteCTA";
import { categoriesQuery, homepageFeaturedProductsQuery, testimonialsQuery, CATEGORY_IMAGE } from "@/lib/queries";
import { WHY_US } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GiftSphere Corporate Solutions — Premium Corporate Gifting in India" },
      {
        name: "description",
        content:
          "Custom corporate gifting at scale — welcome kits, wellness, festival hampers and executive gifts. Pan-India delivery, dedicated account manager, 50+ MOQ.",
      },
      { property: "og:title", content: "GiftSphere — Premium Corporate Gifting Solutions" },
      { property: "og:description", content: "Welcome kits, wellness, festival, executive gifts at scale." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <CategoryGrid />
      <HomepageFeaturedProducts />
      <WhyChooseUs />
      <Stats />
      <TestimonialsStrip />
      <QuoteCTA />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy">
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-gold/20 blur-3xl" />
        <div className="absolute -bottom-20 right-0 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
      </div>
      <div className="container-page relative grid items-center gap-12 py-20 md:grid-cols-2 md:py-28 lg:py-32">
        <div className="fade-up text-ivory">
          <span className="eyebrow">For modern businesses</span>
          <h1 className="mt-4 font-display text-4xl leading-[1.05] md:text-5xl lg:text-6xl">
            Premium Corporate Gifting
            <span className="block text-gold">For Modern Businesses</span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-ivory/75 md:text-lg">
            Employee welcome kits, wellness gifts, festival hampers, and custom corporate
            merchandise — designed, branded and delivered across India by one trusted partner.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="gradient-gold border-0 text-gold-foreground shadow-gold hover:opacity-90">
              <Link to="/quote">Request Quote <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-ivory/25 bg-transparent text-ivory hover:bg-ivory/10 hover:text-ivory">
              <Link to="/collections">Browse Collections</Link>
            </Button>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-ivory/70">
            {["Pan-India delivery", "Custom branding", "Bulk pricing", "Dedicated manager"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-gold" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="fade-up relative">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-gold/30 to-transparent blur-2xl" />
          <img
            src={heroImg}
            alt="Curated premium corporate gift boxes and items"
            width={1600}
            height={1200}
            className="relative rounded-2xl shadow-elegant"
          />
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  const logos = ["Northwind", "Meridian Bank", "CityCare", "Lumen Studios", "Helix Pharma", "Arcadia Tech"];
  return (
    <section className="border-y border-border bg-ivory/40">
      <div className="container-page py-6">
        <p className="text-center text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Trusted by 800+ companies across India
        </p>
        <div className="mt-4 grid grid-cols-2 items-center gap-6 opacity-60 md:grid-cols-3 lg:grid-cols-6">
          {logos.map((l) => (
            <div key={l} className="text-center font-display text-xl text-foreground/60">{l}</div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryGrid() {
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  return (
    <section className="py-24">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Our collections</span>
          <h2 className="mt-3 font-display text-3xl md:text-4xl">Curated for every corporate occasion</h2>
          <p className="mt-3 text-muted-foreground">
            From day-one onboarding to executive client gifting — five core collections, infinitely customisable.
          </p>
          <span className="gold-divider mt-5 inline-block" />
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/collections/$slug"
              params={{ slug: c.slug }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={c.image_url || CATEGORY_IMAGE[c.slug] || CATEGORY_IMAGE["welcome-kits"]}
                  alt={c.name}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="font-display text-2xl">{c.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
                <span className="mt-4 inline-flex items-center text-sm font-medium text-navy">
                  Explore <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function HomepageFeaturedProducts() {
  const { data: featured } = useSuspenseQuery(homepageFeaturedProductsQuery);
  if (!featured.length) return null;

  return (
    <section className="bg-ivory/40 py-24">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Trending gifts</span>
          <h2 className="mt-3 font-display text-3xl md:text-4xl">Trending corporate gifts</h2>
          <p className="mt-3 text-muted-foreground">
            Handpicked corporate gifting products that are performing best on the site right now.
          </p>
          <span className="gold-divider mt-5 inline-block" />
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featured.map((p: any) => (
            <Link
              key={p.id}
              to="/product/$slug"
              params={{ slug: p.slug }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="aspect-[4/3] overflow-hidden bg-white">
                {(() => {
                  const main = (p.image_urls?.[0]) || p.image_url;
                  return main ? (
                    <img
                      src={main}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-navy/30">
                      <span className="text-4xl">🎁</span>
                    </div>
                  );
                })()}
              </div>
              <div className="flex flex-1 flex-col p-6">
                <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{p.category?.name ?? "Corporate gift"}</span>
                <h3 className="mt-3 font-display text-2xl leading-tight">{p.name}</h3>
                <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{p.description}</p>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm font-medium text-navy">
                  <span>MOQ {p.moq}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyChooseUs() {
  const icons = [Truck, Sparkles, Users, Award, Users, CheckCircle2];
  return (
    <section className="bg-ivory/40 py-24">
      <div className="container-page">
        <div className="grid items-start gap-12 md:grid-cols-2">
          <div>
            <span className="eyebrow">Why GiftSphere</span>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">
              The B2B gifting partner that scales with your team.
            </h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              From 50 employees to 50,000 — same dedicated team, same quality bar, same on-time delivery.
            </p>
            <Button asChild className="mt-6 bg-navy text-navy-foreground hover:bg-navy/90">
              <Link to="/about">Our story <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {WHY_US.map((it, i) => {
              const Icon = icons[i % icons.length];
              return (
                <div key={it.title} className="rounded-xl border border-border bg-card p-5 shadow-soft">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-gold">
                    <Icon className="h-5 w-5 text-gold-foreground" />
                  </div>
                  <h3 className="mt-4 font-display text-lg">{it.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{it.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const items = [
    { num: "800+", label: "Corporates served" },
    { num: "2.4M+", label: "Gifts delivered" },
    { num: "25,000+", label: "Pincodes covered" },
    { num: "98%", label: "On-time delivery" },
  ];
  return (
    <section className="bg-navy py-16 text-ivory">
      <div className="container-page grid grid-cols-2 gap-8 md:grid-cols-4">
        {items.map((s) => (
          <div key={s.label} className="text-center">
            <div className="font-display text-4xl text-gold md:text-5xl">{s.num}</div>
            <div className="mt-2 text-xs uppercase tracking-[0.18em] text-ivory/70">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TestimonialsStrip() {
  const { data } = useSuspenseQuery(testimonialsQuery);
  return (
    <section className="py-24">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Client love</span>
          <h2 className="mt-3 font-display text-3xl md:text-4xl">What our clients say</h2>
          <span className="gold-divider mt-5 inline-block" />
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {data.slice(0, 4).map((t) => (
            <figure key={t.id} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="flex gap-0.5 text-gold">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <blockquote className="mt-4 text-sm leading-relaxed text-foreground/85">"{t.quote}"</blockquote>
              <figcaption className="mt-5 border-t border-border pt-4">
                <div className="font-medium">{t.reviewer_name}</div>
                <div className="text-xs text-muted-foreground">{t.designation} · {t.company}</div>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/testimonials" className="text-sm font-medium text-navy hover:text-gold">
            Read all stories →
          </Link>
        </div>
      </div>
    </section>
  );
}
