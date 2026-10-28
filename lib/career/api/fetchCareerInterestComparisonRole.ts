import { apiClient } from "@/lib/api-client";
import { CAREER_DETAIL_PROJECTION_CACHE_VERSION } from "@/lib/career/api/fetchCareerJobBundle";
import type { CareerJobBundleResponseRaw } from "@/lib/career/api/types";
import { isSafeCareerJobSlug } from "@/lib/career/slugSafety";
import { toApiLocale, type Locale } from "@/lib/i18n/locales";
import { isAuthoritativePublicAbsence } from "@/lib/public-content/readError";

/** Same Current reader as Career detail, with the existing browser comparison's
 * no-store semantics. Authored Cache-Control/Pragma headers are SSR-only. */
export async function fetchCareerInterestComparisonRole({ locale, slug }: { locale: Locale; slug: string }): Promise<CareerJobBundleResponseRaw | null> {
  if (!isSafeCareerJobSlug(slug)) return null;
  const query = new URLSearchParams({ locale: toApiLocale(locale), projection_contract: CAREER_DETAIL_PROJECTION_CACHE_VERSION });
  try {
    return await apiClient.getPublic<CareerJobBundleResponseRaw>(
      `/v0.5/career/jobs/${encodeURIComponent(slug)}?${query}`,
      { locale, skipAuth: true, timeoutMs: 12_000, cache: "no-store" },
    );
  } catch (error) {
    if (isAuthoritativePublicAbsence(error)) return null;
    throw error;
  }
}
