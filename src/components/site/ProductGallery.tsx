import { useState } from "react";

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const list = images.filter(Boolean);
  if (list.length === 0) return null;
  const src = list[Math.min(active, list.length - 1)];

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[auto_1fr] lg:items-start">
      {list.length > 1 && (
        <div className="grid gap-1">
          {list.map((u, i) => (
            <button
              key={`${u}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={`h-16 w-16 overflow-hidden rounded-md border bg-white transition-all ${
                i === active ? "border-gold ring-2 ring-gold/40" : "border-border hover:border-gold/60"
              }`}
            >
              <img src={u} alt={`${alt} ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div
        className="relative overflow-hidden rounded-2xl border border-border bg-white shadow-soft aspect-square"
        onMouseMove={onMove}
        onMouseEnter={onMove}
        onMouseLeave={() => setZoom(null)}
      >
        <img
          src={src}
          alt={alt}
          loading="eager"
          className="h-full w-full object-cover will-change-transform"
          style={{
            transform: zoom ? "scale(1.3)" : "scale(1)",
            transformOrigin: zoom ? `${zoom.x}% ${zoom.y}%` : "center",
            transition: zoom ? "transform 120ms linear" : "transform 250ms ease-out",
          }}
        />
      </div>
    </div>
  );
}
