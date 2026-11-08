import { normalizeDisplayLocale } from "./locales";
// Partial display-language support is deliberately separate from legacy API/form locales.
// No CMS, report-language, region, price or entitlement mapping is inferred here.
export const TRADITIONAL_LOCALE = "zh-TW" as const;
export const TRADITIONAL_QUIZ_PATH = "/tests/explore/chiikawa";
export const TRADITIONAL_PROFILE_IDS = ["chiikawa", "hachiware", "usagi", "momonga", "kurimanju", "rakko"] as const;
export const TRADITIONAL_PUBLIC_PATHS = ["", "/tests", TRADITIONAL_QUIZ_PATH, ...TRADITIONAL_PROFILE_IDS.map(id => `${TRADITIONAL_QUIZ_PATH}/results/${id}`)];
export function traditionalPath(pathname: string): string | null {
  const prefix = pathname.split("/")[1];
  if (!normalizeDisplayLocale(prefix)) return null;
  const path = pathname.replace(/^\/(?:en|zh|zh-TW)(?=\/|$)/, "").replace(/\/$/, "");
  return TRADITIONAL_PUBLIC_PATHS.includes(path) || path === `${TRADITIONAL_QUIZ_PATH}/take` ? `/zh-TW${path}` : null;
}
export function traditionalEquivalent(pathname: string): string | null {
  const path = traditionalPath(pathname);
  return path?.startsWith(`/zh-TW${TRADITIONAL_QUIZ_PATH}`) && !path.endsWith("/take") ? path : null;
}
