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
  canRenderSummarySurface: boolean;
  canRenderSalarySummary: boolean;
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
  matchedJobs?: Array<{ slug?: string | null; canonicalSlug?: string | null }> | null;
  authoritySource?: string | null;
  claimPermissions?: CareerClaimPermissions | null;
  trustManifest?: CareerTrustManifest | null;
  careerAsset?: Pick<CareerAssetMaster, "seo_contract"> | null;
  seoContract?: {
    index_eligible?: boolean | null;
    index_state?: string | null;
  } | null;
  warnings?: {
    redFlags?: string[];
    amberFlags?: string[];
    blockedClaims?: string[];
  } | null;
  integritySummary?: {
    integrityState?: string | null;
    criticalMissingFields?: string[];
    confidenceCap?: number | null;
    degradationFactor?: number | null;
  } | null;
  hasSummaryText?: boolean;
  hasSalaryData?: boolean;
  hasOutlookData?: boolean;
  hasAiData?: boolean;
  hasStrongContent?: boolean;
};

type CareerJobProtocolInput = {
  answerSurface?: AnswerSurfaceViewModel | null;
  authoritySource?: string | null;
  claimPermissions?: CareerClaimPermissions | null;
  trustManifest?: CareerTrustManifest | null;
  careerAsset?: Pick<CareerAssetMaster, "seo_contract"> | null;
  seoContract?: {
    index_eligible?: boolean | null;
    index_state?: string | null;
  } | null;
  hasSalaryData?: boolean;
  hasOutlookData?: boolean;
  hasFitData?: boolean;
  warnings?: {
    redFlags?: string[];
    amberFlags?: string[];
    blockedClaims?: string[];
  } | null;
  integritySummary?: {
    integrityState?: string | null;
    criticalMissingFields?: string[];
    confidenceCap?: number | null;
    degradationFactor?: number | null;
  } | null;
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

function hasExplicitIndexGateFromSeoContract(
  seoContract?: { index_eligible?: boolean | null } | null
): boolean {
  return typeof seoContract?.index_eligible === "boolean";
}

function isSeoContractIndexEligible(
  seoContract?: { index_eligible?: boolean | null } | null
): boolean {
  return seoContract?.index_eligible === true;
}

function hasWarningSignals(
  warnings?: {
    redFlags?: string[];
    amberFlags?: string[];
    blockedClaims?: string[];
  } | null
): boolean {
  return Boolean(
    warnings &&
      ((Array.isArray(warnings.redFlags) && warnings.redFlags.length > 0) ||
        (Array.isArray(warnings.amberFlags) && warnings.amberFlags.length > 0) ||
        (Array.isArray(warnings.blockedClaims) && warnings.blockedClaims.length > 0))
  );
}

function hasIntegritySignals(
  summary?: {
    integrityState?: string | null;
    criticalMissingFields?: string[];
    confidenceCap?: number | null;
    degradationFactor?: number | null;
  } | null
): boolean {
  return Boolean(
    summary &&
      (Boolean(normalizeText(summary.integrityState)) ||
        (Array.isArray(summary.criticalMissingFields) && summary.criticalMissingFields.length > 0) ||
        typeof summary.confidenceCap === "number" ||
        typeof summary.degradationFactor === "number")
  );
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
      canRenderSummarySurface: false,
      canRenderSalarySummary: false,
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
  const allowSalaryComparison = hasCareerSalaryPermission(input.claimPermissions);
  const allowTransitionRecommendation = hasCareerTransitionPermission(input.claimPermissions);
  const hasIndexGate =
    hasExplicitIndexGate(input.careerAsset) || hasExplicitIndexGateFromSeoContract(input.seoContract);
  const hasBundleSignals =
    Boolean(input.hasStrongContent) || hasWarningSignals(input.warnings) || hasIntegritySignals(input.integritySummary);
  const canIndexPage =
    (isCareerIndexEligible(input.careerAsset) || isSeoContractIndexEligible(input.seoContract)) &&
    (hasSeoSurface || hasIndexGate) &&
    isTrustReady &&
    allowStrongClaim &&
    (hasAnswerTruth || hasBundleSignals || hasMatchedJobs);

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
  if (!hasAnswerTruth && !hasBundleSignals) {
    missingFields.push("answer_surface_v1");
  }
  if (!hasSeoSurface && !hasIndexGate) {
    missingFields.push("seo_surface_v1");
  }
  if (!hasIndexGate) {
    missingFields.push("seo_contract.index_eligible");
  }
  if (!hasMatchedJobs) {
    missingFields.push("matched_jobs");
  }
  if ((hasAnswerTruth || hasMatchedJobs) && !allowStrongClaim) {
    missingFields.push("claim_permissions.allow_strong_claim");
  }
  if (input.hasSalaryData && !allowSalaryComparison) {
    missingFields.push("claim_permissions.allow_salary_comparison");
  }
  if (hasMatchedJobs && !allowTransitionRecommendation) {
    missingFields.push("claim_permissions.allow_transition_recommendation");
  }

  const canRenderStrongTruth =
    hasAuthoritySource && (hasAnswerTruth || hasBundleSignals) && isTrustReady && allowStrongClaim;
  const hasSummarySurfaceData =
    Boolean(input.hasSummaryText) ||
    Boolean(input.hasSalaryData) ||
    Boolean(input.hasOutlookData) ||
    Boolean(input.hasAiData);
  const canRenderSummarySurface = hasAuthoritySource && hasSummarySurfaceData && isTrustReady && allowStrongClaim;
  const canRenderSalarySummary =
    hasAuthoritySource && Boolean(input.hasSalaryData) && isTrustReady && allowSalaryComparison;
  const canRenderMatchedJobs =
    hasAuthoritySource && hasMatchedJobs && isTrustReady && allowTransitionRecommendation;
  const careerDataStatus = deriveCareerDataStatus({
    canIndexPage,
    hasAnyProtocolSignal:
      hasAuthoritySource ||
      hasMatchedJobs ||
      hasLandingContent ||
      hasSeoSurface ||
      hasBundleSignals ||
      hasClaimPermissions ||
      hasTrustManifest,
  });

  return {
    careerDataStatus,
    canRenderStrongTruth,
    canRenderSummarySurface,
    canRenderSalarySummary,
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
  const hasIndexGate =
    hasExplicitIndexGate(input.careerAsset) || hasExplicitIndexGateFromSeoContract(input.seoContract);
  const canIndexPage =
    (isCareerIndexEligible(input.careerAsset) || isSeoContractIndexEligible(input.seoContract)) &&
    hasIndexGate &&
    isTrustReady &&
    allowStrongClaim;

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
        hasWarningSignals(input.warnings) ||
        hasIntegritySignals(input.integritySummary) ||
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
