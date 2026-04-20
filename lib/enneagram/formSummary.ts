import type { EnneagramFormSummaryV1Raw } from "@/lib/api/v0_3";
import {
  buildPublicFormDisplayLabel,
  normalizePublicFormSummary,
  type PublicFormSummaryV1,
} from "@/lib/mbti/formSummary";

export type EnneagramFormSummaryV1 = PublicFormSummaryV1;

export function normalizeEnneagramFormSummary(
  raw: EnneagramFormSummaryV1Raw | null | undefined
): EnneagramFormSummaryV1 | null {
  const normalized = normalizePublicFormSummary(raw);
  if (!normalized) {
    return null;
  }

  if (normalized.scaleCode !== "ENNEAGRAM") {
    return null;
  }

  return normalized;
}

export function buildEnneagramFormDisplayLabel(
  summary: EnneagramFormSummaryV1 | null | undefined,
  options?: { short?: boolean; includeScaleCode?: boolean; locale?: "en" | "zh" }
): string | null {
  return buildPublicFormDisplayLabel(summary, options);
}
