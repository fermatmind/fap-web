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
      const expectedLength = MBTI_SCENE_DEEP_GROWTH_EXPANSION_TYPES.includes(typeCode) ? 4 : 3;
      expect(modules).toHaveLength(expectedLength);
      for (const sceneModule of modules) {
        expectValidScenarioModule(sceneModule);
      }
      expect(modules.some((sceneModule) => sceneModule.sceneKey === "growth_planning")).toBe(
        MBTI_SCENE_DEEP_GROWTH_EXPANSION_TYPES.includes(typeCode)
      );
    }

    expect(buildMbtiPersonalityScenarioDeepModules({ locale: "en", typeCode: "ISTP" })).toHaveLength(0);
  });

  it("enforces type-priority scene depth matrix on recommendation detail", () => {
    for (const typeCode of MBTI_SCENE_DEEP_PRIORITY_TYPES) {
      const modules = buildMbtiRecommendationScenarioDeepModules({ locale: "en", typeCode });
      const expectedLength = MBTI_SCENE_DEEP_GROWTH_EXPANSION_TYPES.includes(typeCode) ? 4 : 3;
      expect(modules).toHaveLength(expectedLength);
      for (const sceneModule of modules) {
        expectValidScenarioModule(sceneModule);
      }
      expect(modules.some((sceneModule) => sceneModule.sceneKey === "growth_planning")).toBe(
        MBTI_SCENE_DEEP_GROWTH_EXPANSION_TYPES.includes(typeCode)
      );
    }

    expect(buildMbtiRecommendationScenarioDeepModules({ locale: "en", typeCode: "ISFP" })).toHaveLength(0);
  });

  it("keeps test landing continuity strip lightweight but actionable", () => {
    const items = buildMbtiTestLandingContinuityItems("zh");
    expect(items).toHaveLength(3);
    for (const item of items) {
      expect(item.title.trim().length).toBeGreaterThan(4);
      expect(item.body.trim().length).toBeGreaterThan(12);
      expect(item.href.startsWith("/")).toBe(true);
    }
  });

  it("mounts deep-dive sections on topic/personality/recommendation and continuity strip on test landing", () => {
    const topicDetail = read("app/(localized)/[locale]/topics/[slug]/page.tsx");
    const personalityDetail = read("app/(localized)/[locale]/personality/[type]/page.tsx");
    const recommendationDetail = read("app/(localized)/[locale]/career/recommendations/mbti/[type]/page.tsx");
    const testLanding = read("app/(localized)/[locale]/tests/[slug]/page.tsx");

    expect(topicDetail).toContain('testId="topic-detail-scene-deep-dive"');
    expect(personalityDetail).toContain('testId="personality-detail-scene-deep-dive"');
    expect(recommendationDetail).toContain('testId="career-recommendation-scene-deep-dive"');
    expect(testLanding).toContain('data-testid="mbti-landing-continuity-strip"');
  });
});
