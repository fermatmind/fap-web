import type { AnswerSurfaceViewModel } from "@/lib/answer/answerSurface";
import type { CareerAssetMaster, CareerClaimPermissions, CareerTrustManifest } from "@/lib/career/contracts";
import {
  hasCareerSalaryPermission,
  hasCareerStrongClaimPermission,
  hasCareerTransitionPermission,
  isCareerIndexEligible,
  isCareerTrustManifestReady,
} from "@/lib/career/contracts";
import type { LandingSurfaceViewModel } from "@/lib/landing/landingSurface";
import type { SeoSurfaceViewModel } from "@/lib/seo/seoSurface";

export type CareerDataStatus = "available" | "unavailable" | "trust_limited";

export type CareerRecommendationRenderState = {
  careerDataStatus: CareerDataStatus;
  canRenderStrongTruth: boolean;
  canRenderMatchedJobs: boolean;
  canRenderAnswerSurface: boolean;
  canRenderLandingSurface: boolean;
  canIndexPage: boolean;
  missingFields: string[];
};

export type CareerJobRenderState = {
  careerDataStatus: CareerDataStatus;
  canRenderSalarySurface: boolean;
  canRenderOutlookSurface: boolean;
  canRenderFitSurface: boolean;
  canRenderAnswerSurface: boolean;
  canRenderStructuredData: boolean;
  canIndexPage: boolean;
  missingFields: string[];
};

type CareerRecommendationProtocolInput = {
  answerSurface?: AnswerSurfaceViewModel | null;
  landingSurface?: LandingSurfaceViewModel | null;
  seoSurface?: SeoSurfaceViewModel | null;
  matchedJobs?: Array<{ slug?: string | null }> | null;
  authoritySource?: string | null;
  claimPermissions?: CareerClaimPermissions | null;
  trustManifest?: CareerTrustManifest | null;
  careerAsset?: Pick<CareerAssetMaster, "seo_contract"> | null;
};

type CareerJobProtocolInput = {
  answerSurface?: AnswerSurfaceViewModel | null;
  authoritySource?: string | null;
  claimPermissions?: CareerClaimPermissions | null;
  trustManifest?: CareerTrustManifest | null;
  careerAsset?: Pick<CareerAssetMaster, "seo_contract"> | null;
  hasSalaryData?: boolean;
  hasOutlookData?: boolean;
  hasFitData?: boolean;
};

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function hasAnswerSurfaceTruth(surface?: AnswerSurfaceViewModel | null): boolean {
  if (!surface) {
    return false;
  }

  return (
    surface.summaryBlocks.length > 0 ||
    surface.faqBlocks.length > 0 ||
    surface.compareBlocks.length > 0 ||
    surface.sceneSummaryBlocks.length > 0 ||
    surface.nextStepBlocks.length > 0
  );
}

function hasLandingSurfaceContent(surface?: LandingSurfaceViewModel | null): boolean {
  if (!surface) {
    return false;
  }

  return surface.summaryBlocks.length > 0 || surface.ctaBundle.length > 0;
}

function hasSeoAuthority(surface?: SeoSurfaceViewModel | null): boolean {
  if (!surface) {
    return false;
  }

  return Boolean(surface.surfaceType || surface.metadataContractVersion || surface.canonicalUrl);
}

function hasExplicitIndexGate(careerAsset?: Pick<CareerAssetMaster, "seo_contract"> | null): boolean {
  return typeof careerAsset?.seo_contract.index_eligible === "boolean";
}

function deriveCareerDataStatus(options: {
  canIndexPage: boolean;
  hasAnyProtocolSignal: boolean;
}): CareerDataStatus {
  if (options.canIndexPage) {
    return "available";
  }

  return options.hasAnyProtocolSignal ? "trust_limited" : "unavailable";
}

export function getCareerRecommendationRenderState(
  input: CareerRecommendationProtocolInput | null | undefined
): CareerRecommendationRenderState {
  if (!input) {
    return {
      careerDataStatus: "unavailable",
      canRenderStrongTruth: false,
      canRenderMatchedJobs: false,
      canRenderAnswerSurface: false,
      canRenderLandingSurface: false,
      canIndexPage: false,
      missingFields: ["recommendation_detail"],
    };
  }

  const hasAuthoritySource = Boolean(normalizeText(input.authoritySource));
  const hasAnswerTruth = hasAnswerSurfaceTruth(input.answerSurface);
  const hasLandingContent = hasLandingSurfaceContent(input.landingSurface);
  const hasSeoSurface = hasSeoAuthority(input.seoSurface);
  const hasMatchedJobs = Array.isArray(input.matchedJobs) && input.matchedJobs.length > 0;
  const hasTrustManifest = Boolean(input.trustManifest);
  const isTrustReady = isCareerTrustManifestReady(input.trustManifest);
  const hasClaimPermissions = Boolean(input.claimPermissions);
  const allowStrongClaim = hasCareerStrongClaimPermission(input.claimPermissions);
  const allowTransitionRecommendation = hasCareerTransitionPermission(input.claimPermissions);
  const hasIndexGate = hasExplicitIndexGate(input.careerAsset);
  const canIndexPage = isCareerIndexEligible(input.careerAsset) && hasSeoSurface;

  const missingFields: string[] = [];
  if (!hasAuthoritySource) {
    missingFields.push("authority_source");
  }
  if (!hasClaimPermissions) {
    missingFields.push("claim_permissions");
  }
  if (!hasTrustManifest) {
    missingFields.push("trust_manifest");
  }
  if (!hasAnswerTruth) {
    missingFields.push("answer_surface_v1");
  }
  if (!hasSeoSurface) {
    missingFields.push("seo_surface_v1");
  }
  if (!hasIndexGate) {
    missingFields.push("seo_contract.index_eligible");
  }
  if (!hasMatchedJobs) {
    missingFields.push("matched_jobs");
  }

  const canRenderStrongTruth = hasAuthoritySource && hasAnswerTruth && isTrustReady && allowStrongClaim;
  const canRenderMatchedJobs =
    hasAuthoritySource && hasMatchedJobs && isTrustReady && allowTransitionRecommendation;
  const careerDataStatus = deriveCareerDataStatus({
    canIndexPage,
    hasAnyProtocolSignal:
      hasAuthoritySource ||
      hasMatchedJobs ||
      hasLandingContent ||
      hasSeoSurface ||
      hasClaimPermissions ||
      hasTrustManifest,
  });

  return {
    careerDataStatus,
    canRenderStrongTruth,
    canRenderMatchedJobs,
    canRenderAnswerSurface: canRenderStrongTruth,
    canRenderLandingSurface: hasLandingContent,
    canIndexPage,
    missingFields,
  };
}

export function getCareerJobRenderState(
  input: CareerJobProtocolInput | null | undefined
): CareerJobRenderState {
  if (!input) {
    return {
      careerDataStatus: "unavailable",
      canRenderSalarySurface: false,
      canRenderOutlookSurface: false,
      canRenderFitSurface: false,
      canRenderAnswerSurface: false,
      canRenderStructuredData: false,
      canIndexPage: false,
      missingFields: ["career_job_detail"],
    };
  }

  const hasAuthoritySource = Boolean(normalizeText(input.authoritySource));
  const hasAnswerTruth = hasAnswerSurfaceTruth(input.answerSurface);
  const hasTrustManifest = Boolean(input.trustManifest);
  const isTrustReady = isCareerTrustManifestReady(input.trustManifest);
  const hasClaimPermissions = Boolean(input.claimPermissions);
  const allowStrongClaim = hasCareerStrongClaimPermission(input.claimPermissions);
  const allowSalaryComparison = hasCareerSalaryPermission(input.claimPermissions);
  const hasIndexGate = hasExplicitIndexGate(input.careerAsset);
  const canIndexPage = isCareerIndexEligible(input.careerAsset);

  const missingFields: string[] = [];
  if (!hasAuthoritySource) {
    missingFields.push("authority_source");
  }
  if (!hasClaimPermissions) {
    missingFields.push("claim_permissions");
  }
  if (!hasTrustManifest) {
    missingFields.push("trust_manifest");
  }
  if (!hasIndexGate) {
    missingFields.push("seo_contract.index_eligible");
  }
  if (input.hasSalaryData && !allowSalaryComparison) {
    missingFields.push("claim_permissions.allow_salary_comparison");
  }
  if ((input.hasOutlookData || input.hasFitData || hasAnswerTruth) && !allowStrongClaim) {
    missingFields.push("claim_permissions.allow_strong_claim");
  }

  return {
    careerDataStatus: deriveCareerDataStatus({
      canIndexPage,
      hasAnyProtocolSignal:
        hasAuthoritySource ||
        hasTrustManifest ||
        hasClaimPermissions ||
        Boolean(input.hasSalaryData) ||
        Boolean(input.hasOutlookData) ||
        Boolean(input.hasFitData) ||
        hasAnswerTruth,
    }),
    canRenderSalarySurface: hasAuthoritySource && isTrustReady && allowSalaryComparison && Boolean(input.hasSalaryData),
    canRenderOutlookSurface: hasAuthoritySource && isTrustReady && allowStrongClaim && Boolean(input.hasOutlookData),
    canRenderFitSurface: hasAuthoritySource && isTrustReady && allowStrongClaim && Boolean(input.hasFitData),
    canRenderAnswerSurface: hasAuthoritySource && isTrustReady && allowStrongClaim && hasAnswerTruth,
    canRenderStructuredData: hasAuthoritySource && isTrustReady && allowStrongClaim && canIndexPage,
    canIndexPage,
    missingFields,
  };
}
