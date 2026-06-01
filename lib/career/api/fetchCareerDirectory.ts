import { ApiError, apiClient } from "@/lib/api-client";
import type { CareerDirectoryResponseRaw } from "@/lib/career/api/types";
import { toApiLocale, type Locale } from "@/lib/i18n/locales";

type FetchCareerDirectoryInput = {
  locale: Locale | string;
  page?: number;
  perPage?: number;
  family?: string | null;
  query?: string | null;
};

function normalizePositiveInteger(value: number | undefined, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(1, Math.floor(value));
}

function buildQuery(input: FetchCareerDirectoryInput): string {
  const query = new URLSearchParams();
  const page = normalizePositiveInteger(input.page, 1);
  const perPage = Math.min(100, normalizePositiveInteger(input.perPage, 50));
  const family = String(input.family ?? "").trim();
  const search = String(input.query ?? "").trim();

  query.set("locale", toApiLocale(input.locale));
  query.set("page", String(page));
  query.set("per_page", String(perPage));
  if (family) {
    query.set("family", family);
  }
  if (search) {
    query.set("q", search);
  }

  return `?${query.toString()}`;
}

export async function fetchCareerDirectory(input: FetchCareerDirectoryInput): Promise<CareerDirectoryResponseRaw | null> {
  try {
    return await apiClient.get<CareerDirectoryResponseRaw>(`/v0.5/career/directory${buildQuery(input)}`, {
      locale: input.locale,
      skipAuth: true,
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    return null;
  }
}
