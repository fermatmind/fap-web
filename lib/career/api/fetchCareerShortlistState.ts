import { ApiError, apiClient } from "@/lib/api-client";
import type { CareerShortlistStateResponseRaw } from "@/lib/career/api/types";
import { toApiLocale, type Locale } from "@/lib/i18n/locales";

export type FetchCareerShortlistStateInput = {
  locale: Locale | string;
  visitorKey: string;
  subjectKind: "job_slug";
  subjectSlug: string;
  sourcePageType: "career_job_detail" | "career_recommendation_detail";
};

function buildQuery(input: FetchCareerShortlistStateInput): string {
  const query = new URLSearchParams();
  query.set("locale", toApiLocale(input.locale));
  query.set("visitor_key", input.visitorKey);
  query.set("subject_kind", input.subjectKind);
  query.set("subject_slug", input.subjectSlug);
  query.set("source_page_type", input.sourcePageType);

  return `?${query.toString()}`;
}

export async function fetchCareerShortlistState(
  input: FetchCareerShortlistStateInput
): Promise<CareerShortlistStateResponseRaw | null> {
  try {
    return await apiClient.get<CareerShortlistStateResponseRaw>(
      `/v0.5/career/shortlist/state${buildQuery(input)}`,
      {
        locale: input.locale,
        skipAuth: true,
      }
    );
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 422)) {
      return null;
    }

    return null;
  }
}
