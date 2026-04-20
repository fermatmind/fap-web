import type { MeAttemptItem, OfferPayload } from "@/lib/api/v0_3";
import { buildEnneagramFormDisplayLabel, normalizeEnneagramFormSummary } from "@/lib/enneagram/formSummary";
import type { Locale } from "@/lib/i18n/locales";

export type EnneagramHistoryTypeSummary = {
  code: string;
  label: string;
  score: number | null;
  rank: number | null;
};

export type EnneagramHistoryRowSummary = {
  attemptId: string;
  submittedAt: string;
  formCode: string | null;
  formSummaryLabel: string | null;
  primaryType: EnneagramHistoryTypeSummary | null;
  topTypes: EnneagramHistoryTypeSummary[];
  qualityLevel: string | null;
  confidenceLabel: string | null;
  offerSummary: {
    primaryOffer: OfferPayload | null;
  } | null;
  accessSummary: MeAttemptItem["access_summary"] | null;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function normalizeText(...values: unknown[]): string {
  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function normalizeNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function normalizeType(value: unknown): EnneagramHistoryTypeSummary | null {
  const row = asRecord(value);
  if (!row) {
    const code = normalizeText(value);
    return code ? { code, label: code, score: null, rank: null } : null;
  }

  const code = normalizeText(row.code, row.type_code, row.type, row.key);
  if (!code) {
    return null;
  }

  return {
    code,
    label: normalizeText(row.label, row.name, row.title, code),
    score: normalizeNumber(row.score ?? row.percent ?? row.value),
    rank: normalizeNumber(row.rank),
  };
}

function normalizeTypeList(value: unknown): EnneagramHistoryTypeSummary[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => normalizeType(entry))
    .filter((entry): entry is EnneagramHistoryTypeSummary => entry !== null);
}

function resolveSummaryRecord(item: MeAttemptItem): Record<string, unknown> | null {
  const resultSummary = asRecord(item.result_summary);

  return (
    asRecord(item.enneagram_summary_v1) ??
    asRecord(resultSummary?.enneagram) ??
    resultSummary
  );
}

export function normalizeEnneagramHistoryRows(
  items: MeAttemptItem[] | undefined,
  locale: Locale
): EnneagramHistoryRowSummary[] {
  const normalizedItems = Array.isArray(items) ? items : [];

  return normalizedItems.map((item) => {
    const attemptId = normalizeText(item.attempt_id);
    const submittedAt = normalizeText(item.submitted_at);
    const formSummary = normalizeEnneagramFormSummary(item.enneagram_form_v1 ?? null);
    const summary = resolveSummaryRecord(item);
    const offerSummary = asRecord(item.offer_summary);
    const qualitySummary = asRecord(item.quality_summary);

    return {
      attemptId,
      submittedAt,
      formCode: formSummary?.formCode ?? null,
      formSummaryLabel: buildEnneagramFormDisplayLabel(formSummary, { includeScaleCode: true, locale }),
      primaryType: normalizeType(summary?.primary_type ?? summary?.primaryType ?? summary?.type_code),
      topTypes: normalizeTypeList(summary?.top_types ?? summary?.topTypes),
      qualityLevel: normalizeText(qualitySummary?.level, qualitySummary?.grade, summary?.quality_level) || null,
      confidenceLabel: normalizeText(summary?.confidence_label, summary?.confidence, summary?.confidence_level) || null,
      offerSummary: asRecord(offerSummary?.primary_offer)
        ? {
            primaryOffer: offerSummary?.primary_offer as OfferPayload,
          }
        : null,
      accessSummary: asRecord(item.access_summary) ? item.access_summary ?? null : null,
    };
  });
}
