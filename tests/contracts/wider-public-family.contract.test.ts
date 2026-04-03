import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function read(relPath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relPath), "utf8");
}

describe("wider public family contract", () => {
  it("articles index consumes backend landing surface instead of route-local hub copy only", () => {
    const source = read("app/(localized)/[locale]/articles/page.tsx");

    expect(source).toContain("const { items, pagination, landingSurface } = await getCmsArticles");
    expect(source).toContain('findLandingCta(landingSurface, "featured_article")');
    expect(source).toContain("landingSurface?.summaryBlocks[0]?.title");
  });

  it("help routes consume backend public gateway surfaces", () => {
    const helpIndex = read("app/(localized)/[locale]/help/page.tsx");
    const helpDetail = read("app/(localized)/[locale]/help/[slug]/page.tsx");

    expect(helpIndex).toContain('from "@/lib/publicGateway"');
    expect(helpIndex).toContain("const gatewaySurface = await getHelpGatewaySurface(locale)");
    expect(helpIndex).toContain("landingSurface?.discoverabilityItems");

    expect(helpDetail).toContain('from "@/lib/publicGateway"');
    expect(helpDetail).toContain("const gatewaySurface = await getHelpDetailGatewaySurface(page.slug, locale)");
    expect(helpDetail).toContain("<AnswerSurfaceSection");
  });

  it("home and tests index publish curated discoverability surfaces with visible structured lists", () => {
    const home = read("app/(localized)/[locale]/page.tsx");
    const testsIndex = read("app/(localized)/[locale]/tests/page.tsx");

    expect(home).toContain('import { HomePageExperience } from "@/components/marketing/HomePageExperience"');
    expect(home).toContain('import { getHomePageContent } from "@/lib/marketing/homepageContent"');
    expect(home).toContain("function buildHomeJsonLd(locale: Locale)");
    expect(home).toContain('idSuffix: "quickstart-itemlist"');
    expect(home).toContain('idSuffix: "family-itemlist"');
    expect(home).toContain("<HomePageExperience locale={locale} />");

    expect(testsIndex).toContain('import { TestsHubExperience } from "@/components/marketing/tests/TestsHubExperience"');
    expect(testsIndex).toContain('import { getTestsHubContent } from "@/lib/marketing/testsHubContent"');
    expect(testsIndex).toContain("function buildTestsHubJsonLd(locale: Locale)");
    expect(testsIndex).toContain('idSuffix: "quickstart-itemlist"');
    expect(testsIndex).toContain('idSuffix: "family-itemlist"');
    expect(testsIndex).toContain("<TestsHubExperience locale={locale} />");
  });
});
