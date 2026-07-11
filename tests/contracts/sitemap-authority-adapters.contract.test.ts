import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const requireCjs = createRequire(import.meta.url);

const sitemapConfig = requireCjs("../../next-sitemap.config.js") as {
  exclude: string[];
  additionalPaths: () => Promise<Array<{ loc: string }>>;
  transform: (_config: unknown, path: string) => Promise<{ loc: string } | null>;
};
const adapters = requireCjs("../../lib/seo/sitemapAuthorityAdapters.cjs") as {
  SITEMAP_ROUTE_EXCLUDES: string[];
  buildStaticGeneratedPaths: () => string[];
  normalizePath: (path: string) => string;
  resolveSitemapSiteUrl: (value?: string) => string;
};

describe("sitemap authority adapters", () => {
  it("keeps static sitemap path authority in the shared adapter", () => {
    const staticPaths = adapters.buildStaticGeneratedPaths();

    expect(staticPaths).toContain("/");
    expect(staticPaths).toContain("/en");
    expect(staticPaths).toContain("/en/tests");
    expect(staticPaths).toContain("/zh/tests");
    expect(staticPaths.some((path) => /^\/(?:en|zh)\/topics\/.+/.test(path))).toBe(false);
    expect(staticPaths).toContain("/zh/policies");
    expect(staticPaths).toContain("/en/help/contact");
    expect(staticPaths).toContain("/en/help/faq");
    expect(staticPaths).toContain("/zh/help/contact");
    expect(staticPaths).toContain("/zh/help/faq");
    expect(staticPaths).toContain("/en/method-boundaries");
    expect(staticPaths).toContain("/zh/method-boundaries");
    expect(staticPaths).toContain("/en/support");
    expect(staticPaths).toContain("/zh/support");
    expect(staticPaths).toContain("/en/privacy");
    expect(staticPaths).toContain("/zh/privacy");
    expect(staticPaths).toContain("/en/terms");
    expect(staticPaths).toContain("/zh/terms");
    expect(staticPaths).not.toContain("/en/help/about");
    expect(staticPaths).not.toContain("/en/career/industries");
    expect(staticPaths).not.toContain("/zh/career/industries");
    expect(staticPaths).not.toContain("/en/career/industries/healthcare");
    expect(staticPaths).not.toContain("/zh/career/industries/healthcare");
    expect(new Set(staticPaths).size).toBe(staticPaths.length);
  });

  it("preserves deny/exclude policy wiring in next-sitemap config", () => {
    expect(sitemapConfig.exclude).toEqual(
      expect.arrayContaining([
        "/zh",
        "/tests",
        "/tests/*",
        "/api/*",
        "/en/career/jobs/*",
        "/zh/career/jobs/*",
        "/ops/*",
        "/en/ops/*",
        "/zh/ops/*",
      ])
    );

    for (const exclude of adapters.SITEMAP_ROUTE_EXCLUDES) {
      expect(sitemapConfig.exclude).toContain(exclude);
    }
  });

  it("keeps normalization and owned site-url resolution deterministic", async () => {
    expect(adapters.normalizePath("en/tests/")).toBe("/en/tests");
    expect(adapters.resolveSitemapSiteUrl("https://www.fermatmind.com")).toBe("https://fermatmind.com");
    expect(adapters.resolveSitemapSiteUrl("https://staging.fermatmind.com")).toBe("https://fermatmind.com");
    expect(adapters.resolveSitemapSiteUrl("https://preview.example.com/")).toBe("https://preview.example.com");

    await expect(sitemapConfig.transform({}, "/en/tests")).resolves.toMatchObject({
      loc: "/en/tests",
    });
    await expect(sitemapConfig.transform({}, "/zh")).resolves.toBeNull();
  });
});
