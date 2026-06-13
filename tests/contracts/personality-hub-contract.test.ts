import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { PERSONALITY_HUB_TOKENS } from "@/lib/design/personalityHubTokens";
import { buildPersonalityHubPayload } from "@/lib/mbti/personalityHub.adapter";

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
        heroImageUrl: `https://assets.fermatmind.com/static/personality/type-icons/${baseTypeCode.toLowerCase()}.png`,
      };
    })
  ) as never[];
}

describe("personality hub contract", () => {
  it("exports the required semantic tokens", () => {
    expect(PERSONALITY_HUB_TOKENS.colors.navy).toContain("--fm-hub-navy");
    expect(PERSONALITY_HUB_TOKENS.colors.decisionGreen).toContain("--fm-hub-decision-green");
    expect(PERSONALITY_HUB_TOKENS.colors.frictionRose).toContain("--fm-hub-friction-rose");
    expect(PERSONALITY_HUB_TOKENS.sections.stickyDecisionBar.background).toContain("--fm-hub-sticky-bg");
  });

  it("builds a stable hub payload with hero, scenarios, families, and 32-variant inventory", () => {
    const payload = buildPersonalityHubPayload({
      locale: "en",
      canonicalPath: "/en/personality",
      landingSurface: null,
      personalities: buildVariantProfiles(),
    });

    expect(payload.hero.title).toBe("Personality types");
    expect(payload.scenarioCards.length).toBeGreaterThan(0);
    expect(payload.scenarioMatrixSeed.length).toBeGreaterThan(0);
    expect(payload.familyGroups).toHaveLength(4);
    expect(payload.typeDecisionCards).toHaveLength(32);
    expect(payload.typeDecisionCards.find((card) => card.typeCode === "INTJ-A")?.imageUrl).toBe(
      "https://assets.fermatmind.com/static/personality/type-icons/intj.png"
    );
    expect(payload.typeDecisionCards.find((card) => card.typeCode === "INTJ-A")?.baseTypeCode).toBe("INTJ");
    expect(payload.typeDecisionCards.find((card) => card.typeCode === "INTJ-A")?.variantCode).toBe("A");
    expect(payload.typeDecisionCards.find((card) => card.typeCode === "ENTJ-T")?.slug).toBe("entj-t");
    expect(payload.typeWorkbenchSeed).toHaveLength(32);
    expect(payload.inventoryLinks).toHaveLength(32);
    expect(new Set(payload.inventoryLinks.map((item) => item.typeCode)).size).toBe(32);
    expect(payload.careerPreviewSeed.length).toBeGreaterThanOrEqual(3);
    expect(payload.methodologyBlocks).toHaveLength(3);
    expect(payload.faqBlocks.length).toBeGreaterThanOrEqual(4);
    expect(payload.faqBlocks.length).toBeLessThanOrEqual(6);
  });

  it("keeps optional future-facing fields non-blocking", () => {
    const payload = buildPersonalityHubPayload({
      locale: "zh",
      canonicalPath: "/zh/personality",
      landingSurface: null,
      personalities: buildVariantProfiles(),
    });

    expect(payload.faqItems).toBeDefined();
    expect(payload.methodologyItems).toBeDefined();
    expect(payload.jsonLdInputs).toBeDefined();
    expect(payload.jsonLdInputs?.faqItems.length).toBeGreaterThanOrEqual(4);
    expect(payload.jsonLdInputs?.typeItemList).toHaveLength(32);
  });

  it("wires the personality page through the adapter and globals through hub css vars", () => {
    const pagePath = path.join(process.cwd(), "app/(localized)/[locale]/personality/page.tsx");
    const globalsPath = path.join(process.cwd(), "app/globals.css");
    const pageSource = fs.readFileSync(pagePath, "utf8");
    const globalsSource = fs.readFileSync(globalsPath, "utf8");

    expect(pageSource).toContain('from "@/lib/mbti/personalityHub.adapter"');
    expect(pageSource).toContain("buildItemListJsonLd");
    expect(pageSource).toContain("buildPersonalityHubPayload({");
    expect(pageSource).toContain('data-testid="personality-type-group-browse"');
    expect(pageSource).toContain('data-testid="personality-type-directory"');
    expect(pageSource).toContain('from "next/image"');
    expect(pageSource).toContain('data-testid="personality-type-image"');
    expect(pageSource).toContain('data-testid="personality-type-code-fallback"');
    expect(pageSource).toContain("type.imageUrl");
    expect(pageSource).toContain('id="personality-itemlist-jsonld"');
    expect(pageSource).toContain("hubPayload.familyGroups");
    expect(pageSource).not.toContain('from "@/lib/mbti/personalityQuickLocate"');
    expect(pageSource).not.toContain('from "@/components/personality/PersonalityHeroExecutiveSummary"');
    expect(pageSource).not.toContain('from "@/components/personality/CareerIntelligencePreview"');
    expect(pageSource).not.toContain('from "@/components/personality/PersonalityMobileDecisionBar"');
    expect(pageSource).not.toContain('from "@/components/personality/ScenarioIntelligenceMatrix"');
    expect(pageSource).not.toContain('from "@/components/personality/TypeNavigatorWorkbench"');
    expect(globalsSource).toContain("--fm-hub-navy");
    expect(globalsSource).toContain("--fm-hub-decision-green");
    expect(globalsSource).toContain("--fm-hub-friction-rose");
  });
});
