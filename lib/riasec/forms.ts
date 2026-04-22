import { resolveCanonicalSlug, SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import { localizedPath, type Locale } from "@/lib/i18n/locales";

export const RIASEC_SCALE_CODE = "RIASEC" as const;

export const RIASEC_FORM_CODES = ["riasec_60", "riasec_140"] as const;
export type RiasecFormCode = (typeof RIASEC_FORM_CODES)[number];

export const DEFAULT_RIASEC_FORM_CODE: RiasecFormCode = "riasec_60";

export type RiasecFormMeta = {
  formCode: RiasecFormCode;
  questionCount: number;
  estimatedMinutes: number;
  formKind: "standard" | "enhanced";
};

const RIASEC_FORM_META: Record<RiasecFormCode, RiasecFormMeta> = {
  riasec_60: {
    formCode: "riasec_60",
    questionCount: 60,
    estimatedMinutes: 8,
    formKind: "standard",
  },
  riasec_140: {
    formCode: "riasec_140",
    questionCount: 140,
    estimatedMinutes: 18,
    formKind: "enhanced",
  },
};

const RIASEC_FORM_ALIAS_MAP = new Map<string, RiasecFormCode>([
  ["riasec_60", "riasec_60"],
  ["60", "riasec_60"],
  ["standard_60", "riasec_60"],
  ["public_60", "riasec_60"],
  ["default", "riasec_60"],
  ["riasec_140", "riasec_140"],
  ["140", "riasec_140"],
  ["enhanced_140", "riasec_140"],
  ["expert_140", "riasec_140"],
]);

export function isRiasecScaleCode(scaleCode: string | null | undefined): boolean {
  return String(scaleCode ?? "").trim().toUpperCase() === RIASEC_SCALE_CODE;
}

export function isRiasecSlug(slug: string | null | undefined): boolean {
  const canonical = resolveCanonicalSlug(String(slug ?? "").trim());
  return canonical === SCALE_CANONICAL_SLUG_MAP.RIASEC;
}

export function normalizeRiasecFormCode(value: string | null | undefined): RiasecFormCode {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized) {
    return DEFAULT_RIASEC_FORM_CODE;
  }

  return RIASEC_FORM_ALIAS_MAP.get(normalized) ?? DEFAULT_RIASEC_FORM_CODE;
}

export function resolveRiasecFormMeta(value: string | null | undefined): RiasecFormMeta {
  const formCode = normalizeRiasecFormCode(value);
  return RIASEC_FORM_META[formCode];
}

export function getRiasecVariantLabel(formCode: string | null | undefined, locale: Locale): string {
  const meta = resolveRiasecFormMeta(formCode);
  if (locale === "zh") {
    return meta.formKind === "enhanced" ? "140题增强版" : "60题标准版";
  }
  return meta.formKind === "enhanced" ? "140-question enhanced form" : "60-question standard form";
}

export function buildRiasecTakeHref(slug: string, locale: Locale, formCode: string | null | undefined): string {
  const canonicalSlug = resolveCanonicalSlug(slug) || slug;
  const params = new URLSearchParams({ form: normalizeRiasecFormCode(formCode) });
  return `${localizedPath(`/tests/${canonicalSlug}/take`, locale)}?${params.toString()}`;
}
