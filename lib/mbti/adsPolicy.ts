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

export type MbtiAdsSurfacePolicy = "primary" | "secondary" | "seo_only" | "forbidden" | "other";
export type MbtiAdsLaunchTier = "stable" | "candidate" | "hold";
export type MbtiAdsTypeCode = (typeof MBTI_TYPE_CODES)[number];

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
} as const;

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
