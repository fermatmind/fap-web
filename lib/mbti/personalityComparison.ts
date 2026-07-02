import type { CmsPersonalityProfileSummary } from "@/lib/cms/personality";
import { localizedPath, normalizeLocale, type Locale } from "@/lib/i18n/locales";

export const MBTI_COMPARISON_BASE_TYPES = [
  "intj",
  "intp",
  "entj",
  "entp",
  "infj",
  "infp",
  "enfj",
  "enfp",
  "istj",
  "isfj",
  "estj",
  "esfj",
  "istp",
  "isfp",
  "estp",
  "esfp",
] as const;

const MBTI_COMPARISON_BASE_SET = new Set<string>(MBTI_COMPARISON_BASE_TYPES);
const PERSONALITY_COMPARISON_RE = /^([a-z]{4})-a-vs-\1-t$/i;
const PERSONALITY_CROSS_TYPE_COMPARISON_RE = /^([a-z]{4})-vs-([a-z]{4})$/i;

export type MbtiComparisonBaseType = (typeof MBTI_COMPARISON_BASE_TYPES)[number];

export function normalizePersonalityComparisonSlug(value: string | null | undefined): string | null {
  const normalized = String(value ?? "").trim().toLowerCase();
  const atMatch = normalized.match(PERSONALITY_COMPARISON_RE);
  const atBase = atMatch?.[1]?.toLowerCase();
  if (atBase && MBTI_COMPARISON_BASE_SET.has(atBase)) {
    return `${atBase}-a-vs-${atBase}-t`;
  }

  const crossMatch = normalized.match(PERSONALITY_CROSS_TYPE_COMPARISON_RE);
  const left = crossMatch?.[1]?.toLowerCase();
  const right = crossMatch?.[2]?.toLowerCase();
  if (left && right && left !== right && MBTI_COMPARISON_BASE_SET.has(left) && MBTI_COMPARISON_BASE_SET.has(right)) {
    return `${left}-vs-${right}`;
  }

  return null;
}

export function isPersonalityComparisonSlug(value: string | null | undefined): boolean {
  return normalizePersonalityComparisonSlug(value) !== null;
}

export function isPersonalityAtComparisonSlug(value: string | null | undefined): boolean {
  const normalized = String(value ?? "").trim().toLowerCase();
  return normalizePersonalityComparisonSlug(normalized) === normalized && PERSONALITY_COMPARISON_RE.test(normalized);
}

export function isPersonalityCrossTypeComparisonSlug(value: string | null | undefined): boolean {
  const normalized = String(value ?? "").trim().toLowerCase();
  return normalizePersonalityComparisonSlug(normalized) === normalized && PERSONALITY_CROSS_TYPE_COMPARISON_RE.test(normalized);
}

export function buildPersonalityComparisonSlug(baseTypeCode: string): string | null {
  const base = String(baseTypeCode ?? "").trim().toLowerCase();
  return MBTI_COMPARISON_BASE_SET.has(base) ? `${base}-a-vs-${base}-t` : null;
}

export function buildPersonalityComparisonFrontendUrl(locale: Locale | string, slug: string): string {
  const normalizedSlug = normalizePersonalityComparisonSlug(slug) ?? String(slug ?? "").trim().toLowerCase();
  return localizedPath(`/personality/${normalizedSlug}`, normalizeLocale(locale));
}

export function buildPersonalityComparisonSlugsFromProfiles(profiles: CmsPersonalityProfileSummary[]): string[] {
  const variantsByBase = new Map<string, Set<string>>();

  for (const profile of profiles) {
    if (!profile.isIndexable || !profile.publicRouteSlug) {
      continue;
    }

    const base = String(profile.baseTypeCode || profile.typeCode || "").trim().toLowerCase();
    const variant = String(profile.variantCode || "").trim().toLowerCase();
    if (!MBTI_COMPARISON_BASE_SET.has(base) || (variant !== "a" && variant !== "t")) {
      continue;
    }

    const variants = variantsByBase.get(base) ?? new Set<string>();
    variants.add(variant);
    variantsByBase.set(base, variants);
  }

  return MBTI_COMPARISON_BASE_TYPES
    .filter((base) => variantsByBase.get(base)?.has("a") && variantsByBase.get(base)?.has("t"))
    .map((base) => `${base}-a-vs-${base}-t`);
}
