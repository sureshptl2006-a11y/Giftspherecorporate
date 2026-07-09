import { Link } from "@tanstack/react-router";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { Logo } from "./Logo";
import { SITE } from "@/lib/site";
import { useContact } from "@/lib/useSiteSettings";

export function Footer() {
  const c = useContact();
  return (
    <footer className="bg-navy text-navy-foreground">
      <div className="container-page grid gap-10 py-16 md:grid-cols-4">
        <div>
          <Logo variant="light" />
          <p className="mt-4 text-sm leading-relaxed text-ivory/70">
            India's trusted partner for premium corporate gifting at scale —
            welcome kits, wellness, festivals and executive gifting.
          </p>
        </div>
        <div>
          <h4 className="font-display text-lg text-gold">Collections</h4>
          <ul className="mt-4 space-y-2 text-sm text-ivory/75">
            <li><Link to="/collections/$slug" params={{ slug: "welcome-kits" }} className="hover:text-gold">Welcome Kits</Link></li>
            <li><Link to="/collections/$slug" params={{ slug: "festival" }} className="hover:text-gold">Festival Hampers</Link></li>
            <li><Link to="/collections/$slug" params={{ slug: "wellness" }} className="hover:text-gold">Wellness Gifts</Link></li>
            <li><Link to="/collections/$slug" params={{ slug: "events" }} className="hover:text-gold">Event Merchandise</Link></li>
            <li><Link to="/collections/$slug" params={{ slug: "executive" }} className="hover:text-gold">Executive Gifts</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-lg text-gold">Solutions</h4>
          <ul className="mt-4 space-y-2 text-sm text-ivory/75">
            <li><Link to="/calculator" className="hover:text-gold">Bulk Order Calculator</Link></li>
            <li><Link to="/recommender" className="hover:text-gold">AI Gift Recommender</Link></li>
            <li><Link to="/wellness" className="hover:text-gold">Wellness Programs</Link></li>
            <li><Link to="/industries" className="hover:text-gold">Industries We Serve</Link></li>
            <li><Link to="/quote" className="hover:text-gold">Request Quote</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-lg text-gold">Get in Touch</h4>
          <ul className="mt-4 space-y-3 text-sm text-ivory/75">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-gold" /> {c.phone}</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-gold" /> {c.email}</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" /> {c.address}</li>
            <li>
              <a
                href={`https://wa.me/${c.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-2 rounded-md border border-gold/40 px-3 py-1.5 text-xs font-medium text-gold hover:bg-gold hover:text-gold-foreground transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Us
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ivory/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-xs text-ivory/55 md:flex-row">
          <p>© {new Date().getFullYear()} {SITE.full}. All rights reserved.</p>
          <div className="flex gap-5">
            <Link to="/auth" className="hover:text-gold">Admin</Link>
            <a href="#" className="hover:text-gold">Privacy</a>
            <a href="#" className="hover:text-gold">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
