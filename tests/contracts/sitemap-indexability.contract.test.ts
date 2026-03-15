import path from "node:path";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const requireFromRoot = createRequire(path.join(ROOT, "package.json"));

describe("sitemap indexability contract", () => {
  it("frontend sitemap config keeps public topics, help, and career entries without claiming personality, article, or guide authority", async () => {
    const config = requireFromRoot("./next-sitemap.config.js");
    const additionalPaths = await config.additionalPaths();
    const locs = additionalPaths.map((entry: { loc?: string }) => String(entry?.loc ?? ""));

    expect(locs).toEqual(
      expect.arrayContaining([
        "/en/topics/mbti",
        "/zh/topics/mbti",
        "/en/help/faq",
        "/zh/help/faq",
        "/en/career/recommendations/mbti/INTJ",
        "/zh/career/recommendations/mbti/INTJ",
      ])
    );
    expect(locs.some((loc: string) => /^\/(en|zh)\/personality(?:\/|$)/.test(loc))).toBe(false);
    expect(locs.some((loc: string) => /^\/(en|zh)\/articles(?:\/|$)/.test(loc))).toBe(false);
    expect(locs.some((loc: string) => /^\/(en|zh)\/career\/guides(?:\/|$)/.test(loc))).toBe(false);
  });

  it("frontend sitemap config excludes retired and private route families", async () => {
    const config = requireFromRoot("./next-sitemap.config.js");
    const additionalPaths = await config.additionalPaths();
    const locs = additionalPaths.map((entry: { loc?: string }) => String(entry?.loc ?? ""));

    expect(locs.some((loc: string) => loc.includes("/types/") || loc.endsWith("/types"))).toBe(false);
    expect(locs.some((loc: string) => loc.includes("/share/"))).toBe(false);
    expect(locs.some((loc: string) => loc.includes("/result/"))).toBe(false);
    expect(locs.some((loc: string) => loc.includes("/compare/"))).toBe(false);
    expect(locs.some((loc: string) => loc.includes("/history/"))).toBe(false);
    expect(locs.some((loc: string) => /\/take(\/|$)/.test(loc))).toBe(false);
  });
});
