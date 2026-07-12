import { ApiError, apiClient } from "@/lib/api-client";
import type { CareerDirectoryResponseRaw } from "@/lib/career/api/types";
import { toApiLocale, type Locale } from "@/lib/i18n/locales";
import { PUBLIC_API_CACHE_OPTIONS } from "@/lib/publicApiCache";

type FetchCareerDirectoryInput = {
  locale: Locale | string;
  page?: number;
  perPage?: number;
  family?: string | null;
  query?: string | null;
};

export type CareerDirectoryFetchState = "success" | "empty" | "stale" | "unavailable";

export type CareerDirectoryFetchResult = {
  state: CareerDirectoryFetchState;
  payload: CareerDirectoryResponseRaw | null;
  error: null | {
    endpoint: string;
    status: number | null;
    errorCode: string;
    requestId: string | null;
    durationMs: number;
  };
};

const CAREER_DIRECTORY_REVALIDATE_SECONDS = 300;

export function careerDirectoryCacheTag(locale: Locale | string): string {
  return `career-directory:${toApiLocale(locale)}`;
}

function directoryCacheOptions(input: FetchCareerDirectoryInput) {
  const hasQuery = String(input.query ?? "").trim().length > 0;
  const hasFamily = String(input.family ?? "").trim().length > 0;
  const page = normalizePositiveInteger(input.page, 1);

  if (hasQuery || hasFamily || page > 1) {
    return { cache: "no-store" as const };
  }

  return {
    ...PUBLIC_API_CACHE_OPTIONS,
    next: {
      revalidate: CAREER_DIRECTORY_REVALIDATE_SECONDS,
      tags: [careerDirectoryCacheTag(input.locale)],
    },
  };
}

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

export async function fetchCareerDirectory(input: FetchCareerDirectoryInput): Promise<CareerDirectoryFetchResult> {
  const endpoint = `/v0.5/career/directory${buildQuery(input)}`;
  const startedAt = Date.now();

  try {
    const payload = await apiClient.get<CareerDirectoryResponseRaw>(endpoint, {
      locale: input.locale,
      skipAuth: true,
      ...directoryCacheOptions(input),
    });
    const pagination = payload.pagination && typeof payload.pagination === "object" && !Array.isArray(payload.pagination)
      ? payload.pagination as Record<string, unknown>
      : {};
    const total = Number(pagination.total ?? 0);
    const cacheState = String((payload as Record<string, unknown>)?.cache_state ?? "").toLowerCase();

    return {
      state: cacheState === "stale" ? "stale" : total === 0 ? "empty" : "success",
      payload,
      error: null,
    };
  } catch (error) {
    const apiError = error instanceof ApiError ? error : null;
    const failure = {
      endpoint,
      status: apiError?.status ?? null,
      errorCode: apiError?.errorCode ?? "NETWORK_ERROR",
      requestId: apiError?.requestId ?? null,
      durationMs: Date.now() - startedAt,
    };

    console.error("career_directory_unavailable", failure);

    return { state: "unavailable", payload: null, error: failure };
  }
}
