"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Locale } from "@/lib/i18n/locales";
import type { ResolvedOffer } from "@/components/result/RichResultReport";

type OfferKind = "career" | "full" | "relationships";

type MbtiOfferComparisonSectionProps = {
  locale: Locale;
  offers: ResolvedOffer[];
};

const OFFER_ORDER: OfferKind[] = ["career", "full", "relationships"];

const OFFER_LABELS: Record<OfferKind, { en: string; zh: string }> = {
  career: { en: "Career direction module", zh: "职业道路模块" },
  full: { en: "Full personality report", zh: "完整人格报告" },
  relationships: { en: "Relationship insights module", zh: "关系解读模块" },
};

function resolveOfferKind(offer: ResolvedOffer): OfferKind | null {
  const key = offer.key.toUpperCase();
  if (offer.moduleCodes.includes("core_full") || key.includes("REPORT_FULL")) return "full";
  if (offer.moduleCodes.includes("career")) return "career";
  if (offer.moduleCodes.includes("relationships")) return "relationships";
  return null;
}

export function MbtiOfferComparisonSection({ locale, offers }: MbtiOfferComparisonSectionProps) {
  const selectedOffers = OFFER_ORDER.map((kind) =>
    offers.find((offer) => resolveOfferKind(offer) === kind)
  ).filter((offer): offer is ResolvedOffer => offer !== undefined);

  if (selectedOffers.length === 0) {
    return null;
  }

  return (
    <section
      id="offers"
      data-testid="mbti-offer-comparison"
      className="scroll-mt-28 space-y-4 rounded-[28px] border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)] md:p-6"
    >
      <div className="space-y-2">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
          {locale === "zh" ? "解锁方案" : "Unlock options"}
        </p>
        <h2 className="m-0 text-2xl font-semibold tracking-tight text-[var(--fm-text)]">
          {locale === "zh" ? "把零散 CTA 收口成一个正式比较区" : "A single comparison section instead of scattered CTAs"}
        </h2>
        <p className="m-0 max-w-3xl text-sm leading-7 text-[var(--fm-text-muted)]">
          {locale === "zh"
            ? "这一段只展示与当前 MBTI 结果页直接相关的正式方案，不触发支付，也不改现有结算流程。"
            : "This section only shows the formal plans directly tied to the current MBTI result page. It does not trigger checkout or alter the existing payment flow."}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {selectedOffers.map((offer) => {
          const kind = resolveOfferKind(offer) ?? "career";
          const isPrimary = kind === "full";

          return (
            <Card
              key={`${kind}-${offer.key}`}
              data-testid={`mbti-offer-card-${kind}`}
              className={
                isPrimary
                  ? "border-slate-950 bg-slate-950 text-white shadow-[0_22px_48px_rgba(15,23,42,0.2)]"
                  : "border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.06)]"
              }
            >
              <CardHeader className="space-y-2 pb-3">
                <p className={isPrimary ? "m-0 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-200" : "m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]"}>
                  {OFFER_LABELS[kind][locale]}
                </p>
                <CardTitle className={isPrimary ? "text-2xl text-white" : "text-xl text-slate-900"}>{offer.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className={isPrimary ? "m-0 text-4xl font-bold tracking-tight text-white" : "m-0 text-3xl font-bold tracking-tight text-slate-950"}>
                  {offer.price}
                </p>
                <p className={isPrimary ? "m-0 text-sm leading-7 text-slate-200" : "m-0 text-sm leading-7 text-slate-600"}>
                  {offer.description}
                </p>
                {offer.modules.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {offer.modules.map((module) => (
                      <span
                        key={module}
                        className={
                          isPrimary
                            ? "inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/90"
                            : "inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600"
                        }
                      >
                        {module}
                      </span>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
