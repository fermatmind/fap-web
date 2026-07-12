import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  extractBackendSitemapEnneagramPublicAssetPaths,
  extractBackendSitemapEnneagramZhPaths,
} from "@/lib/seo/backendSitemapSource";
import {
  buildEnneagramPublicContentPath,
  ENNEAGRAM_PUBLIC_ROUTE_ENTRIES,
} from "@/lib/personality/enneagramPublicRoutes";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function payloadFor(paths: readonly string[]) {
  return {
    items: paths.map((entryPath) => ({ loc: `https://fermatmind.com${entryPath}` })),
  };
}

describe("ENNEAGRAM-90-FRONTEND-SITEMAP-EXTRACTOR-01", () => {
  it("extracts the full 116-page bilingual Enneagram public asset sitemap cohort from backend authority", () => {
    const expectedPaths = ENNEAGRAM_PUBLIC_ROUTE_ENTRIES.flatMap((entry) => [
      buildEnneagramPublicContentPath("en", entry),
      buildEnneagramPublicContentPath("zh", entry),
    ]).sort((left, right) => left.localeCompare(right));

    expect(expectedPaths).toHaveLength(116);
    expect(extractBackendSitemapEnneagramPublicAssetPaths(payloadFor(expectedPaths))).toEqual(expectedPaths);
    expect(expectedPaths).toContain("/en/personality/enneagram");
    expect(expectedPaths).toContain("/zh/personality/enneagram");
    expect(expectedPaths).toContain("/en/personality/enneagram/wings/1w9");
    expect(expectedPaths).toContain("/zh/personality/enneagram/wings/9w1");
    expect(expectedPaths).toContain("/en/personality/enneagram/type-1/instincts/self-preservation");
    expect(expectedPaths).toContain("/zh/personality/enneagram/type-9/instincts/one-to-one");
  });

  it("keeps unsupported Enneagram sitemap paths, aliases, private hosts, and non-canonical URLs fail-closed", () => {
    expect(extractBackendSitemapEnneagramPublicAssetPaths({
      items: [
        { loc: "https://fermatmind.com/en/personality/enneagram/wings/5w4" },
        { loc: "https://fermatmind.com/zh/personality/enneagram/type-2/instincts/social" },
        { loc: "https://fermatmind.com/en/personality/enneagram/5w4" },
        { loc: "https://fermatmind.com/en/personality/enneagram/type-2/self-preservation" },
        { loc: "https://fermatmind.com/en/personality/enneagram/type-2/instincts/sexual" },
        { loc: "https://fermatmind.com/en/personality/enneagram/tritype-548" },
        { loc: "https://staging.fermatmind.com/en/personality/enneagram/wings/5w4" },
        { loc: "http://fermatmind.com/en/personality/enneagram/wings/5w4" },
        { loc: "https://fermatmind.com/en/personality/enneagram/wings/5w4?preview=1" },
      ],
    })).toEqual([
      "/en/personality/enneagram/wings/5w4",
      "/zh/personality/enneagram/type-2/instincts/social",
    ]);
  });

  it("preserves the sitemap extractor while requiring a distinct llms eligibility authority", () => {
    const paths = [
      "/en/personality/enneagram",
      "/zh/personality/enneagram",
      "/en/personality/enneagram/type-5",
      "/zh/personality/enneagram/type-5",
      "/en/personality/enneagram/wings/5w4",
      "/zh/personality/enneagram/wings/5w4",
      "/en/personality/enneagram/type-5/instincts/social",
      "/zh/personality/enneagram/type-5/instincts/social",
    ];

    expect(extractBackendSitemapEnneagramZhPaths(payloadFor(paths))).toEqual([
      "/zh/personality/enneagram",
      "/zh/personality/enneagram/type-5",
      "/zh/personality/enneagram/type-5/instincts/social",
      "/zh/personality/enneagram/wings/5w4",
    ]);

    const llms = read("app/llms.txt/route.ts");
    const llmsFull = read("app/llms-full.txt/route.ts");
    expect(llms).toContain("listEnneagramLlmsPaths");
    expect(llms).not.toContain("listBackendSitemapEnneagram");
    expect(llmsFull).not.toContain("listBackendSitemapEnneagram");
    expect(llmsFull).not.toContain("listEnneagramLlmsPaths");
  });
});
