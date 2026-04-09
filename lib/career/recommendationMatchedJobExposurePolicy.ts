import type { CareerRecommendationMatchedJobAdapter } from "@/lib/career/adapters/types";

export type RecommendationMatchedJobExposureState = "stable" | "hidden";

function isStableIndexState(value: string | null | undefined): boolean {
  const normalized = String(value ?? "").trim().toLowerCase();
  return normalized === "index" || normalized === "indexed" || normalized === "indexable";
}

function isTrustReady(value: string | null | undefined): boolean {
  const normalized = String(value ?? "").trim().toLowerCase();
  return normalized === "reviewed" || normalized === "approved";
}

export function getRecommendationMatchedJobExposureState(
  job: Pick<CareerRecommendationMatchedJobAdapter, "seoContract" | "trustSummary">
): RecommendationMatchedJobExposureState {
  const stable =
    job.seoContract.indexEligible === true &&
    isStableIndexState(job.seoContract.indexState) &&
    isTrustReady(job.trustSummary.reviewerStatus);

  return stable ? "stable" : "hidden";
}

export function isRecommendationMatchedJobStable(
  job: Pick<CareerRecommendationMatchedJobAdapter, "seoContract" | "trustSummary">
): boolean {
  return getRecommendationMatchedJobExposureState(job) === "stable";
}

export function filterStableRecommendationMatchedJobs<T extends CareerRecommendationMatchedJobAdapter>(jobs: T[]): T[] {
  return jobs.filter(isRecommendationMatchedJobStable);
}
