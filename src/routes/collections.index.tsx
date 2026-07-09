import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { categoriesQuery, productsQuery, CATEGORY_IMAGE } from "@/lib/queries";
import { QuoteCTA } from "@/components/site/QuoteCTA";

export const Route = createFileRoute("/collections/")({
  head: () => ({
    meta: [
      { title: "Collections — GiftSphere Corporate Gifting" },
      { name: "description", content: "Browse all corporate gifting collections — welcome kits, festival hampers, wellness gifts, event merchandise and executive gifts." },
      { property: "og:title", content: "All Collections — GiftSphere" },
      { property: "og:description", content: "Browse welcome kits, festival, wellness, event and executive gifting collections." },
      { property: "og:url", content: "/collections" },
    ],
    links: [{ rel: "canonical", href: "/collections" }],
  }),
  component: CollectionsIndex,
});

function CollectionsIndex() {
  const { data: cats } = useSuspenseQuery(categoriesQuery);
  const { data: products } = useSuspenseQuery(productsQuery);
  return (
    <>
      <section className="bg-navy text-ivory">
        <div className="container-page py-16 md:py-20">
          <span className="eyebrow">Collections</span>
          <h1 className="mt-3 font-display text-4xl md:text-5xl">Explore our gifting collections</h1>
          <p className="mt-4 max-w-2xl text-ivory/70">
            Five curated collections engineered for the moments that matter — every item can be custom branded.
          </p>
        </div>
      </section>
      <section className="py-20">
        <div className="container-page grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cats.map((c) => (
            <Link
              key={c.id}
              to="/collections/$slug"
              params={{ slug: c.slug }}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="aspect-[4/3] overflow-hidden bg-white">
                <img
                  src={(c as any).image_url || CATEGORY_IMAGE[c.slug] || CATEGORY_IMAGE["welcome-kits"]}
                  alt={c.name}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h2 className="font-display text-2xl">{c.name}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{c.description}</p>
                <span className="mt-4 inline-flex items-center text-sm font-medium text-navy">
                  View collection <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="pb-20 pt-10">
        <div className="container-page">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow">All products</span>
              <h2 className="mt-3 font-display text-3xl md:text-4xl">Browse our full product catalogue</h2>
            </div>
            <p className="text-sm text-muted-foreground md:text-right">
              {products.length} items across all active categories.
            </p>
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
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    <span>{(p as any).category?.name ?? "Uncategorized"}</span>
                    <span className="text-navy font-medium">MOQ {p.moq}</span>
                  </div>
                  <h3 className="mt-3 font-display text-lg leading-tight">{p.name}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                  <div className="mt-4 flex items-center justify-between text-sm font-medium text-navy">
                    <span>View details</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <QuoteCTA />
    </>
  );
}
