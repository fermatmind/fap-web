import { isCoreAssessmentSlug } from "@/lib/tests/coreAssessmentSlugs";
import { normalizeInternalHref } from "@/lib/url/safeContentUrls";
import type { DisplayLocale } from "./locales";

export const HISTORY_DISPLAY_PATHS = [
  "/history/mbti",
  "/history/riasec",
  "/history/big5",
  "/history/big5/compare",
  "/history/enneagram",
  "/history/eq",
] as const;

export function historyDisplayHref(href: string, displayLocale: DisplayLocale): string {
  if (displayLocale !== "zh-TW") return href;
  const internal = normalizeInternalHref(href);
  if (!internal || !internal.startsWith("/")) return href;
  const path = internal.replace(/^\/(?:zh|en|zh-TW)(?=\/)/, "");
  const pathname = path.split(/[?#]/u, 1)[0];
  const form = /^\/tests\/([a-z0-9_-]+)\/take$/iu.exec(pathname);
  if (HISTORY_DISPLAY_PATHS.some(entry => entry === pathname)
    || /^\/result\/[A-Za-z0-9_-]{1,128}$/u.test(pathname)
    || pathname === "/results/lookup"
    || (form && isCoreAssessmentSlug(form[1]))) return `/zh-TW${path}`;
  return href;
}
