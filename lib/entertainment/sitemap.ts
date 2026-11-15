import { traditionalSearchEquivalent } from "@/lib/seo/traditionalSearchMetadata";
import { TRADITIONAL_PUBLIC_PATHS } from "@/lib/i18n/traditionalRoutes";
import { entertainmentSearchEntries, traditionalEntertainmentSearchCandidates } from "./searchEntries";
import { CANONICAL_SITE_URL } from "@/lib/site";
import type { PublicSitemapEntry } from "@/lib/seo/publicSitemap";

export function appendFunSitemapEntries(entries: PublicSitemapEntry[]): PublicSitemapEntry[] {
  const result = new Map(entries.map(entry => [entry.loc, entry]));
  for (const { path, lastmod } of entertainmentSearchEntries()) {
    for (const locale of ["en", "zh"]) {
      const loc = `${CANONICAL_SITE_URL}/${locale}${path}`;
      result.set(loc, { loc, lastmod });
    }
  }
  for (const path of TRADITIONAL_PUBLIC_PATHS) {
    const loc = `${CANONICAL_SITE_URL}/zh-TW${path}`;
    result.set(loc, { loc });
  }
  return [...result.values()].sort((a, b) => a.loc.localeCompare(b.loc));
}


export function appendTraditionalEntertainmentSitemapEntries(entries: PublicSitemapEntry[]): PublicSitemapEntry[] {
  const result = new Map(entries.map(entry => [entry.loc, entry]));
  for (const { path, lastmod } of traditionalEntertainmentSearchCandidates) {
    const traditionalPath = traditionalSearchEquivalent(`/zh-TW${path}`);
    if (traditionalPath) {
      const loc = `${CANONICAL_SITE_URL}${traditionalPath}`;
      result.set(loc, { loc, lastmod });
    }
  }
  return [...result.values()].sort((a, b) => a.loc.localeCompare(b.loc));
}
