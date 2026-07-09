// Per-unit pricing helper.
// Linear interpolation between the single-unit price (charged at low quantities)
// and the bulk price (charged at or above `bulk_quantity`). Below the MOQ we
// surface the higher "single" rate; above the bulk threshold we surface the lower
// "bulk" rate; in between we slide linearly so the customer sees a fair number.

export type PricingInput = {
  price_single?: number | null;
  price_bulk?: number | null;
  price_per_unit?: number | null; // legacy fallback
  moq?: number | null;
  bulk_quantity?: number | null;
};

export function unitPrice(p: PricingInput, qty: number): number | null {
  const single = p.price_single ?? p.price_per_unit ?? null;
  const bulk = p.price_bulk ?? p.price_per_unit ?? null;
  if (single == null && bulk == null) return null;
  if (single == null) return Number(bulk);
  if (bulk == null) return Number(single);

  const moq = Math.max(1, p.moq ?? 1);
  const bulkQty = Math.max(moq + 1, p.bulk_quantity ?? 100);

  if (qty <= moq) return Number(single);
  if (qty >= bulkQty) return Number(bulk);
  const ratio = (qty - moq) / (bulkQty - moq);
  return Number(single) + (Number(bulk) - Number(single)) * ratio;
}

export function totalPrice(p: PricingInput, qty: number): number | null {
  const u = unitPrice(p, qty);
  return u == null ? null : Math.round(u * qty);
}

export function formatINR(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

export function priceRange(p: PricingInput): { low: number | null; high: number | null } {
  const single = p.price_single ?? p.price_per_unit ?? null;
  const bulk = p.price_bulk ?? p.price_per_unit ?? null;
  return { low: bulk != null ? Number(bulk) : null, high: single != null ? Number(single) : null };
}
