import { ApiError, apiClient } from "@/lib/api-client";
import type { CareerRuntimeConfigResponseRaw } from "@/lib/career/api/types";
import type { Locale } from "@/lib/i18n/locales";
import { PUBLIC_API_CACHE_OPTIONS } from "@/lib/publicApiCache";

type FetchCareerRuntimeConfigInput = {
  locale: Locale | string;
};

export async function fetchCareerRuntimeConfig(
  input: FetchCareerRuntimeConfigInput
): Promise<CareerRuntimeConfigResponseRaw | null> {
  try {
    return await apiClient.get<CareerRuntimeConfigResponseRaw>("/v0.5/career/runtime-config", {
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

