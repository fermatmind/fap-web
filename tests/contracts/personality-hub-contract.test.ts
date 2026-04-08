import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { PERSONALITY_HUB_TOKENS } from "@/lib/design/personalityHubTokens";
import { buildPersonalityHubPayload } from "@/lib/mbti/personalityHub.adapter";

describe("personality hub contract", () => {
  it("exports the required semantic tokens", () => {
    expect(PERSONALITY_HUB_TOKENS.colors.navy).toContain("--fm-hub-navy");
    expect(PERSONALITY_HUB_TOKENS.colors.decisionGreen).toContain("--fm-hub-decision-green");
    expect(PERSONALITY_HUB_TOKENS.colors.frictionRose).toContain("--fm-hub-friction-rose");
    expect(PERSONALITY_HUB_TOKENS.sections.stickyDecisionBar.background).toContain("--fm-hub-sticky-bg");
  });

  it("builds a stable hub payload with hero, scenarios, families, and 16-type inventory", () => {
    const payload = buildPersonalityHubPayload({
      locale: "en",
      canonicalPath: "/en/personality",
      landingSurface: null,
      personalities: [
        { typeCode: "INTJ", title: "Architect", excerpt: "Strategic and long-range.", subtitle: null },
        { typeCode: "ENFJ", title: "Protagonist", excerpt: "People-first leadership.", subtitle: null },
      ] as never[],
    });

    expect(payload.hero.title).toBe("Personality types");
    expect(payload.scenarioCards.length).toBeGreaterThan(0);
    expect(payload.scenarioMatrixSeed.length).toBeGreaterThan(0);
    expect(payload.familyGroups).toHaveLength(4);
    expect(payload.typeDecisionCards).toHaveLength(16);
    expect(payload.typeWorkbenchSeed).toHaveLength(16);
    expect(payload.inventoryLinks).toHaveLength(16);
    expect(new Set(payload.inventoryLinks.map((item) => item.typeCode)).size).toBe(16);
    expect(payload.careerPreviewSeed.length).toBeGreaterThanOrEqual(3);
    expect(payload.methodologyBlocks.length).toBeGreaterThan(0);
    expect(payload.faqBlocks.length).toBeGreaterThan(0);
  });

  it("keeps optional future-facing fields non-blocking", () => {
    const payload = buildPersonalityHubPayload({
      locale: "zh",
      canonicalPath: "/zh/personality",
      landingSurface: null,
      personalities: [],
    });

    expect(payload.faqItems).toBeDefined();
    expect(payload.methodologyItems).toBeDefined();
    expect(payload.jsonLdInputs).toBeDefined();
  });

  it("wires the personality page through the adapter and globals through hub css vars", () => {
    const pagePath = path.join(process.cwd(), "app/(localized)/[locale]/personality/page.tsx");
    const globalsPath = path.join(process.cwd(), "app/globals.css");
    const pageSource = fs.readFileSync(pagePath, "utf8");
    const globalsSource = fs.readFileSync(globalsPath, "utf8");

    expect(pageSource).toContain('from "@/lib/mbti/personalityHub.adapter"');
    expect(pageSource).toContain('from "@/lib/mbti/personalityQuickLocate"');
    expect(pageSource).toContain('from "@/components/personality/PersonalityHeroExecutiveSummary"');
    expect(pageSource).toContain('from "@/components/personality/CareerIntelligencePreview"');
    expect(pageSource).toContain('from "@/components/personality/ScenarioIntelligenceMatrix"');
    expect(pageSource).toContain('from "@/components/personality/TypeNavigatorWorkbench"');
    expect(pageSource).toContain("buildPersonalityHubPayload({");
    expect(pageSource).toContain("buildPersonalityQuickLocateIndex({");
    expect(pageSource).toContain("buildPersonalityCareerPreview({");
    expect(pageSource).toContain("buildPersonalityScenarioMatrix({");
    expect(pageSource).toContain("buildPersonalityWorkbench({");
    expect(pageSource).toContain("<PersonalityHeroExecutiveSummary");
    expect(pageSource).toContain("<CareerIntelligencePreview");
    expect(pageSource).toContain("<ScenarioIntelligenceMatrix");
    expect(pageSource).toContain("<TypeNavigatorWorkbench");
    expect(pageSource).toContain("quickLocateIndex={quickLocateIndex}");
    expect(pageSource).toContain("seed: hubPayload.careerPreviewSeed");
    expect(pageSource).toContain("hubPayload.familyGroups");
    expect(pageSource).toContain("hubPayload.typeDecisionCards");
    expect(globalsSource).toContain("--fm-hub-navy");
    expect(globalsSource).toContain("--fm-hub-decision-green");
    expect(globalsSource).toContain("--fm-hub-friction-rose");
  });
});
