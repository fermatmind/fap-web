import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { extractBackendSitemapBigFiveZhPaths } from "@/lib/seo/backendSitemapSource";
import {
  BIG_FIVE_PUBLIC_ROUTE_ENTRIES,
  BIG_FIVE_LEGACY_TO_CANONICAL_SLUG,
} from "@/lib/personality/bigFivePublicRoutes";

const canonicalPaths = BIG_FIVE_PUBLIC_ROUTE_ENTRIES.flatMap((entry) => [
  `/en/personality/big-five${entry.pathSuffix}`,
  `/zh/personality/big-five${entry.pathSuffix}`,
]);

describe("BIG5-114-SEO-RUNTIME-RELEASE-01", () => {
  it("accepts exactly 104 backend-authorized canonical Big Five routes and rejects redirect aliases", () => {
    const aliases = Object.keys(BIG_FIVE_LEGACY_TO_CANONICAL_SLUG).flatMap((slug) => [
      `https://fermatmind.com/en/personality/big-five/${slug}`,
      `https://fermatmind.com/zh/personality/big-five/${slug}`,
    ]);
    const paths = extractBackendSitemapBigFiveZhPaths({
      items: [
        ...canonicalPaths.map((path) => ({ loc: `https://fermatmind.com${path}` })),
        ...aliases.map((loc) => ({ loc })),
        { loc: "https://fermatmind.com/en/personality/big-five/unknown" },
        { loc: "https://attacker.example/en/personality/big-five/openness" },
      ],
    });

    expect(canonicalPaths).toHaveLength(104);
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
});
