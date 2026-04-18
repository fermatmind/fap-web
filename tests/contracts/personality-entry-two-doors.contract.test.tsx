import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

function read(relativePath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("personality entry main action contract", () => {
  const source = read("app/(localized)/[locale]/personality/page.tsx");

  it("keeps the personality index focused on the MBTI action plus type browsing", () => {
    expect(source).toContain("看懂你的人格类型");
    expect(source).toContain("我还不知道自己的类型");
    expect(source).toContain("先做一次 MBTI 测试");
    expect(source).toContain('data-testid="personality-main-action"');
    expect(source).toContain('data-testid="personality-start-mbti-cta"');
    expect(source).not.toContain("先找到自己的类型，再进入更适合你的内容方向。");
    expect(source).not.toContain("我已经知道自己的类型");
    expect(source).not.toContain("直接查看人格类型内容");
    expect(source).not.toContain('data-testid="personality-two-main-doors"');
    expect(source).not.toContain('data-testid="personality-browse-types-cta"');
  });

  it("removes the old control-panel surfaces from the personality first layer", () => {
    expect(source).not.toContain("PersonalityHeroExecutiveSummary");
    expect(source).not.toContain("PersonalityMobileDecisionBar");
    expect(source).not.toContain("ScenarioIntelligenceMatrix");
    expect(source).not.toContain("CareerIntelligencePreview");
    expect(source).not.toContain("PersonalityQuickLocateBar");
    expect(source).not.toContain("buildPersonalityQuickLocateIndex");
    expect(source).not.toContain("buildPersonalityCareerPreview");
    expect(source).not.toContain("buildPersonalityScenarioMatrix");
    expect(source).not.toContain("buildPersonalityWorkbench");
  });

  it("keeps MBTI test tracking while routing the primary action to the test start page", () => {
    expect(source).toContain('entrySurface: "mbti_personality_index"');
    expect(source).toContain('sourcePageType: "personality_index"');
    expect(source).toContain('targetAction: "start_mbti_test_primary"');
    expect(source).toContain("buildMbtiEntryHref({");
    expect(source).toContain("TrackedEntryCtaLink");
  });
});
