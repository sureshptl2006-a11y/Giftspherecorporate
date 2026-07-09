import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  industry: z.string().min(2).max(80),
  occasion: z.string().min(2).max(80),
  budget: z.number().int().positive().max(1_000_000),
  employees: z.number().int().positive().max(500_000),
  notes: z.string().max(500).optional().default(""),
});

export const recommendGifts = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      throw new Error("AI gateway not configured");
    }

    const prompt = `You are a senior B2B corporate gifting consultant in India for GiftSphere Corporate Solutions.

Recommend a curated gifting package for this brief:
- Industry: ${data.industry}
- Occasion: ${data.occasion}
- Budget per person: ₹${data.budget}
- Number of recipients: ${data.employees}
- Notes from client: ${data.notes || "none"}

Return STRICT JSON with this shape:
{
  "package_name": "string — short evocative name",
  "tagline": "string — one-line value",
  "items": [ { "name": "string", "why": "string (1 sentence)" } ],  // 4-6 items
  "branding": "string — recommended branding approach in 1 sentence",
  "estimated_total": number,  // rupees, employees * budget
  "notes": "string — short delivery/timing advice"
}

Items must fit the per-person budget. Use Indian brands/standards. NO markdown, ONLY raw JSON.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You output strict JSON only. No prose. No markdown fences." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    if (resp.status === 429) {
      return { error: "rate_limited" as const };
    }
    if (resp.status === 402) {
      return { error: "credits_exhausted" as const };
    }
    if (!resp.ok) {
      console.error("AI gateway error", await resp.text());
      return { error: "unavailable" as const };
    }

    const json = (await resp.json()) as {
      choices?: Array<{ message?: { content?: string }; content?: string }>;
      error?: unknown;
    };
    const content = json.choices?.[0]?.message?.content ?? json.choices?.[0]?.content ?? "";
    const cleaned = content.replace(/```(?:json)?/gi, "").trim();

    const recommendationSchema = z.object({
      package_name: z.string().min(1),
      tagline: z.string().min(1),
      items: z.array(z.object({ name: z.string().min(1), why: z.string().min(1) })).min(4).max(6),
      branding: z.string().min(1),
      estimated_total: z.number().nonnegative(),
      notes: z.string().min(1),
    });

    function tryParse(raw: string) {
      const stripped = raw.trim();
      try {
        return JSON.parse(stripped);
      } catch {
        const match = stripped.match(/(\{[\s\S]*\})/);
        if (match) {
          return JSON.parse(match[1]);
        }
        throw new Error("No valid JSON object found");
      }
    }

    try {
      const parsed = tryParse(cleaned);
      const recommendation = recommendationSchema.parse(parsed);
      return { recommendation };
    } catch (err) {
      console.error("AI parse failed", {
        raw: content,
        cleaned,
        error: err instanceof Error ? err.message : err,
      });
      return { error: "parse_failed" as const, raw: content };
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
