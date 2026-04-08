import { describe, expect, it } from "vitest";
import { buildPersonalityHubPayload } from "@/lib/mbti/personalityHub.adapter";
import { buildPersonalityScenarioMatrix } from "@/lib/mbti/personalityScenarioMatrix";
import { buildPersonalityWorkbench, rankPersonalityWorkbenchCards } from "@/lib/mbti/personalityWorkbench";

describe("personality workbench contract", () => {
  const payload = buildPersonalityHubPayload({
    locale: "en",
    canonicalPath: "/en/personality",
    landingSurface: null,
    personalities: [
      { typeCode: "INTJ", title: "Architect", excerpt: "Strategic and long-range.", subtitle: null },
      { typeCode: "ENFJ", title: "Protagonist", excerpt: "People-first leadership.", subtitle: null },
    ] as never[],
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

  it("builds workbench payload with full 16-type inventory and recommendation secondary actions", () => {
    const workbench = buildPersonalityWorkbench({
      locale: "en",
      familyGroups: payload.familyGroups,
      typeDecisionCards: payload.typeDecisionCards,
    });

    expect(workbench.cards).toHaveLength(16);
    expect(new Set(workbench.cards.map((card) => card.typeCode)).size).toBe(16);
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

    expect(ranked).toHaveLength(16);
    expect(new Set(ranked.map((card) => card.typeCode)).size).toBe(16);
    expect(ranked[0]?.launchTier).toBe("stable");
  });
});
