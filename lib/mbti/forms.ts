import { resolveCanonicalSlug, SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import { localizedPath, type Locale } from "@/lib/i18n/locales";

export const MBTI_FORM_CODES = ["mbti_144", "mbti_93"] as const;
export type MbtiFormCode = (typeof MBTI_FORM_CODES)[number];

export const DEFAULT_MBTI_FORM_CODE: MbtiFormCode = "mbti_144";

type MbtiFormMeta = {
  formCode: MbtiFormCode;
  questionCount: number;
  estimatedMinutes: number;
};

const MBTI_FORM_META: Record<MbtiFormCode, MbtiFormMeta> = {
  mbti_144: {
    formCode: "mbti_144",
    questionCount: 144,
    estimatedMinutes: 15,
  },
  mbti_93: {
    formCode: "mbti_93",
    questionCount: 93,
    estimatedMinutes: 10,
  },
};

const MBTI_FORM_ALIAS_MAP = new Map<string, MbtiFormCode>([
  ["mbti_144", "mbti_144"],
  ["144", "mbti_144"],
  ["standard_144", "mbti_144"],
  ["mbti_93", "mbti_93"],
  ["93", "mbti_93"],
  ["standard_93", "mbti_93"],
]);

export function isMbtiScaleCode(scaleCode: string | null | undefined): boolean {
  return String(scaleCode ?? "").trim().toUpperCase() === "MBTI";
}

export function isMbtiSlug(slug: string | null | undefined): boolean {
  const canonical = resolveCanonicalSlug(String(slug ?? "").trim());
  return canonical === SCALE_CANONICAL_SLUG_MAP.MBTI;
}

export function normalizeMbtiFormCode(value: string | null | undefined): MbtiFormCode {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized) {
    return DEFAULT_MBTI_FORM_CODE;
  }

  return MBTI_FORM_ALIAS_MAP.get(normalized) ?? DEFAULT_MBTI_FORM_CODE;
}

export function resolveMbtiFormMeta(value: string | null | undefined): MbtiFormMeta {
  const formCode = normalizeMbtiFormCode(value);
  return MBTI_FORM_META[formCode];
}

export function listMbtiFormMetas(): MbtiFormMeta[] {
  return MBTI_FORM_CODES.map((formCode) => MBTI_FORM_META[formCode]);
}

export function getMbtiVariantName(formCode: string | null | undefined): string {
  const meta = resolveMbtiFormMeta(formCode);
  return `MBTI ${meta.questionCount}Q`;
}

export function getMbtiVariantDescriptor(formCode: string | null | undefined, locale: Locale): string {
  const meta = resolveMbtiFormMeta(formCode);
  if (locale === "zh") {
    return meta.formCode === "mbti_93" ? "快速版" : "深度版";
  }
  return meta.formCode === "mbti_93" ? "Quick Read" : "Deep Profile";
}

export function getMbtiVariantLabel(formCode: string | null | undefined, locale: Locale): string {
  return `${getMbtiVariantName(formCode)} · ${getMbtiVariantDescriptor(formCode, locale)}`;
}

export function getMbtiVariantSummary(formCode: string | null | undefined, locale: Locale): string {
  const meta = resolveMbtiFormMeta(formCode);
  if (locale === "zh") {
    return meta.formCode === "mbti_93"
      ? `约 ${meta.estimatedMinutes} 分钟，先读懂人格轮廓与协作风格。`
      : `约 ${meta.estimatedMinutes} 分钟，得到更完整的画像与场景解释。`;
  }
  return meta.formCode === "mbti_93"
    ? `About ${meta.estimatedMinutes} minutes for a fast read on type pattern and collaboration style.`
    : `About ${meta.estimatedMinutes} minutes for a deeper profile with fuller scene-based interpretation.`;
}

export function getMbtiStartLabel(formCode: string | null | undefined, locale: Locale): string {
  const meta = resolveMbtiFormMeta(formCode);
  if (locale === "zh") {
    return meta.formCode === "mbti_93" ? "开始快速版" : "开始深度版";
  }
  return meta.formCode === "mbti_93" ? "Start Quick Read" : "Start Deep Profile";
}

export function getMbtiQuestionSummary(locale: Locale): string {
  return listMbtiFormMetas()
    .map((form) => (locale === "zh" ? `${form.questionCount}题` : `${form.questionCount} questions`))
    .join(" / ");
}

export function getMbtiDurationSummary(locale: Locale): string {
  return listMbtiFormMetas()
    .map((form) => (locale === "zh" ? `${form.estimatedMinutes}分钟` : `${form.estimatedMinutes} min`))
    .join(" / ");
}

export function buildMbtiTakeHref(slug: string, locale: Locale, formCode: string | null | undefined): string {
  const canonicalSlug = resolveCanonicalSlug(slug) || slug;
  const params = new URLSearchParams({ form: normalizeMbtiFormCode(formCode) });
  return `${localizedPath(`/tests/${canonicalSlug}/take`, locale)}?${params.toString()}`;
}
