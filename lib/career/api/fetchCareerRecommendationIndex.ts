import { ApiError, apiClient } from "@/lib/api-client";
import type { CareerRecommendationIndexResponseRaw } from "@/lib/career/api/types";
import { toApiLocale, type Locale } from "@/lib/i18n/locales";

type FetchCareerRecommendationIndexInput = {
  locale: Locale | string;
};

function buildQuery(locale: Locale | string): string {
  const query = new URLSearchParams();
  query.set("locale", toApiLocale(locale));
  return `?${query.toString()}`;
}

export async function fetchCareerRecommendationIndex(
  input: FetchCareerRecommendationIndexInput
): Promise<CareerRecommendationIndexResponseRaw | null> {
  try {
    return await apiClient.get<CareerRecommendationIndexResponseRaw>(
      `/v0.5/career/recommendations/mbti${buildQuery(input.locale)}`,
      {
        locale: input.locale,
        skipAuth: true,
        cache: "no-store",
      }
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    return null;
  }
}
