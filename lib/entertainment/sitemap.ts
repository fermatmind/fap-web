import catalog from "./catalog.json";
import { CANONICAL_SITE_URL } from "@/lib/site";
import type { PublicSitemapEntry } from "@/lib/seo/publicSitemap";

// This code-owned experimental family has no counterpart in the backend scales registry.
// Core assessments and all CMS families continue to use their backend authority.
export function appendFunSitemapEntries(entries: PublicSitemapEntry[]): PublicSitemapEntry[] {
  const result = new Map(entries.map(entry => [entry.loc, entry]));
  for (const quiz of catalog) {
    for (const locale of ["en", "zh"]) {
      const loc = `${CANONICAL_SITE_URL}/${locale}/tests/play/${quiz.slug}`;
      result.set(loc, { loc, lastmod: `${quiz.updated}T00:00:00.000Z` });
    }
  }
  return [...result.values()].sort((a, b) => a.loc.localeCompare(b.loc));
}
