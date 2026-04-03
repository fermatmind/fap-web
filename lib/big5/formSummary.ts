import type { Big5FormSummaryV1Raw } from "@/lib/api/v0_3";
import {
  buildPublicFormDisplayLabel,
  normalizePublicFormSummary,
  type PublicFormSummaryV1,
} from "@/lib/mbti/formSummary";

export type Big5FormSummaryV1 = PublicFormSummaryV1;

export function normalizeBig5FormSummary(raw: Big5FormSummaryV1Raw | null | undefined): Big5FormSummaryV1 | null {
  const normalized = normalizePublicFormSummary(raw);
  if (!normalized) {
    return null;
  }

  if (normalized.scaleCode !== "BIG5_OCEAN") {
    return null;
  }

  return normalized;
}

export function buildBig5FormDisplayLabel(
  summary: Big5FormSummaryV1 | null | undefined,
  options?: { short?: boolean; includeScaleCode?: boolean; locale?: "en" | "zh" }
): string | null {
  return buildPublicFormDisplayLabel(summary, options);
}
