import { ApiError, apiClient } from "@/lib/api-client";
import type {
  CareerCrosswalkOverrideSummaryResponseRaw,
  CareerCrosswalkPatchHistoryResponseRaw,
  CareerCrosswalkPatchMutationResponseRaw,
  CareerCrosswalkReviewQueueItemResponseRaw,
  CareerCrosswalkReviewQueueResponseRaw,
} from "@/lib/career/api/types";
import type { Locale } from "@/lib/i18n/locales";

type LocaleInput = { locale: Locale | string };

export type CareerCrosswalkQueueFilters = {
  crosswalk_mode?: string;
  requires_editorial_patch?: string;
  publish_track?: string;
  batch_origin?: string;
  queue_reason?: string;
  sort?: string;
};

function withQuery(path: string, query: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (!value || value.trim() === "") continue;
    search.set(key, value);
  }
  const encoded = search.toString();
  return encoded ? `${path}?${encoded}` : path;
}

export async function fetchCareerCrosswalkReviewQueue(
  input: LocaleInput & { filters?: CareerCrosswalkQueueFilters }
): Promise<CareerCrosswalkReviewQueueResponseRaw | null> {
  try {
    return await apiClient.get<CareerCrosswalkReviewQueueResponseRaw>(
      withQuery("/v0.5/internal/career/crosswalk/review-queue", input.filters ?? {}),
      {
        locale: input.locale,
        skipAuth: true,
      }
    );
  } catch (error) {
    if (error instanceof ApiError) return null;
    return null;
  }
}

export async function fetchCareerCrosswalkReviewQueueItem(
  input: LocaleInput & { slug: string }
): Promise<CareerCrosswalkReviewQueueItemResponseRaw | null> {
  try {
    return await apiClient.get<CareerCrosswalkReviewQueueItemResponseRaw>(
      `/v0.5/internal/career/crosswalk/review-queue/${encodeURIComponent(input.slug)}`,
      {
        locale: input.locale,
        skipAuth: true,
      }
    );
  } catch (error) {
    if (error instanceof ApiError) return null;
    return null;
  }
}

export async function fetchCareerCrosswalkPatchHistory(
  input: LocaleInput & { slug: string }
): Promise<CareerCrosswalkPatchHistoryResponseRaw | null> {
  try {
    return await apiClient.get<CareerCrosswalkPatchHistoryResponseRaw>(
      `/v0.5/internal/career/crosswalk/patches/${encodeURIComponent(input.slug)}`,
      {
        locale: input.locale,
        skipAuth: true,
      }
    );
  } catch (error) {
    if (error instanceof ApiError) return null;
    return null;
  }
}

export async function fetchCareerCrosswalkOverrideSummary(
  input: LocaleInput & { slug: string }
): Promise<CareerCrosswalkOverrideSummaryResponseRaw | null> {
  try {
    return await apiClient.get<CareerCrosswalkOverrideSummaryResponseRaw>(
      `/v0.5/internal/career/crosswalk/override/${encodeURIComponent(input.slug)}`,
      {
        locale: input.locale,
        skipAuth: true,
      }
    );
  } catch (error) {
    if (error instanceof ApiError) return null;
    return null;
  }
}

export type CareerCrosswalkPatchCreateInput = {
  subject_kind: "career_job_detail";
  subject_slug: string;
  target_kind: "occupation" | "family";
  target_slug: string;
  crosswalk_mode_override: string;
  review_notes?: string;
};

export async function createCareerCrosswalkPatch(
  input: LocaleInput & { payload: CareerCrosswalkPatchCreateInput }
): Promise<CareerCrosswalkPatchMutationResponseRaw | null> {
  try {
    return await apiClient.post<CareerCrosswalkPatchMutationResponseRaw>(
      "/v0.5/internal/career/crosswalk/patches",
      input.payload,
      {
        locale: input.locale,
        skipAuth: true,
      }
    );
  } catch (error) {
    if (error instanceof ApiError) return null;
    return null;
  }
}

export async function approveCareerCrosswalkPatch(
  input: LocaleInput & { patchKey: string; reviewNotes?: string }
): Promise<CareerCrosswalkPatchMutationResponseRaw | null> {
  try {
    return await apiClient.post<CareerCrosswalkPatchMutationResponseRaw>(
      `/v0.5/internal/career/crosswalk/patches/${encodeURIComponent(input.patchKey)}/approve`,
      {
        review_notes: input.reviewNotes ?? "",
      },
      {
        locale: input.locale,
        skipAuth: true,
      }
    );
  } catch (error) {
    if (error instanceof ApiError) return null;
    return null;
  }
}

export async function rejectCareerCrosswalkPatch(
  input: LocaleInput & { patchKey: string; reviewNotes?: string }
): Promise<CareerCrosswalkPatchMutationResponseRaw | null> {
  try {
    return await apiClient.post<CareerCrosswalkPatchMutationResponseRaw>(
      `/v0.5/internal/career/crosswalk/patches/${encodeURIComponent(input.patchKey)}/reject`,
      {
        review_notes: input.reviewNotes ?? "",
      },
      {
        locale: input.locale,
        skipAuth: true,
      }
    );
  } catch (error) {
    if (error instanceof ApiError) return null;
    return null;
  }
}

