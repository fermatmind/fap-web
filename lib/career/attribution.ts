import { trackEvent, type AnalyticsProperties } from "@/lib/analytics";
import { TRACKING_EVENTS, type CareerTrackingEventName } from "@/lib/tracking/events";
import type { Locale } from "@/lib/i18n/locales";

export const CAREER_ROUTE_FAMILIES = [
  "landing",
  "jobs",
  "jobs_search",
  "job_detail",
  "family_hub",
  "alias_resolution",
  "recommendations",
  "recommendation_detail",
] as const;

export const CAREER_ENTRY_SURFACES = [
  "career_landing",
  "career_landing_jobs_preview",
  "career_landing_recommendation_preview",
  "career_job_index",
  "career_job_search",
  "career_job_search_results",
  "career_alias_disambiguation",
  "career_job_detail",
  "career_family_hub",
  "career_recommendation_index",
  "career_recommendation_detail",
  "career_recommendation_detail_matched_jobs",
  "career_recommendation_detail_transition_preview",
] as const;

export const CAREER_SOURCE_PAGE_TYPES = [
  "career_landing",
  "career_job_index",
  "career_job_search",
  "career_alias_disambiguation",
  "career_job_detail",
  "career_family_hub",
  "career_recommendation_index",
  "career_recommendation_detail",
] as const;

export const CAREER_SUBJECT_KINDS = ["none", "family_slug", "job_slug", "recommendation_type"] as const;

export const CAREER_QUERY_MODES = ["query", "non_query"] as const;
export const CAREER_BLOCKED_CLAIM_KINDS = [
  "salary",
  "strong_claim",
  "ai_strategy",
  "transition_recommendation",
] as const;

export type CareerRouteFamily = (typeof CAREER_ROUTE_FAMILIES)[number];
export type CareerEntrySurface = (typeof CAREER_ENTRY_SURFACES)[number];
export type CareerSourcePageType = (typeof CAREER_SOURCE_PAGE_TYPES)[number];
export type CareerSubjectKind = (typeof CAREER_SUBJECT_KINDS)[number];
export type CareerQueryMode = (typeof CAREER_QUERY_MODES)[number];
export type CareerBlockedClaimKind = (typeof CAREER_BLOCKED_CLAIM_KINDS)[number];

export type CareerAttributionPayloadInput = {
  locale: Locale;
  entrySurface: CareerEntrySurface;
  sourcePageType: CareerSourcePageType;
  targetAction: string;
  landingPath: string;
  routeFamily: CareerRouteFamily;
  subjectKind?: CareerSubjectKind;
  subjectKey?: string | null;
  queryMode?: CareerQueryMode;
  blockedClaimKind?: CareerBlockedClaimKind;
};

function compactTrackingPayload(
  payload: Record<string, string | number | boolean | null | undefined>
): AnalyticsProperties {
  return Object.entries(payload).reduce<AnalyticsProperties>((acc, [key, value]) => {
    if (value === undefined || value === null || value === "") {
      return acc;
    }

    acc[key] = value;
    return acc;
  }, {});
}

export function buildCareerAttributionPayload({
  locale,
  entrySurface,
  sourcePageType,
  targetAction,
  landingPath,
  routeFamily,
  subjectKind = "none",
  subjectKey,
  queryMode = "non_query",
  blockedClaimKind,
}: CareerAttributionPayloadInput): AnalyticsProperties {
  return compactTrackingPayload({
    locale,
    entry_surface: entrySurface,
    source_page_type: sourcePageType,
    target_action: targetAction,
    landing_path: landingPath,
    route_family: routeFamily,
    subject_kind: subjectKind,
    subject_key: subjectKind === "none" ? undefined : subjectKey ?? undefined,
    query_mode: queryMode,
    blocked_claim_kind: blockedClaimKind,
  });
}

export function trackCareerAttributionEvent(
  eventName: CareerTrackingEventName,
  payload: CareerAttributionPayloadInput
) {
  trackEvent(eventName, buildCareerAttributionPayload(payload));
}

export const CAREER_TRACKING_EVENTS = {
  landingView: TRACKING_EVENTS.CAREER_LANDING_VIEW,
  jobIndexView: TRACKING_EVENTS.CAREER_JOB_INDEX_VIEW,
  jobDetailView: TRACKING_EVENTS.CAREER_JOB_DETAIL_VIEW,
  familyHubView: TRACKING_EVENTS.CAREER_FAMILY_HUB_VIEW,
  recommendationIndexView: TRACKING_EVENTS.CAREER_RECOMMENDATION_INDEX_VIEW,
  recommendationDetailView: TRACKING_EVENTS.CAREER_RECOMMENDATION_DETAIL_VIEW,
  jobSearchSubmit: TRACKING_EVENTS.CAREER_JOB_SEARCH_SUBMIT,
  jobSearchResultClick: TRACKING_EVENTS.CAREER_JOB_SEARCH_RESULT_CLICK,
  jobIndexResultClick: TRACKING_EVENTS.CAREER_JOB_INDEX_RESULT_CLICK,
  familyHubChildClick: TRACKING_EVENTS.CAREER_FAMILY_HUB_CHILD_CLICK,
  jobDetailCtaClick: TRACKING_EVENTS.CAREER_JOB_DETAIL_CTA_CLICK,
  shortlistAdd: TRACKING_EVENTS.CAREER_SHORTLIST_ADD,
  supportLinkClick: TRACKING_EVENTS.CAREER_SUPPORT_LINK_CLICK,
  recommendationResultClick: TRACKING_EVENTS.CAREER_RECOMMENDATION_RESULT_CLICK,
  recommendationMatchedJobClick: TRACKING_EVENTS.CAREER_RECOMMENDATION_MATCHED_JOB_CLICK,
  transitionPreviewView: TRACKING_EVENTS.CAREER_TRANSITION_PREVIEW_VIEW,
  transitionPreviewTargetClick: TRACKING_EVENTS.CAREER_TRANSITION_PREVIEW_TARGET_CLICK,
  aliasResolutionSubmit: TRACKING_EVENTS.CAREER_ALIAS_RESOLUTION_SUBMIT,
  aliasResolutionTargetClick: TRACKING_EVENTS.CAREER_ALIAS_RESOLUTION_TARGET_CLICK,
  aliasResolutionNoResult: TRACKING_EVENTS.CAREER_ALIAS_RESOLUTION_NO_RESULT,
  readySurfaceExposed: TRACKING_EVENTS.CAREER_READY_SURFACE_EXPOSED,
  claimBlockedSurfaceExposed: TRACKING_EVENTS.CAREER_CLAIM_BLOCKED_SURFACE_EXPOSED,
} as const;
