import { CANONICAL_SITE_URL } from "@/lib/site";
import type { PublicSitemapEntry } from "@/lib/seo/publicSitemap";
import { PUBLIC_PATH, RESOURCE_PATHS } from "./core";
export function appendFriendshipSitemapEntries(entries: PublicSitemapEntry[]): PublicSitemapEntry[] {
  const result = new Map(entries.map(entry => [entry.loc, entry]));
  for (const locale of ["en", "zh"]) for (const suffix of RESOURCE_PATHS) {
    const loc = `${CANONICAL_SITE_URL}/${locale}${PUBLIC_PATH}${suffix}`;
    result.set(loc, { loc, lastmod: "2026-10-26T00:00:00.000Z" });
  }
  return [...result.values()].sort((a, b) => a.loc.localeCompare(b.loc));
}
