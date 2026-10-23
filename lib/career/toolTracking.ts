"use client";

import { trackEvent } from "@/lib/analytics";
import { hasAnalyticsConsent } from "@/lib/consent/store";
import type { Locale } from "@/lib/i18n/locales";

export type CareerToolEvent =
  | "career_compare_entered" | "career_compare_succeeded"
  | "career_worksheet_entered" | "career_worksheet_started"
  | "career_worksheet_output_requested" | "career_worksheet_copy_succeeded"
  | "career_worksheet_download_requested" | "career_worksheet_print_requested";

export type CareerOfficialResource = "onet_interest_profiler" | "mynextmove" | "onet_online"
  | "england_profiles" | "england_courses" | "england_skills" | "england_support";

/** Outbound click observation; never represents completing an external tool. */
export function trackCareerOfficialResourceClick(locale: Locale, resourceKey: CareerOfficialResource): void {
  if (!hasAnalyticsConsent()) return;
  trackEvent("career_support_link_click", {
    locale, entry_surface: "career_tests_official_tools", source_page_type: "landing",
    target_action: "open_official_resource", landing_path: `/${locale}/career/tests`,
    route_family: "landing", subject_kind: "none", query_mode: "non_query", resource_key: resourceKey,
  });
}

export function trackCareerToolEvent(eventName: CareerToolEvent, {
  locale, toolRunId, outputFormat,
}: { locale: Locale; toolRunId: string; outputFormat?: "text" | "markdown" | "print" }): void {
  if (!hasAnalyticsConsent()) return;
  const compare = eventName.startsWith("career_compare_");
  const surface = compare ? "career_compare" : "career_worksheet";
  trackEvent(eventName, {
    locale,
    entry_surface: surface,
    source_page_type: surface,
    target_action: eventName.slice(7),
    landing_path: compare ? `/${locale}/career/compare` : `/${locale}/holland-test/pdf-download`,
    route_family: compare ? "compare" : "worksheet",
    subject_kind: "none",
    query_mode: "non_query",
    tool_run_id: toolRunId,
    ...(outputFormat ? { output_format: outputFormat } : {}),
  });
}
