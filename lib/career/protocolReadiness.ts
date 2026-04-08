import type { AnswerSurfaceViewModel } from "@/lib/answer/answerSurface";
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

type CareerRecommendationProtocolInput = {
  answerSurface?: AnswerSurfaceViewModel | null;
  landingSurface?: LandingSurfaceViewModel | null;
  seoSurface?: SeoSurfaceViewModel | null;
  matchedJobs?: Array<{ slug?: string | null }> | null;
  authoritySource?: string | null;
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

  const missingFields: string[] = [];
  if (!hasAuthoritySource) {
    missingFields.push("authority_source");
  }
  if (!hasAnswerTruth) {
    missingFields.push("answer_surface_v1");
  }
  if (!hasSeoSurface) {
    missingFields.push("seo_surface_v1");
  }
  if (!hasMatchedJobs) {
    missingFields.push("matched_jobs");
  }

  const canRenderStrongTruth = hasAuthoritySource && hasAnswerTruth;
  const canRenderMatchedJobs = hasAuthoritySource && hasMatchedJobs;
  const canIndexPage = hasAuthoritySource && hasAnswerTruth && hasSeoSurface && hasMatchedJobs;

  let careerDataStatus: CareerDataStatus = "unavailable";
  if (canIndexPage) {
    careerDataStatus = "available";
  } else if (hasAuthoritySource || hasMatchedJobs || hasLandingContent || hasSeoSurface) {
    careerDataStatus = "trust_limited";
  }

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
