import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  industry: z.string().min(2).max(80),
  occasion: z.string().min(2).max(80),
  budget: z.number().int().positive().max(1_000_000),
  employees: z.number().int().positive().max(500_000),
  notes: z.string().max(500).optional().default(""),
});

type ProductItem = {
  id: string;
  name: string;
  description: string | null;
  price_single: number | null;
  price_bulk: number | null;
  price_per_unit: number | null;
  moq: number;
  category: { slug: string; name: string } | null;
};

const recommendationSchema = z.object({
  package_name: z.string().min(1).max(100),
  tagline: z.string().min(1).max(240),
  items: z
    .array(z.object({ name: z.string().min(1).max(120), why: z.string().min(1).max(280) }))
    .min(1)
    .max(6),
  branding: z.string().min(1).max(400),
  estimated_total: z.number().nonnegative(),
  notes: z.string().min(1).max(500),
});

const occasionCategoryMap: Record<string, string> = {
  "Employee onboarding": "welcome-kits",
  "Work anniversary": "executive",
  "Diwali / festival": "festival",
  "New Year": "festival",
  "Client gifting": "executive",
  "Conference / event": "events",
  "Leadership recognition": "executive",
  "Wellness program": "wellness",
};

const brandingMap: Record<string, string> = {
  "Employee onboarding":
    "Choose premium welcome kits with personalized branding and an onboarding note for new team members.",
  "Work anniversary":
    "Deliver memorable gifts with subtle logo placement and a personalized appreciation card.",
  "Diwali / festival":
    "Use festive packaging with gold accents and branded greeting cards for a premium holiday feel.",
  "New Year":
    "Present gifts in elegant, branded packaging that feels celebratory and professional.",
  "Client gifting":
    "Pick executive-quality items with tasteful branding and a premium presentation box.",
  "Conference / event":
    "Bundle practical, branded conference swag that attendees can use immediately.",
  "Leadership recognition":
    "Select high-end gifts with luxe branding and a thoughtful recognition note.",
  "Wellness program":
    "Offer wellness-focused items in calm, branded packaging for a polished corporate look.",
};

function getPrice(product: ProductItem) {
  return product.price_per_unit ?? product.price_single ?? product.price_bulk ?? 0;
}

function formatReason(product: ProductItem, occasion: string) {
  const description = product.description?.trim();
  if (description) return `${description}`;
  if (product.category?.name)
    return `A strong ${product.category.name.toLowerCase()} choice with broad corporate appeal.`;
  return "A thoughtful corporate gifting option with strong appeal.";
}

function chooseItems(products: ProductItem[], budget: number) {
  if (!products.length) return [];
  const candidates = products
    .map((product) => ({
      product,
      price: getPrice(product),
      diff: Math.abs((getPrice(product) || 0) - budget),
    }))
    .filter(({ price }) => price > 0)
    .sort((a, b) => a.diff - b.diff);

  const selected: ProductItem[] = [];
  const usedCategories = new Set<string>();

  for (const candidate of candidates) {
    if (selected.length >= 6) break;
    if (selected.length < 4 || !usedCategories.has(candidate.product.category?.slug ?? "")) {
      selected.push(candidate.product);
      if (candidate.product.category?.slug) usedCategories.add(candidate.product.category.slug);
    }
  }

  if (selected.length >= 4) return selected.slice(0, 6);
  return products.slice(0, Math.min(products.length, 6));
}

function parseJsonResponse(raw: string) {
  const cleaned = raw.replace(/```(?:json)?/gi, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON object in AI response");
    return JSON.parse(match[0]);
  }
}

export const recommendGifts = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    // xAI calls its service Grok. GROK_API_KEY and GROQ_API_KEY are accepted
    // temporarily so existing deployed secrets keep working after this migration.
    // Support Gemini keys as well if the project is configured with GEMINI_API_KEY.
    const apiKey =
      process.env.XAI_API_KEY ||
      process.env.GROK_API_KEY ||
      process.env.GROQ_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.VITE_XAI_API_KEY ||
      process.env.VITE_GROK_API_KEY ||
      process.env.VITE_GROQ_API_KEY ||
      process.env.VITE_GEMINI_API_KEY ||
      import.meta.env.XAI_API_KEY ||
      import.meta.env.GROK_API_KEY ||
      import.meta.env.GROQ_API_KEY ||
      import.meta.env.GEMINI_API_KEY ||
      import.meta.env.VITE_XAI_API_KEY ||
      import.meta.env.VITE_GROK_API_KEY ||
      import.meta.env.VITE_GROQ_API_KEY ||
      import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return { error: "missing_api_key" as const };

    let products: ProductItem[] | null = null;
    let error: { message: string } | null = null;
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const result = await supabaseAdmin
        .from("products")
        .select("*, category:categories(*)")
        .eq("active", true)
        .order("display_order", { ascending: true });
      products = result.data as ProductItem[] | null;
      error = result.error;
    } catch (caughtError) {
      console.error(
        "Supabase recommender setup failed",
        caughtError instanceof Error ? caughtError.message : caughtError,
      );
      return { error: "db_error" as const };
    }

    if (error) {
      console.error("Supabase recommender failed", error.message);
      return { error: "db_error" as const };
    }

    const validProducts = products ?? [];
    if (!validProducts.length) {
      return { error: "no_products" as const };
    }

    const categorySlug = occasionCategoryMap[data.occasion] ?? "executive";
    const primaryProducts = validProducts.filter((p) => p.category?.slug === categorySlug);
    const fallbackProducts = validProducts.filter((p) => p.category?.slug !== categorySlug);
    const selected = chooseItems(
      primaryProducts.length ? primaryProducts : fallbackProducts,
      data.budget,
    );

    if (selected.length < 1) {
      return { error: "no_products" as const };
    }

    const productContext = selected.map((product) => ({
      name: product.name,
      description: product.description,
      category: product.category?.name,
      price: getPrice(product),
    }));
    const prompt = `You are a senior B2B corporate gifting consultant in India. Create one polished gift package from the available catalogue items only.

Client brief:
- Industry: ${data.industry}
- Occasion: ${data.occasion}
- Budget per person: ₹${data.budget}
- Recipients: ${data.employees}
- Notes: ${data.notes || "None"}

Available catalogue items:
${JSON.stringify(productContext)}

Return a JSON object only, with this exact shape:
{"package_name":"string","tagline":"string","items":[{"name":"catalogue item name","why":"one sentence"}],"branding":"one sentence","estimated_total":${data.employees * data.budget},"notes":"short delivery or pricing note"}

Use 1 to 6 available items. Do not invent product names. Keep estimated_total exactly ${data.employees * data.budget}.`;

    try {
      const response = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          // Override this in the server environment if your xAI account is
          // restricted to a particular model.
          model: process.env.XAI_MODEL || "grok-4.3",
          temperature: 0.6,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: "Return valid JSON only, with no markdown." },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (response.status === 429) return { error: "rate_limited" as const };
      if (response.status === 402) return { error: "credits_exhausted" as const };
      if (response.status === 401 || response.status === 403)
        return { error: "invalid_api_key" as const };
      if (!response.ok) {
        console.error("xAI recommender error", response.status, await response.text());
        return { error: "unavailable" as const };
      }

      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = payload.choices?.[0]?.message?.content;
      if (!content) return { error: "parse_failed" as const, raw: "" };

      const recommendation = recommendationSchema.parse(parseJsonResponse(content));
      return {
        recommendation: { ...recommendation, estimated_total: data.employees * data.budget },
      };
    } catch (error) {
      console.error(
        "xAI recommender response error",
        error instanceof Error ? error.message : error,
      );
      return { error: "unavailable" as const };
    }
  });

export type Recommendation = {
  package_name: string;
  tagline: string;
  items: { name: string; why: string }[];
  branding: string;
  estimated_total: number;
  notes: string;
};
