type OfferPayload = {
  sku?: string;
  label?: string;
  title?: string;
  formatted_price?: string;
  currency?: string;
  amount_cents?: number;
  price_cents?: number;
  modules_included?: string[];
  modules_allowed?: string[];
  [key: string]: unknown;
};

function displayPrice(offer: OfferPayload): string {
  if (typeof offer.formatted_price === "string" && offer.formatted_price.trim().length > 0) {
    return offer.formatted_price;
  }

  if (typeof offer.amount_cents === "number") {
    const amount = (offer.amount_cents / 100).toFixed(2);
    return `${amount} ${offer.currency ?? ""}`.trim();
  }

  if (typeof offer.price_cents === "number") {
    const amount = (offer.price_cents / 100).toFixed(2);
    return `${amount} ${offer.currency ?? ""}`.trim();
  }

  return "Price unavailable";
}

export function OfferCard({ offer }: { offer: OfferPayload }) {
  const modules = Array.isArray(offer.modules_included)
    ? offer.modules_included
    : Array.isArray(offer.modules_allowed)
      ? offer.modules_allowed
      : [];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="m-0 text-sm font-semibold text-slate-900">{offer.label ?? offer.title ?? "BIG5 Full Report"}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{displayPrice(offer)}</p>

      {offer.sku ? <p className="mt-1 text-xs text-slate-500">SKU: {offer.sku}</p> : null}

      {modules.length > 0 ? (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
          {modules.map((moduleCode) => (
            <li key={moduleCode}>{moduleCode}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
