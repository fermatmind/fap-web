import { describe, expect, it } from "vitest";
import {
  listBig5RecommendationTraits,
  listCareerIndustries,
  listCareerJobs,
  listMbtiRecommendationTypes,
} from "@/lib/content";

describe("career content contract", () => {
  it("keeps launch volume targets", () => {
    expect(listCareerJobs("en").length).toBe(30);
    expect(listCareerJobs("zh").length).toBe(30);
    expect(listCareerIndustries("en").length).toBe(12);
    expect(listCareerIndustries("zh").length).toBe(12);
    expect(listMbtiRecommendationTypes().length).toBe(16);
    expect(listBig5RecommendationTraits().length).toBe(5);
  });

  it("uses bilingual parity for job slugs", () => {
    const enSlugs = new Set(listCareerJobs("en").map((item) => item.slug));
    const zhSlugs = new Set(listCareerJobs("zh").map((item) => item.slug));

    expect(enSlugs.size).toBe(30);
    expect(zhSlugs.size).toBe(30);
    expect([...enSlugs].sort()).toEqual([...zhSlugs].sort());
  });
});
