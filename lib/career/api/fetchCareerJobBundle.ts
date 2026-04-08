import { ApiError, apiClient } from "@/lib/api-client";
import { toApiLocale, type Locale } from "@/lib/i18n/locales";
import type { CareerJobBundleResponseRaw } from "@/lib/career/api/types";

type FetchCareerJobBundleInput = {
  locale: Locale | string;
  slug: string;
};

function buildQuery(locale: Locale | string): string {
  const query = new URLSearchParams();
  query.set("locale", toApiLocale(locale));
  return `?${query.toString()}`;
}

export async function fetchCareerJobBundle(
  input: FetchCareerJobBundleInput
): Promise<CareerJobBundleResponseRaw | null> {
  const normalizedSlug = String(input.slug ?? "").trim().toLowerCase();
  if (!normalizedSlug) {
    return null;
  }

  try {
    return await apiClient.get<CareerJobBundleResponseRaw>(
      `/v0.5/career/jobs/${encodeURIComponent(normalizedSlug)}${buildQuery(input.locale)}`,
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
