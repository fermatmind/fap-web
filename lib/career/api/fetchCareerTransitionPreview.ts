import { ApiError, apiClient } from "@/lib/api-client";
import type { CareerTransitionPreviewResponseRaw } from "@/lib/career/api/types";
import type { Locale } from "@/lib/i18n/locales";
import { PUBLIC_API_CACHE_OPTIONS } from "@/lib/publicApiCache";

type FetchCareerTransitionPreviewInput = {
  locale: Locale | string;
  type: string;
};

function buildQuery(type: string): string {
  const query = new URLSearchParams();
  query.set("type", type);
  return `?${query.toString()}`;
}

export async function fetchCareerTransitionPreview(
  input: FetchCareerTransitionPreviewInput
): Promise<CareerTransitionPreviewResponseRaw | null> {
  const normalizedType = String(input.type ?? "").trim().toLowerCase();
  if (!normalizedType) {
    return null;
  }

  try {
    return await apiClient.get<CareerTransitionPreviewResponseRaw>(
      `/v0.5/career/transition-preview${buildQuery(normalizedType)}`,
      {
        locale: input.locale,
        skipAuth: true,
        ...PUBLIC_API_CACHE_OPTIONS,
      }
    );
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 422)) {
      return null;
    }

    return null;
  }
}
