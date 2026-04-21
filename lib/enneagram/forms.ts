import { resolveCanonicalSlug, SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import { localizedPath, type Locale } from "@/lib/i18n/locales";

export const ENNEAGRAM_SCALE_CODE = "ENNEAGRAM" as const;

export const ENNEAGRAM_FORM_CODES = ["enneagram_likert_105", "enneagram_forced_choice_144"] as const;
export type EnneagramFormCode = (typeof ENNEAGRAM_FORM_CODES)[number];

export const DEFAULT_ENNEAGRAM_FORM_CODE: EnneagramFormCode = "enneagram_likert_105";

export type EnneagramQuestionMode = "likert_105" | "forced_choice_144";

export type EnneagramFormMeta = {
  formCode: EnneagramFormCode;
  questionCount: number;
  estimatedMinutes: number;
  questionMode: EnneagramQuestionMode;
};

const ENNEAGRAM_FORM_META: Record<EnneagramFormCode, EnneagramFormMeta> = {
  enneagram_likert_105: {
    formCode: "enneagram_likert_105",
    questionCount: 105,
    estimatedMinutes: 12,
    questionMode: "likert_105",
  },
  enneagram_forced_choice_144: {
    formCode: "enneagram_forced_choice_144",
    questionCount: 144,
    estimatedMinutes: 18,
    questionMode: "forced_choice_144",
  },
};

const ENNEAGRAM_FORM_ALIAS_MAP = new Map<string, EnneagramFormCode>([
  ["enneagram_likert_105", "enneagram_likert_105"],
  ["likert_105", "enneagram_likert_105"],
  ["105", "enneagram_likert_105"],
  ["likert", "enneagram_likert_105"],
  ["default", "enneagram_likert_105"],
  ["enneagram_forced_choice_144", "enneagram_forced_choice_144"],
  ["forced_choice_144", "enneagram_forced_choice_144"],
  ["forced-choice-144", "enneagram_forced_choice_144"],
  ["pair_144", "enneagram_forced_choice_144"],
  ["144", "enneagram_forced_choice_144"],
]);

export function isEnneagramScaleCode(scaleCode: string | null | undefined): boolean {
  return String(scaleCode ?? "").trim().toUpperCase() === ENNEAGRAM_SCALE_CODE;
}

export function isEnneagramSlug(slug: string | null | undefined): boolean {
  const canonical = resolveCanonicalSlug(String(slug ?? "").trim());
  return canonical === SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM;
}

export function normalizeEnneagramFormCode(value: string | null | undefined): EnneagramFormCode {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized) {
    return DEFAULT_ENNEAGRAM_FORM_CODE;
  }

  return ENNEAGRAM_FORM_ALIAS_MAP.get(normalized) ?? DEFAULT_ENNEAGRAM_FORM_CODE;
}

export function resolveEnneagramFormMeta(value: string | null | undefined): EnneagramFormMeta {
  const formCode = normalizeEnneagramFormCode(value);
  return ENNEAGRAM_FORM_META[formCode];
}

export function listEnneagramFormMetas(): EnneagramFormMeta[] {
  return ENNEAGRAM_FORM_CODES.map((formCode) => ENNEAGRAM_FORM_META[formCode]);
}

export function getEnneagramVariantName(formCode: string | null | undefined): string {
  const meta = resolveEnneagramFormMeta(formCode);
  return meta.formCode === "enneagram_forced_choice_144" ? "Enneagram 144Q" : "Enneagram 105Q";
}

export function getEnneagramVariantDescriptor(formCode: string | null | undefined, locale: Locale): string {
  const meta = resolveEnneagramFormMeta(formCode);
  if (locale === "zh") {
    return meta.formCode === "enneagram_forced_choice_144" ? "二选一迫选版" : "五点量表版";
  }
  return meta.formCode === "enneagram_forced_choice_144" ? "Forced-choice pairs" : "Five-point Likert";
}

export function getEnneagramVariantLabel(formCode: string | null | undefined, locale: Locale): string {
  return `${getEnneagramVariantName(formCode)} · ${getEnneagramVariantDescriptor(formCode, locale)}`;
}

export function getEnneagramVariantSummary(formCode: string | null | undefined, locale: Locale): string {
  const meta = resolveEnneagramFormMeta(formCode);
  if (locale === "zh") {
    return meta.formCode === "enneagram_forced_choice_144"
      ? `${meta.questionCount} 题，约 ${meta.estimatedMinutes} 分钟。每题在两个描述中选择更贴近你的一个，适合更正式的迫选版本。`
      : `${meta.questionCount} 题，约 ${meta.estimatedMinutes} 分钟。使用五点量表回答每个描述，适合标准自评入口。`;
  }

  return meta.formCode === "enneagram_forced_choice_144"
    ? `${meta.questionCount} questions, about ${meta.estimatedMinutes} minutes. Choose the closer statement in each pair for the formal forced-choice form.`
    : `${meta.questionCount} questions, about ${meta.estimatedMinutes} minutes. Rate each statement on a five-point scale for the standard self-report form.`;
}

export function getEnneagramStartLabel(formCode: string | null | undefined, locale: Locale): string {
  const meta = resolveEnneagramFormMeta(formCode);
  if (locale === "zh") {
    return meta.formCode === "enneagram_forced_choice_144" ? "开始二选一版" : "开始量表版";
  }
  return meta.formCode === "enneagram_forced_choice_144" ? "Start forced-choice" : "Start Likert form";
}

export function getEnneagramDurationSummary(locale: Locale): string {
  return listEnneagramFormMetas()
    .map((form) => (locale === "zh" ? `${form.estimatedMinutes}分钟` : `${form.estimatedMinutes} min`))
    .join(" / ");
}

export function getEnneagramQuestionSummary(locale: Locale): string {
  return listEnneagramFormMetas()
    .map((form) => (locale === "zh" ? `${form.questionCount}题` : `${form.questionCount}Q`))
    .join(" / ");
}

export function buildEnneagramTakeHref(slug: string, locale: Locale, formCode: string | null | undefined): string {
  const canonicalSlug = resolveCanonicalSlug(slug) || slug;
  const params = new URLSearchParams({ form: normalizeEnneagramFormCode(formCode) });
  return `${localizedPath(`/tests/${canonicalSlug}/take`, locale)}?${params.toString()}`;
}
