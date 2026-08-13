"use client";

import { SelfUnderstandingDomainBadge } from "@/components/domains/SelfUnderstandingDomainBadge";
import type { Big5PublicProjection } from "@/lib/api/v0_3";
import type { Big5ResultPageV2CoreDomain } from "@/lib/big5/resultPageV2";
import { BIG5_DOMAIN_LABELS, BIG5_DOMAIN_ORDER, type Big5DomainCode } from "@/lib/big5/taxonomy";
import type { Locale } from "@/lib/i18n/locales";

export type Big5CoreSummaryItem = {
  code: Big5DomainCode;
  label: string;
  score: number;
  bandLabel: string;
  summary: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100
    ? value
    : null;
}

export function buildBig5V2CoreSummaryItems(
  domains: Big5ResultPageV2CoreDomain[],
  locale: Locale
): Big5CoreSummaryItem[] {
  if (domains.length !== BIG5_DOMAIN_ORDER.length) {
    return [];
  }

  const byCode = new Map(domains.map((domain) => [domain.code, domain]));
  return BIG5_DOMAIN_ORDER.flatMap((code) => {
    const domain = byCode.get(code);
    if (!domain || !Number.isFinite(domain.score) || domain.score < 0 || domain.score > 100) {
      return [];
    }

    return [{
      code,
      label: locale === "zh"
        ? domain.labelZh || BIG5_DOMAIN_LABELS[code].zh
        : domain.labelEn || BIG5_DOMAIN_LABELS[code].en,
      score: domain.score,
      bandLabel: locale === "zh" ? domain.bandLabelZh || domain.band : domain.bandLabelEn || domain.band,
      summary: locale === "zh" ? domain.summaryZh || domain.summaryEn : domain.summaryEn || domain.summaryZh,
    }];
  });
}

export function buildLegacyBig5CoreSummaryItems(
  projection: Big5PublicProjection | null,
  dimensions: Array<Record<string, unknown>>,
  locale: Locale
): Big5CoreSummaryItem[] {
  const traitVector = Array.isArray(projection?.trait_vector) ? projection.trait_vector : [];
  const traitsByCode = new Map<string, Record<string, unknown>>();
  for (const value of traitVector) {
    const trait = asRecord(value);
    const code = normalizeText(trait?.key).toUpperCase();
    if (BIG5_DOMAIN_ORDER.includes(code as Big5DomainCode) && !traitsByCode.has(code)) {
      traitsByCode.set(code, trait as Record<string, unknown>);
    }
  }
  if (traitsByCode.size !== BIG5_DOMAIN_ORDER.length) {
    return [];
  }

  const dimensionsByCode = new Map(
    dimensions.map((dimension) => [normalizeText(dimension.code ?? dimension.key).toUpperCase(), dimension])
  );

  return BIG5_DOMAIN_ORDER.flatMap((code) => {
    const trait = traitsByCode.get(code);
    const score = normalizeNumber(trait?.percentile);
    if (!trait || score === null) {
      return [];
    }
    const dimension = dimensionsByCode.get(code);
    return [{
      code,
      label: normalizeText(dimension?.label) || BIG5_DOMAIN_LABELS[code][locale],
      score,
      bandLabel: normalizeText(trait.band_label ?? trait.band ?? dimension?.winnerLabel),
      summary: "",
    }];
  });
}

export function Big5CoreSummary({
  locale,
  items,
  source,
}: {
  locale: Locale;
  items: Big5CoreSummaryItem[];
  source: "v2" | "legacy" | "unavailable";
}) {
  const available = items.length === BIG5_DOMAIN_ORDER.length;

  return (
    <div
      data-testid="big5-core-only-shell"
      data-core-source={source}
      data-domain-id="self_understanding"
      data-domain-role="primary"
      data-domain-envelope-state="metadata_only"
      className="space-y-6"
    >
      <SelfUnderstandingDomainBadge locale={locale} />
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="m-0 text-xl font-semibold text-slate-950">
          {locale === "zh" ? "五维核心摘要" : "Five-domain core summary"}
        </h2>
        {available ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5" data-testid="big5-core-domains">
            {items.map((item) => {
              const percent = Math.max(0, Math.min(100, item.score));
              return (
                <article
                  key={item.code}
                  data-testid={`big5-core-domain-${item.code}`}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{item.code}</p>
                      <h3 className="m-0 mt-1 text-base font-semibold text-slate-950">{item.label}</h3>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-sm font-semibold text-slate-800">
                      {Number.isInteger(item.score) ? item.score : item.score.toFixed(1)}
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={`${item.label} ${item.score}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={item.score}
                    className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"
                  >
                    <div className="h-full rounded-full bg-sky-600" style={{ width: `${percent}%` }} />
                  </div>
                  {item.bandLabel ? <p className="m-0 mt-2 text-xs font-medium text-slate-500">{item.bandLabel}</p> : null}
                  {item.summary ? <p className="m-0 mt-3 text-sm leading-7 text-slate-700">{item.summary}</p> : null}
                </article>
              );
            })}
          </div>
        ) : (
          <p role="status" data-testid="big5-core-summary-unavailable" className="m-0 text-sm text-slate-600">
            {locale === "zh" ? "结果摘要暂时不可用" : "The result summary is temporarily unavailable"}
          </p>
        )}
      </section>
    </div>
  );
}
