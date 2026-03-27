import type { Locale } from "@/lib/i18n/locales";
import type { MeAttemptItem, MeAttemptsResponse, ReportResponse } from "@/lib/api/v0_3";

const BIG5_DOMAIN_ORDER = ["O", "C", "E", "A", "N"] as const;

type Big5DomainCode = (typeof BIG5_DOMAIN_ORDER)[number];

const BIG5_DOMAIN_LABELS: Record<Big5DomainCode, { en: string; zh: string }> = {
  O: { en: "Openness", zh: "开放性" },
  C: { en: "Conscientiousness", zh: "尽责性" },
  E: { en: "Extraversion", zh: "外向性" },
  A: { en: "Agreeableness", zh: "宜人性" },
  N: { en: "Neuroticism", zh: "情绪性" },
};

export type Big5HistoryRowSummary = {
  attemptId: string;
  submittedAt: string;
  topDomains: string[];
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

    const topDomains = BIG5_DOMAIN_ORDER.map((code) => ({
      code,
      label: BIG5_DOMAIN_LABELS[code][locale],
      mean: normalizeNumericPercentile(domainsMean?.[code]),
    }))
      .filter((entry) => entry.mean !== null)
      .sort((left, right) => (right.mean as number) - (left.mean as number))
      .slice(0, 3)
      .map((entry) => entry.label);

    return {
      attemptId,
      submittedAt,
      topDomains,
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
