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

export type PublicRiasecFormProjection = {
  form_code?: string | null;
  code?: string | null;
  question_count?: number | string | null;
  questions_count?: number | string | null;
  estimated_minutes?: number | string | null;
  time_minutes?: number | string | null;
  form_kind?: string | null;
  kind?: string | null;
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

function positiveNumber(value: unknown): number | null {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
}

function normalizeProjectedForm(value: unknown): RiasecFormMeta | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const row = value as PublicRiasecFormProjection;
  const rawCode = row.form_code ?? row.code ?? null;
  const formCode = RIASEC_FORM_ALIAS_MAP.get(String(rawCode ?? "").trim().toLowerCase());
  if (!formCode) {
    return null;
  }

  const fallback = RIASEC_FORM_META[formCode];
  const kind = String(row.form_kind ?? row.kind ?? fallback.formKind).trim().toLowerCase();

  return {
    formCode,
    questionCount: positiveNumber(row.question_count ?? row.questions_count) ?? fallback.questionCount,
    estimatedMinutes: positiveNumber(row.estimated_minutes ?? row.time_minutes) ?? fallback.estimatedMinutes,
    formKind: kind === "enhanced" ? "enhanced" : fallback.formKind,
  };
}

export function listRiasecFormMetas(forms?: unknown): RiasecFormMeta[] {
  const projected = Array.isArray(forms)
    ? forms
        .map((form) => normalizeProjectedForm(form))
        .filter((form): form is RiasecFormMeta => Boolean(form))
    : [];
  const byCode = new Map<RiasecFormCode, RiasecFormMeta>();

  for (const form of projected) {
    byCode.set(form.formCode, form);
  }
  for (const formCode of RIASEC_FORM_CODES) {
    if (!byCode.has(formCode)) {
      byCode.set(formCode, RIASEC_FORM_META[formCode]);
    }
  }

  return RIASEC_FORM_CODES.map((formCode) => byCode.get(formCode)).filter((form): form is RiasecFormMeta => Boolean(form));
}

export function getRiasecVariantLabel(formCode: string | null | undefined, locale: Locale): string {
  const meta = resolveRiasecFormMeta(formCode);
  if (locale === "zh") {
    return meta.formKind === "enhanced" ? "140题增强版" : "60题标准版";
  }
  return meta.formKind === "enhanced" ? "140-question enhanced form" : "60-question standard form";
}

export function getRiasecVariantSummary(formCode: string | null | undefined, locale: Locale): string {
  const meta = resolveRiasecFormMeta(formCode);
  if (locale === "zh") {
    return meta.formKind === "enhanced"
      ? "140 题增强版，覆盖活动、环境与角色偏好，适合更完整地阅读职业兴趣结构。"
      : "60 题标准版，默认公开入口，适合快速建立 RIASEC 六维职业兴趣轮廓。";
  }

  return meta.formKind === "enhanced"
    ? "140-item enhanced form covering activity, environment, and role preference layers for a fuller interest profile."
    : "60-item standard form and default public entry for a focused RIASEC six-dimension career interest profile.";
}

export function getRiasecStartLabel(formCode: string | null | undefined, locale: Locale): string {
  const meta = resolveRiasecFormMeta(formCode);
  if (locale === "zh") {
    return meta.formKind === "enhanced" ? "开始增强版" : "开始标准版";
  }
  return meta.formKind === "enhanced" ? "Start enhanced form" : "Start standard form";
}

export function getRiasecQuestionSummary(locale: Locale): string {
  return locale === "zh" ? "60 / 140 题" : "60 / 140 questions";
}

export function getRiasecDurationSummary(locale: Locale): string {
  return locale === "zh" ? "约 8 / 18 分钟" : "about 8 / 18 minutes";
}

export function buildRiasecTakeHref(slug: string, locale: Locale, formCode: string | null | undefined): string {
  const canonicalSlug = resolveCanonicalSlug(slug) || slug;
  const params = new URLSearchParams({ form: normalizeRiasecFormCode(formCode) });
  return `${localizedPath(`/tests/${canonicalSlug}/take`, locale)}?${params.toString()}`;
}
