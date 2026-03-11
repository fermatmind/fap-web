"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trackEvent } from "@/lib/analytics";
import type { ReportCta } from "@/lib/api/v0_3";
import type { Locale } from "@/lib/i18n/locales";
import type { ResolvedOffer } from "@/components/result/RichResultReport";

type OfferKind = "career" | "full" | "relationships";

type MbtiOfferComparisonSectionProps = {
  locale: Locale;
  offers: ResolvedOffer[];
  cta?: ReportCta | null;
  onCheckout?: () => void | Promise<void>;
  isCheckingOut?: boolean;
  checkoutError?: string | null;
};

const OFFER_ORDER: OfferKind[] = ["career", "full", "relationships"];

const OFFER_LABELS: Record<OfferKind, { en: string; zh: string }> = {
  career: { en: "Career direction module", zh: "职业道路模块" },
  full: { en: "Full personality report", zh: "完整人格报告" },
  relationships: { en: "Relationship insights module", zh: "关系解读模块" },
};

function normalizeText(...values: unknown[]): string {
  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function resolveOfferKind(offer: ResolvedOffer): OfferKind | null {
  const key = offer.key.toUpperCase();
  if (offer.moduleCodes.includes("core_full") || key.includes("REPORT_FULL")) return "full";
  if (offer.moduleCodes.includes("career")) return "career";
  if (offer.moduleCodes.includes("relationships")) return "relationships";
  return null;
}

export function MbtiOfferComparisonSection({
  locale,
  offers,
  cta,
  onCheckout,
  isCheckingOut = false,
  checkoutError = null,
}: MbtiOfferComparisonSectionProps) {
  const selectedOffers = OFFER_ORDER.map((kind) =>
    offers.find((offer) => resolveOfferKind(offer) === kind)
  ).filter((offer): offer is ResolvedOffer => offer !== undefined);
  const impressionTrackedRef = useRef(false);
  const ctaBadge = normalizeText(cta?.badge);
  const ctaTitle =
    normalizeText(cta?.title) ||
    (locale === "zh" ? "把零散 CTA 收口成一个正式比较区" : "A single comparison section instead of scattered CTAs");
  const ctaSubtitle =
    normalizeText(cta?.subtitle) ||
    (locale === "zh"
      ? "这一段只展示与当前 MBTI 结果页直接相关的正式方案，不触发支付，也不改现有结算流程。"
      : "This section only shows the formal plans directly tied to the current MBTI result page. It does not trigger checkout or alter the existing payment flow.");
  const benefitBullets = Array.isArray(cta?.benefit_bullets)
    ? cta.benefit_bullets.map((item) => normalizeText(item)).filter(Boolean)
    : [];
  const primaryCtaLabel =
    normalizeText(cta?.primary_label) || (locale === "zh" ? "查看解锁方案" : "View unlock options");
  const checkoutLabel = isCheckingOut
    ? locale === "zh"
      ? "正在跳转..."
      : "Redirecting..."
    : primaryCtaLabel;

  useEffect(() => {
    if (selectedOffers.length === 0 || impressionTrackedRef.current) return;
    impressionTrackedRef.current = true;

    trackEvent("ui_card_impression", {
      slug: "mbti-result-shell",
      scale_code: "MBTI",
      visual_kind: "offer_primary_cta",
      locale,
    });
  }, [locale, selectedOffers.length]);

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
          {ctaTitle}
        </h2>
        <p className="m-0 max-w-3xl text-sm leading-7 text-[var(--fm-text-muted)]">{ctaSubtitle}</p>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white/90 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            {ctaBadge ? (
              <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                {ctaBadge}
              </span>
            ) : null}
            {benefitBullets.length > 0 ? (
              <ul className="mb-0 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-600">
                {benefitBullets.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            ) : null}
          </div>

          <button
            type="button"
            data-testid="mbti-offers-primary-cta"
            disabled={isCheckingOut}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[var(--fm-accent)] px-5 py-3 text-sm font-semibold text-white shadow-[var(--fm-shadow-sm)] transition hover:opacity-95"
            onClick={() => {
              trackEvent("ui_card_interaction", {
                slug: "mbti-result-shell",
                scale_code: "MBTI",
                visual_kind: "offer_primary_cta",
                interaction: "click",
                locale,
              });
              void onCheckout?.();
            }}
          >
            {checkoutLabel}
          </button>
        </div>
        {checkoutError ? (
          <p className="mb-0 mt-3 text-sm text-rose-600" data-testid="mbti-offers-checkout-error">
            {checkoutError}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {selectedOffers.map((offer) => {
          const kind = resolveOfferKind(offer) ?? "career";
          const isPrimary = kind === "full";

          return (
            <Card
              id={isPrimary ? "offer-full" : undefined}
              key={`${kind}-${offer.key}`}
              data-testid={`mbti-offer-card-${kind}`}
              className={
                isPrimary
                  ? "border-slate-950 bg-slate-950 text-white shadow-[0_22px_48px_rgba(15,23,42,0.2)]"
                  : "border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.06)]"
              }
            >
              <CardHeader className="space-y-2 pb-3">
                {isPrimary && ctaBadge ? (
                  <span className="inline-flex w-fit rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-200">
                    {ctaBadge}
                  </span>
                ) : null}
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
