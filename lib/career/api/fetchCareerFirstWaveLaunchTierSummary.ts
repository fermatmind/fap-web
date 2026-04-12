import { ApiError, apiClient } from "@/lib/api-client";
import type { CareerFirstWaveLaunchTierResponseRaw } from "@/lib/career/api/types";
import { toApiLocale, type Locale } from "@/lib/i18n/locales";
import { PUBLIC_API_CACHE_OPTIONS } from "@/lib/publicApiCache";

type FetchCareerFirstWaveLaunchTierSummaryInput = {
  locale: Locale | string;
};

function buildQuery(locale: Locale | string): string {
  const query = new URLSearchParams();
  query.set("locale", toApiLocale(locale));
  return `?${query.toString()}`;
}

export async function fetchCareerFirstWaveLaunchTierSummary(
  input: FetchCareerFirstWaveLaunchTierSummaryInput
): Promise<CareerFirstWaveLaunchTierResponseRaw | null> {
  try {
    return await apiClient.get<CareerFirstWaveLaunchTierResponseRaw>(
      `/v0.5/career/first-wave/launch-tier${buildQuery(input.locale)}`,
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
