import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { blogPostBySlugQuery } from "@/lib/queries";
import { QuoteCTA } from "@/components/site/QuoteCTA";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${titleCase(params.slug)} — GiftSphere Insights` },
      { name: "description", content: `Read about ${titleCase(params.slug)} — corporate gifting insights from GiftSphere.` },
      { property: "og:title", content: titleCase(params.slug) },
      { property: "og:type", content: "article" },
      { property: "og:url", content: `/blog/${params.slug}` },
    ],
    links: [{ rel: "canonical", href: `/blog/${params.slug}` }],
  }),
  component: BlogPostPage,
});

function titleCase(s: string) { return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()); }

function BlogPostPage() {
  const { slug } = Route.useParams();
  const { data: post } = useSuspenseQuery(blogPostBySlugQuery(slug));
  if (!post) throw notFound();

  // Very lightweight markdown rendering (h2 + paragraphs + bold)
  const blocks = (post.content ?? "").split(/\n\n+/);

  return (
    <>
      <section className="bg-navy text-ivory">
        <div className="container-page py-16">
          <Link to="/blog" className="text-xs uppercase tracking-[0.18em] text-gold">← All insights</Link>
          <h1 className="mt-4 max-w-3xl font-display text-3xl md:text-5xl">{post.title}</h1>
          <p className="mt-4 max-w-2xl text-ivory/75">{post.excerpt}</p>
          <p className="mt-6 text-xs text-ivory/60">{post.author} · {new Date(post.created_at).toLocaleDateString("en-IN", { dateStyle: "long" })}</p>
        </div>
      </section>

      <article className="py-16">
        <div className="container-page mx-auto max-w-3xl space-y-5">
          {blocks.map((b, i) => {
            if (b.startsWith("## ")) return <h2 key={i} className="font-display text-2xl md:text-3xl pt-4">{b.slice(3)}</h2>;
            if (b.match(/^\d+\.\s/m)) {
              return (
                <ol key={i} className="list-decimal space-y-2 pl-5">
                  {b.split("\n").map((line, j) => <li key={j} dangerouslySetInnerHTML={{ __html: line.replace(/^\d+\.\s/, "").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />)}
                </ol>
              );
            }
            if (b.startsWith("- ")) {
              return (
                <ul key={i} className="list-disc space-y-2 pl-5">
                  {b.split("\n").map((line, j) => <li key={j} dangerouslySetInnerHTML={{ __html: line.replace(/^-\s/, "").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />)}
                </ul>
              );
            }
            return <p key={i} className="leading-relaxed text-foreground/85" dangerouslySetInnerHTML={{ __html: b.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />;
          })}
        </div>
      </article>

      <QuoteCTA />
    </>
  );
}
