import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { buildPersonalityHubPayload } from "@/lib/mbti/personalityHub.adapter";
import { buildFAQPageJsonLd, buildItemListJsonLd } from "@/lib/seo/generateSchema";

describe("personality semantics contract", () => {
  it("freezes methodology and faq payloads as formal hub content", () => {
    const payload = buildPersonalityHubPayload({
      locale: "en",
      canonicalPath: "/en/personality",
      landingSurface: null,
      personalities: [],
    });

    expect(payload.methodologyBlocks).toHaveLength(3);
    expect(payload.methodologyBlocks[0]?.body.toLowerCase()).toContain("career judgment");
    expect(payload.methodologyBlocks[1]?.body.toLowerCase()).toContain("drain");
    expect(payload.methodologyBlocks[2]?.body.toLowerCase()).toContain("recommendation");
    expect(payload.faqItems).toBeDefined();
    expect(payload.faqItems?.length).toBeGreaterThanOrEqual(4);
    expect(payload.faqItems?.length).toBeLessThanOrEqual(6);
  });

  it("keeps FAQPage and ItemList schema inputs aligned with real page content", () => {
    const payload = buildPersonalityHubPayload({
      locale: "zh",
      canonicalPath: "/zh/personality",
      landingSurface: null,
      personalities: [],
    });

    const faqJsonLd = buildFAQPageJsonLd(payload.jsonLdInputs?.faqItems ?? []);
    const itemListJsonLd = buildItemListJsonLd({
      path: "/zh/personality",
      title: "16 型人格目录",
      description: "按人格类型浏览 16 型 profile 路由。",
      locale: "zh",
      items: (payload.jsonLdInputs?.typeItemList ?? []).map((item) => ({
        name: item.name,
        path: item.url,
        description: item.description,
      })),
    });

    expect(faqJsonLd.mainEntity).toHaveLength(payload.faqItems?.length ?? 0);
    expect(itemListJsonLd.numberOfItems).toBe(16);
    expect(itemListJsonLd.itemListElement).toHaveLength(16);
  });

  it("wires methodology and faq sections after career preview without disturbing existing hub sections", () => {
    const pagePath = path.join(process.cwd(), "app/(localized)/[locale]/personality/page.tsx");
    const pageSource = fs.readFileSync(pagePath, "utf8");

    expect(pageSource).toContain("<CareerIntelligencePreview");
    expect(pageSource).toContain("<PersonalityMethodology");
    expect(pageSource).toContain("<PersonalityFaq");
    expect(pageSource.indexOf("<CareerIntelligencePreview")).toBeLessThan(pageSource.indexOf("<PersonalityMethodology"));
    expect(pageSource.indexOf("<PersonalityMethodology")).toBeLessThan(pageSource.indexOf("<PersonalityFaq"));
  });
});
