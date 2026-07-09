import { Link } from "@tanstack/react-router";
import { Menu, X, Phone } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { useContact } from "@/lib/useSiteSettings";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/collections", label: "Collections" },
  { to: "/wellness", label: "Wellness" },
  { to: "/industries", label: "Industries" },
  { to: "/recommender", label: "AI Recommender" },
  { to: "/blog", label: "Insights" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const c = useContact();
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-6 md:h-20">
        <Logo />
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="text-sm font-medium text-foreground/75 transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={`tel:${c.phone.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground"
          >
            <Phone className="h-4 w-4 text-gold" />
            {c.phone}
          </a>
          <Button asChild variant="default" className="bg-navy text-navy-foreground hover:bg-navy/90">
            <Link to="/quote">Request Quote</Link>
          </Button>
        </div>
        <button
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 text-foreground lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <div className="container-page flex flex-col gap-1 py-4">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded px-2 py-2 text-sm font-medium text-foreground/80 hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}
            <Button asChild className="mt-3 bg-navy text-navy-foreground hover:bg-navy/90">
              <Link to="/quote" onClick={() => setOpen(false)}>Request Quote</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
