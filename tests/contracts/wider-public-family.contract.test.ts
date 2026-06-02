import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function read(relPath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relPath), "utf8");
}

describe("wider public family contract", () => {
  it("articles index renders the article list without the landing summary panel", () => {
    const source = read("app/(localized)/[locale]/articles/page.tsx");

    expect(source).toContain("const { items, pagination } = await getCmsArticlesWithLastKnownGood");
    expect(source).not.toContain("landingSurface?.summaryBlocks[0]");
    expect(source).not.toContain('findLandingCta(landingSurface, "featured_article")');
    expect(source).not.toContain("dict.articles.kicker");
  });

  it("help routes redirect the root to support and keep detail pages on backend ContentPage surfaces", () => {
    const helpIndex = read("app/(localized)/[locale]/help/page.tsx");
    const helpDetail = read("app/(localized)/[locale]/help/[slug]/page.tsx");

    expect(helpIndex).toContain('from "next/navigation"');
    expect(helpIndex).toContain("permanentRedirect(localizedPath(\"/support\", locale))");

    expect(helpDetail).toContain('from "@/lib/cms/content-pages"');
    expect(helpDetail).toContain("getContentPage(contentSlug(slug), locale)");
    expect(helpDetail).not.toContain("getContentPageWithLastKnownGood");
    expect(helpDetail).toContain("<ContentPageTemplate");
  });

  it("home and tests index publish curated discoverability surfaces with visible structured lists", () => {
    const home = read("app/(localized)/[locale]/page.tsx");
    const testsIndex = read("app/(localized)/[locale]/tests/page.tsx");

    expect(home).toContain('import { HomePageExperience } from "@/components/marketing/HomePageExperience"');
    expect(home).toContain('import { getHomePageContent } from "@/lib/marketing/homepageContent"');
    expect(home).toContain("function buildHomeJsonLd(locale: Locale, copy:");
    expect(home).toContain('idSuffix: "quickstart-itemlist"');
    expect(home).toContain('idSuffix: "family-itemlist"');
    expect(home).toContain('import { listVisibleTestsHubCards } from "@/lib/marketing/testsHubContent"');
    expect(home).toContain("listVisibleTestsHubCards(locale).catch(() => [])");
    expect(home).toContain("<HomePageExperience locale={locale} copy={copy} articles={articles} supplementalTests={supplementalTests} />");

    expect(testsIndex).toContain('import { TestsHubExperience } from "@/components/marketing/tests/TestsHubExperience"');
    expect(testsIndex).toContain('import { getTestsHubContent } from "@/lib/marketing/testsHubContent"');
    expect(testsIndex).toContain("function buildTestsHubJsonLd(locale: Locale, content:");
    expect(testsIndex).toContain('idSuffix: "quickstart-itemlist"');
    expect(testsIndex).toContain('idSuffix: "family-itemlist"');
    expect(testsIndex).toContain("<TestsHubExperience content={content} locale={locale} />");
  });
});
