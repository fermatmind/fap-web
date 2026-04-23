import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function read(relPath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relPath), "utf8");
}

describe("non-article multilingual public rollout contract", () => {
  it("keeps support hub on CMS/public APIs instead of local editorial copy", () => {
    const supportPage = read("app/(localized)/[locale]/support/page.tsx");

    expect(supportPage).toContain("getHelpGatewaySurface");
    expect(supportPage).toContain("listSupportArticles");
    expect(supportPage).toContain("listInterpretationGuides");
    expect(supportPage).not.toContain("const copy = {");
  });

  it("defines dedicated public routes for support articles and interpretation guides", () => {
    const supportArticlePage = read("app/(localized)/[locale]/support/articles/[slug]/page.tsx");
    const interpretationGuidePage = read("app/(localized)/[locale]/support/guides/[slug]/page.tsx");

    expect(supportArticlePage).toContain("getSupportArticle");
    expect(supportArticlePage).toContain("buildSupportArticlePath");
    expect(interpretationGuidePage).toContain("getInterpretationGuide");
    expect(interpretationGuidePage).toContain("buildInterpretationGuidePath");
  });

  it("defines a token-gated content release revalidation endpoint", () => {
    const routeSource = read("app/api/content-release/revalidate/route.ts");

    expect(routeSource).toContain("CONTENT_RELEASE_REVALIDATE_TOKEN");
    expect(routeSource).toContain("x-fm-content-release-token");
    expect(routeSource).toContain("revalidatePath");
  });
});
