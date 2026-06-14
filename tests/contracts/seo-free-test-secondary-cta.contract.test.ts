import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(file: string): string {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

describe("SEO-FREE-TEST-SECONDARY-CTA-04 contract", () => {
  it("centralizes zh free-test labels for secondary entry surfaces", () => {
    const helper = read("lib/tests/freeTestLabels.ts");

    expect(helper).toContain("开始 MBTI 免费测试");
    expect(helper).toContain("开始${name}免费测试");
    expect(helper).toContain("IQ_RAVEN");
    expect(helper).toContain("EQ_60");
    expect(helper).toContain("EQ_SJT_16");
    expect(helper).toContain("智商");
    expect(helper).toContain("情商");
  });

  it("updates take metadata, test detail generic CTA, sticky CTA, and share-card fallbacks", () => {
    expect(read("app/(localized)/[locale]/tests/[slug]/take/page.tsx")).toContain("getFreeTestStartLabel({");
    expect(read("app/(localized)/[locale]/tests/[slug]/page.tsx")).toContain("getFreeTestStartLabel({");
    expect(read("components/business/CTASticky.tsx")).toContain("getFreeTestStartLabel({");
    expect(read("components/share/MbtiShareSummaryCard.tsx")).toContain("开始 MBTI 免费测试");
    expect(read("components/share/EnneagramShareSummaryCard.tsx")).toContain("开始九型人格免费测试");
    expect(read("app/(localized)/[locale]/share/[id]/ShareClient.tsx")).toContain("开始九型人格免费测试");
    expect(read("lib/og/mbtiShare.tsx")).toContain("开始 MBTI 免费测试");
  });

  it("updates natural career and personality entry CTAs without touching result-page report semantics", () => {
    expect(read("app/(localized)/[locale]/career/tests/page.tsx")).toContain("开始霍兰德职业兴趣免费测试");
    expect(read("app/(localized)/[locale]/personality/page.tsx")).toContain("开始 MBTI 免费测试");
    expect(read("components/personality/PersonalityMobileDecisionBar.tsx")).toContain("开始 MBTI 免费测试");
    expect(read("app/(localized)/[locale]/topics/[slug]/page.tsx")).toContain("开始 MBTI 免费测试");
    expect(read("components/personality/PublicContentAssetRenderer.tsx")).toContain("开始大五人格免费测试");
    expect(read("components/personality/PublicContentAssetRenderer.tsx")).toContain("开始九型人格免费测试");
    expect(read("lib/mbti/personalityHub.adapter.ts")).toContain("开始 MBTI 免费测试");
    expect(read("lib/mbti/sceneDeepContent.ts")).toContain("开始 MBTI 免费测试");
  });
});
