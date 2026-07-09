import { Link } from "@tanstack/react-router";

export function Logo({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const color = variant === "light" ? "text-ivory" : "text-navy";
  return (
    <Link to="/" className={`group inline-flex items-baseline gap-2 ${color}`}>
      <span className="font-display text-2xl font-semibold tracking-tight">
        Gift<span className="text-gold">Sphere</span>
      </span>
      <span className="hidden text-[10px] uppercase tracking-[0.22em] opacity-70 sm:inline">
        Corporate
      </span>
    </Link>
  );
}
