import type {
  CareerJobIndexCardAdapter,
  CareerSearchResultCardAdapter,
} from "@/lib/career/adapters/types";

type JobFacingExposureCard = Pick<CareerJobIndexCardAdapter, "dataStatus" | "seoContract" | "trustSummary">;
type JobFacingExposureSearchCard = Pick<CareerSearchResultCardAdapter, "dataStatus" | "seoContract" | "trustSummary">;

type CareerJobExposureGateInput = {
  dataStatus?: string | null;
  indexEligible?: boolean | null;
  indexState?: string | null;
  reviewerStatus?: string | null;
};

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

export function isCareerJobExposureGateOpen(input: CareerJobExposureGateInput): boolean {
  if (input.dataStatus !== undefined && input.dataStatus !== null && input.dataStatus !== "available") {
    return false;
  }

  return (
    isIndexable(input.indexEligible) &&
    isStableIndexState(input.indexState) &&
    isTrustReady(input.reviewerStatus)
  );
}

export function isJobCardStableExposable(card: JobFacingExposureCard | JobFacingExposureSearchCard): boolean {
  return isCareerJobExposureGateOpen({
    dataStatus: card.dataStatus,
    indexEligible: card.seoContract.indexEligible,
    indexState: card.seoContract.indexState,
    reviewerStatus: card.trustSummary.reviewerStatus,
  });
}

export function filterStableExposableJobCards<T extends JobFacingExposureCard | JobFacingExposureSearchCard>(
  cards: T[]
): T[] {
  return cards.filter(isJobCardStableExposable);
}
