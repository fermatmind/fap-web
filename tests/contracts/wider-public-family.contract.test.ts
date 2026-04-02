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

  it("home and tests index consume backend discoverability ordering", () => {
    const home = read("app/(localized)/[locale]/page.tsx");
    const testsIndex = read("app/(localized)/[locale]/tests/page.tsx");

    expect(home).toContain('import { HeroSection } from "@/components/marketing/HeroSection"');
    expect(home).toContain("const highlightedCards: HomeHighlightedCard[] = preferredLiveSlugs");
    expect(home).toContain("<HighlightedTestsSection locale={locale} cards={highlightedCards} />");

    expect(testsIndex).toContain("const gatewaySurface = await getTestsGatewaySurface(locale)");
    expect(testsIndex).toContain("const gatewayItems = landingSurface?.discoverabilityItems ?? []");
    expect(testsIndex).toContain("gatewayItemsBySlug.get(test.slug)?.title");
  });
});
