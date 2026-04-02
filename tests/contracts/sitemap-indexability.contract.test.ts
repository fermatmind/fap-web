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
  it("frontend sitemap config keeps the current public topics, help, personality, article, and guide routes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          items: [{ public_route_slug: "intj-a" }],
        })
      )
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
        "/en/career/recommendations/mbti/intj-a",
        "/zh/career/recommendations/mbti/intj-a",
      ])
    );
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
