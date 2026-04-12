import path from "node:path";
import { createRequire } from "node:module";
import { afterEach, describe, expect, it, vi } from "vitest";

const ROOT = process.cwd();
const requireFromRoot = createRequire(path.join(ROOT, "package.json"));

function jsonResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("sitemap indexability contract", () => {
  it("frontend sitemap config keeps authority-safe Career detail routes and excludes query/search-style Career discovery", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);

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

        if (url.includes("/api/v0.5/career/first-wave/launch-tier?")) {
          return jsonResponse({
            summary_kind: "career_first_wave_launch_tier",
            summary_version: "career.launch_tier.first_wave.v1",
            scope: "career_first_wave_10",
            counts: {
              total: 2,
              stable: 1,
              candidate: 1,
              hold: 0,
            },
            occupations: [
              {
                canonical_slug: "backend-architect",
                launch_tier: "stable",
              },
              {
                canonical_slug: "data-engineer",
                launch_tier: "candidate",
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

        if (url.includes("/api/v0.5/career/family/data-science?")) {
          return jsonResponse({
            family: {
              canonical_slug: "data-science",
            },
            counts: {
              visible_children_count: 1,
            },
          });
        }

        if (url.includes("/api/v0.5/career/family/compliance?")) {
          return jsonResponse({
            family: {
              canonical_slug: "compliance",
            },
            counts: {
              visible_children_count: 0,
            },
          });
        }

        return jsonResponse({ items: [] });
      })
    );

    const config = requireFromRoot("./next-sitemap.config.js");
    const additionalPaths = await config.additionalPaths();
    const locs = additionalPaths.map((entry: { loc?: string }) => String(entry?.loc ?? ""));

    expect(locs).toEqual(
      expect.arrayContaining([
        "/en/topics/mbti",
        "/zh/topics/mbti",
        "/en/help/faq",
        "/zh/help/faq",
        "/en/personality",
        "/zh/personality",
        "/en/articles",
        "/zh/articles",
        "/en/career/guides",
        "/zh/career/guides",
        "/en/career/jobs/backend-architect",
        "/zh/career/jobs/backend-architect",
        "/en/career/family/data-science",
        "/zh/career/family/data-science",
        "/en/career/recommendations/mbti/intj-a",
        "/zh/career/recommendations/mbti/intj-a",
      ])
    );
    expect(locs).not.toContain("/en/career/jobs/data-engineer");
    expect(locs).not.toContain("/zh/career/jobs/data-engineer");
    expect(locs).not.toContain("/en/career/family/compliance");
    expect(locs).not.toContain("/zh/career/family/compliance");
    expect(locs.some((loc: string) => loc.includes("/career/recommendations/big5/"))).toBe(false);
    expect(locs.some((loc: string) => loc.includes("?q="))).toBe(false);
  });

  it("frontend sitemap config excludes retired and private route families", async () => {
    const config = requireFromRoot("./next-sitemap.config.js");
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
});
