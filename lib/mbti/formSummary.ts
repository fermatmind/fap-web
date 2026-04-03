import type { MbtiFormSummaryV1Raw } from "@/lib/api/v0_3";

export type MbtiFormSummaryV1 = {
  formCode: string;
  label: string;
  shortLabel: string;
  questionCount: number;
  estimatedMinutes: number;
  scaleCode: string;
};

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

export function normalizeMbtiFormSummary(raw: MbtiFormSummaryV1Raw | null | undefined): MbtiFormSummaryV1 | null {
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

export function buildMbtiFormDisplayLabel(
  summary: MbtiFormSummaryV1 | null | undefined,
  options?: { short?: boolean; includeScaleCode?: boolean }
): string | null {
  if (!summary) {
    return null;
  }

  const label = options?.short ? summary.shortLabel : summary.label;
  if (!label) {
    return null;
  }

  return options?.includeScaleCode === false ? label : `${summary.scaleCode} · ${label}`;
}
