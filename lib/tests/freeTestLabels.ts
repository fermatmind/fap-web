import { SCALE_CANONICAL_SLUG_MAP, resolveCanonicalSlug } from "@/lib/assessmentSlugMap";
import type { Locale } from "@/lib/i18n/locales";

type FreeTestLabelInput = {
  locale: Locale;
  scaleCode?: string | null;
  slug?: string | null;
  title?: string | null;
  fallback: string;
};

function normalize(value: string | null | undefined): string {
  return String(value ?? "").trim().toLowerCase();
}

function resolveZhFreeTestName({
  scaleCode,
  slug,
  title,
}: Pick<FreeTestLabelInput, "scaleCode" | "slug" | "title">): string | null {
  const normalizedScaleCode = String(scaleCode ?? "").trim().toUpperCase();
  const canonicalSlug = resolveCanonicalSlug(String(slug ?? "").trim());
  const haystack = `${normalize(slug)} ${normalize(title)}`;

  if (normalizedScaleCode === "MBTI" || canonicalSlug === SCALE_CANONICAL_SLUG_MAP.MBTI || haystack.includes("mbti")) {
    return "MBTI";
  }
  if (normalizedScaleCode === "BIG5_OCEAN" || canonicalSlug === SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN || haystack.includes("big-five") || haystack.includes("大五")) {
    return "大五人格";
  }
  if (normalizedScaleCode === "ENNEAGRAM" || canonicalSlug === SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM || haystack.includes("enneagram") || haystack.includes("九型")) {
    return "九型人格";
  }
  if (normalizedScaleCode === "RIASEC" || canonicalSlug === SCALE_CANONICAL_SLUG_MAP.RIASEC || haystack.includes("holland") || haystack.includes("riasec") || haystack.includes("霍兰德")) {
    return "霍兰德职业兴趣";
  }
  if (normalizedScaleCode === "IQ_RAVEN" || canonicalSlug === SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN || haystack.includes("iq") || haystack.includes("智商")) {
    return "智商";
  }
  if (normalizedScaleCode === "EQ_60" || normalizedScaleCode === "EQ_SJT_16" || canonicalSlug === SCALE_CANONICAL_SLUG_MAP.EQ_60 || haystack.includes("eq") || haystack.includes("情商")) {
    return "情商";
  }

  return null;
}

export function getFreeTestStartLabel(input: FreeTestLabelInput): string {
  if (input.locale !== "zh") return input.fallback;

  const name = resolveZhFreeTestName(input);
  if (!name) return input.fallback;

  return name === "MBTI" ? "开始 MBTI 免费测试" : `开始${name}免费测试`;
}

export function getFreeTestAnchorLabel(input: FreeTestLabelInput): string {
  if (input.locale !== "zh") return input.fallback;

  const name = resolveZhFreeTestName(input);
  if (!name) return input.fallback;

  return name === "MBTI" ? "MBTI免费测试" : `${name}免费测试`;
}
