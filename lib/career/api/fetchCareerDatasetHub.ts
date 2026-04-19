import { ApiError, apiClient } from "@/lib/api-client";
import type { CareerDatasetHubResponseRaw } from "@/lib/career/api/types";
import type { Locale } from "@/lib/i18n/locales";

type FetchCareerDatasetHubInput = {
  locale: Locale | string;
};

export async function fetchCareerDatasetHub(
  input: FetchCareerDatasetHubInput
): Promise<CareerDatasetHubResponseRaw | null> {
  try {
    return await apiClient.get<CareerDatasetHubResponseRaw>("/v0.5/career/datasets/occupations", {
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
