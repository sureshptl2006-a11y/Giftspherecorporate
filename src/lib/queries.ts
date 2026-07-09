import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("display_order");
    if (error) throw error;
    return data ?? [];
  },
});

export const categoryBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["category", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const productsByCategoryQuery = (categoryId: string | undefined) =>
  queryOptions({
    queryKey: ["products", "by-category", categoryId],
    enabled: !!categoryId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category_id", categoryId!)
        .eq("active", true)
        .order("display_order");
      if (error) throw error;
      return data ?? [];
    },
  });

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("active", true)
      .order("display_order");
    if (error) throw error;
    return data ?? [];
  },
});

export const homepageFeaturedProductsQuery = queryOptions({
  queryKey: ["products", "homepage-featured"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("active", true)
      .order("display_order");
    if (error) {
      if ((error as any).code === "42703" || /Could not find the 'featured_homepage' column/.test(String(error.message))) {
        console.warn("Supabase schema cache missing featured_homepage; homepage featured products disabled.");
        return [];
      }
      throw error;
    }
    return (data ?? []).filter((product: any) => product.featured_homepage === true);
  },
});

export const productBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories(*)")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const testimonialsQuery = queryOptions({
  queryKey: ["testimonials"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("active", true)
      .order("display_order");
    if (error) throw error;
    return data ?? [];
  },
});

export const blogPostsQuery = queryOptions({
  queryKey: ["blog-posts"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export const blogPostBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

// Category-image fallback map (we ship local hero/category imagery)
import welcome from "@/assets/cat-welcome.jpg";
import festival from "@/assets/cat-festival.jpg";
import wellness from "@/assets/cat-wellness.jpg";
import event from "@/assets/cat-event.jpg";
import executive from "@/assets/cat-executive.jpg";

export const CATEGORY_IMAGE: Record<string, string> = {
  "welcome-kits": welcome,
  festival,
  wellness,
  events: event,
  executive,
};
