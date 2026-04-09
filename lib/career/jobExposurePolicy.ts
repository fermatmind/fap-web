import type {
  CareerJobIndexCardAdapter,
  CareerSearchResultCardAdapter,
} from "@/lib/career/adapters/types";

type JobFacingExposureCard = Pick<CareerJobIndexCardAdapter, "dataStatus" | "seoContract" | "trustSummary">;
type JobFacingExposureSearchCard = Pick<CareerSearchResultCardAdapter, "dataStatus" | "seoContract" | "trustSummary">;

function isIndexable(value: boolean | null | undefined): boolean {
  return value === true;
}

function isStableIndexState(value: string | null | undefined): boolean {
  const normalized = String(value ?? "").trim().toLowerCase();
  return normalized === "index" || normalized === "indexed" || normalized === "indexable";
}

function isTrustReady(value: string | null | undefined): boolean {
  const normalized = String(value ?? "").trim().toLowerCase();
  return normalized === "reviewed" || normalized === "approved";
}

export function isJobCardStableExposable(card: JobFacingExposureCard | JobFacingExposureSearchCard): boolean {
  if (card.dataStatus !== "available") {
    return false;
  }

  return (
    isIndexable(card.seoContract.indexEligible) &&
    isStableIndexState(card.seoContract.indexState) &&
    isTrustReady(card.trustSummary.reviewerStatus)
  );
}

export function filterStableExposableJobCards<T extends JobFacingExposureCard | JobFacingExposureSearchCard>(
  cards: T[]
): T[] {
  return cards.filter(isJobCardStableExposable);
}
