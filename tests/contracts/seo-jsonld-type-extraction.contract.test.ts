import { describe, expect, it } from "vitest";

import {
  extractJsonLdTypesFromHtml,
  extractJsonLdTypesFromValue,
} from "../../scripts/seo/lib/jsonld-types.mjs";

describe("SEO JSON-LD type extraction", () => {
  it("recursively counts FAQPage when it is nested inside Article JSON-LD", () => {
    const html = `
      <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "RIASEC Holland Career Interest Test Explained",
          "hasPart": [
            {
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What is RIASEC?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "RIASEC is a career interest framework."
                  }
                }
              ]
            }
          ]
        }
      </script>
      <script type="application/ld+json">
        {"@context":"https://schema.org","@type":"BreadcrumbList"}
      </script>
    `;

    expect(extractJsonLdTypesFromHtml(html)).toEqual([
      "Article",
      "FAQPage",
      "Question",
      "Answer",
      "BreadcrumbList",
    ]);
    expect(extractJsonLdTypesFromHtml(html).filter((type) => type === "FAQPage")).toHaveLength(1);
  });

  it("handles @type arrays and @graph values without requiring top-level FAQPage scripts", () => {
    expect(
      extractJsonLdTypesFromValue({
        "@graph": [
          { "@type": ["Article", "CreativeWork"], hasPart: { "@type": "FAQPage" } },
          { "@type": "BreadcrumbList" },
        ],
      })
    ).toEqual(["Article", "CreativeWork", "FAQPage", "BreadcrumbList"]);
  });
});
