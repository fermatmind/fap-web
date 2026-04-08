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

export type MbtiAdsSurfacePolicy = "primary" | "secondary" | "seo_only" | "forbidden" | "other";

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

export function normalizeMbtiAdsPath(pathname: string): string {
  const [withoutQuery] = pathname.split(/[?#]/, 1);
  const withLeadingSlash = withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
  const normalized = withLeadingSlash.replace(LOCALE_PREFIX_RE, "") || "/";
  return normalized === "" ? "/" : normalized;
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
