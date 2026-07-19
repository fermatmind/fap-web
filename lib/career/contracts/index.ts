export type { CareerAssetMaster, CareerAssetAliasIndexItem } from "@/lib/career/contracts/careerAssetMaster";
export { isCareerAssetMaster, normalizeCareerAssetMaster } from "@/lib/career/contracts/careerAssetMaster";
export type { CareerClaimPermissions } from "@/lib/career/contracts/claimPermissions";
export {
  createConservativeCareerClaimPermissions,
  isCareerClaimPermissions,
  normalizeCareerClaimPermissions,
} from "@/lib/career/contracts/claimPermissions";
export type {
  CareerScoreComponentBreakdown,
  CareerScorePenalty,
  CareerScoreResult,
} from "@/lib/career/contracts/scoreResult";
export {
  createUnavailableCareerScoreResult,
  isCareerScoreResult,
  normalizeCareerScoreResult,
} from "@/lib/career/contracts/scoreResult";
export type {
  CareerTrustManifest,
  CareerTrustSourceTraceItem,
} from "@/lib/career/contracts/trustManifest";
export {
  isCareerTrustManifest,
  normalizeCareerTrustManifest,
} from "@/lib/career/contracts/trustManifest";

import type { CareerAssetMaster } from "@/lib/career/contracts/careerAssetMaster";
import type { CareerClaimPermissions } from "@/lib/career/contracts/claimPermissions";
import type { CareerTrustManifest } from "@/lib/career/contracts/trustManifest";

export function hasCareerStrongClaimPermission(value: CareerClaimPermissions | null | undefined): boolean {
  return value?.allow_strong_claim === true;
}

export function hasCareerSalaryPermission(value: CareerClaimPermissions | null | undefined): boolean {
  return value?.allow_salary_comparison === true;
}

export function hasCareerTransitionPermission(value: CareerClaimPermissions | null | undefined): boolean {
  return value?.allow_transition_recommendation === true;
}

export function isCareerTrustManifestReady(value: CareerTrustManifest | null | undefined): boolean {
  const blockedReasons = value?.quality.blocked_reasons ?? [];

  return (
    value?.quality.complete === true &&
    value.quality.reviewed === true &&
    value.quality.stale !== true &&
    blockedReasons.length === 0 &&
    value.legacyReview.reviewed === true
  );
}

export function isCareerIndexEligible(
  value: Pick<CareerAssetMaster, "seo_contract"> | null | undefined
): boolean {
  return value?.seo_contract.index_eligible === true;
}
