import { localizedPath, normalizeLocale, type Locale } from "@/lib/i18n/locales";

function normalizeCareerSlug(value: string): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

export function buildCareerJobFrontendUrl(locale: Locale | string, slug: string): string {
  const normalizedLocale = normalizeLocale(locale);
  return localizedPath(`/career/jobs/${normalizeCareerSlug(slug)}`, normalizedLocale);
}

export function buildCareerRecommendationFrontendUrl(locale: Locale | string, slug: string): string {
  const normalizedLocale = normalizeLocale(locale);
  return localizedPath(`/career/recommendations/mbti/${normalizeCareerSlug(slug)}`, normalizedLocale);
}
