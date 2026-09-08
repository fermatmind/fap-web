import { describe, expect, it } from "vitest";
import { getAssessmentLandingUi } from "@/lib/tests/assessmentLandingUi";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";

describe("English assessment search copy", () => {
  it.each([
    ["MBTI", "16 Types", "four preference pairs"],
    ["BIG5_OCEAN", "OCEAN", "30 facets"],
    ["ENNEAGRAM", "9-Type", "motivations"],
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
    if (code !== "MBTI") {
      expect(getAssessmentLandingUi(slug, "zh")?.seoTitle).toBeUndefined();
      expect(getAssessmentLandingUi(slug, "zh")?.seoDescription).toBeUndefined();
    }
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
