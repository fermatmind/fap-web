import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { buildPersonalityHubPayload } from "@/lib/mbti/personalityHub.adapter";

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

function read(relativePath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("personality type browse contract", () => {
  const pageSource = read("app/(localized)/[locale]/personality/page.tsx");
  const detailSource = read("app/(localized)/[locale]/personality/[type]/page.tsx");
  const resultSource = read("app/(localized)/[locale]/(app)/result/[id]/ResultClient.tsx");

  it("keeps NT, NF, SJ, and SP as the second layer of the personality index", () => {
    const payload = buildPersonalityHubPayload({
      locale: "zh",
      canonicalPath: "/zh/personality",
      landingSurface: null,
      personalities: buildVariantProfiles(),
    });

    expect(payload.familyGroups.map((group) => group.groupKey)).toEqual(["NT", "NF", "SJ", "SP"]);
    expect(payload.familyGroups.flatMap((group) => group.cards)).toHaveLength(32);
    expect(payload.familyGroups[0]?.cards.map((card) => card.typeCode).slice(0, 2)).toEqual(["INTJ-A", "INTJ-T"]);
    expect(pageSource).toContain('id="type-groups"');
    expect(pageSource).toContain('data-testid="personality-type-group-browse"');
    expect(pageSource).toContain('data-testid="personality-type-directory"');
    expect(pageSource).toContain('data-testid="personality-type-image"');
    expect(pageSource).toContain('data-testid="personality-type-code-fallback"');
    expect(pageSource).toContain("formatTypeLabel(type)");
    expect(pageSource).toContain("type.baseTypeCode.split");
    expect(pageSource).toContain("type.variantCode");
  });

  it("removes theme navigation from the personality index", () => {
    expect(pageSource).not.toContain('data-testid="personality-quiet-theme-library"');
    expect(pageSource).not.toContain("继续阅读");
    expect(pageSource).not.toContain("这些是人格内容的延伸方向");
    expect(pageSource).not.toContain("按决策场景选择入口");
  });

  it("keeps personality detail and MBTI result pages oriented to final content and next steps", () => {
    expect(detailSource).toContain('data-testid="personality-detail-next-steps"');
    expect(detailSource).toContain('data-testid="personality-detail-intent-links"');
    expect(detailSource).toContain('data-testid="personality-detail-section-map"');
    expect(detailSource).toContain("buildPersonalitySectionShortcuts(locale, detail.projection.sections, mbtiIntentCtaHref)");
    expect(detailSource).toContain("formatPersonalityDetailHeading(detail, locale)");
    expect(detailSource).toContain("start_mbti_test_intent_chip");
    expect(detailSource).toContain("是什么");
    expect(detailSource).toContain("常见特征");
    expect(detailSource).toContain("A/T 差异");
    expect(detailSource).toContain("爱情 / 关系");
    expect(detailSource).toContain("看职业方向");
    expect(detailSource).toContain("适合工作");
    expect(detailSource).toContain("优缺点");
    expect(detailSource).toContain("Take the test");
    expect(detailSource).toContain("返回 A/T 入口");
    expect(detailSource).toContain("MBTI免费测试");
    expect(detailSource).not.toContain('data-testid="mbti-personality-content-pack"');
    expect(detailSource).not.toContain("getMbtiPersonalityContent");
    expect(detailSource).not.toContain("buildMbtiPersonalityScenarioDeepModules");
    expect(detailSource).not.toContain("内容包");
    expect(detailSource).not.toContain("通用页框架");
    expect(detailSource).not.toContain("继续入口");
    expect(detailSource).not.toContain("SEO snapshot");
    expect(detailSource).not.toContain("Profile summary");
    expect(resultSource).toContain('data-testid="mbti-result-personality-next-step"');
    expect(resultSource).toContain("查看人格类型内容");
  });
});
