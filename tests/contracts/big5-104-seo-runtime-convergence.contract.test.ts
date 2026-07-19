import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { extractBackendSitemapBigFiveCanonicalPaths } from "@/lib/seo/backendSitemapSource";
import {
  BIG_FIVE_PUBLIC_ROUTE_ENTRIES,
  BIG_FIVE_LEGACY_TO_CANONICAL_SLUG,
} from "@/lib/personality/bigFivePublicRoutes";

const canonicalPaths = BIG_FIVE_PUBLIC_ROUTE_ENTRIES.flatMap((entry) => [
  `/en/personality/big-five${entry.pathSuffix}`,
  `/zh/personality/big-five${entry.pathSuffix}`,
]);

describe("BIG5-EN52-104-DISCOVERABILITY-CONVERGENCE-13", () => {
  it("accepts exactly 104 backend-authorized canonical Big Five routes and rejects redirect aliases", () => {
    const aliases = Object.keys(BIG_FIVE_LEGACY_TO_CANONICAL_SLUG).flatMap((slug) => [
      `https://fermatmind.com/en/personality/big-five/${slug}`,
      `https://fermatmind.com/zh/personality/big-five/${slug}`,
    ]);
    const paths = extractBackendSitemapBigFiveCanonicalPaths({
      items: [
        ...canonicalPaths.map((path) => ({ loc: `https://fermatmind.com${path}` })),
        ...aliases.map((loc) => ({ loc })),
        { loc: "https://fermatmind.com/en/personality/big-five/unknown" },
        { loc: "https://attacker.example/en/personality/big-five/openness" },
      ],
    });

    expect(canonicalPaths).toHaveLength(104);
    expect(BIG_FIVE_PUBLIC_ROUTE_ENTRIES.filter((entry) => entry.entityType === "hub")).toHaveLength(1);
    expect(BIG_FIVE_PUBLIC_ROUTE_ENTRIES.filter((entry) => entry.entityType === "domain")).toHaveLength(5);
    expect(BIG_FIVE_PUBLIC_ROUTE_ENTRIES.filter((entry) => entry.entityType === "polarity")).toHaveLength(15);
    expect(BIG_FIVE_PUBLIC_ROUTE_ENTRIES.filter((entry) => entry.entityType === "facet_hub")).toHaveLength(1);
    expect(BIG_FIVE_PUBLIC_ROUTE_ENTRIES.filter((entry) => entry.entityType === "facet_detail")).toHaveLength(30);
    expect(paths).toHaveLength(104);
    expect(paths).toEqual([...canonicalPaths].sort((left, right) => left.localeCompare(right)));
    expect(paths.some((path) => aliases.some((alias) => alias.endsWith(path)))).toBe(false);
  });

  it("enumerates the complete authority cohort in llms and llms-full without frontend editorial fallback", () => {
    const llms = readFileSync("app/llms.txt/route.ts", "utf8");
    const llmsFull = readFileSync("app/llms-full.txt/route.ts", "utf8");
    const sitemap = readFileSync("app/sitemap.xml/route.ts", "utf8");

    expect(llms).toContain("listBackendSitemapBigFiveZhPaths({ signal })");
    expect(llms).toContain("...bigFiveZhPaths");
    expect(llmsFull).toContain("LLMS_FULL_BIG_FIVE_CANONICAL_ENTRY_LIMIT = 104");
    expect(llmsFull).toContain("...bigFiveZhEntries");
    expect(llmsFull).not.toContain("LLMS_FULL_BIG_FIVE_ZH_ENTRY_LIMIT");
    expect(sitemap).toContain("fetchBackendPublicSitemapSource");
    expect(sitemap).not.toMatch(/big.?five.*fallback/i);
  });

  it("keeps aliases redirect-only before backend asset access and outside metadata/hreflang authority", () => {
    const page = readFileSync("app/(localized)/[locale]/personality/big-five/[...slug]/page.tsx", "utf8");
    const routes = readFileSync("lib/personality/bigFivePublicRoutes.ts", "utf8");
    const legacyCheck = page.indexOf("resolveBigFiveLegacyRedirectPath(locale, slug)");
    const backendFetch = page.indexOf("getBigFivePublicContentAsset(locale, entry)");

    expect(BIG_FIVE_PUBLIC_ROUTE_ENTRIES).toHaveLength(52);
    expect(Object.keys(BIG_FIVE_LEGACY_TO_CANONICAL_SLUG)).toHaveLength(10);
    expect(routes).not.toContain("BIG_FIVE_ZH_LEGACY_TO_V2_SLUG");
    expect(legacyCheck).toBeGreaterThan(-1);
    expect(backendFetch).toBeGreaterThan(legacyCheck);
    expect(page).toContain("canonicalCandidate: asset.canonicalPath");
    expect(page).toContain("en: alternatePath(asset.hreflang.en");
    expect(page).toContain('zh: alternatePath(asset.hreflang["zh-CN"]');
  });
});
