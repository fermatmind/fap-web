import { normalizeDisplayLocale } from "./locales";
// Partial display-language support is deliberately separate from legacy API/form locales.
// No CMS, report-language, region, price or entitlement mapping is inferred here.
export const TRADITIONAL_LOCALE = "zh-TW" as const;
export const TRADITIONAL_QUIZ_PATH = "/tests/explore/chiikawa";
export const TRADITIONAL_PROFILE_IDS = ["chiikawa", "hachiware", "usagi", "momonga", "kurimanju", "rakko"] as const;
export const TRADITIONAL_SEVEN_SINS_PATH = "/tests/explore/seven-sins-virtues-test";
export const TRADITIONAL_SEVEN_SINS_PROFILE_IDS = ["recognition-reading", "resources-reading", "desire-boundaries-reading", "comparison-reading", "rewards-reading", "anger-reading", "starting-rest-reading"] as const;
// Direct readers are deployed before their native CMS publication. Missing
// variants stay 404; only published pages enter cross-language navigation.
export const TRADITIONAL_CMS_READER_PATHS = ["/about", "/brand", "/charter", "/careers"] as const;
// Expanded only after the corresponding native CMS variants are published.
// Reader deployment and published navigation remain separate inventories.
export const TRADITIONAL_CMS_PUBLISHED_PATHS = ["/about", "/brand", "/charter", "/careers"] as const;
export const TRADITIONAL_PUBLIC_PATHS = ["", "/tests", TRADITIONAL_QUIZ_PATH, ...TRADITIONAL_PROFILE_IDS.map(id => `${TRADITIONAL_QUIZ_PATH}/results/${id}`), TRADITIONAL_SEVEN_SINS_PATH, ...TRADITIONAL_SEVEN_SINS_PROFILE_IDS.map(id => `${TRADITIONAL_SEVEN_SINS_PATH}/results/${id}`)];
export function traditionalPath(pathname: string): string | null {
  const prefix = pathname.split("/")[1];
  if (!normalizeDisplayLocale(prefix)) return null;
  const path = pathname.replace(/^\/(?:en|zh|zh-TW)(?=\/|$)/, "").replace(/\/$/, "");
  // Published CMS pilot: available for language navigation, but not indexable.
  // Keep it out of the sitemap list and reciprocal search alternates.
  if (TRADITIONAL_CMS_PUBLISHED_PATHS.some(entry => entry === path)) return `/zh-TW${path}`;
  if (prefix === "zh-TW" && TRADITIONAL_CMS_READER_PATHS.some(entry => entry === path)) return `/zh-TW${path}`;
  return TRADITIONAL_PUBLIC_PATHS.includes(path) || path === `${TRADITIONAL_QUIZ_PATH}/take` || path === `${TRADITIONAL_SEVEN_SINS_PATH}/take` ? `/zh-TW${path}` : null;
}
export function traditionalEquivalent(pathname: string): string | null {
  const path = traditionalPath(pathname);
  return path && [TRADITIONAL_QUIZ_PATH, TRADITIONAL_SEVEN_SINS_PATH].some(entry => path.startsWith(`/zh-TW${entry}`)) && !path.endsWith("/take") ? path : null;
}
