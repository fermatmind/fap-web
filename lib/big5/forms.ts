import { resolveCanonicalSlug, SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import { localizedPath, type Locale } from "@/lib/i18n/locales";

export const BIG5_FORM_CODES = ["big5_120", "big5_90"] as const;
export type Big5FormCode = (typeof BIG5_FORM_CODES)[number];

export const DEFAULT_BIG5_FORM_CODE: Big5FormCode = "big5_120";

type Big5FormMeta = {
  formCode: Big5FormCode;
  questionCount: number;
  estimatedMinutes: number;
};

const BIG5_FORM_META: Record<Big5FormCode, Big5FormMeta> = {
  big5_120: {
    formCode: "big5_120",
    questionCount: 120,
    estimatedMinutes: 20,
  },
  big5_90: {
    formCode: "big5_90",
    questionCount: 90,
    estimatedMinutes: 15,
  },
};

const BIG5_FORM_ALIAS_MAP = new Map<string, Big5FormCode>([
  ["big5_120", "big5_120"],
  ["120", "big5_120"],
  ["big5-120", "big5_120"],
  ["standard_120", "big5_120"],
  ["default", "big5_120"],
  ["big5_90", "big5_90"],
  ["90", "big5_90"],
  ["big5-90", "big5_90"],
  ["short_90", "big5_90"],
]);

export function isBig5ScaleCode(scaleCode: string | null | undefined): boolean {
  return String(scaleCode ?? "").trim().toUpperCase() === "BIG5_OCEAN";
}

export function isBig5Slug(slug: string | null | undefined): boolean {
  const canonical = resolveCanonicalSlug(String(slug ?? "").trim());
  return canonical === SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN;
}

export function normalizeBig5FormCode(value: string | null | undefined): Big5FormCode {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized) {
    return DEFAULT_BIG5_FORM_CODE;
  }

  return BIG5_FORM_ALIAS_MAP.get(normalized) ?? DEFAULT_BIG5_FORM_CODE;
}

export function resolveBig5FormMeta(value: string | null | undefined): Big5FormMeta {
  const formCode = normalizeBig5FormCode(value);
  return BIG5_FORM_META[formCode];
}

export function listBig5FormMetas(): Big5FormMeta[] {
  return BIG5_FORM_CODES.map((formCode) => BIG5_FORM_META[formCode]);
}

export function getBig5StartLabel(formCode: string | null | undefined, locale: Locale): string {
  const meta = resolveBig5FormMeta(formCode);
  if (locale === "zh") {
    return `${meta.questionCount}题开始测试`;
  }
  return `Start ${meta.questionCount}-question test`;
}

export function getBig5QuestionSummary(locale: Locale): string {
  return listBig5FormMetas()
    .map((form) => (locale === "zh" ? `${form.questionCount}题` : `${form.questionCount} questions`))
    .join(" / ");
}

export function getBig5DurationSummary(locale: Locale): string {
  return listBig5FormMetas()
    .map((form) => (locale === "zh" ? `${form.estimatedMinutes}分钟` : `${form.estimatedMinutes} min`))
    .join(" / ");
}

export function buildBig5TakeHref(slug: string, locale: Locale, formCode: string | null | undefined): string {
  const canonicalSlug = resolveCanonicalSlug(slug) || slug;
  const params = new URLSearchParams({ form: normalizeBig5FormCode(formCode) });
  return `${localizedPath(`/tests/${canonicalSlug}/take`, locale)}?${params.toString()}`;
}
