import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

const BASE_URL = "";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const staticPaths = ["/", "/about", "/collections", "/wellness", "/industries", "/calculator", "/recommender", "/quote", "/blog", "/testimonials", "/contact"];

        const [cats, prods, posts] = await Promise.all([
          supabase.from("categories").select("slug"),
          supabase.from("products").select("slug").eq("active", true),
          supabase.from("blog_posts").select("slug").eq("published", true),
        ]);

        const urls = [
          ...staticPaths.map((p) => ({ loc: p, priority: p === "/" ? "1.0" : "0.8" })),
          ...(cats.data ?? []).map((c) => ({ loc: `/collections/${c.slug}`, priority: "0.7" })),
          ...(prods.data ?? []).map((p) => ({ loc: `/product/${p.slug}`, priority: "0.6" })),
          ...(posts.data ?? []).map((p) => ({ loc: `/blog/${p.slug}`, priority: "0.6" })),
        ];

        const xml =
          `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
          urls.map((u) => `  <url><loc>${BASE_URL}${u.loc}</loc><changefreq>weekly</changefreq><priority>${u.priority}</priority></url>`).join("\n") +
          `\n</urlset>`;

        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
