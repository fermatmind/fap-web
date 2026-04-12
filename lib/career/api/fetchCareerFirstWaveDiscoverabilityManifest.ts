import { ApiError, apiClient } from "@/lib/api-client";
import type { CareerFirstWaveDiscoverabilityManifestResponseRaw } from "@/lib/career/api/types";
import { toApiLocale, type Locale } from "@/lib/i18n/locales";
import { PUBLIC_API_CACHE_OPTIONS } from "@/lib/publicApiCache";

type FetchCareerFirstWaveDiscoverabilityManifestInput = {
  locale: Locale | string;
};

function buildQuery(locale: Locale | string): string {
  const query = new URLSearchParams();
  query.set("locale", toApiLocale(locale));
  return `?${query.toString()}`;
}

export async function fetchCareerFirstWaveDiscoverabilityManifest(
  input: FetchCareerFirstWaveDiscoverabilityManifestInput
): Promise<CareerFirstWaveDiscoverabilityManifestResponseRaw | null> {
  try {
    return await apiClient.get<CareerFirstWaveDiscoverabilityManifestResponseRaw>(
      `/v0.5/career/first-wave/discoverability-manifest${buildQuery(input.locale)}`,
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
