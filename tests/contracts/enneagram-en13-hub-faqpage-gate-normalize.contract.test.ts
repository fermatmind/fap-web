import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const SOURCE = readFileSync("app/(localized)/[locale]/personality/enneagram/page.tsx", "utf8");

describe("ENNEAGRAM-EN13-HUB-FAQPAGE-GATE-NORMALIZE-01", () => {
  it("renders backend-authoritative visible FAQ as FAQPage on the noindex hub", () => {
    expect(SOURCE).toContain('const visibleFaq = asset.faq.filter((item) => item.question && item.answer)');
    expect(SOURCE).toContain(
      '<JsonLd id="enneagram-hub-faq-jsonld" data={buildFAQPageJsonLd(visibleFaq)} />'
    );
    expect(SOURCE).toContain("{visibleFaq.length > 0 ? (");
    expect(SOURCE).not.toContain("{asset.schemaRuntimeEligible && visibleFaq.length > 0 ? (");
  });

  it("keeps non-FAQ hub schema behind backend eligibility and preserves noindex authority", () => {
    expect(SOURCE).toContain("const pageJsonLd = asset.schemaRuntimeEligible");
    expect(SOURCE).toContain("{asset.schemaRuntimeEligible ? (");
    expect(SOURCE).toContain("noindexFollow: robotsAllowsFollow(asset.robots)");
    expect(SOURCE).not.toContain("sitemap");
    expect(SOURCE).not.toContain("llms");
  });
});
