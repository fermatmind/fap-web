import type { Locale } from "@/lib/i18n/locales";
import { MBTI_TYPE_CODES } from "@/lib/mbti/mbtiTypeContentPack";

export const MBTI_ADS_PRIMARY_WHITELIST = [
  "/tests/mbti-personality-test-16-personality-types",
] as const;

export const MBTI_ADS_SECONDARY_WHITELIST = [
  "/personality/[type]",
  "/career/recommendations/mbti/[type]",
] as const;

export const MBTI_ADS_SEO_ONLY_PAGES = [
  "/personality",
  "/topics",
  "/topics/mbti",
] as const;

export const MBTI_ADS_FORBIDDEN_PATTERNS = [
  "/result/[id]",
  "/tests/*/take",
  "/orders/*",
  "/payment/*",
  "/share/*",
  "/compare/*",
  "/history/*",
] as const;

export const MBTI_ADS_SECONDARY_WHITELIST_STABLE_TYPES = [
  "INTP",
  "INTJ",
  "ENTJ",
  "INFJ",
  "INFP",
  "ENFJ",
  "ISTJ",
  "ISFJ",
  "ESTJ",
  "ESFJ",
] as const;

export const MBTI_ADS_SECONDARY_WHITELIST_CANDIDATE_TYPES = [
  "ENTP",
  "ENFP",
  "ISTP",
  "ISFP",
  "ESTP",
  "ESFP",
] as const;

export const MBTI_ADS_SECONDARY_WHITELIST_ALL_TYPES = [
  ...MBTI_ADS_SECONDARY_WHITELIST_STABLE_TYPES,
  ...MBTI_ADS_SECONDARY_WHITELIST_CANDIDATE_TYPES,
] as const;

export const MBTI_ADS_STABLE_SMOKE_PERSONALITY_TYPES = ["INTJ", "INFJ", "ISTJ", "ENFJ"] as const;

export const MBTI_ADS_STABLE_SMOKE_RECOMMENDATION_TYPES = ["INTJ", "ENTJ", "INFJ", "ISTJ"] as const;

export const MBTI_ADS_LAUNCH_SIGNAL_EVENTS = [
  "landing_view",
  "start_click",
  "start_attempt",
  "view_result",
  "click_unlock",
  "create_order",
] as const;

export const MBTI_ADS_LAUNCH_SIGNAL_REQUIREMENTS = {
  landing_view: ["test_slug", "form_code", "entry_surface", "source_page_type", "target_action", "landing_path", "locale"],
  start_click: ["test_slug", "form_code", "entry_surface", "source_page_type", "target_action", "landing_path", "locale"],
  start_attempt: ["test_slug", "attempt_id", "form_code", "entry_surface", "source_page_type", "target_action", "landing_path", "locale"],
  view_result: ["attempt_id", "form_code", "locale"],
  click_unlock: ["attempt_id", "form_code", "locale"],
  create_order: ["attempt_id", "orderNoMasked", "form_code", "locale"],
} as const;

export type MbtiAdsSurfacePolicy = "primary" | "secondary" | "seo_only" | "forbidden" | "other";
export type MbtiAdsLaunchTier = "stable" | "candidate" | "hold";
export type MbtiAdsTypeCode = (typeof MBTI_TYPE_CODES)[number];
export type MbtiAdsLaunchSmokeSurface = "primary" | "secondary" | "seo_only";
export type MbtiAdsLaunchSignalEvent = (typeof MBTI_ADS_LAUNCH_SIGNAL_EVENTS)[number];

export type MbtiAdsLaunchSmokeEntry = {
  key: string;
  path: string;
  surface: MbtiAdsLaunchSmokeSurface;
  pageType:
    | "test_landing"
    | "personality_detail"
    | "career_recommendation_detail"
    | "personality_index"
    | "topic_detail";
  typeCode?: MbtiAdsTypeCode;
};

export const MBTI_ADS_STABLE_SMOKE_LOCALES = ["en", "zh"] as const;

const LOCALE_PREFIX_RE = /^\/(en|zh)(?=\/|$)/;
const SECONDARY_PATTERNS = [/^\/personality\/[^/]+$/, /^\/career\/recommendations\/mbti\/[^/]+$/];
const FORBIDDEN_PATTERNS = [
  /^\/result\/[^/]+$/,
  /^\/tests\/[^/]+\/take(?:\/.*)?$/,
  /^\/orders(?:\/.*)?$/,
  /^\/payment(?:\/.*)?$/,
  /^\/share(?:\/.*)?$/,
  /^\/compare(?:\/.*)?$/,
  /^\/history(?:\/.*)?$/,
];

export const MBTI_ADS_LAUNCH_MANIFEST = {
  primaryWhitelistPages: MBTI_ADS_PRIMARY_WHITELIST,
  secondaryWhitelistPages: MBTI_ADS_SECONDARY_WHITELIST,
  seoOnlyPages: MBTI_ADS_SEO_ONLY_PAGES,
  forbiddenPatterns: MBTI_ADS_FORBIDDEN_PATTERNS,
  secondaryWhitelistStableTypes: MBTI_ADS_SECONDARY_WHITELIST_STABLE_TYPES,
  secondaryWhitelistCandidateTypes: MBTI_ADS_SECONDARY_WHITELIST_CANDIDATE_TYPES,
  secondaryWhitelistAllTypes: MBTI_ADS_SECONDARY_WHITELIST_ALL_TYPES,
  secondaryWhitelistHoldTypes: MBTI_TYPE_CODES.filter(
    (typeCode) =>
      !MBTI_ADS_SECONDARY_WHITELIST_STABLE_TYPES.includes(
        typeCode as (typeof MBTI_ADS_SECONDARY_WHITELIST_STABLE_TYPES)[number]
      ) &&
      !MBTI_ADS_SECONDARY_WHITELIST_CANDIDATE_TYPES.includes(
        typeCode as (typeof MBTI_ADS_SECONDARY_WHITELIST_CANDIDATE_TYPES)[number]
      )
  ),
  stableSmokePersonalityTypes: MBTI_ADS_STABLE_SMOKE_PERSONALITY_TYPES,
  stableSmokeRecommendationTypes: MBTI_ADS_STABLE_SMOKE_RECOMMENDATION_TYPES,
  stableSmokeLocales: MBTI_ADS_STABLE_SMOKE_LOCALES,
  launchSignalEvents: MBTI_ADS_LAUNCH_SIGNAL_EVENTS,
  launchSignalRequirements: MBTI_ADS_LAUNCH_SIGNAL_REQUIREMENTS,
} as const;

function buildLocalizedMbtiTypePath(locale: Locale, typeCode: string, kind: "personality" | "recommendation"): string {
  const slug = `${String(typeCode).trim().toLowerCase()}-a`;
  return kind === "personality"
    ? `/${locale}/personality/${slug}`
    : `/${locale}/career/recommendations/mbti/${slug}`;
}

export function normalizeMbtiAdsPath(pathname: string): string {
  const [withoutQuery] = pathname.split(/[?#]/, 1);
  const withLeadingSlash = withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
  const normalized = withLeadingSlash.replace(LOCALE_PREFIX_RE, "") || "/";
  return normalized === "" ? "/" : normalized;
}

export function normalizeMbtiAdsTypeCode(typeCode: string): MbtiAdsTypeCode | null {
  const normalized = String(typeCode ?? "").trim().toUpperCase();
  return MBTI_TYPE_CODES.includes(normalized as MbtiAdsTypeCode) ? (normalized as MbtiAdsTypeCode) : null;
}

export function isMbtiSecondaryWhitelistStable(typeCode: string): boolean {
  const normalized = normalizeMbtiAdsTypeCode(typeCode);
  return normalized
    ? MBTI_ADS_SECONDARY_WHITELIST_STABLE_TYPES.includes(
        normalized as (typeof MBTI_ADS_SECONDARY_WHITELIST_STABLE_TYPES)[number]
      )
    : false;
}

export function isMbtiSecondaryWhitelistCandidate(typeCode: string): boolean {
  const normalized = normalizeMbtiAdsTypeCode(typeCode);
  return normalized
    ? MBTI_ADS_SECONDARY_WHITELIST_CANDIDATE_TYPES.includes(
        normalized as (typeof MBTI_ADS_SECONDARY_WHITELIST_CANDIDATE_TYPES)[number]
      )
    : false;
}

export function getMbtiAdsLaunchTier(typeCode: string): MbtiAdsLaunchTier {
  if (isMbtiSecondaryWhitelistStable(typeCode)) {
    return "stable";
  }

  if (isMbtiSecondaryWhitelistCandidate(typeCode)) {
    return "candidate";
  }

  return "hold";
}

export function getMbtiSecondaryWhitelistHoldTypes(): MbtiAdsTypeCode[] {
  return MBTI_TYPE_CODES.filter(
    (typeCode) =>
      !isMbtiSecondaryWhitelistStable(typeCode) && !isMbtiSecondaryWhitelistCandidate(typeCode)
  );
}

export function getMbtiAdsSurfacePolicy(pathname: string): MbtiAdsSurfacePolicy {
  const normalized = normalizeMbtiAdsPath(pathname);

  if (MBTI_ADS_PRIMARY_WHITELIST.includes(normalized as (typeof MBTI_ADS_PRIMARY_WHITELIST)[number])) {
    return "primary";
  }

  if (SECONDARY_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return "secondary";
  }

  if (MBTI_ADS_SEO_ONLY_PAGES.includes(normalized as (typeof MBTI_ADS_SEO_ONLY_PAGES)[number])) {
    return "seo_only";
  }

  if (FORBIDDEN_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return "forbidden";
  }

  return "other";
}

export function getMbtiStableLaunchSmokeEntries(locale: Locale): MbtiAdsLaunchSmokeEntry[] {
  return [
    {
      key: "mbti_test_landing",
      path: `/${locale}${MBTI_ADS_PRIMARY_WHITELIST[0]}`,
      surface: "primary",
      pageType: "test_landing",
    },
    ...MBTI_ADS_STABLE_SMOKE_PERSONALITY_TYPES.map((typeCode) => ({
      key: `personality_${String(typeCode).toLowerCase()}`,
      path: buildLocalizedMbtiTypePath(locale, typeCode, "personality"),
      surface: "secondary" as const,
      pageType: "personality_detail" as const,
      typeCode,
    })),
    ...MBTI_ADS_STABLE_SMOKE_RECOMMENDATION_TYPES.map((typeCode) => ({
      key: `recommendation_${String(typeCode).toLowerCase()}`,
      path: buildLocalizedMbtiTypePath(locale, typeCode, "recommendation"),
      surface: "secondary" as const,
      pageType: "career_recommendation_detail" as const,
      typeCode,
    })),
    {
      key: "personality_index",
      path: `/${locale}/personality`,
      surface: "seo_only",
      pageType: "personality_index",
    },
    {
      key: "mbti_topic_detail",
      path: `/${locale}/topics/mbti`,
      surface: "seo_only",
      pageType: "topic_detail",
    },
  ];
}

export function getMbtiStableLaunchSmokeMatrix(): Record<
  (typeof MBTI_ADS_STABLE_SMOKE_LOCALES)[number],
  MbtiAdsLaunchSmokeEntry[]
> {
  return {
    en: getMbtiStableLaunchSmokeEntries("en"),
    zh: getMbtiStableLaunchSmokeEntries("zh"),
  };
}
