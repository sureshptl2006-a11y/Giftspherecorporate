import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { blogPostsQuery } from "@/lib/queries";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Insights & Guides — GiftSphere Blog" },
      { name: "description", content: "Corporate gifting trends, welcome kit ideas, wellness gifting and retention strategies for HR and procurement leaders." },
      { property: "og:title", content: "GiftSphere Insights & Guides" },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const { data: posts } = useSuspenseQuery(blogPostsQuery);
  return (
    <>
      <section className="bg-navy text-ivory">
        <div className="container-page py-16">
          <span className="eyebrow">Insights</span>
          <h1 className="mt-3 font-display text-4xl md:text-5xl">Guides for HR & procurement leaders.</h1>
        </div>
      </section>
      <section className="py-16">
        <div className="container-page grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link
              key={p.id}
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="h-44 bg-gradient-to-br from-navy to-navy/70" />
              <div className="flex flex-1 flex-col p-6">
                <h2 className="font-display text-xl">{p.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>
                <span className="mt-4 inline-flex items-center text-sm font-medium text-navy">
                  Read article <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
