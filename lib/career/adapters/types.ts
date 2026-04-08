import type { CareerClaimPermissions, CareerScoreResult, CareerTrustManifest } from "@/lib/career/contracts";
import type {
  CareerDataStatus,
  CareerJobRenderState,
  CareerRecommendationRenderState,
} from "@/lib/career/protocolReadiness";

export type CareerSeoContractAdapter = {
  canonicalPath: string | null;
  canonicalTarget: string | null;
  indexState: string | null;
  indexEligible: boolean | null;
  datasetEligible: boolean | null;
  articleEligible: boolean | null;
};

export type CareerProvenanceMetaAdapter = {
  contentVersion: string;
  dataVersion: string;
  logicVersion: string;
  compilerVersion: string | null;
  compiledAt: string | null;
  truthMetricId: string | null;
  trustManifestId: string | null;
  indexStateId: string | null;
  compileRunId: string | null;
  importRunId: string | null;
  compileRefs: Record<string, unknown>;
};

export type CareerWarningsAdapter = {
  redFlags: string[];
  amberFlags: string[];
  blockedClaims: string[];
};

export type CareerIntegritySummaryAdapter = {
  integrityState: string | null;
  criticalMissingFields: string[];
  confidenceCap: number | null;
  degradationFactor: number | null;
};

export type CareerScoreBundleAdapter = {
  fitScore: CareerScoreResult;
  strainScore: CareerScoreResult;
  aiSurvivalScore: CareerScoreResult;
  mobilityScore: CareerScoreResult;
  confidenceScore: CareerScoreResult;
};

export type CareerJobBundleAdapter = {
  authoritySource: string;
  slug: string;
  locale: string;
  title: string;
  summary: string;
  titles: {
    canonicalEn: string | null;
    canonicalZh: string | null;
  };
  aliasIndex: Array<{
    alias: string;
    normalized: string;
    lang: string;
  }>;
  truthLayer: {
    medianPayUsdAnnual: number | null;
    outlookPct20242034: number | null;
    outlookDescription: string | null;
    aiExposure: number | null;
    entryEducation: string | null;
    workExperience: string | null;
    onTheJobTraining: string | null;
    sourceRefs: string[];
  };
  scoreBundle: CareerScoreBundleAdapter;
  warnings: CareerWarningsAdapter;
  claimPermissions: CareerClaimPermissions;
  trustManifest: CareerTrustManifest | null;
  seoContract: CareerSeoContractAdapter;
  provenanceMeta: CareerProvenanceMetaAdapter;
  integritySummary: CareerIntegritySummaryAdapter;
  renderState: CareerJobRenderState;
};

export type CareerRecommendationMatchedJobAdapter = {
  slug: string;
  title: string;
  summary: string;
  fitBucket: "primary" | "secondary" | null;
  fitPersonalityCodes: string[];
  mbtiPrimaryCodes: string[];
  mbtiSecondaryCodes: string[];
  href: string;
};

export type CareerRecommendationMatchedGuideAdapter = {
  slug: string;
  title: string;
  summary: string;
  fitPersonalityCodes: string[];
  href: string;
};

export type CareerRecommendationBundleAdapter = {
  authoritySource: string;
  requestedType: string;
  displayType: string;
  canonicalTypeCode: string;
  graphTypeCode: string;
  publicRouteSlug: string;
  typeName: string;
  nickname: string | null;
  careerDataStatus: CareerDataStatus;
  recommendationSubjectMeta: {
    canonicalType: string | null;
  };
  scoreBundle: CareerScoreBundleAdapter;
  warnings: CareerWarningsAdapter;
  claimPermissions: CareerClaimPermissions;
  trustManifest: CareerTrustManifest | null;
  seoContract: CareerSeoContractAdapter;
  provenanceMeta: CareerProvenanceMetaAdapter;
  integritySummary: CareerIntegritySummaryAdapter;
  supportingTruthSummary: {
    medianPayUsdAnnual: number | null;
    outlookPct20242034: number | null;
    aiExposure: number | null;
    summary: string | null;
  };
  matchedJobs: CareerRecommendationMatchedJobAdapter[];
  matchedGuides: CareerRecommendationMatchedGuideAdapter[];
  sceneEntryBlocks: Array<{
    key: string;
    title: string;
    body: string;
    href: string | null;
  }>;
  renderState: CareerRecommendationRenderState;
};
