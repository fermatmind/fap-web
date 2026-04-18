import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

function read(relativePath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("personality entry main action contract", () => {
  const source = read("app/(localized)/[locale]/personality/page.tsx");

  it("keeps the personality index focused on the direct type directory", () => {
    expect(source).toContain('data-testid="personality-type-group-browse"');
    expect(source).toContain('data-testid="personality-type-directory"');
    expect(source).not.toContain("看懂你的人格类型");
    expect(source).not.toContain("我还不知道自己的类型");
    expect(source).not.toContain("先做一次 MBTI 测试");
    expect(source).not.toContain("按类型组浏览");
    expect(source).not.toContain('data-testid="personality-ia-hero"');
    expect(source).not.toContain('data-testid="personality-main-action"');
    expect(source).not.toContain('data-testid="personality-start-mbti-cta"');
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

  it("keeps personality index page-view tracking without a primary MBTI CTA", () => {
    expect(source).toContain('entrySurface: "mbti_personality_index"');
    expect(source).toContain('sourcePageType: "personality_index"');
    expect(source).toContain('targetAction: "entry_view"');
    expect(source).not.toContain('targetAction: "start_mbti_test_primary"');
    expect(source).not.toContain("buildMbtiEntryHref({");
    expect(source).not.toContain("TrackedEntryCtaLink");
  });
});
