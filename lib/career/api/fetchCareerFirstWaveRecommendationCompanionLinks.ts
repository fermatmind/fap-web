import { ApiError, apiClient } from "@/lib/api-client";
import type { CareerFirstWaveRecommendationCompanionLinksResponseRaw } from "@/lib/career/api/types";
import { toApiLocale, type Locale } from "@/lib/i18n/locales";
import { PUBLIC_API_CACHE_OPTIONS } from "@/lib/publicApiCache";

type FetchCareerFirstWaveRecommendationCompanionLinksInput = {
  locale: Locale | string;
  type: string;
};

function buildQuery(locale: Locale | string): string {
  const query = new URLSearchParams();
  query.set("locale", toApiLocale(locale));
  return `?${query.toString()}`;
}

export async function fetchCareerFirstWaveRecommendationCompanionLinks(
  input: FetchCareerFirstWaveRecommendationCompanionLinksInput
): Promise<CareerFirstWaveRecommendationCompanionLinksResponseRaw | null> {
  const normalizedType = String(input.type ?? "").trim().toLowerCase();
  if (!normalizedType) {
    return null;
  }

  try {
    return await apiClient.get<CareerFirstWaveRecommendationCompanionLinksResponseRaw>(
      `/v0.5/career/first-wave/recommendations/mbti/${encodeURIComponent(normalizedType)}/companion-links${buildQuery(input.locale)}`,
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
