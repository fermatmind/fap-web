import { ApiError, apiClient } from "@/lib/api-client";
import type { CareerAliasResolutionResponseRaw } from "@/lib/career/api/types";
import { toApiLocale, type Locale } from "@/lib/i18n/locales";

type FetchCareerAliasResolutionInput = {
  q: string;
  locale: Locale | string;
};

function buildQuery(input: FetchCareerAliasResolutionInput): string {
  const query = new URLSearchParams();
  query.set("q", input.q);
  query.set("locale", toApiLocale(input.locale));

  return `?${query.toString()}`;
}

export async function fetchCareerAliasResolution(
  input: FetchCareerAliasResolutionInput
): Promise<CareerAliasResolutionResponseRaw | null> {
  const normalizedQuery = String(input.q ?? "").trim();
  if (!normalizedQuery) {
    return null;
  }

  try {
    return await apiClient.get<CareerAliasResolutionResponseRaw>(
      `/v0.5/career/resolve${buildQuery({ ...input, q: normalizedQuery })}`,
      {
        locale: input.locale,
        skipAuth: true,
        cache: "no-store",
      }
    );
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 422)) {
      return null;
    }

    return null;
  }
}
