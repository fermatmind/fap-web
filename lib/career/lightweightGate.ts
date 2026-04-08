import type { CareerLightweightDataStatus } from "@/lib/career/adapters/types";

type LightweightGateInput = {
  authoritySource?: string | null;
  indexEligible?: boolean | null;
  indexState?: string | null;
  reviewerStatus?: string | null;
};

function normalizeString(value: string | null | undefined): string {
  return String(value ?? "").trim().toLowerCase();
}

export function isCareerLightweightTrustReady(reviewerStatus: string | null | undefined): boolean {
  const normalized = normalizeString(reviewerStatus);
  return normalized === "reviewed" || normalized === "approved";
}

export function deriveCareerLightweightDataStatus(
  input: LightweightGateInput | null | undefined
): CareerLightweightDataStatus {
  if (!input?.authoritySource) {
    return "unavailable";
  }

  const indexState = normalizeString(input.indexState);
  const trustReady = isCareerLightweightTrustReady(input.reviewerStatus);

  if (input.indexEligible === true && trustReady) {
    return "available";
  }

  if (input.indexEligible === false || indexState || trustReady) {
    return "trust_limited";
  }

  return "unavailable";
}
