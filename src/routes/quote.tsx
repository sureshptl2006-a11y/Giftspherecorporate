import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const searchSchema = z.object({
  product: z.string().optional(),
  qty: z.coerce.number().optional(),
  employees: z.coerce.number().optional(),
  budget: z.coerce.number().optional(),
});

export const Route = createFileRoute("/quote")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Request a Quote — GiftSphere" },
      { name: "description", content: "Tell us your gifting brief — company, occasion, employees, budget, and timeline. We'll reply within one business day." },
      { property: "og:title", content: "Request a Corporate Gifting Quote" },
      { property: "og:url", content: "/quote" },
    ],
    links: [{ rel: "canonical", href: "/quote" }],
  }),
  component: QuotePage,
});

const quoteSchema = z.object({
  company_name: z.string().trim().min(2, "Company name required").max(120),
  contact_person: z.string().trim().min(2, "Your name required").max(120),
  email: z.string().trim().email("Valid email required").max(200),
  phone: z.string().trim().min(7, "Phone required").max(20),
  industry: z.string().min(1, "Pick industry"),
  num_employees: z.coerce.number().int().positive().max(500000),
  budget_per_employee: z.coerce.number().positive().max(1_000_000),
  delivery_date: z.string().optional(),
  product_category: z.string().optional(),
  additional_notes: z.string().max(1000).optional(),
});

const INDUSTRIES = ["IT & Software", "Hospitals & Healthcare", "Pharmaceuticals", "Banks & Financial Services", "Insurance", "Education", "Startups", "Manufacturing", "Other"];
const CATEGORIES = ["Employee Welcome Kits", "Festival & Diwali Gifts", "Wellness Gifts", "Corporate Event Gifts", "Executive Gifts", "Not sure yet"];

function QuotePage() {
  const search = Route.useSearch();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const prefillNotes = [
    search.product && `Interested in: ${search.product} (${search.qty ?? "?"} units)`,
    search.employees && `Team size: ${search.employees}`,
    search.budget && `Budget/employee: ₹${search.budget}`,
  ].filter(Boolean).join("\n");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = Object.fromEntries(fd) as Record<string, string>;
    const parsed = quoteSchema.safeParse(raw);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("quote_requests").insert({
      ...parsed.data,
      num_employees: Number(parsed.data.num_employees),
      budget_per_employee: Number(parsed.data.budget_per_employee),
      delivery_date: parsed.data.delivery_date || null,
    });
    setLoading(false);
    if (error) {
      toast.error("Couldn't send. Please try again.");
      return;
    }
    // Forward inquiry to WhatsApp
    const d = parsed.data;
    const msg =
      `*New Quote Request — GiftSphere*%0A%0A` +
      `*Company:* ${d.company_name}%0A` +
      `*Contact:* ${d.contact_person}%0A` +
      `*Email:* ${d.email}%0A` +
      `*Phone:* ${d.phone}%0A` +
      `*Industry:* ${d.industry}%0A` +
      `*Category:* ${d.product_category || "—"}%0A` +
      `*Recipients:* ${d.num_employees}%0A` +
      `*Budget/recipient:* ₹${d.budget_per_employee}%0A` +
      `*Delivery date:* ${d.delivery_date || "—"}%0A` +
      `*Notes:* ${(d.additional_notes || "—").replace(/\n/g, " ")}`;
    window.open(`https://wa.me/${SITE.whatsapp}?text=${msg}`, "_blank", "noopener,noreferrer");
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <section className="bg-ivory/30 py-20">
        <div className="container-page mx-auto max-w-2xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full gradient-gold">
            <CheckCircle2 className="h-7 w-7 text-gold-foreground" />
          </div>
          <h1 className="mt-6 font-display text-4xl">Quote request received</h1>
          <p className="mt-3 text-muted-foreground">
            Thank you! A dedicated account manager will reach out within one business day with a curated proposal and pricing.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button asChild className="bg-navy text-navy-foreground hover:bg-navy/90"><Link to="/collections">Browse collections</Link></Button>
            <Button asChild variant="outline"><Link to="/">Home</Link></Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="bg-navy text-ivory">
        <div className="container-page py-16">
          <span className="eyebrow">Request a quote</span>
          <h1 className="mt-3 font-display text-4xl md:text-5xl">Tell us about your gifting brief.</h1>
          <p className="mt-3 max-w-xl text-ivory/75">We'll respond within one business day with a curated proposal and indicative pricing.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page mx-auto max-w-3xl">
          <form onSubmit={onSubmit} className="grid gap-5 rounded-2xl border border-border bg-card p-8 shadow-soft md:grid-cols-2">
            <div className="md:col-span-1">
              <Label htmlFor="company_name">Company name *</Label>
              <Input id="company_name" name="company_name" required maxLength={120} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="contact_person">Your name *</Label>
              <Input id="contact_person" name="contact_person" required maxLength={120} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="email">Work email *</Label>
              <Input id="email" name="email" type="email" required maxLength={200} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" name="phone" type="tel" required maxLength={20} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="industry">Industry *</Label>
              <Select name="industry" required defaultValue="">
                <SelectTrigger className="mt-1.5" id="industry"><SelectValue placeholder="Select industry" /></SelectTrigger>
                <SelectContent>{INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="product_category">Gift category</Label>
              <Select name="product_category" defaultValue="">
                <SelectTrigger className="mt-1.5" id="product_category"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="num_employees">Number of recipients *</Label>
              <Input id="num_employees" name="num_employees" type="number" min={1} required defaultValue={search.employees} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="budget_per_employee">Budget per recipient (₹) *</Label>
              <Input id="budget_per_employee" name="budget_per_employee" type="number" min={1} required defaultValue={search.budget} className="mt-1.5" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="delivery_date">Required delivery date</Label>
              <Input id="delivery_date" name="delivery_date" type="date" className="mt-1.5" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="additional_notes">Additional notes</Label>
              <Textarea
                id="additional_notes" name="additional_notes" maxLength={1000}
                defaultValue={prefillNotes}
                placeholder="Tell us about the occasion, branding preferences, packaging requirements..."
                className="mt-1.5 min-h-[120px]"
              />
            </div>
            <Button type="submit" disabled={loading} size="lg" className="gradient-gold border-0 text-gold-foreground shadow-gold hover:opacity-90 md:col-span-2">
              {loading ? "Sending..." : <>Send quote request <ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>
            <p className="text-xs text-muted-foreground md:col-span-2">
              By submitting you agree to be contacted by our team about your gifting requirement.
            </p>
          </form>
        </div>
      </section>
    </>
  );
}
