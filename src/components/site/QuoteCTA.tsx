import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function QuoteCTA({ compact = false }: { compact?: boolean }) {
  return (
    <section className={compact ? "py-12" : "py-20"}>
      <div className="container-page">
        <div className="gradient-navy relative overflow-hidden rounded-2xl px-8 py-14 text-center shadow-elegant md:px-16 md:py-20">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
          <span className="eyebrow !text-gold">Ready to gift</span>
          <h2 className="mt-4 font-display text-3xl text-ivory md:text-5xl">
            Let's build a gifting program your team will remember.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-ivory/75">
            Tell us your team size, occasion and budget. We'll come back with a curated proposal
            and indicative pricing within one business day.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="gradient-gold border-0 text-gold-foreground shadow-gold hover:opacity-90">
              <Link to="/quote">Request a Quote <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-ivory/30 bg-transparent text-ivory hover:bg-ivory/10 hover:text-ivory">
              <Link to="/calculator">Try the Bulk Calculator</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
