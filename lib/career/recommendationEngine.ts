import type { CareerProfileSnapshot, CareerRecommendationJobInput, CareerRecommendationResult } from "@/lib/career/types";

export function rankCareerRecommendations(_input: {
  profile: CareerProfileSnapshot;
  jobs: CareerRecommendationJobInput[];
  locale: "en" | "zh";
  topN?: number;
}): CareerRecommendationResult[] {
  void _input;
  return [];
}
