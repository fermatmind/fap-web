import { describe, expect, it } from "vitest";
import { getAssessmentLandingUi } from "@/lib/tests/assessmentLandingUi";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";

describe("English assessment search copy", () => {
  it.each([
    ["MBTI", "16 Types", "four preference pairs"],
    ["BIG5_OCEAN", "OCEAN", "30 facets"],
    ["ENNEAGRAM", "9-Type", "two-option choices"],
    ["IQ_RAVEN", "Matrix Reasoning", "Free test and results"],
    ["EQ_60", "Emotional Intelligence", "self-report"],
    ["RIASEC", "Holland Code", "three-letter code"],
  ] as const)("gives %s a distinct English search title and an accurate description", (code, term, explanation) => {
    const slug = SCALE_CANONICAL_SLUG_MAP[code];
    const en = getAssessmentLandingUi(slug, "en")!;
    expect(en.seoTitle).toContain(term);
    expect(en.seoDescription).toContain(explanation);
    if (code === "IQ_RAVEN") expect(en.seoDescription).toContain("no substitute for professional IQ assessment");
    if (code !== "EQ_60") expect(en.seoTitle).not.toEqual(en.title);
    expect(en.seoTitle!.length).toBeLessThan(65);
    expect(en.seoDescription!.length).toBeLessThan(180);
    expect(en.title).toMatch(/^Free /u);
    if (!["MBTI", "RIASEC", "ENNEAGRAM", "IQ_RAVEN", "EQ_60", "BIG5_OCEAN"].includes(code)) {
      expect(getAssessmentLandingUi(slug, "zh")?.seoTitle).toBeUndefined();
      expect(getAssessmentLandingUi(slug, "zh")?.seoDescription).toBeUndefined();
    }
  });

  it.each([
    ["IQ_RAVEN", "zh", "免费智商测试（IQ）", "免费智商测试（IQ）：30题图形推理，测试与结果免费", "30道原创图形与矩阵推理题"],
    ["IQ_RAVEN", "en", "Free IQ Test", "Free IQ Test: 30 Matrix Reasoning Questions & Free Results", "30 original visual matrix reasoning questions"],
    ["MBTI", "zh", "MBTI 16 型人格免费测试", "MBTI 免费测试：16 型人格与偏好解读", "了解你的 16 型人格结果与四组偏好。"],
    ["MBTI", "en", "Free 16-Type MBTI-Style Personality Test", "Free MBTI Personality Test: 16 Types & Preferences", "Learn about your 16-type personality result and four preference pairs."],
    ["RIASEC", "zh", "霍兰德职业兴趣免费测试（RIASEC）", "免费霍兰德职业兴趣测试：RIASEC 六维与三字代码", "了解你更喜欢哪些工作活动"],
    ["RIASEC", "en", "Free Holland Code Career Interest Test (RIASEC)", "Free Career Interest Test: Holland Code (RIASEC)", "Find work activities you would like to explore"],
    ["BIG5_OCEAN", "en", "Free Big Five Personality Test", "Free Big Five Personality Test: OCEAN Traits & Results", "five continuous personality traits"],
    ["EQ_60", "zh", "免费情商测试：60题情绪与关系自评", "免费情商测试（EQ）：60题自评与四维结果", "约10分钟完成60题情商自评"],
    ["EQ_60", "en", "Free Emotional Intelligence Test (EQ)", "Free Emotional Intelligence Test (EQ) & Results", "60-question emotional intelligence self-report in about 10 minutes"],
    ["ENNEAGRAM", "zh", "九型人格免费测试（Enneagram）", "九型人格免费测试（Enneagram）", "了解你的九型分布与候选类型。"],
    ["ENNEAGRAM", "en", "Free Enneagram Personality Test", "Free Enneagram Test: Explore Your 9-Type Profile", "Explore your nine-type distribution and candidate types."],
  ] as const)("keeps the approved %s %s H1, search title and hero introduction", (code, locale, title, seoTitle, heroStart) => {
    const copy = getAssessmentLandingUi(SCALE_CANONICAL_SLUG_MAP[code], locale)!;
    expect(copy.title).toBe(title);
    expect(copy.seoTitle).toBe(seoTitle);
    expect(copy.heroDescription).toContain(heroStart);
  });

  it("keeps the MBTI Chinese landing copy in the product UI authority", () => {
    const copy = getAssessmentLandingUi(SCALE_CANONICAL_SLUG_MAP.MBTI, "zh");

    expect(copy).toMatchObject({
      title: "MBTI 16 型人格免费测试",
      seoTitle: "MBTI 免费测试：16 型人格与偏好解读",
      seoDescription: "免费完成 MBTI 性格测试，93 题约 10 分钟，144 题约 15 分钟。查看 16 型人格、四组偏好解释与后续探索建议，用于自我了解与沟通参考。",
    });
    expect(copy?.entryLabels).toMatchObject({
      mbti_144: "144 题 · 约 15 分钟 · 免费测试",
      mbti_93: "93 题 · 约 10 分钟 · 免费测试",
    });
  });
});
