import { ApiError, apiClient } from "@/lib/api-client";
import type { CareerRecommendationBundleResponseRaw } from "@/lib/career/api/types";
import { toApiLocale, type Locale } from "@/lib/i18n/locales";
import { PUBLIC_API_CACHE_OPTIONS } from "@/lib/publicApiCache";

type FetchCareerRecommendationBundleInput = {
  locale: Locale | string;
  type: string;
};

function buildQuery(locale: Locale | string): string {
  const query = new URLSearchParams();
  query.set("locale", toApiLocale(locale));
  return `?${query.toString()}`;
}

export async function fetchCareerRecommendationBundle(
  input: FetchCareerRecommendationBundleInput
): Promise<CareerRecommendationBundleResponseRaw | null> {
  const normalizedType = String(input.type ?? "").trim().toLowerCase();
  if (!normalizedType) {
    return null;
  }

  try {
    return await apiClient.get<CareerRecommendationBundleResponseRaw>(
      `/v0.5/career/recommendations/mbti/${encodeURIComponent(normalizedType)}${buildQuery(input.locale)}`,
      {
        locale: input.locale,
        skipAuth: true,
        ...PUBLIC_API_CACHE_OPTIONS,
      }
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    return null;
  }
}
