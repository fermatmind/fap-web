import type { MbtiFormSummaryV1Raw, PublicFormSummaryV1Raw } from "@/lib/api/v0_3";

export type PublicFormSummaryV1 = {
  formCode: string;
  label: string;
  shortLabel: string;
  questionCount: number;
  estimatedMinutes: number;
  scaleCode: string;
};

export type MbtiFormSummaryV1 = PublicFormSummaryV1;

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

export function normalizePublicFormSummary(raw: PublicFormSummaryV1Raw | null | undefined): PublicFormSummaryV1 | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const formCode = normalizeText(raw.form_code);
  const label = normalizeText(raw.label);
  const shortLabel = normalizeText(raw.short_label);
  const scaleCode = normalizeText(raw.scale_code).toUpperCase() || "MBTI";
  const questionCount = Number(raw.question_count ?? 0);
  const estimatedMinutes = Number(raw.estimated_minutes ?? 0);

  if (!formCode || !label || !shortLabel || !Number.isFinite(questionCount) || questionCount <= 0) {
    return null;
  }

  return {
    formCode,
    label,
    shortLabel,
    questionCount,
    estimatedMinutes: Number.isFinite(estimatedMinutes) && estimatedMinutes > 0 ? estimatedMinutes : 0,
    scaleCode,
  };
}

function resolveScaleDisplayName(scaleCode: string, locale?: "en" | "zh"): string {
  if (scaleCode === "BIG5_OCEAN") {
    return locale === "zh" ? "大五人格" : "Big Five";
  }

  if (scaleCode === "ENNEAGRAM") {
    return locale === "zh" ? "九型人格" : "Enneagram";
  }

  return scaleCode || "MBTI";
}

export function buildPublicFormDisplayLabel(
  summary: PublicFormSummaryV1 | null | undefined,
  options?: { short?: boolean; includeScaleCode?: boolean; locale?: "en" | "zh" }
): string | null {
  if (!summary) {
    return null;
  }

  const label = options?.short ? summary.shortLabel : summary.label;
  if (!label) {
    return null;
  }

  if (options?.includeScaleCode === false) {
    return label;
  }

  return `${resolveScaleDisplayName(summary.scaleCode, options?.locale)} · ${label}`;
}

export function normalizeMbtiFormSummary(raw: MbtiFormSummaryV1Raw | null | undefined): MbtiFormSummaryV1 | null {
  return normalizePublicFormSummary(raw);
}

export function buildMbtiFormDisplayLabel(
  summary: MbtiFormSummaryV1 | null | undefined,
  options?: { short?: boolean; includeScaleCode?: boolean; locale?: "en" | "zh" }
): string | null {
  return buildPublicFormDisplayLabel(summary, options);
}
