import { localizedPath, normalizeLocale, type Locale } from "@/lib/i18n/locales";
import { normalizeInternalHref } from "@/lib/url/safeContentUrls";

function normalizeCareerSlug(value: string): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

export function buildCareerJobFrontendUrl(locale: Locale | string, slug: string): string {
  const normalizedLocale = normalizeLocale(locale);
  return localizedPath(`/career/jobs/${normalizeCareerSlug(slug)}`, normalizedLocale);
}

export function buildCareerFamilyFrontendUrl(locale: Locale | string, slug: string): string {
  const normalizedLocale = normalizeLocale(locale);
  return localizedPath(`/career/family/${normalizeCareerSlug(slug)}`, normalizedLocale);
}

export function buildCareerRecommendationFrontendUrl(locale: Locale | string, slug: string): string {
  const normalizedLocale = normalizeLocale(locale);
  return localizedPath(`/career/recommendations/mbti/${normalizeCareerSlug(slug)}`, normalizedLocale);
}

export function normalizeCareerBundleCanonicalPath(
  locale: Locale | string,
  canonicalPath: string | null | undefined,
  fallbackPath: string
): string {
  const normalizedLocale = normalizeLocale(locale);
  const normalizedCanonical = normalizeInternalHref(canonicalPath);

  if (!normalizedCanonical) {
    return fallbackPath;
  }

  if (/^\/(en|zh)(\/|$)/i.test(normalizedCanonical)) {
    return normalizedCanonical;
  }

  if (normalizedCanonical.startsWith("/career/")) {
    return localizedPath(normalizedCanonical, normalizedLocale);
  }

  return normalizedCanonical.startsWith("/") ? normalizedCanonical : fallbackPath;
}
