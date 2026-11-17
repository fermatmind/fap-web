import { isBilingualInterestDirectoryPath } from "@/lib/career/interestDirectoryRoutes";
import { indexableCareerInterestPilots } from "@/lib/career/explorationPilot";
import { entertainmentSearchPaths } from "@/lib/entertainment/searchEntries";
import type { Metadata } from "next";
import { hasTraditionalAssessmentSearchPath, traditionalEquivalent, traditionalPath } from "@/lib/i18n/traditionalRoutes";
import { CANONICAL_SITE_URL, isConfiguredStagingSiteUrl } from "@/lib/site";

const publicCareerInterestPaths = new Set(indexableCareerInterestPilots().map(({ path }) =>
  path.replace(/^\/(?:en|zh)\//u, "/"),
));

export function hasTraditionalCareerInterestSearchPath(path: string): boolean {
  return !isBilingualInterestDirectoryPath(path) && publicCareerInterestPaths.has(path);
}

const publicCareerEntryPaths = new Set(["/career", "/career/tests", "/career/recommendations"]);

export function hasTraditionalCareerEntrySearchPath(path: string): boolean {
  return publicCareerEntryPaths.has(path);
}

const publicResourcePaths = new Set(["/business", "/support", "/holland-test/pdf-download", "/tests/enneagram-personality-test-nine-types/technical-note"]);

export function hasTraditionalPublicResourceSearchPath(path: string): boolean {
  return publicResourcePaths.has(path);
}

export function traditionalSearchEquivalent(pathname: string): string | null {
  const suffix = pathname.replace(/^\/(?:en|zh|zh-TW)\//u, "/");
  if (hasTraditionalPublicResourceSearchPath(suffix) || hasTraditionalAssessmentSearchPath(suffix) || hasTraditionalCareerInterestSearchPath(suffix) || hasTraditionalCareerEntrySearchPath(suffix)) return `/zh-TW${suffix}`;
  const path = traditionalPath(pathname);
  if (path && entertainmentSearchPaths.has(suffix)) return path;
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
