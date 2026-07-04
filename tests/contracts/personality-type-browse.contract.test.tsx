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
    expect(pageSource).toContain("formatTypeLabel(type)");
    expect(pageSource).toContain("TYPE_ICONS[typeGroup.baseTypeCode]");
    expect(pageSource).toContain("INTJ: DraftingCompass");
    expect(pageSource).toContain("ESFP: Drama");
    expect(pageSource).toContain('data-testid="personality-type-image"');
    expect(pageSource).toContain('data-testid="personality-type-code-fallback"');
    expect(pageSource).toContain("crossComparisonsByBaseType");
    expect(pageSource).toContain('item.comparisonType === "mbti_cross_type"');
    expect(pageSource).toContain("comparisonLabel(item)");
    expect(pageSource).not.toContain("{typeGroup.baseTypeCode}</h3>");
    expect(pageSource).toContain("formatDisplayNameText");
    expect(pageSource).toContain("formatDisplayNameText(typeGroup.displayName)");
    expect(pageSource).toContain('Array.from(displayName).join(" ")');
    expect(pageSource).not.toContain("{group.groupKey} {group.title}");
    expect(pageSource).toContain("grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-4");
    expect(pageSource).toContain('className="flex h-full flex-col gap-2"');
    expect(pageSource).toContain("flex min-h-[8.75rem] flex-1 flex-col rounded-xl");
    expect(pageSource).not.toContain("group flex min-h-[8.75rem] flex-col rounded-xl");
    expect(pageSource).not.toContain("hover:-translate-y-0.5 hover:border-[#d4c9df] hover:shadow-md");
    expect(pageSource).toContain("mt-auto flex flex-wrap gap-2 pt-5");
    expect(pageSource).toContain("flex min-w-0 flex-1 flex-col items-center");
    expect(pageSource).toContain("w-full text-center font-sans text-base font-semibold tracking-[0.08em]");
    expect(pageSource).toContain("w-full text-center font-sans text-[0.95rem] font-semibold tracking-[0.03em]");
    expect(pageSource).toContain("inline-flex w-fit max-w-full flex-nowrap items-center gap-2 whitespace-nowrap");
    expect(pageSource).not.toContain("mt-2 inline-flex w-fit max-w-full flex-nowrap items-center gap-2 whitespace-nowrap");
    expect(pageSource).toContain("clickablePillMotion");
    expect(pageSource).toContain("hover:scale-110");
    expect(pageSource).toContain("focus-visible:scale-110");
    expect(pageSource).toContain("hover:shadow-[0_8px_18px_rgba(33,119,140,0.18)]");
    expect(pageSource).not.toContain('className="h-3.5 w-px bg-current/20"');
    expect(pageSource).toContain("h-12 w-12 shrink-0");
    expect(pageSource).toContain("inline-flex h-11 w-[4.75rem] shrink-0 items-center justify-center rounded-full border");
    expect(pageSource).toContain("text-sm font-semibold leading-none");
    expect(pageSource).not.toContain("type.baseTypeCode.split");
  });

  it("removes theme navigation from the personality index", () => {
    expect(pageSource).not.toContain('data-testid="personality-quiet-theme-library"');
    expect(pageSource).not.toContain("继续阅读");
    expect(pageSource).not.toContain("这些是人格内容的延伸方向");
    expect(pageSource).not.toContain("按决策场景选择入口");
  });

  it("keeps personality detail and MBTI result pages oriented to final content and next steps", () => {
    expect(detailSource).toContain('data-testid="personality-detail-next-steps"');
    expect(detailSource).not.toContain('data-testid="personality-detail-intent-links"');
    expect(detailSource).toContain('data-testid="personality-detail-section-map"');
    expect(detailSource).toContain('data-testid="personality-detail-left-toc"');
    expect(detailSource).toContain('data-testid="personality-detail-v85-primary-sections"');
    expect(detailSource).toContain('data-testid="personality-detail-right-summary"');
    expect(detailSource).toContain('data-testid="personality-detail-dimension-overview"');
    expect(detailSource).toContain('data-testid="personality-detail-sticky-local-nav"');
    expect(detailSource).toContain("人格页面章节导航");
    expect(detailSource).toContain("Personality page section navigation");
    expect(detailSource).toContain("buildPersonalitySectionShortcuts(locale, detail.projection.sections, mbtiIntentCtaHref)");
    expect(detailSource).toContain("buildV85PersonalitySectionShortcuts(locale, v85Sections)");
    expect(detailSource).toContain("formatPersonalityDetailHeading(detail, locale)");
    expect(detailSource).toContain("start_mbti_test_intent_chip");
    expect(detailSource).toContain("类型导读");
    expect(detailSource).toContain("快速理解");
    expect(detailSource).toContain("A/T 差别");
    expect(detailSource).toContain("看职业方向");
    expect(detailSource).toContain("工作职业");
    expect(detailSource).toContain("优势/风险");
    expect(detailSource).toContain("Take the test");
    expect(detailSource).toContain("variantComparisonLabel");
    expect(detailSource).toContain("维度概览");
    expect(detailSource).toContain("buildPersonalityDimensionSummary(detail.projection, locale)");
    expect(detailSource).not.toContain("返回 A/T 入口");
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
