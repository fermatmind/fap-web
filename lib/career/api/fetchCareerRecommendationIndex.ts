import { apiClient } from "@/lib/api-client";
import type { CareerRecommendationIndexResponseRaw } from "@/lib/career/api/types";
import { toApiLocale, type Locale } from "@/lib/i18n/locales";
import { PUBLIC_API_CACHE_OPTIONS } from "@/lib/publicApiCache";
import { isAuthoritativePublicAbsence } from "@/lib/public-content/readError";

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
    return await apiClient.getPublic<CareerRecommendationIndexResponseRaw>(
      `/v0.5/career/recommendations/mbti${buildQuery(input.locale)}`,
      {
        locale: input.locale,
        skipAuth: true,
        ...PUBLIC_API_CACHE_OPTIONS,
      }
    );
  } catch (error) {
    if (isAuthoritativePublicAbsence(error)) {
      return null;
    }

    throw error;
  }
}
