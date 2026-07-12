import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function read(relPath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relPath), "utf8");
}

describe("public api cache contract", () => {
  it("keeps hot public lookup and cms fetches on a shared revalidate policy", () => {
    const files = [
      "app/(localized)/[locale]/tests/[slug]/page.tsx",
      "app/(localized)/[locale]/tests/[slug]/take/page.tsx",
      "lib/career/api/fetchCareerRecommendationIndex.ts",
      "lib/career/api/fetchCareerRecommendationBundle.ts",
      "lib/career/api/fetchCareerTransitionPreview.ts",
      "lib/career/api/fetchCareerJobBundle.ts",
      "lib/cms/topics.ts",
      "lib/cms/personality.ts",
      "lib/cms/career-jobs.ts",
      "lib/cms/career-guides.ts",
      "lib/cms/career-recommendations.ts",
    ];

    for (const file of files) {
      const source = read(file);
      expect(source).toContain("PUBLIC_API_CACHE_OPTIONS");
      expect(source).not.toContain('cache: "no-store"');
    }
  });

  it("defines a single public api revalidate window", () => {
    const source = read("lib/publicApiCache.ts");

    expect(source).toContain("PUBLIC_API_REVALIDATE_SECONDS = 300");
    expect(source).toContain("PUBLIC_API_CACHE_OPTIONS");
    expect(source).toContain("revalidate: PUBLIC_API_REVALIDATE_SECONDS");
  });

  it("uses route-level revalidate instead of force dynamic on public SEO pages", () => {
    const publicSeoRoutes = [
      "app/(localized)/[locale]/personality/page.tsx",
      "app/(localized)/[locale]/personality/[type]/page.tsx",
      "app/(localized)/[locale]/topics/page.tsx",
      "app/(localized)/[locale]/topics/[slug]/page.tsx",
      "app/(localized)/[locale]/career/guides/page.tsx",
      "app/(localized)/[locale]/career/guides/[slug]/page.tsx",
      "app/(localized)/[locale]/career/jobs/[slug]/page.tsx",
    ];

    for (const file of publicSeoRoutes) {
      const source = read(file);
      expect(source).toContain("export const revalidate = 300");
      expect(source).not.toContain('export const dynamic = "force-dynamic"');
    }
  });

  it("forces static rendering for public SEO detail pages that otherwise default to private dynamic headers", () => {
    const publicSeoDetailRoutes = [
      "app/(localized)/[locale]/personality/[type]/page.tsx",
      "app/(localized)/[locale]/topics/[slug]/page.tsx",
      "app/(localized)/[locale]/career/guides/[slug]/page.tsx",
    ];

    for (const file of publicSeoDetailRoutes) {
      expect(read(file)).toContain('export const dynamic = "force-static"');
    }
  });

  it("keeps career job detail public-cacheable while allowing SSR query attribution", () => {
    const source = read("app/(localized)/[locale]/career/jobs/[slug]/page.tsx");

    expect(source).toContain("export const revalidate = 300");
    expect(source).not.toContain('export const dynamic = "force-dynamic"');
    expect(source).not.toContain('cache: "no-store"');
  });

  it("caches only the unfiltered first career directory page", () => {
    const source = read("app/(localized)/[locale]/career/jobs/page.tsx");
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
