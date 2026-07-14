import { apiClient } from "@/lib/api-client";
import { toApiLocale, type Locale } from "@/lib/i18n/locales";
import { isAuthoritativePublicAbsence } from "@/lib/public-content/readError";
import { PUBLIC_API_CACHE_OPTIONS } from "@/lib/publicApiCache";

export type CareerIndustryDirectoryResponseRaw = {
  authority_version?: unknown;
  bundle_kind?: unknown;
  bundle_version?: unknown;
  locale?: unknown;
  public_detail_indexable_count?: unknown;
  industry_count?: unknown;
  industries?: unknown;
};

type FetchCareerIndustryDirectoryInput = {
  locale: Locale | string;
};

const CAREER_INDUSTRY_DIRECTORY_REVALIDATE_SECONDS = 300;

export function careerIndustryDirectoryCacheTag(locale: Locale | string): string {
  return `career-industry-directory:${toApiLocale(locale)}`;
}

export async function fetchCareerIndustryDirectory(
  input: FetchCareerIndustryDirectoryInput
): Promise<CareerIndustryDirectoryResponseRaw | null> {
  const query = new URLSearchParams({ locale: toApiLocale(input.locale) });

  try {
    return await apiClient.getPublic<CareerIndustryDirectoryResponseRaw>(
      `/v0.5/career/industries?${query.toString()}`,
      {
        locale: input.locale,
        skipAuth: true,
        ...PUBLIC_API_CACHE_OPTIONS,
        next: {
          revalidate: CAREER_INDUSTRY_DIRECTORY_REVALIDATE_SECONDS,
          tags: [careerIndustryDirectoryCacheTag(input.locale)],
        },
      }
    );
  } catch (error) {
    if (isAuthoritativePublicAbsence(error)) {
      return null;
    }

    throw error;
  }
}
