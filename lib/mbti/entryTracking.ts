import type { Locale } from "@/lib/i18n/locales";
import { DEFAULT_MBTI_FORM_CODE, buildMbtiTakeHref, normalizeMbtiFormCode } from "@/lib/mbti/forms";

export const MBTI_ENTRY_TEST_SLUG = "mbti-personality-test-16-personality-types";

export type MbtiEntrySurface =
  | "mbti_test_landing"
  | "mbti_topic_detail"
  | "mbti_topic_index"
  | "mbti_personality_index"
  | "mbti_personality_detail"
  | "mbti_career_recommendation_detail"
  | "mbti_scene_block";

export type MbtiEntrySourcePageType =
  | "test_landing"
  | "topic_detail"
  | "topic_index"
  | "personality_index"
  | "personality_detail"
  | "career_recommendation_detail"
  | "scene_block";

type BuildMbtiEntryHrefInput = {
  locale: Locale;
  testSlug?: string;
  formCode?: string;
  entrySurface: MbtiEntrySurface;
  sourcePageType: MbtiEntrySourcePageType;
  targetAction: string;
  sourcePath: string;
};

type BuildMbtiEntryTrackingPayloadInput = {
  locale: Locale;
  testSlug?: string;
  formCode?: string;
  entrySurface: MbtiEntrySurface;
  sourcePageType: MbtiEntrySourcePageType;
  targetAction: string;
};

function appendQueryToHref(href: string, query: Record<string, string | undefined>): string {
  const [pathname, rawQuery = ""] = href.split("?");
  const searchParams = new URLSearchParams(rawQuery);

  for (const [key, value] of Object.entries(query)) {
    if (!value) continue;
    searchParams.set(key, value);
  }

  const serialized = searchParams.toString();
  return serialized ? `${pathname}?${serialized}` : pathname;
}

export function buildMbtiEntryHref({
  locale,
  testSlug = MBTI_ENTRY_TEST_SLUG,
  formCode = DEFAULT_MBTI_FORM_CODE,
  entrySurface,
  sourcePageType,
  targetAction,
  sourcePath,
}: BuildMbtiEntryHrefInput): string {
  const normalizedFormCode = normalizeMbtiFormCode(formCode);
  const takeHref = buildMbtiTakeHref(testSlug, locale, normalizedFormCode);
  return appendQueryToHref(takeHref, {
    entrypoint: entrySurface,
    entry_surface: entrySurface,
    source_page_type: sourcePageType,
    target_action: targetAction,
    test_slug: testSlug,
    form_code: normalizedFormCode,
    landing_path: sourcePath,
  });
}

export function buildMbtiEntryTrackingPayload({
  locale,
  testSlug = MBTI_ENTRY_TEST_SLUG,
  formCode = DEFAULT_MBTI_FORM_CODE,
  entrySurface,
  sourcePageType,
  targetAction,
}: BuildMbtiEntryTrackingPayloadInput): Record<string, string> {
  const normalizedFormCode = normalizeMbtiFormCode(formCode);
  return {
    slug: testSlug,
    test_slug: testSlug,
    form_code: normalizedFormCode,
    entry_surface: entrySurface,
    source_page_type: sourcePageType,
    target_action: targetAction,
    locale,
  };
}
