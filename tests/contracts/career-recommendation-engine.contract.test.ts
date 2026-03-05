import { describe, expect, it } from "vitest";
import { rankCareerRecommendations } from "@/lib/career/recommendationEngine";
import type { CareerRecommendationJobInput } from "@/lib/career/types";

const baseJob = {
  industrySlug: "technology",
  summary: "",
  mbtiPrimary: ["INTP"],
  mbtiSecondary: ["INTJ"],
  big5Targets: {
    openness: { min: 60, max: 95 },
    conscientiousness: { min: 50, max: 90 },
    extraversion: { min: 30, max: 80 },
    agreeableness: { min: 30, max: 85 },
    neuroticism: { min: 10, max: 45 },
  },
  iqRange: { min: 60, max: 100 },
  eqRange: { min: 40, max: 90 },
} satisfies Omit<CareerRecommendationJobInput, "slug" | "title" | "riasecVector" | "marketDemand">;

describe("career recommendation engine", () => {
  it("ranks jobs by weighted factors and returns explainable reasons", () => {
    const jobs: CareerRecommendationJobInput[] = [
      {
        ...baseJob,
        slug: "job-a",
        title: "Job A",
        marketDemand: 90,
        riasecVector: { R: 40, I: 90, A: 50, S: 45, E: 55, C: 70 },
      },
      {
        ...baseJob,
        slug: "job-b",
        title: "Job B",
        marketDemand: 50,
        mbtiPrimary: ["ESFP"],
        mbtiSecondary: ["ENFP"],
        riasecVector: { R: 95, I: 30, A: 40, S: 70, E: 80, C: 35 },
      },
    ];

    const profile = {
      mbtiType: "INTP",
      big5: {
        openness: 80,
        conscientiousness: 70,
        extraversion: 45,
        agreeableness: 60,
        neuroticism: 25,
      },
      iqScore: 78,
      eqScore: 66,
      riasec: { R: 42, I: 86, A: 55, S: 52, E: 58, C: 68 },
      sources: {
        mbti: "history",
        big5: "history",
        iq: "history",
        eq: "history",
        riasec: "local",
      },
    } as const;

    const result = rankCareerRecommendations({
      profile,
      jobs,
      locale: "en",
      topN: 2,
    });

    expect(result).toHaveLength(2);
    expect(result[0]?.jobSlug).toBe("job-a");
    expect(result[0]?.totalScore).toBeGreaterThan(result[1]?.totalScore ?? 0);
    expect(result[0]?.factors.interest).toBeGreaterThan(0);
    expect(result[0]?.why_interest.length).toBeGreaterThan(0);
    expect(result[0]?.why_personality.length).toBeGreaterThan(0);
    expect(result[0]?.why_capability.length).toBeGreaterThan(0);
    expect(result[0]?.risks.length).toBeGreaterThan(0);
  });
});
