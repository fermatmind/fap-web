import { ApiError, apiClient } from "@/lib/api-client";
import type { CareerExplainabilityResponseRaw } from "@/lib/career/api/types";
import { toApiLocale, type Locale } from "@/lib/i18n/locales";
import { PUBLIC_API_CACHE_OPTIONS } from "@/lib/publicApiCache";

type FetchCareerJobExplainabilityInput = {
  locale: Locale | string;
  slug: string;
};

function buildQuery(locale: Locale | string): string {
  const query = new URLSearchParams();
  query.set("locale", toApiLocale(locale));
  return `?${query.toString()}`;
}

export async function fetchCareerJobExplainability(
  input: FetchCareerJobExplainabilityInput
): Promise<CareerExplainabilityResponseRaw | null> {
  const normalizedSlug = String(input.slug ?? "").trim().toLowerCase();
  if (!normalizedSlug) {
    return null;
  }

  try {
    return await apiClient.get<CareerExplainabilityResponseRaw>(
      `/v0.5/career/jobs/${encodeURIComponent(normalizedSlug)}/explainability${buildQuery(input.locale)}`,
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
