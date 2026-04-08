import { ApiError, apiClient } from "@/lib/api-client";
import type { CareerSearchResponseRaw } from "@/lib/career/api/types";
import { toApiLocale, type Locale } from "@/lib/i18n/locales";

type FetchCareerSearchInput = {
  q: string;
  locale: Locale | string;
  limit?: number;
  mode?: "auto" | "exact" | "prefix";
};

function buildQuery(input: FetchCareerSearchInput): string {
  const query = new URLSearchParams();
  query.set("q", input.q);
  query.set("locale", toApiLocale(input.locale));

  if (typeof input.limit === "number" && Number.isFinite(input.limit)) {
    query.set("limit", String(input.limit));
  }

  if (input.mode) {
    query.set("mode", input.mode);
  }

  return `?${query.toString()}`;
}

export async function fetchCareerSearch(
  input: FetchCareerSearchInput
): Promise<CareerSearchResponseRaw | null> {
  const normalizedQuery = String(input.q ?? "").trim();
  if (!normalizedQuery) {
    return null;
  }

  try {
    return await apiClient.get<CareerSearchResponseRaw>(
      `/v0.5/career/search${buildQuery({ ...input, q: normalizedQuery })}`,
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
