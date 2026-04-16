import { ApiError, apiClient } from "@/lib/api-client";
import type { CareerShortlistWriteResponseRaw } from "@/lib/career/api/types";
import { toApiLocale, type Locale } from "@/lib/i18n/locales";

export type SubmitCareerShortlistAddInput = {
  locale: Locale | string;
  visitorKey: string;
  subjectKind: "job_slug";
  subjectSlug: string;
  sourcePageType: "career_job_detail" | "career_recommendation_detail";
  contextSnapshotUuid?: string | null;
  projectionUuid?: string | null;
  recommendationSnapshotUuid?: string | null;
};

function buildQuery(locale: Locale | string): string {
  const query = new URLSearchParams();
  query.set("locale", toApiLocale(locale));

  return `?${query.toString()}`;
}

export async function submitCareerShortlistAdd(
  input: SubmitCareerShortlistAddInput
): Promise<CareerShortlistWriteResponseRaw | null> {
  try {
    return await apiClient.post<CareerShortlistWriteResponseRaw>(
      `/v0.5/career/shortlist${buildQuery(input.locale)}`,
      {
        visitor_key: input.visitorKey,
        subject_kind: input.subjectKind,
        subject_slug: input.subjectSlug,
        source_page_type: input.sourcePageType,
        context_snapshot_uuid: input.contextSnapshotUuid ?? undefined,
        projection_uuid: input.projectionUuid ?? undefined,
        recommendation_snapshot_uuid: input.recommendationSnapshotUuid ?? undefined,
      },
      {
        locale: input.locale,
        skipAuth: true,
      }
    );
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 422 || error.status === 409)) {
      return null;
    }

    return null;
  }
}
