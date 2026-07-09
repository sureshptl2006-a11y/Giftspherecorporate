import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Package } from "lucide-react";
import {
  categoryBySlugQuery,
  productsByCategoryQuery,
  CATEGORY_IMAGE,
} from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { QuoteCTA } from "@/components/site/QuoteCTA";
import { priceRange, formatINR } from "@/lib/pricing";

export const Route = createFileRoute("/collections/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${titleCase(params.slug)} — GiftSphere Collections` },
      { name: "description", content: `Premium corporate ${titleCase(params.slug).toLowerCase()} options — custom-branded, MOQ-friendly, delivered pan-India.` },
      { property: "og:title", content: `${titleCase(params.slug)} — GiftSphere` },
      { property: "og:url", content: `/collections/${params.slug}` },
    ],
    links: [{ rel: "canonical", href: `/collections/${params.slug}` }],
  }),
  component: CategoryPage,
});

function titleCase(s: string) {
  return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data: category } = useSuspenseQuery(categoryBySlugQuery(slug));
  if (!category) throw notFound();
  const { data: products } = useSuspenseQuery(productsByCategoryQuery(category.id));

  return (
    <>
      <section className="relative overflow-hidden bg-navy text-ivory">
        {/* Right-side full-height image for md+ screens */}
        <div className="absolute inset-y-0 right-0 w-2/3 hidden md:block">
          <img
            src={category.banner_image_url || category.image_url || CATEGORY_IMAGE[slug]}
            alt={category.name}
            className="h-full w-full object-cover object-center"
            style={{
              WebkitMaskImage:
                'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.08) 12%, rgba(0,0,0,0.35) 20%, rgba(0,0,0,1) 25%, rgba(0,0,0,1) 100%)',
              maskImage:
                'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.08) 12%, rgba(0,0,0,0.35) 20%, rgba(0,0,0,1) 25%, rgba(0,0,0,1) 100%)',
              maskSize: '100% 100%',
              WebkitMaskSize: '100% 100%',
            }}
          />
          {/* Option A: mask-only blend retained (overlays removed) */}
        </div>

        <div className="container-page relative py-16 md:py-24">
          <div className="md:grid md:grid-cols-2 md:items-center">
            <div className="md:pr-8 lg:pr-12">
              <Link to="/collections" className="text-xs uppercase tracking-[0.18em] text-gold hover:opacity-80">
                ← All collections
              </Link>
              <h1 className="mt-4 font-display text-4xl md:text-5xl">{category.name}</h1>
              <p className="mt-4 max-w-2xl text-ivory/80">{category.description}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild className="gradient-gold border-0 text-gold-foreground hover:opacity-90">
                  <Link to="/quote">Request quote on this collection</Link>
                </Button>
                <Button asChild variant="outline" className="border-ivory/30 bg-transparent text-ivory hover:bg-ivory/10 hover:text-ivory">
                  <Link to="/calculator">Estimate cost</Link>
                </Button>
              </div>
            </div>

            {/* Mobile/tablet: show image below text so layout stacks naturally */}
            <div className="mt-8 md:mt-0">
              <img
                src={category.banner_image_url || category.image_url || CATEGORY_IMAGE[slug]}
                alt={category.name}
                className="w-full h-auto object-cover object-center rounded-none md:hidden"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container-page">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl md:text-3xl">{products.length} products in this collection</h2>
            <p className="hidden text-sm text-muted-foreground md:block">Mix & match — we'll bundle, brand and dispatch.</p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <Link
                key={p.id}
                to="/product/$slug"
                params={{ slug: p.slug }}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant"
              >
                <div className="flex aspect-square items-center justify-center overflow-hidden bg-white">
                  {(() => {
                    const main = ((p as any).image_urls?.[0]) || p.image_url;
                    return main ? (
                      <img src={main} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110" />
                    ) : (
                      <Package className="h-16 w-16 text-navy/30 transition-transform group-hover:scale-110" strokeWidth={1.2} />
                    );
                  })()}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-lg leading-tight">{p.name}</h3>
                  <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
                  {(() => {
                    const r = priceRange(p as any);
                    return (
                      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                        <span className="text-xs text-muted-foreground">
                          MOQ {p.moq}
                          {r.low != null && r.high != null && (
                            <> • {formatINR(r.low)}–{formatINR(r.high)}</>
                          )}
                        </span>
                        <span className="inline-flex items-center text-sm font-medium text-navy">
                          Details <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <QuoteCTA compact />
    </>
  );
}
