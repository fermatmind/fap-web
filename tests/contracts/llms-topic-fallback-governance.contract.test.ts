import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSource(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("llms topic backend authority", () => {
  it("uses backend topic exposure with LKG and no local discoverability fixture", () => {
    const llmsSource = readSource("app/llms.txt/route.ts");
    const llmsFullSource = readSource("app/llms-full.txt/route.ts");

    for (const source of [llmsSource, llmsFullSource]) {
      expect(source).toContain("listDiscoverableTopicsWithLastKnownGood");
      expect(source).not.toContain("TOPIC_LLMS_COMPATIBILITY_FALLBACK");
      expect(source).not.toContain("TOPIC_FALLBACK");
    }
  });

  it("keeps topic detail paths out of static sitemap authority", () => {
    const sitemapSource = readSource("lib/seo/sitemapAuthorityAdapters.cjs");

    expect(sitemapSource).not.toContain("TOPIC_SLUGS");
    expect(sitemapSource).toContain("function buildTopicPaths() {\n  return [];");
  });
});
