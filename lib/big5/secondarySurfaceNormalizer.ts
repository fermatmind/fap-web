import type { Locale } from "@/lib/i18n/locales";
import type { MeAttemptItem, MeAttemptsResponse, OfferPayload, ReportResponse } from "@/lib/api/v0_3";
import { buildBig5FormDisplayLabel, normalizeBig5FormSummary } from "@/lib/big5/formSummary";

const BIG5_DOMAIN_ORDER = ["O", "C", "E", "A", "N"] as const;

type Big5DomainCode = (typeof BIG5_DOMAIN_ORDER)[number];

const BIG5_DOMAIN_LABELS: Record<Big5DomainCode, { en: string; zh: string }> = {
  O: { en: "Openness", zh: "开放性" },
  C: { en: "Conscientiousness", zh: "尽责性" },
  E: { en: "Extraversion", zh: "外向性" },
  A: { en: "Agreeableness", zh: "宜人性" },
  N: { en: "Neuroticism", zh: "情绪性" },
};

const BIG5_FACET_LABELS: Record<string, { en: string; zh: string; domain: string }> = {
  N1: { en: "N1 Anxiety", zh: "N1 焦虑", domain: "N" },
  N2: { en: "N2 Anger", zh: "N2 愤怒", domain: "N" },
  N3: { en: "N3 Depression", zh: "N3 抑郁", domain: "N" },
  N4: { en: "N4 Self Consciousness", zh: "N4 自我意识", domain: "N" },
  N5: { en: "N5 Immoderation", zh: "N5 冲动", domain: "N" },
  N6: { en: "N6 Vulnerability", zh: "N6 脆弱性", domain: "N" },
  E1: { en: "E1 Friendliness", zh: "E1 友善", domain: "E" },
  E2: { en: "E2 Gregariousness", zh: "E2 合群", domain: "E" },
  E3: { en: "E3 Assertiveness", zh: "E3 自信主张", domain: "E" },
  E4: { en: "E4 Activity Level", zh: "E4 活跃度", domain: "E" },
  E5: { en: "E5 Excitement Seeking", zh: "E5 刺激追求", domain: "E" },
  E6: { en: "E6 Cheerfulness", zh: "E6 愉悦感", domain: "E" },
  O1: { en: "O1 Imagination", zh: "O1 想象力", domain: "O" },
  O2: { en: "O2 Artistic Interests", zh: "O2 审美兴趣", domain: "O" },
  O3: { en: "O3 Emotionality", zh: "O3 情感丰富度", domain: "O" },
  O4: { en: "O4 Adventurousness", zh: "O4 冒险性", domain: "O" },
  O5: { en: "O5 Intellect", zh: "O5 智性", domain: "O" },
  O6: { en: "O6 Liberalism", zh: "O6 开放价值观", domain: "O" },
  A1: { en: "A1 Trust", zh: "A1 信任", domain: "A" },
  A2: { en: "A2 Morality", zh: "A2 诚实", domain: "A" },
  A3: { en: "A3 Altruism", zh: "A3 利他", domain: "A" },
  A4: { en: "A4 Cooperation", zh: "A4 合作", domain: "A" },
  A5: { en: "A5 Modesty", zh: "A5 谦逊", domain: "A" },
  A6: { en: "A6 Sympathy", zh: "A6 同情心", domain: "A" },
  C1: { en: "C1 Self Efficacy", zh: "C1 自我效能", domain: "C" },
  C2: { en: "C2 Orderliness", zh: "C2 条理性", domain: "C" },
  C3: { en: "C3 Dutifulness", zh: "C3 责任感", domain: "C" },
  C4: { en: "C4 Achievement Striving", zh: "C4 成就追求", domain: "C" },
  C5: { en: "C5 Self Discipline", zh: "C5 自律", domain: "C" },
  C6: { en: "C6 Cautiousness", zh: "C6 审慎", domain: "C" },
};

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

function normalizePercentileFromBody(text: string): number | null {
  const matched = text.match(/(?:percentile|百分位)\s*([0-9]{1,3})/i);
  if (!matched) return null;

  const value = Number(matched[1]);
  if (!Number.isFinite(value)) return null;

  return Math.max(0, Math.min(100, value));
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
  if (normalizedDomain.length === 1) {
    return normalizedDomain;
  }

  return BIG5_FACET_LABELS[code]?.domain ?? code.slice(0, 1);
}

function inferDomainCode(label: string): Big5DomainCode | null {
  const normalized = label.toUpperCase();
  if (normalized.startsWith("O")) return "O";
  if (normalized.startsWith("C")) return "C";
  if (normalized.startsWith("E")) return "E";
  if (normalized.startsWith("A")) return "A";
  if (normalized.startsWith("N")) return "N";
  return null;
}

function extractMetricPercentile(block: Record<string, unknown>): number | null {
  const direct =
    normalizeNumericPercentile(block.percentile) ??
    normalizeNumericPercentile(block.percentile_value) ??
    normalizeNumericPercentile(block.metric_percentile) ??
    normalizeNumericPercentile(block.value) ??
    normalizeNumericPercentile(block.metric_value);

  if (direct !== null) {
    return direct;
  }

  return normalizePercentileFromBody(normalizeText(block.body ?? block.desc));
}

function extractSections(report: ReportResponse): Array<Record<string, unknown>> {
  const reportSections = Array.isArray(report.report?.sections) ? report.report.sections : [];
  if (reportSections.length > 0) {
    return reportSections as Array<Record<string, unknown>>;
  }

  const projectionSections = Array.isArray(report.big5_public_projection_v1?.sections)
    ? report.big5_public_projection_v1.sections
    : [];
  return projectionSections as Array<Record<string, unknown>>;
}

export function normalizeBig5HistoryRows(
  items: MeAttemptItem[] | undefined,
  locale: Locale
): Big5HistoryRowSummary[] {
  const normalizedItems = Array.isArray(items) ? items : [];

  return normalizedItems.map((item) => {
    const attemptId = normalizeText(item.attempt_id);
    const submittedAt = normalizeText(item.submitted_at);
    const domainsMean = asRecord(item.result_summary?.domains_mean);
    const topFacetsSummary = asRecord(item.top_facets_summary_v1);
    const qualitySummary = asRecord(item.quality_summary);
    const normsSummary = asRecord(item.norms_summary);
    const offerSummary = asRecord(item.offer_summary);
    const shareSummary = asRecord(item.share_summary);
    const formSummary = normalizeBig5FormSummary(item.big5_form_v1 ?? null);

    const topDomains = BIG5_DOMAIN_ORDER.map((code) => ({
      code,
      label: BIG5_DOMAIN_LABELS[code][locale],
      mean: normalizeNumericPercentile(domainsMean?.[code]),
    }))
      .filter((entry) => entry.mean !== null)
      .sort((left, right) => (right.mean as number) - (left.mean as number))
      .slice(0, 3)
      .map((entry) => entry.label);

    const topFacets = (Array.isArray(topFacetsSummary?.items) ? topFacetsSummary.items : [])
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
      .filter((entry): entry is Big5HistoryFacetSummary => entry !== null);

    return {
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
      accessSummary: asRecord(item.access_summary) ? item.access_summary ?? null : null,
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

  const sections = extractSections(report);

  if (Object.keys(domainPercentiles).length === 0) {
    const domainSection = sections.find((section) => normalizeText(section.key) === "domains_overview");
    const domainBlocks = Array.isArray(domainSection?.blocks) ? domainSection.blocks : [];

    for (const block of domainBlocks) {
      const blockRecord = asRecord(block);
      if (!blockRecord) continue;

      const code = inferDomainCode(
        normalizeText(blockRecord.metric_code) || normalizeText(blockRecord.title) || normalizeText(blockRecord.body)
      );
      const percentile = extractMetricPercentile(blockRecord);
      if (!code || percentile === null) continue;

      domainPercentiles[code] = percentile;
    }
  }

  if (Object.keys(facetPercentiles).length === 0) {
    const facetSection = sections.find((section) => normalizeText(section.key) === "facet_table");
    const facetBlocks = Array.isArray(facetSection?.blocks) ? facetSection.blocks : [];

    for (const block of facetBlocks) {
      const blockRecord = asRecord(block);
      if (!blockRecord) continue;

      const code = normalizeMetricCode(blockRecord.metric_code || blockRecord.title);
      const percentile = extractMetricPercentile(blockRecord);
      if (!code || percentile === null) continue;

      facetPercentiles[code] = percentile;
    }
  }

  return {
    domainPercentiles,
    facetPercentiles,
  };
}
