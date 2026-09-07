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
    expect(getAssessmentLandingUi(slug, "zh")?.seoTitle).toBeUndefined();
    expect(getAssessmentLandingUi(slug, "zh")?.seoDescription).toBeUndefined();
  });
});
