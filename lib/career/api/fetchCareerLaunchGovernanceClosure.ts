import { ApiError, apiClient } from "@/lib/api-client";
import type { CareerLaunchGovernanceClosureResponseRaw } from "@/lib/career/api/types";
import { toApiLocale, type Locale } from "@/lib/i18n/locales";
import { PUBLIC_API_CACHE_OPTIONS } from "@/lib/publicApiCache";

type FetchCareerLaunchGovernanceClosureInput = {
  locale: Locale | string;
};

function buildQuery(locale: Locale | string): string {
  const query = new URLSearchParams();
  query.set("locale", toApiLocale(locale));
  return `?${query.toString()}`;
}

export async function fetchCareerLaunchGovernanceClosure(
  input: FetchCareerLaunchGovernanceClosureInput
): Promise<CareerLaunchGovernanceClosureResponseRaw | null> {
  try {
    return await apiClient.get<CareerLaunchGovernanceClosureResponseRaw>(
      `/v0.5/career/launch-governance-closure${buildQuery(input.locale)}`,
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

