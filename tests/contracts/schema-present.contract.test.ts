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

  it("topic detail page injects webpage and breadcrumb JSON-LD", () => {
    const source = read("app/(localized)/[locale]/topics/[slug]/page.tsx");
    expect(source).toContain("JsonLd");
    expect(source).toContain("buildWebPageJsonLd");
    expect(source).toContain("buildBreadcrumbJsonLd");
    expect(source).toContain("RelatedContent");
  });

  it("career job detail page injects occupation JSON-LD", () => {
    const source = read("app/(localized)/[locale]/career/jobs/[slug]/page.tsx");
    expect(source).toContain("buildOccupationJsonLd");
    expect(source).toContain("JsonLd");
    expect(source).toContain("Future outlook");
  });

  it("personality detail page injects cms seo jsonld and breadcrumb jsonld", () => {
    const source = read("app/(localized)/[locale]/personality/[type]/page.tsx");
    expect(source).toContain("normalizePersonalitySeoPayload");
    expect(source).toContain("buildBreadcrumbJsonLd");
    expect(source).toContain("renderPersonalitySections");
    expect(source).toContain("JsonLd");
  });

  it("schema builder exposes required types", () => {
    const source = read("lib/seo/generateSchema.ts");
    expect(source).toContain('"@type": "WebPage"');
    expect(source).toContain('"@type": "Article"');
    expect(source).toContain('"@type": "FAQPage"');
    expect(source).toContain('"@type": "BreadcrumbList"');
    expect(source).toContain('"@type": "Person"');
    expect(source).toContain('"@type": "Occupation"');
  });
});
