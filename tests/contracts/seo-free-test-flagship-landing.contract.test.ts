import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const PAGE_PATH = path.join(process.cwd(), "app/(localized)/[locale]/tests/[slug]/page.tsx");

describe("SEO-FREE-TEST-FLAGSHIP-LANDING-03 contract", () => {
  it("prioritizes published CMS landing-surface seo and hero fields before zh flagship fallback copy", () => {
    const source = fs.readFileSync(PAGE_PATH, "utf8");

    expect(source).toContain("getFlagshipFreeTestCopy(test.scale_code, locale)");
    expect(source).toContain("getTestDetailCmsLandingSurface(slug, locale)");
    expect(source).toContain('"test_detail_mbti_personality_test_16_personality_types"');
    expect(source).toContain('"test_detail_holland_career_interest_test_riasec"');
    expect(source).toContain("MBTI免费测试｜16型人格测试");
    expect(source).toContain("大五人格免费测试｜Big Five人格测试");
    expect(source).toContain("九型人格免费测试｜九型人格测试");
    expect(source).toContain("霍兰德职业兴趣免费测试｜RIASEC职业测试");
    expect(source).toContain("const cmsLandingSurfaceContent = resolveTestDetailCmsLandingSurfaceContent(cmsLandingSurface);");
    expect(source).toContain("const title =");
    expect(source).toContain("cmsLandingSurfaceContent.seoTitle");
    expect(source).toContain("const heroTitle = cmsLandingSurfaceContent.heroTitle || flagshipFreeTestCopy?.h1 || localizedTestTitle;");
    expect(source).toContain("const heroCopy = cmsLandingSurfaceContent.heroCopy || landingCopy || test.description;");
    expect(source).toContain("methodologyBoundaryNote: toStringValue(payload?.methodology_boundary_note),");
    expect(source).toContain("const disclaimer = cmsLandingSurfaceContent.methodologyBoundaryNote || toStringValue(langNode.disclaimer);");
    expect(source).toContain("可免费开始，基础结果免费；高级报告如有付费需提前说明。");
    expect(source).toContain('data-testid="test-detail-free-boundary"');
  });

  it("uses specific free-test CTA labels for flagship default forms while keeping form-specific secondary labels", () => {
    const source = fs.readFileSync(PAGE_PATH, "utf8");

    expect(source).toContain("getFlagshipFreeTestCtaLabel({");
    expect(source).toContain("开始 MBTI 免费测试");
    expect(source).toContain("开始大五人格免费测试");
    expect(source).toContain("开始九型人格免费测试");
    expect(source).toContain("开始霍兰德职业兴趣免费测试");
    expect(source).toContain("开始 MBTI 快速版免费测试");
    expect(source).toContain("开始大五人格快速版免费测试");
    expect(source).toContain("开始九型人格二选一版免费测试");
    expect(source).toContain("开始霍兰德职业兴趣增强版免费测试");
  });
});
