import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("schema injection contract", () => {
  it("tests detail page injects webpage, breadcrumb and faq JSON-LD", () => {
    const source = read("app/(localized)/[locale]/tests/[slug]/page.tsx");
    expect(source).toContain("JsonLd");
    expect(source).toContain("buildWebPageJsonLd");
    expect(source).toContain("buildBreadcrumbJsonLd");
    expect(source).toContain("buildFAQPageJsonLd");
    expect(source).toContain('id="faq"');
  });

  it("article detail page injects article and breadcrumb JSON-LD", () => {
    const source = read("app/(localized)/[locale]/articles/[slug]/page.tsx");
    expect(source).toContain("JsonLd");
    expect(source).toContain("buildArticleJsonLd");
    expect(source).toContain("buildBreadcrumbJsonLd");
    expect(source).toContain("datePublished");
    expect(source).toContain("dateModified");
    expect(source).toContain('id="references"');
  });

  it("topic detail page injects cms seo jsonld, webpage, breadcrumb, and faq jsonld", () => {
    const source = read("app/(localized)/[locale]/topics/[slug]/page.tsx");
    expect(source).toContain("JsonLd");
    expect(source).toContain("normalizeTopicSeoPayload");
    expect(source).toContain("buildWebPageJsonLd");
    expect(source).toContain("buildBreadcrumbJsonLd");
    expect(source).toContain("buildFAQPageJsonLd");
    expect(source).toContain("renderTopicSections");
    expect(source).toContain("renderTopicEntryGroups");
  });

  it("career job detail page injects cms occupation jsonld and breadcrumb jsonld", () => {
    const source = read("app/(localized)/[locale]/career/jobs/[slug]/page.tsx");
    expect(source).toContain("getCareerJobSeoFromCmsBySlug");
    expect(source).toContain("JsonLd");
    expect(source).toContain("buildBreadcrumbJsonLd");
    expect(source).not.toContain("buildOccupationJsonLd");
    expect(source).not.toContain("getCareerJobBySlug");
    expect(source).not.toContain("renderVeliteMdx");
    expect(source).toContain("Future outlook");
  });

  it("career guide detail page injects cms seo jsonld and breadcrumb jsonld", () => {
    const source = read("app/(localized)/[locale]/career/guides/[slug]/page.tsx");
    expect(source).toContain("getCareerGuideSeoFromCmsBySlug");
    expect(source).toContain("normalizeCareerGuideSeoPayload");
    expect(source).toContain("JsonLd");
    expect(source).toContain("buildBreadcrumbJsonLd");
    expect(source).not.toContain("buildWebPageJsonLd");
    expect(source).not.toContain("getCareerGuideBySlug");
    expect(source).not.toContain("renderVeliteMdx");
    expect(source).toContain("renderSimpleMarkdown");
    expect(source).toContain("dangerouslySetInnerHTML");
  });

  it("career jobs list and alias pages no longer resolve jobs from local content", () => {
    const listSource = read("app/(localized)/[locale]/career/jobs/page.tsx");
    const aliasSource = read("app/(localized)/[locale]/career/[slug]/page.tsx");

    expect(listSource).toContain("listCareerJobsFromCms");
    expect(listSource).not.toContain("listCareerJobs(");
    expect(aliasSource).toContain("getCareerJobFromCmsBySlug");
    expect(aliasSource).not.toContain("getCareerJobBySlug");
  });

  it("career guide list, alias, and landing pages resolve guides from cms helpers", () => {
    const listSource = read("app/(localized)/[locale]/career/guides/page.tsx");
    const aliasSource = read("app/(localized)/[locale]/career/[slug]/page.tsx");
    const landingSource = read("app/(localized)/[locale]/career/page.tsx");

    expect(listSource).toContain("listCareerGuidesFromCms");
    expect(listSource).not.toContain("listCareerGuides(");
    expect(aliasSource).toContain("getCareerGuideFromCmsBySlug");
    expect(aliasSource).not.toContain("getCareerGuideBySlug");
    expect(landingSource).toContain("listCareerGuidesFromCms");
    expect(landingSource).not.toContain("listCareerGuides(");
  });

  it("personality detail page injects cms seo jsonld, webpage, breadcrumb, and faq jsonld", () => {
    const source = read("app/(localized)/[locale]/personality/[type]/page.tsx");
    expect(source).toContain("normalizePersonalitySeoPayload");
    expect(source).toContain("buildWebPageJsonLd");
    expect(source).toContain("buildBreadcrumbJsonLd");
    expect(source).toContain("buildFAQPageJsonLd");
    expect(source).toContain("getPersonalityProjectionDetailBySlugOrType");
    expect(source).toContain("renderProjectionSections");
    expect(source).toContain("renderPersonalitySections");
    expect(source).toContain("JsonLd");
  });

  it("career mbti recommendation page injects webpage, breadcrumb, item list, and faq jsonld", () => {
    const source = read("app/(localized)/[locale]/career/recommendations/mbti/[type]/page.tsx");
    expect(source).toContain("JsonLd");
    expect(source).toContain("buildWebPageJsonLd");
    expect(source).toContain("buildBreadcrumbJsonLd");
    expect(source).toContain("buildItemListJsonLd");
    expect(source).toContain("buildFAQPageJsonLd");
    expect(source).toContain("getMbtiCareerRecommendationByType");
    expect(source).toContain("getMbtiRecommendationContent");
    expect(source).toContain("permanentRedirect");
    expect(source).not.toContain("getCareerJobBySlug");
    expect(source).toContain('id="faq"');
  });

  it("help detail page injects webpage, breadcrumb, and faq jsonld only when faq content exists", () => {
    const source = read("app/(localized)/[locale]/help/[slug]/page.tsx");
    expect(source).toContain("JsonLd");
    expect(source).toContain("buildWebPageJsonLd");
    expect(source).toContain("buildBreadcrumbJsonLd");
    expect(source).toContain("buildFAQPageJsonLd");
    expect(source).toContain('id="faq"');
    expect(source).toContain('page.slug === "faq"');
  });

  it("schema builder exposes required types", () => {
    const source = read("lib/seo/generateSchema.ts");
    expect(source).toContain('"@type": "WebPage"');
    expect(source).toContain('"@type": "Article"');
    expect(source).toContain('"@type": "FAQPage"');
    expect(source).toContain('"@type": "BreadcrumbList"');
    expect(source).toContain('"@type": "ItemList"');
    expect(source).toContain('"@type": "Person"');
    expect(source).toContain('"@type": "Occupation"');
  });
});
