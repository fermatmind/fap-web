import { ApiError, apiClient } from "@/lib/api-client";
import type { CareerFirstWaveReadinessSummaryResponseRaw } from "@/lib/career/api/types";
import { toApiLocale, type Locale } from "@/lib/i18n/locales";
import { PUBLIC_API_CACHE_OPTIONS } from "@/lib/publicApiCache";

type FetchCareerFirstWaveReadinessSummaryInput = {
  locale: Locale | string;
};

function buildQuery(locale: Locale | string): string {
  const query = new URLSearchParams();
  query.set("locale", toApiLocale(locale));
  return `?${query.toString()}`;
}

export async function fetchCareerFirstWaveReadinessSummary(
  input: FetchCareerFirstWaveReadinessSummaryInput
): Promise<CareerFirstWaveReadinessSummaryResponseRaw | null> {
  try {
    return await apiClient.get<CareerFirstWaveReadinessSummaryResponseRaw>(
      `/v0.5/career/first-wave/readiness${buildQuery(input.locale)}`,
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
