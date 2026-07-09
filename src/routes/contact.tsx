import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Phone, Mail, MapPin, MessageCircle, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact GiftSphere — Get in Touch" },
      { name: "description", content: "Talk to our corporate gifting team — phone, WhatsApp, email, or send a message. Reply within one business day." },
      { property: "og:title", content: "Contact GiftSphere" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  company: z.string().trim().max(120).optional(),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(20).optional(),
  message: z.string().trim().min(5).max(1500),
});

function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert(parsed.data);
    setLoading(false);
    if (error) {
      toast.error("Couldn't send. Try again.");
      return;
    }
    const d = parsed.data;
    const msg =
      `*New Enquiry — GiftSphere*%0A%0A` +
      `*Name:* ${d.name}%0A` +
      `*Company:* ${d.company || "—"}%0A` +
      `*Email:* ${d.email}%0A` +
      `*Phone:* ${d.phone || "—"}%0A` +
      `*Message:* ${d.message.replace(/\n/g, " ")}`;
    window.open(`https://wa.me/${SITE.whatsapp}?text=${msg}`, "_blank", "noopener,noreferrer");
    setDone(true);
    toast.success("Message sent — we'll be in touch.");
  }

  return (
    <>
      <section className="bg-navy text-ivory">
        <div className="container-page py-16">
          <span className="eyebrow">Contact us</span>
          <h1 className="mt-3 font-display text-4xl md:text-5xl">Let's start a conversation.</h1>
          <p className="mt-3 max-w-xl text-ivory/75">Phone, WhatsApp, or message — pick what works for you.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page grid gap-10 lg:grid-cols-5">
          {/* Contact info */}
          <div className="space-y-5 lg:col-span-2">
            <ContactItem icon={Phone} label="Call us" value={SITE.phone} href={`tel:${SITE.phone.replace(/\s/g, "")}`} />
            <ContactItem icon={MessageCircle} label="WhatsApp" value="Message instantly" href={`https://wa.me/${SITE.whatsapp}`} external />
            <ContactItem icon={Mail} label="Email" value={SITE.email} href={`mailto:${SITE.email}`} />
            <ContactItem icon={MapPin} label="Offices" value={SITE.address} />

            <div className="overflow-hidden rounded-2xl border border-border shadow-soft">
              <iframe
                title="Map — Malad West, Mumbai"
                src="https://www.openstreetmap.org/export/embed.html?bbox=72.825%2C19.180%2C72.845%2C19.195&amp;layer=mapnik&amp;marker=19.1864%2C72.8350"
                loading="lazy"
                className="h-64 w-full"
              />
            </div>
          </div>

          {/* Form */}
          {done ? (
            <div className="rounded-2xl border border-border bg-card p-8 shadow-soft lg:col-span-3">
              <h2 className="font-display text-3xl">Thanks — we got it.</h2>
              <p className="mt-3 text-muted-foreground">A team member will be in touch within one business day.</p>
              <Button asChild className="mt-6"><Link to="/">Back home</Link></Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-border bg-card p-8 shadow-soft md:grid-cols-2 lg:col-span-3">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input id="name" name="name" required maxLength={120} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input id="company" name="company" maxLength={120} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" name="email" type="email" required className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" type="tel" className="mt-1.5" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea id="message" name="message" required minLength={5} maxLength={1500} className="mt-1.5 min-h-[140px]" />
              </div>
              <Button type="submit" disabled={loading} className="gradient-gold border-0 text-gold-foreground hover:opacity-90 md:col-span-2">
                {loading ? "Sending..." : <>Send message <ArrowRight className="ml-2 h-4 w-4" /></>}
              </Button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}

function ContactItem({ icon: Icon, label, value, href, external }: any) {
  const inner = (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-soft transition-colors hover:border-gold/50">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-gold">
        <Icon className="h-5 w-5 text-gold-foreground" />
      </div>
      <div>
        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
        <div className="font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
  return href ? <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>{inner}</a> : inner;
}
