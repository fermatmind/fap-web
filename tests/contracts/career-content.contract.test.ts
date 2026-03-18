import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";
import {
  listBig5RecommendationTraits,
  listCareerIndustries,
  listCareerJobs,
} from "@/lib/content";

const localContentSource = readFileSync(
  resolve(process.cwd(), "lib/content.ts"),
  "utf8"
);
const cmsCareerRecommendationSource = readFileSync(
  resolve(process.cwd(), "lib/cms/career-recommendations.ts"),
  "utf8"
);

describe("career content contract", () => {
  it("keeps launch volume targets", () => {
    expect(listCareerJobs("en").length).toBe(30);
    expect(listCareerJobs("zh").length).toBe(30);
    expect(listCareerIndustries("en").length).toBe(12);
    expect(listCareerIndustries("zh").length).toBe(12);
    expect(listBig5RecommendationTraits().length).toBe(5);
  });

  it("uses bilingual parity for job slugs", () => {
    const enSlugs = new Set(listCareerJobs("en").map((item) => item.slug));
    const zhSlugs = new Set(listCareerJobs("zh").map((item) => item.slug));

    expect(enSlugs.size).toBe(30);
    expect(zhSlugs.size).toBe(30);
    expect([...enSlugs].sort()).toEqual([...zhSlugs].sort());
  });

  it("keeps Big5 local helpers but removes local MBTI public authority residue", () => {
    expect(listBig5RecommendationTraits()).toEqual([
      "agreeableness",
      "conscientiousness",
      "extraversion",
      "neuroticism",
      "openness",
    ]);

    expect(localContentSource).not.toContain("export function getMbtiRecommendation");
    expect(localContentSource).not.toContain("export function listMbtiRecommendationTypes");
    expect(localContentSource).not.toContain("function relatedTypesByCodes");
    expect(localContentSource).not.toContain("export function listRelatedTypesForPost");
    expect(localContentSource).not.toContain("export function listRelatedTypesForGuide");
    expect(localContentSource).not.toContain("export function listRelatedArticlesForType");
    expect(localContentSource).not.toContain("export function listRelatedCareerItemsForType");
    expect(localContentSource).not.toContain('profile_type === "mbti"');

    expect(cmsCareerRecommendationSource).toContain("/v0.5/career-recommendations/mbti");
    expect(cmsCareerRecommendationSource).toContain("authoritySource");
    expect(cmsCareerRecommendationSource).toContain("publicRouteSlug");
  });
});
