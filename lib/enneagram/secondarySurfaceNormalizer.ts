import type { MeAttemptItem, MeAttemptsResponse, OfferPayload } from "@/lib/api/v0_3";
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
  confidenceLevel: string | null;
  confidenceLabel: string | null;
  interpretationScope: string | null;
  interpretationReason: string | null;
  closeCallPair: {
    typeA: string | null;
    typeB: string | null;
    summary: string | null;
  } | null;
  comparePolicy: {
    formLabel: string | null;
    compareCompatibilityGroup: string | null;
    crossFormComparable: boolean;
    canCompare: boolean | null;
    reason: string | null;
    copyKey: string | null;
  } | null;
  classificationSummary: {
    interpretationScope: string | null;
    confidenceLevel: string | null;
    interpretationContextId: string | null;
    contentReleaseHash: string | null;
    contentSnapshotStatus: string | null;
  } | null;
  observationSummary: {
    status: string | null;
    completionRate: number | null;
    userConfirmedType: string | null;
    suggestedNextAction: string | null;
    day7Submitted: boolean;
  } | null;
  offerSummary: {
    primaryOffer: OfferPayload | null;
  } | null;
  accessSummary: MeAttemptItem["access_summary"] | null;
};

export type EnneagramHistoryCompareSummary = {
  canCompare: boolean;
  reason: string | null;
  copyKey: string | null;
  currentAttemptId: string | null;
  previousAttemptId: string | null;
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

function normalizeBoolean(value: unknown): boolean {
  return value === true;
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

function normalizeCloseCallPair(value: unknown): EnneagramHistoryRowSummary["closeCallPair"] {
  const row = asRecord(value);
  if (!row) {
    return null;
  }

  const typeA = normalizeType(row.type_a)?.label ?? normalizeText(row.type_a);
  const typeB = normalizeType(row.type_b)?.label ?? normalizeText(row.type_b);
  const summary = normalizeText(row.summary, row.trigger_reason) || null;

  if (!typeA && !typeB && !summary) {
    return null;
  }

  return {
    typeA: typeA || null,
    typeB: typeB || null,
    summary,
  };
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
    const observationState = asRecord(item.observation_state_v1);
    const hasObservationSummary =
      observationState !== null ||
      normalizeText(item.observation_status, item.user_confirmed_type, item.suggested_next_action).length > 0 ||
      normalizeNumber(item.observation_completion_rate) !== null;

    return {
      attemptId,
      submittedAt,
      formCode: formSummary?.formCode ?? null,
      formSummaryLabel: buildEnneagramFormDisplayLabel(formSummary, { includeScaleCode: true, locale }),
      primaryType: normalizeType(summary?.primary_type ?? summary?.primaryType ?? summary?.type_code),
      topTypes: normalizeTypeList(summary?.top_types ?? summary?.topTypes),
      qualityLevel: normalizeText(qualitySummary?.level, qualitySummary?.grade, summary?.quality_level) || null,
      confidenceLevel:
        normalizeText(item.classification_summary_v1?.confidence_level, summary?.confidence_level, summary?.confidence) || null,
      confidenceLabel: normalizeText(summary?.confidence_label, summary?.confidence, summary?.confidence_level) || null,
      interpretationScope:
        normalizeText(item.classification_summary_v1?.interpretation_scope, summary?.interpretation_scope) || null,
      interpretationReason:
        normalizeText(summary?.interpretation_reason, item.classification_summary_v1?.interpretation_reason) || null,
      closeCallPair: normalizeCloseCallPair(item.classification_summary_v1?.close_call_pair ?? summary?.close_call_pair),
      comparePolicy: asRecord(item.compare_policy_v1)
        ? {
            formLabel: normalizeText(item.compare_policy_v1?.form_label) || null,
            compareCompatibilityGroup: normalizeText(item.compare_policy_v1?.compare_compatibility_group) || null,
            crossFormComparable: item.compare_policy_v1?.cross_form_comparable === true,
            canCompare:
              typeof item.compare_policy_v1?.can_compare === "boolean" ? item.compare_policy_v1.can_compare : null,
            reason: normalizeText(item.compare_policy_v1?.reason) || null,
            copyKey: normalizeText(item.compare_policy_v1?.copy_key) || null,
          }
        : null,
      classificationSummary: asRecord(item.classification_summary_v1)
        ? {
            interpretationScope: normalizeText(item.classification_summary_v1?.interpretation_scope) || null,
            confidenceLevel: normalizeText(item.classification_summary_v1?.confidence_level) || null,
            interpretationContextId: normalizeText(item.classification_summary_v1?.interpretation_context_id) || null,
            contentReleaseHash: normalizeText(item.classification_summary_v1?.content_release_hash) || null,
            contentSnapshotStatus: normalizeText(item.classification_summary_v1?.content_snapshot_status) || null,
          }
        : null,
      observationSummary: hasObservationSummary
        ? {
            status: normalizeText(item.observation_status, observationState?.status) || null,
            completionRate: normalizeNumber(item.observation_completion_rate ?? observationState?.observation_completion_rate),
            userConfirmedType: normalizeText(item.user_confirmed_type, observationState?.user_confirmed_type) || null,
            suggestedNextAction: normalizeText(item.suggested_next_action, observationState?.suggested_next_action) || null,
            day7Submitted: normalizeBoolean(item.day7_submitted),
          }
        : null,
      offerSummary: asRecord(offerSummary?.primary_offer)
        ? {
            primaryOffer: offerSummary?.primary_offer as OfferPayload,
          }
        : null,
      accessSummary: asRecord(item.access_summary) ? item.access_summary ?? null : null,
    };
  });
}

export function normalizeEnneagramHistoryCompare(
  history: Pick<MeAttemptsResponse, "history_compare"> | null | undefined
): EnneagramHistoryCompareSummary | null {
  const historyCompare = asRecord(history?.history_compare);
  const guard = asRecord(historyCompare?.compare_guard_v1);
  if (!guard) {
    return null;
  }

  return {
    canCompare: guard.can_compare === true,
    reason: normalizeText(guard.reason) || null,
    copyKey: normalizeText(guard.copy_key) || null,
    currentAttemptId: normalizeText(historyCompare?.current_attempt_id) || null,
    previousAttemptId: normalizeText(historyCompare?.previous_attempt_id) || null,
  };
}
