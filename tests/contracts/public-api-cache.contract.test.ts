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
});
