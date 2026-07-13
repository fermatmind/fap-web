import { apiClient } from "@/lib/api-client";
import type { CareerFamilyHubResponseRaw } from "@/lib/career/api/types";
import { toApiLocale, type Locale } from "@/lib/i18n/locales";
import { PUBLIC_API_CACHE_OPTIONS } from "@/lib/publicApiCache";
import { isAuthoritativePublicAbsence } from "@/lib/public-content/readError";

type FetchCareerFamilyHubInput = {
  locale: Locale | string;
  slug: string;
};

function buildQuery(locale: Locale | string): string {
  const query = new URLSearchParams();
  query.set("locale", toApiLocale(locale));
  return `?${query.toString()}`;
}

export async function fetchCareerFamilyHub(
  input: FetchCareerFamilyHubInput
): Promise<CareerFamilyHubResponseRaw | null> {
  const normalizedSlug = String(input.slug ?? "").trim().toLowerCase();
  if (!normalizedSlug) {
    return null;
  }

  try {
    return await apiClient.getPublic<CareerFamilyHubResponseRaw>(
      `/v0.5/career/family/${encodeURIComponent(normalizedSlug)}${buildQuery(input.locale)}`,
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
