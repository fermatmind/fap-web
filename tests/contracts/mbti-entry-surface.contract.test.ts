import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildMbtiEntryHref } from "@/lib/mbti/entryTracking";
import {
  MBTI_TYPE_CODES,
  getMbtiPersonalityContent,
  getMbtiRecommendationContent,
} from "@/lib/mbti/mbtiTypeContentPack";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function count(source: string, needle: string): number {
  return source.split(needle).length - 1;
}

function extractTypeBlock(source: string, typeCode: string): string | null {
  const start = source.indexOf(`"${typeCode}": {`);
  if (start === -1) {
    return null;
  }

  let index = start;
  let depth = 0;
  let inString = false;
  let escaped = false;
  let quote = "";

  for (; index < source.length; index += 1) {
    const char = source[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        inString = false;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      inString = true;
      quote = char;
      continue;
    }

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return source.slice(start, index + 1);
      }
    }
  }

  return null;
}

function extractSection(block: string, sectionName: string): string | null {
  const start = block.indexOf(`"${sectionName}": {`);
  if (start === -1) {
    return null;
  }

  let index = start;
  let depth = 0;
  let inString = false;
  let escaped = false;
  let quote = "";

  for (; index < block.length; index += 1) {
    const char = block[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        inString = false;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      inString = true;
      quote = char;
      continue;
    }

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return block.slice(start, index + 1);
      }
    }
  }

  return null;
}

function extractField(section: string | null, fieldName: string): string {
  if (!section) {
    return "";
  }

  const match = section.match(new RegExp(`"${fieldName}":\\s*"((?:\\\\.|[^"\\\\])*)"`));
  return match?.[1] ?? "";
}

describe("mbti entry surface contract", () => {
  it("wires topic detail with one primary mbti CTA and entry tracking", () => {
    const source = read("app/(localized)/[locale]/topics/[slug]/page.tsx");

    expect(source).toContain("const isMbtiTopic =");
    expect(source).toContain('<AnalyticsPageViewTracker eventName="landing_view"');
    expect(source).toContain("{isMbtiTopic ? <AnalyticsPageViewTracker");
    expect(source).toContain('entrySurface: "mbti_topic_detail"');
    expect(source).toContain('sourcePageType: "topic_detail"');
    expect(source).toContain('data-testid="mbti-topic-detail-entry-cta-group"');
    expect(source).toContain('data-testid="mbti-topic-detail-primary-cta"');
    expect(source).toContain('targetAction: "start_mbti_test_primary"');
    expect(source).toContain('TrackedEntryCtaLink');
    expect(source).toContain('buildMbtiEntryHref({');
    expect(count(source, 'data-testid="mbti-topic-detail-primary-cta"')).toBe(1);
  });

  it("wires topic index with one primary mbti CTA and entry tracking", () => {
    const source = read("app/(localized)/[locale]/topics/page.tsx");

    expect(source).toContain('<AnalyticsPageViewTracker eventName="landing_view"');
    expect(source).toContain('entrySurface: "mbti_topic_index"');
    expect(source).toContain('sourcePageType: "topic_index"');
    expect(source).toContain('data-testid="mbti-topics-index-entry-cta-group"');
    expect(source).toContain('data-testid="mbti-topics-index-primary-cta"');
    expect(source).toContain('targetAction: "start_mbti_test_primary"');
    expect(source).toContain('TrackedEntryCtaLink');
    expect(source).toContain('buildMbtiEntryHref({');
    expect(count(source, 'data-testid="mbti-topics-index-primary-cta"')).toBe(1);
  });

  it("wires personality index with entry tracking and the type directory", () => {
    const source = read("app/(localized)/[locale]/personality/page.tsx");

    expect(source).toContain('<AnalyticsPageViewTracker eventName="landing_view"');
    expect(source).toContain('entrySurface: "mbti_personality_index"');
    expect(source).toContain('sourcePageType: "personality_index"');
    expect(source).toContain('data-testid="personality-type-group-browse"');
    expect(source).toContain('data-testid="personality-type-directory"');
    expect(source).toContain("buildPersonalityHubPayload({");
    expect(source).toContain('targetAction: "entry_view"');
    expect(source).not.toContain('data-testid="personality-two-main-doors"');
    expect(source).not.toContain('"personality-main-door-test"');
    expect(source).not.toContain('"personality-main-door-browse"');
    expect(source).not.toContain('data-testid="personality-start-mbti-cta"');
    expect(source).not.toContain('data-testid="personality-browse-types-cta"');
    expect(source).not.toContain('targetAction: "start_mbti_test_primary"');
    expect(source).not.toContain('buildMbtiEntryHref({');
    expect(source).not.toContain("TrackedEntryCtaLink");
    expect(source).not.toContain("PersonalityHeroExecutiveSummary");
    expect(source).not.toContain("PersonalityQuickLocateBar");
    expect(source).not.toContain("ScenarioIntelligenceMatrix");
    expect(source).not.toContain("TypeNavigatorWorkbench");
    expect(source).not.toContain("CareerIntelligencePreview");
    expect(count(source, 'data-testid="personality-start-mbti-cta"')).toBe(0);
  });

  it("keeps header personality navigation focused on the hub plus family-level entry points", () => {
    const source = read("lib/navigation/headerDropdownMenus.ts");

    expect(source).toContain('{ href: "/personality", label: "All personality profiles" }');
    expect(source).toContain('{ href: "/personality#nt", label: "Analysts (NT)" }');
    expect(source).toContain('{ href: "/personality#nf", label: "Diplomats (NF)" }');
    expect(source).toContain('{ href: "/personality#sj", label: "Sentinels (SJ)" }');
    expect(source).toContain('{ href: "/personality#sp", label: "Explorers (SP)" }');
    expect(source).not.toContain('{ href: "/personality/intp", label: "INTP personality" }');
  });

  it("wires personality detail with one primary mbti CTA and entry tracking", () => {
    const source = read("app/(localized)/[locale]/personality/[type]/page.tsx");

    expect(source).toContain('<AnalyticsPageViewTracker eventName="landing_view"');
    expect(source).toContain('buildMbtiEntryTrackingPayload({');
    expect(source).toContain('entrySurface: "mbti_personality_detail"');
    expect(source).toContain('data-testid="mbti-personality-entry-cta-group"');
    expect(source).toContain('data-testid="mbti-personality-primary-cta"');
    expect(source).toContain('data-testid="mbti-personality-content-pack"');
    expect(source).toContain('mbti-personality-scene-career');
    expect(source).toContain('targetAction: "start_mbti_test_primary"');
    expect(source).toContain('TrackedEntryCtaLink');
    expect(source).toContain('buildMbtiEntryHref({');
    expect(count(source, 'data-testid="mbti-personality-primary-cta"')).toBe(1);
  });

  it("wires career recommendation detail with one primary mbti CTA and entry tracking", () => {
    const source = read("app/(localized)/[locale]/career/recommendations/mbti/[type]/page.tsx");

    expect(source).toContain('<AnalyticsPageViewTracker eventName="landing_view"');
    expect(source).toContain('buildMbtiEntryTrackingPayload({');
    expect(source).toContain('entrySurface: "mbti_career_recommendation_detail"');
    expect(source).toContain('data-testid="mbti-career-entry-cta-group"');
    expect(source).toContain('data-testid="mbti-career-primary-cta"');
    expect(
      source.includes('career-recommendation-type-interpretation') ||
        source.includes('career-recommendation-protocol-status')
    ).toBe(true);
    expect(source).toContain('targetAction: "start_mbti_test_primary"');
    expect(source).toContain('TrackedEntryCtaLink');
    expect(source).toContain('buildMbtiEntryHref({');
    expect(count(source, 'data-testid="mbti-career-primary-cta"')).toBe(1);
  });

  it("keeps scene entry skeleton on mbti detail and landing surfaces", () => {
    const topicDetail = read("app/(localized)/[locale]/topics/[slug]/page.tsx");
    const personalityDetail = read("app/(localized)/[locale]/personality/[type]/page.tsx");
    const recommendationDetail = read("app/(localized)/[locale]/career/recommendations/mbti/[type]/page.tsx");
    const testLanding = read("app/(localized)/[locale]/tests/[slug]/page.tsx");

    expect(topicDetail).toContain("topic-detail-scene-entry");
    expect(personalityDetail).toContain("personality-detail-scene-entry");
    expect(recommendationDetail).toContain("career-recommendation-scene-entry");
    expect(testLanding).toContain("mbti-test-landing-scene-entry");
    expect(testLanding).toContain("showsMbtiActions ? (");
  });

  it("keeps the mbti topic hub as a lightweight type continuation grid", () => {
    const source = read("app/(localized)/[locale]/topics/[slug]/page.tsx");

    expect(source).toContain('data-testid="mbti-topic-type-grid"');
    expect(source).toContain("MBTI_TYPE_GROUPS");
    expect(source).toContain("typeCode.toLowerCase()}-a");
    expect(source).toContain("MBTI type continue grid");
  });

  it("keeps weak-type personality parity and recommendation judgment density above the ads-secondary threshold", () => {
    const weakTypes = ["ENTP", "ENFP", "ISFP", "ESTP", "ESFP", "ISTP"] as const;

    for (const type of weakTypes) {
      const personalityA = getMbtiPersonalityContent(`${type.toLowerCase()}-a`, "zh");
      const personalityT = getMbtiPersonalityContent(`${type.toLowerCase()}-t`, "zh");
      const recommendationA = getMbtiRecommendationContent(`${type.toLowerCase()}-a`, "zh");
      const recommendationT = getMbtiRecommendationContent(`${type.toLowerCase()}-t`, "zh");

      expect(personalityA?.variantCopy.hero.summary).toBeTruthy();
      expect(personalityT?.variantCopy.hero.summary).toBeTruthy();
      expect(personalityA?.variantCopy.hero.summary).not.toBe(personalityT?.variantCopy.hero.summary);
      expect(personalityA?.common.hero.variantDeltaA).toBeTruthy();
      expect(personalityA?.common.hero.variantDeltaT).toBeTruthy();
      expect(personalityA?.common.hero.variantDeltaA).not.toBe(personalityA?.common.hero.variantDeltaT);

      expect(personalityA?.variantCopy.careerDirection.summary).toBeTruthy();
      expect(personalityT?.variantCopy.careerDirection.summary).toBeTruthy();
      expect(personalityA?.variantCopy.careerDirection.summary).not.toBe(personalityT?.variantCopy.careerDirection.summary);

      expect(personalityA?.variantCopy.teamCollaboration.summary).toBeTruthy();
      expect(personalityT?.variantCopy.teamCollaboration.summary).toBeTruthy();
      expect(personalityA?.variantCopy.teamCollaboration.summary).not.toBe(personalityT?.variantCopy.teamCollaboration.summary);

      expect(personalityA?.variantCopy.growthPlanning.summary).toBeTruthy();
      expect(personalityT?.variantCopy.growthPlanning.summary).toBeTruthy();
      expect(personalityA?.variantCopy.growthPlanning.summary).not.toBe(personalityT?.variantCopy.growthPlanning.summary);

      expect(recommendationA?.fitWhy).toBeTruthy();
      expect(recommendationA?.costWhy).toBeTruthy();
      expect(recommendationA?.jobStructure).toBeTruthy();
      expect(recommendationA?.nextStep).toBeTruthy();
      expect(recommendationA?.support.nextSteps.length).toBeGreaterThan(0);
      expect(recommendationA?.variantRisk).toBeTruthy();
      expect(recommendationT?.variantRisk).toBeTruthy();
      expect(recommendationA?.variantRisk).not.toBe(recommendationT?.variantRisk);
    }
  });

  it("expands mbti entry tracking surfaces for topic/index/scene attribution", () => {
    const source = read("lib/mbti/entryTracking.ts");

    expect(source).toContain('"mbti_topic_detail"');
    expect(source).toContain('"mbti_topic_index"');
    expect(source).toContain('"mbti_personality_index"');
    expect(source).toContain('"mbti_scene_block"');
    expect(source).toContain('"topic_detail"');
    expect(source).toContain('"topic_index"');
    expect(source).toContain('"personality_index"');
    expect(source).toContain('"scene_block"');
  });

  it("builds executable mbti take hrefs with entry attribution query", () => {
    const href = buildMbtiEntryHref({
      locale: "zh",
      testSlug: "mbti-personality-test-16-personality-types",
      formCode: "mbti_144",
      entrySurface: "mbti_personality_detail",
      sourcePageType: "personality_detail",
      targetAction: "start_mbti_test_primary",
      sourcePath: "/zh/personality/intj-a",
    });

    expect(href.startsWith("/zh/tests/mbti-personality-test-16-personality-types/take?")).toBe(true);
    expect(href).toContain("form=mbti_144");
    expect(href).toContain("entry_surface=mbti_personality_detail");
    expect(href).toContain("source_page_type=personality_detail");
    expect(href).toContain("target_action=start_mbti_test_primary");
    expect(href).toContain("landing_path=%2Fzh%2Fpersonality%2Fintj-a");
  });

  it("keeps the weakest mbti packs split across A/T risk and scene parity", () => {
    const source = read("lib/mbti/mbtiTypeContentPacks.generated.ts");
    const weakTypes = ["ENTP", "ENFP", "ESFP", "ISFP", "ESTP"];

    for (const typeCode of weakTypes) {
      const block = extractTypeBlock(source, typeCode);

      expect(block).not.toBeNull();
      if (!block) {
        throw new Error(`Missing content pack block for ${typeCode}`);
      }
      const recommendation = extractSection(block, "recommendation");
      const sectionA = extractSection(block, "a");
      const sectionT = extractSection(block, "t");

      expect(recommendation).not.toBeNull();
      expect(sectionA).not.toBeNull();
      expect(sectionT).not.toBeNull();

      expect(extractField(recommendation, "variantRiskA")).not.toBe(
        extractField(recommendation, "variantRiskT")
      );

      const aCareer = extractSection(sectionA ?? "", "career");
      const tCareer = extractSection(sectionT ?? "", "career");
      const aTeam = extractSection(sectionA ?? "", "team");
      const tTeam = extractSection(sectionT ?? "", "team");
      const aGrowth = extractSection(sectionA ?? "", "growth");
      const tGrowth = extractSection(sectionT ?? "", "growth");

      expect(extractField(aCareer, "summary")).not.toBe("");
      expect(extractField(tCareer, "summary")).not.toBe("");
      expect(extractField(aCareer, "summary")).not.toBe(extractField(tCareer, "summary"));
      expect(extractField(aCareer, "variantDeltaA")).not.toBe(extractField(aCareer, "variantDeltaT"));
      expect(extractField(tCareer, "variantDeltaA")).not.toBe(extractField(tCareer, "variantDeltaT"));
      expect(extractField(aTeam, "summary")).not.toBe("");
      expect(extractField(tTeam, "summary")).not.toBe("");
      expect(extractField(aTeam, "summary")).not.toBe(extractField(tTeam, "summary"));
      expect(extractField(aTeam, "variantDeltaA")).not.toBe(extractField(aTeam, "variantDeltaT"));
      expect(extractField(tTeam, "variantDeltaA")).not.toBe(extractField(tTeam, "variantDeltaT"));
      expect(extractField(aGrowth, "summary")).not.toBe("");
      expect(extractField(tGrowth, "summary")).not.toBe("");
      expect(extractField(aGrowth, "summary")).not.toBe(extractField(tGrowth, "summary"));
      expect(extractField(aGrowth, "variantDeltaA")).not.toBe(extractField(aGrowth, "variantDeltaT"));
      expect(extractField(tGrowth, "variantDeltaA")).not.toBe(extractField(tGrowth, "variantDeltaT"));
    }
  });

  it("resolves all 16 mbti types through the shared helper with complete scene and recommendation layers", () => {
    const assertFilled = (value: string, context: string) => {
      if (value === "") {
        throw new Error(`${context} is empty`);
      }
    };

    for (const typeCode of MBTI_TYPE_CODES) {
      const slugA = `${typeCode.toLowerCase()}-a`;
      const slugT = `${typeCode.toLowerCase()}-t`;
      const personalityA = getMbtiPersonalityContent(slugA, "en");
      const personalityT = getMbtiPersonalityContent(slugT, "en");
      const recommendationA = getMbtiRecommendationContent(slugA, "en");
      const recommendationT = getMbtiRecommendationContent(slugT, "en");

      expect(personalityA).not.toBeNull();
      expect(personalityT).not.toBeNull();
      expect(recommendationA).not.toBeNull();
      expect(recommendationT).not.toBeNull();

      for (const pack of [personalityA!, personalityT!]) {
        assertFilled(pack.common.hero.summary, `${typeCode}.common.hero.summary`);
        assertFilled(pack.common.hero.positioning, `${typeCode}.common.hero.positioning`);
        assertFilled(pack.common.hero.coreStrength, `${typeCode}.common.hero.coreStrength`);
        assertFilled(pack.common.hero.realWorldFriction, `${typeCode}.common.hero.realWorldFriction`);
        assertFilled(pack.common.hero.nextStepHint, `${typeCode}.common.hero.nextStepHint`);
        assertFilled(pack.common.careerDirection.summary, `${typeCode}.common.careerDirection.summary`);
        assertFilled(pack.common.careerDirection.why, `${typeCode}.common.careerDirection.why`);
        expect(pack.common.careerDirection.nextLinks.length).toBeGreaterThan(0);
        assertFilled(pack.common.teamCollaboration.summary, `${typeCode}.common.teamCollaboration.summary`);
        assertFilled(pack.common.teamCollaboration.why, `${typeCode}.common.teamCollaboration.why`);
        expect(pack.common.teamCollaboration.nextLinks.length).toBeGreaterThan(0);
        assertFilled(pack.common.growthPlanning.summary, `${typeCode}.common.growthPlanning.summary`);
        assertFilled(pack.common.growthPlanning.why, `${typeCode}.common.growthPlanning.why`);
        expect(pack.common.growthPlanning.nextLinks.length).toBeGreaterThan(0);

        assertFilled(pack.variantCopy.hero.summary, `${typeCode}.variant.hero.summary`);
        assertFilled(pack.variantCopy.careerDirection.summary, `${typeCode}.variant.careerDirection.summary`);
        assertFilled(pack.variantCopy.teamCollaboration.summary, `${typeCode}.variant.teamCollaboration.summary`);
        assertFilled(pack.variantCopy.growthPlanning.summary, `${typeCode}.variant.growthPlanning.summary`);
        expect(pack.support.linkedGuides.length).toBeGreaterThan(0);
        expect(pack.support.linkedArticles.length).toBeGreaterThan(0);
        expect(pack.support.testEntryLink.href).toContain("/tests/mbti-personality-test-16-personality-types");
        expect(pack.support.topicBacklink.href).toContain("/topics/mbti");
      }

      for (const rec of [recommendationA!, recommendationT!]) {
        assertFilled(rec.heroSummary, `${typeCode}.recommendation.heroSummary`);
        assertFilled(rec.fitWhy, `${typeCode}.recommendation.fitWhy`);
        assertFilled(rec.costWhy, `${typeCode}.recommendation.costWhy`);
        assertFilled(rec.jobStructure, `${typeCode}.recommendation.jobStructure`);
        assertFilled(rec.nextStep, `${typeCode}.recommendation.nextStep`);
        expect(rec.support.nextSteps.length).toBeGreaterThan(0);
        expect(rec.support.linkedGuides.length).toBeGreaterThan(0);
        expect(rec.support.linkedArticles.length).toBeGreaterThan(0);
      }

      if (typeCode !== "INTP") {
        expect(personalityA!.variantCopy.hero.summary).not.toBe(personalityT!.variantCopy.hero.summary);
        expect(personalityA!.variantCopy.careerDirection.summary).not.toBe(personalityT!.variantCopy.careerDirection.summary);
        expect(personalityA!.variantCopy.teamCollaboration.summary).not.toBe(personalityT!.variantCopy.teamCollaboration.summary);
        expect(personalityA!.variantCopy.growthPlanning.summary).not.toBe(personalityT!.variantCopy.growthPlanning.summary);
        expect(recommendationA!.variantRisk).not.toBe(recommendationT!.variantRisk);
      }
    }
  });
});
