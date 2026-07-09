import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { ChevronLeft, Minus, Plus, Upload, Package } from "lucide-react";
import { productBySlugQuery, CATEGORY_IMAGE } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { unitPrice, totalPrice, formatINR, priceRange } from "@/lib/pricing";
import { ProductGallery } from "@/components/site/ProductGallery";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${titleCase(params.slug)} — GiftSphere Corporate Gifts` },
      { name: "description", content: `Get a quote on ${titleCase(params.slug)} — branded for your company, delivered in bulk.` },
      { property: "og:url", content: `/product/${params.slug}` },
    ],
    links: [{ rel: "canonical", href: `/product/${params.slug}` }],
  }),
  component: ProductPage,
});

function titleCase(s: string) {
  return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: product } = useSuspenseQuery(productBySlugQuery(slug));
  if (!product) throw notFound();

  const [qty, setQty] = useState(product.moq);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setLogoUrl(reader.result as string);
    reader.readAsDataURL(f);
  }

  const catSlug = (product.category as any)?.slug ?? "welcome-kits";

  return (
    <>
      <section className="border-b border-border bg-ivory/30">
        <div className="container-page py-6 text-xs">
          <Link to="/collections" className="text-muted-foreground hover:text-navy">Collections</Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <Link to="/collections/$slug" params={{ slug: catSlug }} className="text-muted-foreground hover:text-navy">
            {(product.category as any)?.name}
          </Link>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-page grid gap-12 md:grid-cols-2">
          {/* Mockup panel */}
          <div>
            {(() => {
              const gallery: string[] = [
                ...((product as any).image_urls ?? []),
                ...(product.image_url ? [product.image_url] : []),
              ].filter((v, i, a) => v && a.indexOf(v) === i);
              const finalImages = gallery.length ? gallery : [CATEGORY_IMAGE[catSlug]];
              return (
                <div className="relative">
                  <ProductGallery images={finalImages} alt={product.name} />
                  {logoUrl && (
                    <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-[60%] rounded-md bg-white/90 px-4 py-2 shadow-elegant">
                      <img src={logoUrl} alt="Your logo" className="max-h-16 max-w-[140px] object-contain" />
                    </div>
                  )}
                </div>
              );
            })()}
            <p className="mt-3 text-center text-xs text-muted-foreground">
              {logoUrl ? "Mockup preview — final placement confirmed in proof stage." : "Hover image to zoom. Upload your logo to preview branding."}
            </p>
          </div>

          {/* Info panel */}
          <div>
            <Link to="/collections/$slug" params={{ slug: catSlug }} className="inline-flex items-center text-xs uppercase tracking-[0.18em] text-gold">
              <ChevronLeft className="h-3 w-3" /> Back to {(product.category as any)?.name}
            </Link>
            <h1 className="mt-3 font-display text-3xl md:text-4xl">{product.name}</h1>
            <p className="mt-4 text-foreground/80">{product.description}</p>

            {(() => {
              const range = priceRange(product as any);
              const live = unitPrice(product as any, qty);
              const lineTotal = totalPrice(product as any, qty);
              return (
                <>
                  <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
                    <div className="rounded-lg border border-border bg-card p-4">
                      <dt className="text-xs uppercase tracking-wider text-muted-foreground">MOQ</dt>
                      <dd className="mt-1 font-display text-2xl">{product.moq} <span className="text-sm font-sans">units</span></dd>
                    </div>
                    <div className="rounded-lg border border-gold/40 bg-gold/5 p-4">
                      <dt className="text-xs uppercase tracking-wider text-muted-foreground">Price range / unit</dt>
                      <dd className="mt-1 font-display text-2xl">
                        {formatINR(range.low)} <span className="text-sm font-sans text-muted-foreground">– {formatINR(range.high)}</span>
                      </dd>
                      <p className="mt-1 text-[11px] text-muted-foreground">Lower price unlocks at bulk volume.</p>
                    </div>
                  </dl>

                  <div className="mt-6">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Branding options</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(product.branding_options ?? []).map((b) => (
                        <span key={b} className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium text-navy">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Your logo preview</Label>
                    <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
                    <Button variant="outline" onClick={() => fileRef.current?.click()} className="mt-2 border-dashed">
                      <Upload className="mr-2 h-4 w-4" /> {logoUrl ? "Replace logo" : "Upload logo"}
                    </Button>
                  </div>

                  <div className="mt-6">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Quantity</Label>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <div className="inline-flex items-center rounded-lg border border-border">
                        <button onClick={() => setQty((q) => Math.max(1, q - 25))} className="px-3 py-2"><Minus className="h-4 w-4" /></button>
                        <Input
                          type="number"
                          value={qty}
                          min={1}
                          onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 0))}
                          className="w-24 border-x border-y-0 text-center"
                        />
                        <button onClick={() => setQty((q) => q + 25)} className="px-3 py-2"><Plus className="h-4 w-4" /></button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[1, product.moq, (product as any).bulk_quantity ?? 100, ((product as any).bulk_quantity ?? 100) * 5].map((n, i) => (
                          <button key={i} onClick={() => setQty(n)} className="rounded-full border border-border px-3 py-1 text-xs hover:border-gold hover:text-navy">
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 rounded-lg border border-border bg-card p-4">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs uppercase tracking-wider text-muted-foreground">Your price</span>
                        <span className="font-display text-2xl text-navy">{formatINR(live)}<span className="text-sm font-sans text-muted-foreground">/unit</span></span>
                      </div>
                      <div className="mt-1 flex items-baseline justify-between text-sm">
                        <span className="text-muted-foreground">Estimated total for {qty.toLocaleString("en-IN")} units</span>
                        <span className="font-semibold text-navy">{formatINR(lineTotal)}</span>
                      </div>
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        Indicative — excludes GST &amp; dispatch. Final pricing confirmed in your quote.
                      </p>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      MOQ {product.moq} • bulk pricing from {(product as any).bulk_quantity ?? 100}+ units.
                    </p>
                  </div>
                </>
              );
            })()}

            <div className="mt-8 flex gap-3">
              <Button asChild size="lg" className="gradient-gold border-0 text-gold-foreground shadow-gold hover:opacity-90">
                <Link to="/quote" search={{ product: product.name, qty }}>Request Quote</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/collections/$slug" params={{ slug: catSlug }}><Package className="mr-2 h-4 w-4" /> More like this</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
