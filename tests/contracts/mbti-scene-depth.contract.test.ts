import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  MBTI_SCENE_DEEP_GROWTH_EXPANSION_TYPES,
  MBTI_SCENE_DEEP_PRIORITY_SCENES,
  MBTI_SCENE_DEEP_PRIORITY_TYPES,
  buildMbtiPersonalityScenarioDeepModules,
  buildMbtiRecommendationScenarioDeepModules,
  buildMbtiTestLandingContinuityItems,
  buildMbtiTopicScenarioDeepModules,
  type MbtiSceneDeepModule,
} from "@/lib/mbti/sceneDeepContent";

const ROOT = process.cwd();
const EXPECTED_PRIORITY_TYPES = ["ENTJ", "INTP", "INTJ", "ENFJ", "ENTP", "INFJ", "ENFP", "ESTP", "ISTJ", "ISFJ"] as const;
const EXPECTED_GROWTH_EXPANSION_TYPES = ["ENTP", "INFJ", "ENFP", "ESTP", "ISTJ", "ISFJ"] as const;
const GROWTH_EXPANSION_TYPE_SET = new Set<string>(MBTI_SCENE_DEEP_GROWTH_EXPANSION_TYPES);

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function expectValidScenarioModule(sceneModule: MbtiSceneDeepModule): void {
  expect(MBTI_SCENE_DEEP_PRIORITY_SCENES).toContain(sceneModule.sceneKey);
  expect(sceneModule.title.trim().length).toBeGreaterThan(8);
  expect(sceneModule.summary.trim().length).toBeGreaterThan(24);
  expect(sceneModule.whyTypeRelevant.trim().length).toBeGreaterThan(24);
  expect(sceneModule.links.length).toBeGreaterThanOrEqual(2);

  for (const link of sceneModule.links) {
    expect(link.label.trim().length).toBeGreaterThan(1);
    expect(link.href.startsWith("/")).toBe(true);
  }
}

describe("mbti scene depth contract", () => {
  it("locks priority type scope and growth-expansion type scope for PR-9", () => {
    expect(MBTI_SCENE_DEEP_PRIORITY_TYPES).toEqual(EXPECTED_PRIORITY_TYPES);
    expect(MBTI_SCENE_DEEP_GROWTH_EXPANSION_TYPES).toEqual(EXPECTED_GROWTH_EXPANSION_TYPES);
  });

  it("locks scene scope to three baseline scenes plus controlled growth expansion", () => {
    expect(MBTI_SCENE_DEEP_PRIORITY_SCENES).toEqual([
      "career_direction",
      "team_collaboration",
      "major_selection",
      "growth_planning",
    ]);
  });

  it("keeps topic-level scenario modules non-empty and executable", () => {
    const modules = buildMbtiTopicScenarioDeepModules("zh");

    expect(modules).toHaveLength(4);
    for (const sceneModule of modules) {
      expectValidScenarioModule(sceneModule);
    }
    expect(modules.some((sceneModule) => sceneModule.sceneKey === "growth_planning")).toBe(true);
  });

  it("enforces type-priority scene depth matrix on personality detail", () => {
    for (const typeCode of MBTI_SCENE_DEEP_PRIORITY_TYPES) {
      const modules = buildMbtiPersonalityScenarioDeepModules({ locale: "en", typeCode });
      const expectedLength = GROWTH_EXPANSION_TYPE_SET.has(typeCode) ? 4 : 3;
      expect(modules).toHaveLength(expectedLength);
      for (const sceneModule of modules) {
        expectValidScenarioModule(sceneModule);
      }
      expect(modules.some((sceneModule) => sceneModule.sceneKey === "growth_planning")).toBe(
        GROWTH_EXPANSION_TYPE_SET.has(typeCode)
      );
    }

    expect(buildMbtiPersonalityScenarioDeepModules({ locale: "en", typeCode: "ISTP" })).toHaveLength(0);
  });

  it("enforces type-priority scene depth matrix on recommendation detail", () => {
    for (const typeCode of MBTI_SCENE_DEEP_PRIORITY_TYPES) {
      const modules = buildMbtiRecommendationScenarioDeepModules({ locale: "en", typeCode });
      const expectedLength = GROWTH_EXPANSION_TYPE_SET.has(typeCode) ? 4 : 3;
      expect(modules).toHaveLength(expectedLength);
      for (const sceneModule of modules) {
        expectValidScenarioModule(sceneModule);
      }
      expect(modules.some((sceneModule) => sceneModule.sceneKey === "growth_planning")).toBe(
        GROWTH_EXPANSION_TYPE_SET.has(typeCode)
      );
    }

    expect(buildMbtiRecommendationScenarioDeepModules({ locale: "en", typeCode: "ISFP" })).toHaveLength(0);
  });

  it("keeps growth scene links actionable and attribution-ready for second-batch types", () => {
    for (const typeCode of MBTI_SCENE_DEEP_GROWTH_EXPANSION_TYPES) {
      const personalityModules = buildMbtiPersonalityScenarioDeepModules({ locale: "en", typeCode });
      const recommendationModules = buildMbtiRecommendationScenarioDeepModules({ locale: "en", typeCode });

      const personalityGrowth = personalityModules.find((module) => module.sceneKey === "growth_planning");
      const recommendationGrowth = recommendationModules.find((module) => module.sceneKey === "growth_planning");

      expect(personalityGrowth).toBeTruthy();
      expect(recommendationGrowth).toBeTruthy();
      expect(personalityGrowth?.links.length).toBeGreaterThanOrEqual(2);
      expect(recommendationGrowth?.links.length).toBeGreaterThanOrEqual(2);
      expect(personalityGrowth?.links.some((link) => link.kind === "start_test")).toBe(true);
      expect(recommendationGrowth?.links.some((link) => link.kind === "start_test")).toBe(true);
      expect(
        personalityGrowth?.links.some(
          (link) => link.kind === "start_test" && link.targetAction === "start_mbti_test_scene_growth_planning"
        )
      ).toBe(true);
      expect(
        recommendationGrowth?.links.some(
          (link) => link.kind === "start_test" && link.targetAction === "start_mbti_test_scene_growth_planning"
        )
      ).toBe(true);
    }
  });

  it("keeps test landing continuity strip lightweight but actionable", () => {
    const items = buildMbtiTestLandingContinuityItems("zh");
    expect(items).toHaveLength(4);
    for (const item of items) {
      expect(item.title.trim().length).toBeGreaterThan(4);
      expect(item.body.trim().length).toBeGreaterThan(12);
      expect(item.href.startsWith("/")).toBe(true);
    }
    expect(items.some((item) => item.key === "to_recommendation_intp")).toBe(true);
  });

  it("keeps deep-dive sections on topic/personality while recommendation detail switches to protocol-guarded rendering and continuity strip on test landing", () => {
    const topicDetail = read("app/(localized)/[locale]/topics/[slug]/page.tsx");
    const personalityDetail = read("app/(localized)/[locale]/personality/[type]/page.tsx");
    const recommendationDetail = read("app/(localized)/[locale]/career/recommendations/mbti/[type]/page.tsx");
    const testLanding = read("app/(localized)/[locale]/tests/[slug]/page.tsx");

    expect(topicDetail).toContain('testId="topic-detail-scene-deep-dive"');
    expect(personalityDetail).toContain('testId="personality-detail-scene-deep-dive"');
    expect(recommendationDetail).toContain('testId="career-recommendation-scene-entry"');
    expect(recommendationDetail).toContain('data-testid="career-recommendation-protocol-status"');
    expect(recommendationDetail).not.toContain('testId="career-recommendation-scene-deep-dive"');
    expect(testLanding).toContain('data-testid="mbti-landing-continuity-strip"');
  });
});
