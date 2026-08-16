import type { Locale } from "@/lib/i18n/locales";
import type { MeAttemptItem, MeAttemptsResponse, OfferPayload, ReportResponse } from "@/lib/api/v0_3";
import { buildBig5FormDisplayLabel, normalizeBig5FormSummary } from "@/lib/big5/formSummary";
import { resolveBig5PrivateResultAuthority, type Big5PrivateResultAuthority } from "@/lib/big5/privateResultAuthority";
import {
  BIG5_DOMAIN_LABELS,
  BIG5_DOMAIN_ORDER,
  BIG5_FACET_LABELS,
  isBig5DomainCode,
} from "@/lib/big5/taxonomy";

export type Big5HistoryFacetSummary = {
  key: string;
  label: string;
  domain: string;
  percentile: number | null;
  bucket: string | null;
  kind: string | null;
};

export type Big5HistoryQualitySummary = {
  level: string;
  grade: string | null;
};

export type Big5HistoryNormsSummary = {
  status: string;
  normsVersion: string | null;
};

export type Big5HistoryOfferSummary = {
  primaryOffer: OfferPayload | null;
};

export type Big5HistoryShareSummary = {
  enabled: boolean;
  shareKind: string;
};

export type Big5HistoryRowSummary = {
  authority: Big5PrivateResultAuthority;
  attemptId: string;
  submittedAt: string;
  formCode: string | null;
  formSummaryLabel: string | null;
  topDomains: string[];
  topFacets: Big5HistoryFacetSummary[];
  qualitySummary: Big5HistoryQualitySummary | null;
  normsSummary: Big5HistoryNormsSummary | null;
  offerSummary: Big5HistoryOfferSummary | null;
  shareSummary: Big5HistoryShareSummary | null;
  accessSummary: MeAttemptItem["access_summary"] | null;
};

export type Big5CompareSnapshot = {
  authority: Big5PrivateResultAuthority | null;
  domainPercentiles: Record<string, number>;
  facetPercentiles: Record<string, number>;
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

function normalizeNumericPercentile(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.min(100, value));
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.min(100, parsed));
    }
  }

  return null;
}

function normalizeMetricCode(value: unknown): string {
  return normalizeText(value).toUpperCase();
}

function normalizeFacetLabel(code: string, rawLabel: unknown, locale: Locale): string {
  const predefined = BIG5_FACET_LABELS[code];
  if (predefined) {
    return predefined[locale];
  }

  return normalizeText(rawLabel) || code;
}

function normalizeFacetDomain(code: string, rawDomain: unknown): string {
  const normalizedDomain = normalizeMetricCode(rawDomain);
  if (isBig5DomainCode(normalizedDomain)) {
    return normalizedDomain;
  }

  return BIG5_FACET_LABELS[code]?.domain ?? code.slice(0, 1);
}

function canExposeHistoryFacetSummaries(accessSummary: Record<string, unknown> | null): boolean {
  if (!accessSummary) {
    return true;
  }

  return normalizeText(accessSummary.access_state).toLowerCase() === "ready"
    && normalizeText(accessSummary.report_state).toLowerCase() === "ready";
}

export function normalizeBig5HistoryRows(
  items: MeAttemptItem[] | undefined,
  locale: Locale
): Big5HistoryRowSummary[] {
  const normalizedItems = Array.isArray(items) ? items : [];

  return normalizedItems.flatMap((item) => {
    const authority = resolveBig5PrivateResultAuthority(item);
    if (!authority) return [];
    const attemptId = normalizeText(item.attempt_id);
    const submittedAt = normalizeText(item.submitted_at);
    const domainsMean = asRecord(item.result_summary?.domains_mean);
    const topFacetsSummary = asRecord(item.top_facets_summary_v1);
    const qualitySummary = asRecord(item.quality_summary);
    const normsSummary = asRecord(item.norms_summary);
    const offerSummary = asRecord(item.offer_summary);
    const shareSummary = asRecord(item.share_summary);
    const formSummary = normalizeBig5FormSummary(item.big5_form_v1 ?? null);
    const accessSummary = asRecord(item.access_summary) ? item.access_summary ?? null : null;
    const exposeFacetSummaries = canExposeHistoryFacetSummaries(accessSummary);

    const topDomains = BIG5_DOMAIN_ORDER.map((code) => ({
      code,
      label: BIG5_DOMAIN_LABELS[code][locale],
      mean: normalizeNumericPercentile(domainsMean?.[code]),
    }))
      .filter((entry) => entry.mean !== null)
      .sort((left, right) => (right.mean as number) - (left.mean as number))
      .slice(0, 3)
      .map((entry) => entry.label);

    const topFacets = exposeFacetSummaries
      ? (Array.isArray(topFacetsSummary?.items) ? topFacetsSummary.items : [])
        .map((entry) => {
          const facet = asRecord(entry);
          const key = normalizeMetricCode(facet?.key);
          if (!key) return null;

          return {
            key,
            label: normalizeFacetLabel(key, facet?.label, locale),
            domain: normalizeFacetDomain(key, facet?.domain),
            percentile: normalizeNumericPercentile(facet?.percentile),
            bucket: normalizeText(facet?.bucket) || null,
            kind: normalizeText(facet?.kind) || null,
          } satisfies Big5HistoryFacetSummary;
        })
        .filter((entry): entry is Big5HistoryFacetSummary => entry !== null)
      : [];

    return {
      authority,
      attemptId,
      submittedAt,
      formCode: formSummary?.formCode ?? null,
      formSummaryLabel: buildBig5FormDisplayLabel(formSummary, { includeScaleCode: true, locale }),
      topDomains,
      topFacets,
      qualitySummary: normalizeText(qualitySummary?.level)
        ? {
            level: normalizeText(qualitySummary?.level).toUpperCase(),
            grade: normalizeText(qualitySummary?.grade).toUpperCase() || null,
          }
        : null,
      normsSummary: normalizeText(normsSummary?.status)
        ? {
            status: normalizeText(normsSummary?.status).toUpperCase(),
            normsVersion: normalizeText(normsSummary?.norms_version) || null,
          }
        : null,
      offerSummary: asRecord(offerSummary?.primary_offer)
        ? {
            primaryOffer: offerSummary?.primary_offer as OfferPayload,
          }
        : null,
      shareSummary: typeof shareSummary?.enabled === "boolean" || normalizeText(shareSummary?.share_kind)
        ? {
            enabled: Boolean(shareSummary?.enabled),
            shareKind: normalizeText(shareSummary?.share_kind) || "big5_result",
          }
        : null,
      accessSummary,
    };
  });
}

export function resolveBig5CompareAttemptPair(
  history: Pick<MeAttemptsResponse, "items" | "history_compare"> | null | undefined,
  queryCurrent: string,
  queryPrevious: string
): { current: string; previous: string } | null {
  const normalizedCurrent = queryCurrent.trim();
  const normalizedPrevious = queryPrevious.trim();
  if (normalizedCurrent && normalizedPrevious) {
    return {
      current: normalizedCurrent,
      previous: normalizedPrevious,
    };
  }

  const historyCompare = asRecord(history?.history_compare);
  const compareCurrent = normalizeText(historyCompare?.current_attempt_id);
  const comparePrevious = normalizeText(historyCompare?.previous_attempt_id);
  if (compareCurrent && comparePrevious) {
    return {
      current: compareCurrent,
      previous: comparePrevious,
    };
  }

  const items = Array.isArray(history?.items) ? history.items : [];
  if (items.length < 2) return null;

  return {
    current: normalizeText(items[0]?.attempt_id),
    previous: normalizeText(items[1]?.attempt_id),
  };
}

export function normalizeBig5CompareSnapshot(report: ReportResponse): Big5CompareSnapshot {
  const authority = resolveBig5PrivateResultAuthority(report);
  if (!authority) {
    return { authority: null, domainPercentiles: {}, facetPercentiles: {} };
  }
  const domainPercentiles: Record<string, number> = {};
  const facetPercentiles: Record<string, number> = {};

  const traitVector = Array.isArray(report.big5_public_projection_v1?.trait_vector)
    ? report.big5_public_projection_v1.trait_vector
    : [];

  for (const trait of traitVector) {
    const traitRecord = asRecord(trait);
    const code = normalizeMetricCode(traitRecord?.key);
    const percentile = normalizeNumericPercentile(traitRecord?.percentile);
    if (!code || percentile === null) continue;
    domainPercentiles[code] = percentile;
  }

  const facetVector = Array.isArray(report.big5_public_projection_v1?.facet_vector)
    ? report.big5_public_projection_v1.facet_vector
    : [];

  for (const facet of facetVector) {
    const facetRecord = asRecord(facet);
    const code = normalizeMetricCode(facetRecord?.key);
    const percentile = normalizeNumericPercentile(facetRecord?.percentile);
    if (!code || percentile === null) continue;
    facetPercentiles[code] = percentile;
  }

  return {
    authority,
    domainPercentiles,
    facetPercentiles,
  };
}
