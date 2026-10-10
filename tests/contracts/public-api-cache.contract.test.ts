import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getCareerGuideFromCmsBySlug, getCareerGuideSeoFromCmsBySlug } from "@/lib/cms/career-guides";

function read(relPath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relPath), "utf8");
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("public api cache contract", () => {
  it("keeps hot public lookup and cms fetches on a shared revalidate policy", () => {
    // Exact Topic and guide exceptions are checked through their real fetch
    // client; the remaining hot readers retain the common cache policy.
    const files = [
      "lib/content.ts",
      "app/(localized)/[locale]/tests/[slug]/take/page.tsx",
      "lib/career/api/fetchCareerRecommendationIndex.ts",
      "lib/career/api/fetchCareerRecommendationBundle.ts",
      "lib/career/api/fetchCareerTransitionPreview.ts",
      "lib/cms/personality.ts",
      "lib/cms/career-jobs.ts",
      "lib/cms/career-recommendations.ts",
    ];

    for (const file of files) {
      const source = read(file);
      expect(source).toContain("PUBLIC_API_CACHE_OPTIONS");
      expect(source).not.toContain('cache: "no-store"');
    }
  });

  it.each(["en", "zh"] as const)("bounds the live guide exception without weakening neighboring cache policy (%s)", async (locale) => {
    const liveSlug = "iq-eq-balance-at-work";
    const slugs = [liveSlug, `${liveSlug}-related`, "unrelated-guide"];
    const fetcher = vi.fn(async (input: RequestInfo | URL, options?: RequestInit) => {
      void options;
      const url = new URL(String(input));
      const slug = url.pathname.split("/")[4];
      const payload = url.pathname.endsWith("/seo")
        ? { meta: { title: "Guide metadata", description: "Current limits" } }
        : { guide: { id: 1, slug, locale: locale === "zh" ? "zh-CN" : "en",
          title: "Current guide", body_md: "Current guide body", is_public: true } };
      return new Response(JSON.stringify(payload), { headers: { "Content-Type": "application/json" } });
    });
    vi.stubGlobal("fetch", fetcher);
    for (const slug of slugs) {
      expect(await getCareerGuideFromCmsBySlug(slug, locale)).toMatchObject({ slug, bodyMd: "Current guide body" });
      expect((await getCareerGuideSeoFromCmsBySlug(slug, locale))?.meta.title).toBe("Guide metadata");
    }
    expect(fetcher).toHaveBeenCalledTimes(6);
    expect(fetcher.mock.calls.filter(([input]) => new URL(String(input)).pathname.split("/")[4] === liveSlug)).toHaveLength(2);
    for (const [input, options] of fetcher.mock.calls as [RequestInfo | URL, RequestInit & { next?: { revalidate?: number } }][]) {
      const selected = new URL(String(input)).pathname.split("/")[4] === liveSlug;
      if (selected) {
        expect(options.cache).toBe("no-store");
        expect(options.next).toBeUndefined();
      } else {
        expect(options.cache).toBeUndefined();
        expect(options.next?.revalidate).toBe(300);
      }
    }
  });

  it("defines a single public api revalidate window", () => {
    const source = read("lib/publicApiCache.ts");

    expect(source).toContain("PUBLIC_API_REVALIDATE_SECONDS = 300");
    expect(source).toContain("PUBLIC_API_CACHE_OPTIONS");
    expect(source).toContain("revalidate: PUBLIC_API_REVALIDATE_SECONDS");
  });

  it("uses route-level revalidate instead of force dynamic on cache-safe public SEO pages", () => {
    const publicSeoRoutes = [
      "app/(localized)/[locale]/personality/page.tsx",
      "app/(localized)/[locale]/personality/[type]/page.tsx",
      "app/(localized)/[locale]/topics/page.tsx",
      "app/(localized)/[locale]/topics/[slug]/page.tsx",
      "app/(localized)/[locale]/career/guides/page.tsx",
      "app/(localized)/[locale]/career/guides/[slug]/page.tsx",
    ];

    for (const file of publicSeoRoutes) {
      const source = read(file);
      expect(source).toContain("export const revalidate = 300");
      expect(source).not.toContain('export const dynamic = "force-dynamic"');
    }
  });

  it("forces static rendering only for public SEO detail pages that do not require per-request nonce HTML", () => {
    const publicSeoDetailRoutes = [
      "app/(localized)/[locale]/career/guides/[slug]/page.tsx",
    ];

    for (const file of publicSeoDetailRoutes) {
      expect(read(file)).toContain('export const dynamic = "force-static"');
    }
  });

  it("renders personality detail and comparison HTML per request so the CSP nonce matches the document", () => {
    const source = read("app/(localized)/[locale]/personality/[type]/page.tsx");
    const loadingBoundary = path.join(process.cwd(), "app/(localized)/[locale]/personality/loading.tsx");

    expect(source).toContain('import { connection } from "next/server"');
    expect(source.match(/await connection\(\);/g)).toHaveLength(2);
    expect(source).toContain("export const revalidate = 300");
    expect(source).not.toContain('export const dynamic = "force-static"');
    expect(source).not.toContain('export const dynamic = "force-dynamic"');
    expect(fs.existsSync(loadingBoundary)).toBe(false);
  });

  it("renders Topic detail HTML per request for nonce CSP while retaining the shared data-cache window", () => {
    const source = read("app/(localized)/[locale]/topics/[slug]/page.tsx");

    expect(source).toContain('import { connection } from "next/server"');
    expect(source).toContain("await connection()");
    expect(source).toContain("export const revalidate = 300");
    expect(source).not.toContain('export const dynamic = "force-static"');
    expect(source).not.toContain('export const dynamic = "force-dynamic"');
  });

  it("renders Chinese Current detail from an uncached bundle while retaining cached SEO authority", () => {
    const source = read("app/(localized)/[locale]/career/jobs/[slug]/page.tsx");
    const fetchSource = read("lib/career/api/fetchCareerJobBundle.ts");

    expect(source).toContain('export const dynamic = "force-dynamic"');
    expect(source).not.toContain("export const revalidate = 300");
    expect(source).not.toContain('cache: "no-store"');
    expect(fetchSource).toContain('toApiLocale(locale) === "zh-CN"');
    expect(fetchSource).toContain('cache: "no-store" as const');
    expect(fetchSource).toContain("detailCacheOptions");
  });

  it("caches only the unfiltered first career directory page", () => {
    const source = read("app/(localized)/[locale]/career/page.tsx");
    const fetchSource = read("lib/career/api/fetchCareerDirectory.ts");

    expect(source).toContain("export const revalidate = 300");
    expect(source).not.toContain('export const dynamic = "force-dynamic"');
    expect(fetchSource).toContain("PUBLIC_API_CACHE_OPTIONS");
    expect(fetchSource).toContain("careerDirectoryCacheTag");
    expect(fetchSource).toContain('return { cache: "no-store" as const }');
    expect(fetchSource).toContain("hasQuery || hasFamily || page > 1");
  });

  it("does not enumerate retired professions detail routes from CMS during build", () => {
    const source = read("app/(localized)/[locale]/professions/[code]/page.tsx");

    expect(source).toContain("export const dynamicParams = false");
    expect(source).toContain("export function generateStaticParams()");
    expect(source).toContain("return []");
    expect(source).not.toContain("listPersonalityProfiles");
  });
});
