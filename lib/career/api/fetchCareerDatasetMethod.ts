import { ApiError, apiClient } from "@/lib/api-client";
import type { CareerDatasetMethodResponseRaw } from "@/lib/career/api/types";
import type { Locale } from "@/lib/i18n/locales";
import { PUBLIC_API_CACHE_OPTIONS } from "@/lib/publicApiCache";

type FetchCareerDatasetMethodInput = {
  locale: Locale | string;
};

export async function fetchCareerDatasetMethod(
  input: FetchCareerDatasetMethodInput
): Promise<CareerDatasetMethodResponseRaw | null> {
  try {
    return await apiClient.get<CareerDatasetMethodResponseRaw>("/v0.5/career/datasets/occupations/method", {
      locale: input.locale,
      skipAuth: true,
      ...PUBLIC_API_CACHE_OPTIONS,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    return null;
  }
}

