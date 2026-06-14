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

export type MbtiComparisonBaseType = (typeof MBTI_COMPARISON_BASE_TYPES)[number];

export function normalizePersonalityComparisonSlug(value: string | null | undefined): string | null {
  const normalized = String(value ?? "").trim().toLowerCase();
  const match = normalized.match(PERSONALITY_COMPARISON_RE);
  const base = match?.[1]?.toLowerCase();

  return base && MBTI_COMPARISON_BASE_SET.has(base) ? `${base}-a-vs-${base}-t` : null;
}

export function isPersonalityComparisonSlug(value: string | null | undefined): boolean {
  return normalizePersonalityComparisonSlug(value) !== null;
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
