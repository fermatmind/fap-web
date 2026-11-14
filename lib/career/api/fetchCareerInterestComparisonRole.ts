import { apiClient } from "@/lib/api-client";
import { CAREER_DETAIL_PROJECTION_CACHE_VERSION } from "@/lib/career/api/fetchCareerJobBundle";
import type { CareerJobBundleResponseRaw } from "@/lib/career/api/types";
import { isSafeCareerJobSlug } from "@/lib/career/slugSafety";
import { toApiLocale, type DisplayLocale } from "@/lib/i18n/locales";
import { isAuthoritativePublicAbsence } from "@/lib/public-content/readError";

/** Same Current reader as Career detail, with the existing browser comparison's
 * no-store semantics. Authored Cache-Control/Pragma headers are SSR-only. */
export async function fetchCareerInterestComparisonRole({ locale, slug, sameOrigin = false }: { locale: DisplayLocale; slug: string; sameOrigin?: boolean }): Promise<CareerJobBundleResponseRaw | null> {
  if (!isSafeCareerJobSlug(slug)) return null;
  const query = new URLSearchParams({ locale: locale === "zh-TW" ? locale : toApiLocale(locale), projection_contract: CAREER_DETAIL_PROJECTION_CACHE_VERSION });
  const path = `/v0.5/career/jobs/${encodeURIComponent(slug)}?${query}`;
  const url = sameOrigin && typeof window !== "undefined" ? new URL(`/api${path}`, window.location.origin).href : path;
  try {
    return await apiClient.getPublic<CareerJobBundleResponseRaw>(
      url,
      { locale, skipAuth: true, timeoutMs: 12_000, cache: "no-store" },
    );
  } catch (error) {
    if (isAuthoritativePublicAbsence(error)) return null;
    throw error;
  }
}
