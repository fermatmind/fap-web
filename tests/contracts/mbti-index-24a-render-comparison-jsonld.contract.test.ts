import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { normalizePersonalityComparisonJsonLd } from "@/lib/cms/personality";

const ROOT = process.cwd();

describe("MBTI-INDEX-24A comparison JSON-LD authority", () => {
  it("accepts only an object payload whose canonical matches the backend comparison canonical", () => {
    const canonical = "https://fermatmind.com/zh/personality/intj-vs-intp";
    const payload = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      url: canonical,
      hasPart: { "@type": "FAQPage", mainEntity: [] },
    };

    expect(normalizePersonalityComparisonJsonLd(payload, canonical)).toBe(payload);
    expect(normalizePersonalityComparisonJsonLd(payload, `${canonical}-other`)).toBeNull();
    expect(normalizePersonalityComparisonJsonLd([payload], canonical)).toBeNull();
    expect(normalizePersonalityComparisonJsonLd("CollectionPage", canonical)).toBeNull();
    expect(normalizePersonalityComparisonJsonLd(null, canonical)).toBeNull();
  });

  it("keeps the backend block and derives the breadcrumb schema from the visible trail", () => {
    const source = fs.readFileSync(
      path.join(ROOT, "app/(localized)/[locale]/personality/[type]/page.tsx"),
      "utf8"
    );

    expect(source).toContain("const hasAuthoritativeComparisonJsonLd = comparison.jsonld !== null");
    expect(source).toContain("hasAuthoritativeComparisonJsonLd ? (");
    expect(source).toContain("data={comparison.jsonld}");
    expect(source).toContain("personality-comparison-breadcrumb-");
    expect(source).toContain("buildBreadcrumbJsonLd(breadcrumbItems.map(");
    expect(source).toContain("<Breadcrumb items={breadcrumbItems} />");
    expect(source).not.toContain("personality-comparison-faq-");
    expect(source).not.toContain("comparison.isIndexable && !shouldNoindex");
  });
});
