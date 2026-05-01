import { localizedPath, normalizeLocale, type Locale } from "@/lib/i18n/locales";
import { normalizeInternalHref } from "@/lib/url/safeContentUrls";

function normalizeCareerSlug(value: string): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function stripLocalePrefix(path: string): string {
  return path.replace(/^\/(?:en|zh)(?=\/|$)/i, "") || "/";
}

function allowedCareerRoutePrefix(path: string): string | null {
  const normalized = stripLocalePrefix(path);

  if (normalized.startsWith("/career/jobs/")) {
    return "/career/jobs/";
  }

  if (normalized.startsWith("/career/family/")) {
    return "/career/family/";
  }

  if (normalized.startsWith("/career/recommendations/mbti/")) {
    return "/career/recommendations/mbti/";
  }

  if (normalized.startsWith("/tests/")) {
    return "/tests/";
  }

  if (normalized.startsWith("/topics/")) {
    return "/topics/";
  }

  return null;
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

  const allowedPrefix = allowedCareerRoutePrefix(fallbackPath);
  const normalizedCanonicalPath = stripLocalePrefix(normalizedCanonical);
  if (!allowedPrefix || !normalizedCanonicalPath.startsWith(allowedPrefix)) {
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
