import { describe, expect, it } from "vitest";
import { buildPersonalityHubPayload } from "@/lib/mbti/personalityHub.adapter";
import { buildPersonalityScenarioMatrix } from "@/lib/mbti/personalityScenarioMatrix";
import { buildPersonalityWorkbench, rankPersonalityWorkbenchCards } from "@/lib/mbti/personalityWorkbench";

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

describe("personality workbench contract", () => {
  const payload = buildPersonalityHubPayload({
    locale: "en",
    canonicalPath: "/en/personality",
    landingSurface: null,
    personalities: buildVariantProfiles(),
  });

  it("builds scenario matrix cards from hub payload", () => {
    const matrix = buildPersonalityScenarioMatrix({
      locale: "en",
      scenarioCards: payload.scenarioMatrixSeed,
      familyGroups: payload.familyGroups,
      typeDecisionCards: payload.typeDecisionCards,
    });

    expect(matrix.length).toBeGreaterThan(0);
    expect(matrix[0]?.primaryMetric).toBeDefined();
    expect(matrix[0]?.topTypeCodes.length).toBeGreaterThan(0);
    expect(matrix[0]?.primaryCta.href).toBeTruthy();
  });

  it("builds workbench payload with full 32-variant inventory and recommendation secondary actions", () => {
    const workbench = buildPersonalityWorkbench({
      locale: "en",
      familyGroups: payload.familyGroups,
      typeDecisionCards: payload.typeDecisionCards,
    });

    expect(workbench.cards).toHaveLength(32);
    expect(new Set(workbench.cards.map((card) => card.typeCode)).size).toBe(32);
    expect(workbench.cards.find((card) => card.typeCode === "INTJ-A")?.baseTypeCode).toBe("INTJ");
    expect(workbench.cards.every((card) => Boolean(card.recommendationHref))).toBe(true);
    expect(workbench.cards.every((card) => card.href !== card.recommendationHref)).toBe(true);
    expect(workbench.sortOptions.some((option) => option.key === "stable")).toBe(true);
    expect(workbench.sortOptions.some((option) => option.key === "introvert")).toBe(true);
  });

  it("reorders cards without deleting inventory", () => {
    const workbench = buildPersonalityWorkbench({
      locale: "en",
      familyGroups: payload.familyGroups,
      typeDecisionCards: payload.typeDecisionCards,
    });
    const ranked = rankPersonalityWorkbenchCards(workbench.cards, "stable");

    expect(ranked).toHaveLength(32);
    expect(new Set(ranked.map((card) => card.typeCode)).size).toBe(32);
    expect(ranked[0]?.launchTier).toBe("stable");
  });
});
