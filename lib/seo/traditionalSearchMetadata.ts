import { entertainmentSearchPaths } from "@/lib/entertainment/searchEntries";
import type { Metadata } from "next";
import { hasTraditionalAssessmentSearchPath, traditionalEquivalent, traditionalPath } from "@/lib/i18n/traditionalRoutes";
import { CANONICAL_SITE_URL, isConfiguredStagingSiteUrl } from "@/lib/site";

export function traditionalSearchEquivalent(pathname: string): string | null {
  const path = traditionalPath(pathname);
  if (path) {
    const suffix = path.slice("/zh-TW".length);
    if (entertainmentSearchPaths.has(suffix) || hasTraditionalAssessmentSearchPath(suffix)) return path;
  }
  return traditionalEquivalent(pathname);
}

export function traditionalSearchMetadata(path: string, metadata: Metadata): Metadata {
  if (isConfiguredStagingSiteUrl() || traditionalSearchEquivalent(path) !== path) return metadata;
  const suffix = path.slice("/zh-TW".length);
  return {
    ...metadata,
    robots: { index: true, follow: true },
    alternates: {
      canonical: CANONICAL_SITE_URL + path,
      languages: {
        "zh-TW": CANONICAL_SITE_URL + path,
        "zh-CN": `${CANONICAL_SITE_URL}/zh${suffix}`,
        en: `${CANONICAL_SITE_URL}/en${suffix}`,
        "x-default": `${CANONICAL_SITE_URL}/en${suffix}`,
      },
    },
  };
}
