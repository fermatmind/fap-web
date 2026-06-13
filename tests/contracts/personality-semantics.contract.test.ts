import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { buildPersonalityHubPayload } from "@/lib/mbti/personalityHub.adapter";
import { buildFAQPageJsonLd, buildItemListJsonLd } from "@/lib/seo/generateSchema";

const BASE_TYPES = [
  "INTJ",
  "ENTP",
  "ENTJ",
  "INTP",
  "INFP",
  "INFJ",
  "ENFJ",
  "ENFP",
  "ISTJ",
  "ISFJ",
  "ESTJ",
  "ESFJ",
  "ISTP",
  "ISFP",
  "ESTP",
  "ESFP",
] as const;

function buildVariantProfiles() {
  return BASE_TYPES.flatMap((baseTypeCode) =>
    (["A", "T"] as const).map((variantCode) => {
      const runtimeTypeCode = `${baseTypeCode}-${variantCode}`;

      return {
        typeCode: runtimeTypeCode,
        baseTypeCode,
        runtimeTypeCode,
        displayType: runtimeTypeCode,
        variantCode,
        slug: runtimeTypeCode.toLowerCase(),
        publicRouteSlug: runtimeTypeCode.toLowerCase(),
        publicRouteType: "32-type",
        title: `${baseTypeCode} ${variantCode}`,
        excerpt: `${runtimeTypeCode} summary.`,
        subtitle: null,
        heroImageUrl: null,
      };
    })
  ) as never[];
}

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
      personalities: buildVariantProfiles(),
    });

    const faqJsonLd = buildFAQPageJsonLd(payload.jsonLdInputs?.faqItems ?? []);
    const itemListJsonLd = buildItemListJsonLd({
      path: "/zh/personality",
      title: "32 个 A/T 人格入口目录",
      description: "按人格类型浏览 32 个 A/T profile 路由。",
      locale: "zh",
      items: (payload.jsonLdInputs?.typeItemList ?? []).map((item) => ({
        name: item.name,
        path: item.url,
        description: item.description,
      })),
    });

    expect(faqJsonLd.mainEntity).toHaveLength(payload.faqItems?.length ?? 0);
    expect(itemListJsonLd.numberOfItems).toBe(32);
    expect(itemListJsonLd.itemListElement).toHaveLength(32);
  });

  it("keeps the current personality page on the compact CMS-backed type directory", () => {
    const pagePath = path.join(process.cwd(), "app/(localized)/[locale]/personality/page.tsx");
    const pageSource = fs.readFileSync(pagePath, "utf8");

    expect(pageSource).toContain("listPersonalityProfiles");
    expect(pageSource).toContain("buildPersonalityHubPayload({");
    expect(pageSource).toContain("<TypeGroupBrowse");
    expect(pageSource).toContain('id="personality-itemlist-jsonld"');
  });

  it("does not render FAQPage schema unless FAQ content is reintroduced to the page", () => {
    const pagePath = path.join(process.cwd(), "app/(localized)/[locale]/personality/page.tsx");
    const pageSource = fs.readFileSync(pagePath, "utf8");

    expect(pageSource).not.toContain("buildFAQPageJsonLd");
    expect(pageSource).not.toContain("<PersonalityFaq");
  });
});
