import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { afterEach, describe, expect, it, vi } from "vitest";

const ROOT = process.cwd();
const requireFromRoot = createRequire(path.join(ROOT, "package.json"));
const PRIVATE_PATH_RE =
  /(?:^|\/)(?:en|zh)?\/?(?:result|results|orders?|share|pay|payment|history)(?:\/|$)|\/tests\/[^/]+\/take(?:\/|$)/i;

type SitemapEntry = {
  loc?: string;
};

function loadSitemapConfig() {
  delete requireFromRoot.cache[requireFromRoot.resolve("./next-sitemap.config.js")];
  return requireFromRoot("./next-sitemap.config.js") as {
    additionalPaths: () => Promise<SitemapEntry[]>;
  };
}

afterEach(() => {
  delete requireFromRoot.cache[requireFromRoot.resolve("./next-sitemap.config.js")];
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("sitemap generation fallback contract", () => {
  it("builds a safe minimal XML sitemap when dynamic generation fails", () => {
    const fallback = requireFromRoot("./lib/seo/sitemapFallback.cjs") as {
      buildSafeSitemapFallbackPaths: () => string[];
      buildSafeSitemapFallbackXml: (siteUrl?: string) => string;
    };

    const paths = fallback.buildSafeSitemapFallbackPaths();
    const xml = fallback.buildSafeSitemapFallbackXml("https://www.fermatmind.com");
    const locs = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((match) => match[1]);

    expect(paths).toEqual(expect.arrayContaining(["/", "/en", "/en/tests", "/zh/tests"]));
    expect(paths.length).toBeGreaterThan(10);
    expect(paths.some((entry) => PRIVATE_PATH_RE.test(entry))).toBe(false);
    expect(locs[0]).toBe("https://fermatmind.com");
    expect(locs).toContain("https://fermatmind.com/en/tests/mbti-personality-test-16-personality-types");
    expect(locs).toContain("https://fermatmind.com/zh/tests/holland-career-interest-test-riasec");
    expect(locs.every((loc) => loc.startsWith("https://fermatmind.com"))).toBe(true);
    expect(locs.some((loc) => PRIVATE_PATH_RE.test(new URL(loc).pathname))).toBe(false);
  });

  it("keeps additionalPaths safe when every remote authority request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("simulated authority outage");
      })
    );

    const additionalPaths = await loadSitemapConfig().additionalPaths();
    const locs = additionalPaths.map((entry) => String(entry.loc ?? ""));

    expect(locs).toContain("/");
    expect(locs).toContain("/en/tests");
    expect(locs).toContain("/zh/tests");
    expect(locs).toContain("/en/method-boundaries");
    expect(locs).toContain("/zh/method-boundaries");
    expect(locs.some((loc) => PRIVATE_PATH_RE.test(loc))).toBe(false);
    expect(locs).not.toContain("/en/career/jobs/software-developers");
    expect(locs).not.toContain("/zh/career/jobs/software-developers");
    expect(locs.some((loc) => loc.includes("?"))).toBe(false);
  });

  it("keeps the generation wrapper responsible for writing fallback XML on CLI failure", () => {
    const source = fs.readFileSync(path.join(ROOT, "scripts/seo/generate-sitemap.mjs"), "utf8");

    expect(source).toContain("buildSafeSitemapFallbackXml");
    expect(source).toContain("writeSafeFallbackSitemap");
    expect(source).toContain("privateSitemapPathPattern");
    expect(source).toContain("hasSafeUsableSitemapXml");
    expect(source).toContain("next-sitemap failed");
    expect(source).toContain("generated sitemap was missing or empty");
  });
});
