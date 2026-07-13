import { apiClient } from "@/lib/api-client";
import type { CareerJobIndexResponseRaw } from "@/lib/career/api/types";
import { toApiLocale, type Locale } from "@/lib/i18n/locales";
import { isAuthoritativePublicAbsence } from "@/lib/public-content/readError";

type FetchCareerJobIndexInput = {
  locale: Locale | string;
};

function buildQuery(locale: Locale | string): string {
  const query = new URLSearchParams();
  query.set("locale", toApiLocale(locale));
  return `?${query.toString()}`;
}

export async function fetchCareerJobIndex(
  input: FetchCareerJobIndexInput
): Promise<CareerJobIndexResponseRaw | null> {
  try {
    return await apiClient.getPublic<CareerJobIndexResponseRaw>(`/v0.5/career/jobs${buildQuery(input.locale)}`, {
      locale: input.locale,
      skipAuth: true,
      cache: "no-store",
    });
  } catch (error) {
    if (isAuthoritativePublicAbsence(error)) {
      return null;
    }

    throw error;
  }
}
