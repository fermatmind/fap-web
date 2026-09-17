import { describe, expect, it } from "vitest";
import { getAssessmentLandingUi } from "@/lib/tests/assessmentLandingUi";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";

describe("English assessment search copy", () => {
  it.each([
    ["MBTI", "16 Types", "four preference pairs"],
    ["BIG5_OCEAN", "OCEAN", "30 facets"],
    ["ENNEAGRAM", "9-Type", "paired choices"],
    ["IQ_RAVEN", "Matrix Reasoning", "raw scores differ from normed IQ"],
    ["EQ_60", "Self-Assessment", "empathy"],
    ["RIASEC", "Holland Code", "three-letter code"],
  ] as const)("gives %s a distinct English search title and an accurate description", (code, term, explanation) => {
    const slug = SCALE_CANONICAL_SLUG_MAP[code];
    const en = getAssessmentLandingUi(slug, "en")!;
    expect(en.seoTitle).toContain(term);
    expect(en.seoDescription).toContain(explanation);
    expect(en.seoTitle).not.toEqual(en.title);
    expect(en.seoTitle!.length).toBeLessThan(65);
    expect(en.seoDescription!.length).toBeLessThan(180);
    expect(en.title).toMatch(/^Free /u);
    if (!["MBTI", "RIASEC", "ENNEAGRAM"].includes(code)) {
      expect(getAssessmentLandingUi(slug, "zh")?.seoTitle).toBeUndefined();
      expect(getAssessmentLandingUi(slug, "zh")?.seoDescription).toBeUndefined();
    }
  });

  it.each([
    ["MBTI", "zh", "MBTI 16 型人格免费测试", "MBTI 免费测试：16 型人格与偏好解读", "了解你的 16 型人格结果与四组偏好。"],
    ["MBTI", "en", "Free MBTI-Style Personality Test", "Free MBTI Personality Test: 16 Types & Preferences", "See your four-letter type and the preferences behind it."],
    ["RIASEC", "zh", "霍兰德职业兴趣免费测试（RIASEC）", "霍兰德职业兴趣免费测试（RIASEC）", "了解你更喜欢哪些工作活动"],
    ["RIASEC", "en", "Free Holland Career Interest Test (RIASEC)", "Free Holland Code Career Test: RIASEC Interests", "Explore the work activities you enjoy."],
    ["ENNEAGRAM", "zh", "九型人格免费测试（Enneagram）", "九型人格免费测试（Enneagram）", "了解你的九型分布与候选类型。"],
    ["ENNEAGRAM", "en", "Free Enneagram Personality Test", "Free Enneagram Test: Explore Your 9-Type Profile", "Explore your nine-type profile and compare the patterns that fit your experience."],
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
