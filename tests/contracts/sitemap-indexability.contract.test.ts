import path from "node:path";
import { createRequire } from "node:module";
import { afterEach, describe, expect, it, vi } from "vitest";

const ROOT = process.cwd();
const requireFromRoot = createRequire(path.join(ROOT, "package.json"));

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

afterEach(() => {
  delete requireFromRoot.cache[requireFromRoot.resolve("./next-sitemap.config.js")];
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

function loadSitemapConfig() {
  delete requireFromRoot.cache[requireFromRoot.resolve("./next-sitemap.config.js")];
  return requireFromRoot("./next-sitemap.config.js");
}

describe("sitemap indexability contract", () => {
  it("frontend sitemap config uses apex as the owned production host", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.fermatmind.com");
    expect(loadSitemapConfig().siteUrl).toBe("https://fermatmind.com");

    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://fermatmind.com");
    expect(loadSitemapConfig().siteUrl).toBe("https://fermatmind.com");

    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://staging.fermatmind.com");
    expect(loadSitemapConfig().siteUrl).toBe("https://fermatmind.com");
  });

  it("frontend sitemap config includes approved Career job detail routes and excludes query/search-style Career discovery", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);

        if (url.includes("/api/v0.5/seo/sitemap-source")) {
          return jsonResponse({
            ok: true,
            source: "backend_sitemap_generator",
            count: 2,
            items: [
              {
                loc: "https://fermatmind.com/en/career/jobs/backend-architect",
              },
              {
                loc: "https://fermatmind.com/zh/career/jobs/backend-architect",
              },
              {
                loc: "https://fermatmind.com/en/career/jobs/backend-engineer",
              },
              {
                loc: "https://www.fermatmind.com/en/career/jobs/software-developers",
              },
              {
                loc: "https://www.fermatmind.com/zh/career/jobs/software-developers",
              },
              {
                loc: "https://fermatmind.com/en/career/jobs/software-engineer",
              },
              {
                loc: "https://fermatmind.com/en/results/lookup",
              },
              {
                loc: "https://fermatmind.com/zh/results/lookup",
              },
            ],
          });
        }

        if (url.includes("/api/v0.5/career/jobs?")) {
          return jsonResponse({
            items: [
              {
                identity: {
                  canonical_slug: "backend-architect",
                },
                seo_contract: {
                  canonical_path: "/career/jobs/backend-architect",
                  index_state: "indexed",
                  index_eligible: true,
                },
              },
              {
                identity: {
                  canonical_slug: "data-engineer",
                },
                seo_contract: {
                  canonical_path: "/career/jobs/data-engineer",
                  index_state: "indexed",
                  index_eligible: true,
                },
              },
            ],
          });
        }

        if (url.includes("/api/v0.5/career-jobs/backend-architect/seo?")) {
          return jsonResponse({
            meta: { robots: "index,follow" },
            seo_surface_v1: {
              robots_policy: "index,follow",
              indexability_state: "indexable",
              sitemap_state: "included",
              llms_exposure_state: "allow",
            },
          });
        }

        if (url.includes("/api/v0.5/career-jobs/backend-engineer/seo?")) {
          return jsonResponse({
            meta: { robots: "noindex,follow" },
            seo_surface_v1: {
              robots_policy: "noindex,follow",
              indexability_state: "trust_limited",
              sitemap_state: "excluded",
              llms_exposure_state: "blocked",
            },
          });
        }

        if (url.includes("/api/v0.5/career-jobs/")) {
          return jsonResponse({ message: "not found" }, 404);
        }

        if (url.includes("/api/v0.5/career/first-wave/discoverability-manifest?")) {
          return jsonResponse({
            manifest_kind: "career_first_wave_discoverability_manifest",
            manifest_version: "career.discoverability.first_wave.v1",
            scope: "career_first_wave_10",
            routes: [
              {
                route_kind: "career_job_detail",
                canonical_path: "/career/jobs/backend-architect",
                discoverability_state: "discoverable",
                canonical_slug: "backend-architect",
              },
              {
                route_kind: "career_job_detail",
                canonical_path: "/career/jobs/data-engineer",
                discoverability_state: "excluded",
                canonical_slug: "data-engineer",
              },
              {
                route_kind: "career_family_hub",
                canonical_path: "/career/family/data-science",
                discoverability_state: "discoverable",
                canonical_slug: "data-science",
              },
              {
                route_kind: "career_family_hub",
                canonical_path: "/career/family/compliance",
                discoverability_state: "excluded",
                canonical_slug: "compliance",
              },
            ],
          });
        }

        if (url.includes("/api/v0.5/career/recommendations/mbti?")) {
          return jsonResponse({
            items: [
              {
                recommendation_subject_meta: {
                  public_route_slug: "intj-a",
                },
                seo_contract: {
                  canonical_path: "/career/recommendations/mbti/intj-a",
                  index_state: "indexed",
                  index_eligible: true,
                },
              },
            ],
          });
        }

        return jsonResponse({ items: [] });
      })
    );

    const config = loadSitemapConfig();
    const additionalPaths = await config.additionalPaths();
    const locs = additionalPaths.map((entry: { loc?: string }) => String(entry?.loc ?? ""));

    expect(locs).toEqual(
      expect.arrayContaining([
        "/en/topics/mbti",
        "/zh/topics/mbti",
        "/en/personality",
        "/zh/personality",
        "/en/articles",
        "/zh/articles",
        "/en/career/guides",
        "/zh/career/guides",
        "/en/career/recommendations/mbti/intj-a",
        "/zh/career/recommendations/mbti/intj-a",
      ])
    );
    expect(locs).toContain("/en/career/jobs/backend-architect");
    expect(locs).toContain("/zh/career/jobs/backend-architect");
    expect(locs).not.toContain("/en/help/about");
    expect(locs).not.toContain("/en/help/contact");
    expect(locs).not.toContain("/en/help/faq");
    expect(locs).not.toContain("/en/help/for-business-and-research");
    expect(locs).not.toContain("/en/help/team");
    expect(locs).not.toContain("/en/help/used-and-mentioned");
    expect(locs).not.toContain("/zh/help/contact");
    expect(locs).not.toContain("/zh/help/faq");
    expect(locs).not.toContain("/zh/help/for-business-and-research");
    expect(locs).not.toContain("/en/method-boundaries");
    expect(locs).not.toContain("/zh/method-boundaries");
    expect(locs).not.toContain("/zh/policies");
    expect(locs).not.toContain("/en/privacy");
    expect(locs).not.toContain("/zh/privacy");
    expect(locs).not.toContain("/en/support");
    expect(locs).not.toContain("/zh/support");
    expect(locs).not.toContain("/en/terms");
    expect(locs).not.toContain("/zh/terms");
    expect(locs).not.toContain("/en/career/jobs/backend-engineer");
    expect(locs).not.toContain("/en/career/jobs/software-engineer");
    expect(locs).not.toContain("/en/career/jobs/software-developers");
    expect(locs).not.toContain("/zh/career/jobs/software-developers");
    expect(locs).not.toContain("/en/results/lookup");
    expect(locs).not.toContain("/zh/results/lookup");
    expect(locs).not.toContain("/en/career/jobs/data-engineer");
    expect(locs).not.toContain("/zh/career/jobs/data-engineer");
    expect(locs).not.toContain("/en/career/family/data-science");
    expect(locs).not.toContain("/zh/career/family/data-science");
    expect(locs).not.toContain("/en/career/family/compliance");
    expect(locs).not.toContain("/zh/career/family/compliance");
    expect(locs.some((loc: string) => loc.includes("/career/recommendations/big5/"))).toBe(false);
    expect(locs.some((loc: string) => loc.includes("?q="))).toBe(false);
  });

  it("frontend sitemap config keeps backend-owned MBTI personality A/T variant routes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);

        if (url.includes("/api/v0.5/seo/sitemap-source")) {
          return jsonResponse({
            ok: true,
            source: "backend_sitemap_generator",
            count: 7,
            items: [
              { loc: "https://fermatmind.com/en/personality/intp-a" },
              { loc: "https://fermatmind.com/en/personality/intp-t" },
              { loc: "https://fermatmind.com/zh/personality/intp-a" },
              { loc: "https://fermatmind.com/zh/personality/intp-t" },
              { loc: "https://fermatmind.com/en/personality/intp" },
              { loc: "https://fermatmind.com/en/personality/not-a-type" },
              { loc: "https://fermatmind.com/en/types/intp-t" },
            ],
          });
        }

        return jsonResponse({ items: [] });
      })
    );

    const config = loadSitemapConfig();
    const additionalPaths = await config.additionalPaths();
    const locs = additionalPaths.map((entry: { loc?: string }) => String(entry?.loc ?? ""));

    expect(locs).toEqual(
      expect.arrayContaining([
        "/en/personality/intp-a",
        "/en/personality/intp-t",
        "/zh/personality/intp-a",
        "/zh/personality/intp-t",
      ])
    );
    expect(locs).not.toContain("/en/personality/intp");
    expect(locs).not.toContain("/en/personality/not-a-type");
    expect(locs).not.toContain("/en/types/intp-t");
  });

  it("frontend sitemap config excludes retired and private route families", async () => {
    const config = loadSitemapConfig();
    const policy = requireFromRoot("./lib/seo/indexingPolicy.cjs");
    const additionalPaths = await config.additionalPaths();
    const locs = additionalPaths.map((entry: { loc?: string }) => String(entry?.loc ?? ""));

    expect(locs.some((loc: string) => loc.includes("/types/") || loc.endsWith("/types"))).toBe(false);
    expect(locs.some((loc: string) => loc.includes("/share/"))).toBe(false);
    expect(locs.some((loc: string) => loc.includes("/result/"))).toBe(false);
    expect(locs.some((loc: string) => loc.includes("/compare/"))).toBe(false);
    expect(locs.some((loc: string) => loc.includes("/history/"))).toBe(false);
    expect(locs.some((loc: string) => /\/relationships(\/|$)/.test(loc))).toBe(false);
    expect(locs.some((loc: string) => /\/take(\/|$)/.test(loc))).toBe(false);
    expect(policy.shouldIncludeInSitemap("/en/relationships/mbti")).toBe(false);
    expect(policy.shouldIncludeInSitemap("/zh/relationships/mbti")).toBe(false);
  });

  it("frontend sitemap config excludes known redirect, 404, ops, and private final paths", async () => {
    const config = loadSitemapConfig();
    const additionalPaths = await config.additionalPaths();
    const locs = additionalPaths.map((entry: { loc?: string }) => String(entry?.loc ?? ""));

    expect(locs).not.toContain("/zh");
    expect(locs).not.toContain("/en/datasets/occupations");
    expect(locs).not.toContain("/zh/datasets/occupations");
    expect(locs).not.toContain("/en/datasets/occupations/method");
    expect(locs).not.toContain("/zh/datasets/occupations/method");
    expect(locs.some((loc: string) => /^\/tests(?:\/|$)/.test(loc))).toBe(false);
    expect(locs.some((loc: string) => /^\/(?:en|zh)\/ops(?:\/|$)/.test(loc))).toBe(false);
    expect(locs).not.toContain("/en/blog");
    expect(locs).not.toContain("/zh/blog");
    expect(locs).not.toContain("/en/help");
    expect(locs).not.toContain("/zh/help");
    expect(locs).not.toContain("/en/refund");
    expect(locs).not.toContain("/zh/refund");
    expect(locs).not.toContain("/zh/help/about");
    expect(locs).not.toContain("/zh/help/team");
    expect(locs).not.toContain("/zh/help/used-and-mentioned");
    expect(locs).not.toContain("/en/brand");
    expect(locs).not.toContain("/en/careers");
    expect(locs).not.toContain("/en/charter");
    expect(locs).not.toContain("/en/foundation");
    expect(locs).not.toContain("/en/policies");
    expect(await config.transform({}, "/zh")).toBeNull();
    expect(await config.transform({}, "/tests/mbti-personality-test-16-personality-types")).toBeNull();
    expect(await config.transform({}, "/en/tests/mbti-personality-test-16-personality-types")).not.toBeNull();
    expect(await config.transform({}, "/en/help")).toBeNull();
    expect(await config.transform({}, "/zh/help")).toBeNull();
    expect(await config.transform({}, "/en/blog")).toBeNull();
    expect(await config.transform({}, "/zh/blog")).toBeNull();
    expect(await config.transform({}, "/en/refund")).toBeNull();
    expect(await config.transform({}, "/zh/refund")).toBeNull();
    expect(await config.transform({}, "/zh/help/about")).toBeNull();
    expect(await config.transform({}, "/en/brand")).toBeNull();
    expect(await config.transform({}, "/en/careers")).toBeNull();
    expect(await config.transform({}, "/en/datasets/occupations")).toBeNull();
    expect(await config.transform({}, "/zh/datasets/occupations/method")).toBeNull();
    expect(await config.transform({}, "/en/career/jobs/backend-engineer")).toBeNull();
    expect(await config.transform({}, "/zh/career/jobs/product-manager")).toBeNull();
    expect(await config.transform({}, "/en/results/lookup")).toBeNull();
    expect(await config.transform({}, "/zh/results/lookup")).toBeNull();
    expect(await config.transform({}, "/en/ops/content-pages")).toBeNull();
  });
});
