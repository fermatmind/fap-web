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
  reasonCodes: string[];
  datasetEligible: boolean | null;
  articleEligible: boolean | null;
};

export type CareerLightweightDataStatus = "available" | "trust_limited" | "unavailable";

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

export type CareerExplainabilityScoreDimensionAdapter = {
  value: number | null;
  integrityState: string;
  criticalMissingFields: string[];
  confidenceCap: number | null;
  formulaVersion: string | null;
  components: Record<string, number | null>;
  penalties: Array<{
    code: string;
    value: number | null;
    reason: string | null;
  }>;
  degradationFactor: number | null;
};

export type CareerExplainabilityAdapter = {
  summaryKind: string;
  summaryVersion: string;
  subjectKind: "job" | "recommendation";
  subjectIdentity: {
    occupationUuid: string | null;
    canonicalSlug: string | null;
    canonicalTitleEn: string | null;
    publicRouteSlug?: string | null;
    type?: string | null;
    canonicalTypeCode?: string | null;
    displayTitle?: string | null;
  };
  scoreBundle: {
    fitScore: CareerExplainabilityScoreDimensionAdapter;
    strainScore: CareerExplainabilityScoreDimensionAdapter;
    aiSurvivalScore: CareerExplainabilityScoreDimensionAdapter;
    mobilityScore: CareerExplainabilityScoreDimensionAdapter;
    confidenceScore: CareerExplainabilityScoreDimensionAdapter;
  };
  warnings: CareerWarningsAdapter;
  claimPermissions: CareerClaimPermissions;
  integritySummary: CareerIntegritySummaryAdapter;
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
  occupationUuid: string | null;
  canonicalSlug: string;
  title: string;
  summary: string;
  fitBucket: "primary" | "secondary" | null;
  fitPersonalityCodes: string[];
  mbtiPrimaryCodes: string[];
  mbtiSecondaryCodes: string[];
  seoContract: CareerSeoContractAdapter;
  trustSummary: {
    reviewerStatus: string | null;
  };
  href: string;
};

export type CareerRecommendationMatchedGuideAdapter = {
  slug: string;
  title: string;
  summary: string;
  fitPersonalityCodes: string[];
  href: string;
};

export type CareerTransitionPreviewAdapter = {
  pathType: string;
  steps?: string[];
  targetJob: {
    occupationUuid: string | null;
    canonicalSlug: string;
    title: string;
    href: string;
  };
  scoreSummary: {
    mobilityScore: CareerScoreResult;
    confidenceScore: CareerScoreResult;
  };
  trustSummary: {
    allowTransitionRecommendation: boolean;
    reviewerStatus: string | null;
    reasonCodes: string[];
  };
  seoContract: CareerSeoContractAdapter;
};

export type CareerFamilyHubVisibleChildAdapter = {
  occupationUuid: string | null;
  canonicalSlug: string;
  canonicalTitleEn: string | null;
  canonicalTitleZh: string | null;
  title: string;
  href: string;
  seoContract: CareerSeoContractAdapter;
  trustSummary: {
    reviewerStatus: string | null;
  };
};

export type CareerFamilyHubAdapter = {
  authoritySource: string;
  family: {
    familyUuid: string | null;
    canonicalSlug: string;
    titleEn: string | null;
    titleZh: string | null;
    title: string;
  };
  visibleChildren: CareerFamilyHubVisibleChildAdapter[];
  counts: {
    visibleChildrenCount: number;
    publishReadyCount: number;
    blockedOverrideEligibleCount: number;
    blockedNotSafelyRemediableCount: number;
    blockedTotal: number;
  };
};

export type CareerAliasResolutionTargetAdapter = {
  canonicalSlug: string;
  title: string;
  href: string;
};

export type CareerAliasResolutionAmbiguousCandidateAdapter = {
  candidateKind: "occupation" | "family";
  canonicalSlug: string;
  title: string;
  href: string;
};

export type CareerAliasResolutionAdapter = {
  authoritySource: string;
  query: {
    raw: string;
    normalized: string;
    locale: string | null;
  };
  resolution:
    | {
        resolvedKind: "occupation";
        occupation: CareerAliasResolutionTargetAdapter;
      }
    | {
        resolvedKind: "family";
        family: CareerAliasResolutionTargetAdapter;
      }
    | {
        resolvedKind: "ambiguous";
        candidates: CareerAliasResolutionAmbiguousCandidateAdapter[];
      }
    | {
        resolvedKind: "none";
      };
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

export type CareerJobIndexCardAdapter = {
  authoritySource: string;
  dataStatus: CareerLightweightDataStatus;
  identity: {
    occupationUuid: string | null;
    canonicalSlug: string;
    entityLevel: string | null;
    familyUuid: string | null;
  };
  titles: {
    title: string;
    canonicalEn: string | null;
    canonicalZh: string | null;
    searchH1Zh: string | null;
  };
  truthSummary: {
    truthMarket: string | null;
    medianPayUsdAnnual: number | null;
    outlookPct20242034: number | null;
    outlookDescription: string | null;
    aiExposure: number | null;
  };
  trustSummary: {
    reviewerStatus: string | null;
    reviewedAt: string | null;
    contentVersion: string | null;
    dataVersion: string | null;
    logicVersion: string | null;
    editorialPatchRequired: boolean;
    editorialPatchStatus: string | null;
    allowStrongClaim: boolean;
    allowSalaryComparison: boolean;
    allowAiStrategy: boolean;
    reasonCodes: string[];
  };
  scoreSummary: {
    fitScore: CareerScoreResult;
    confidenceScore: CareerScoreResult;
  };
  seoContract: CareerSeoContractAdapter;
  provenanceMeta: CareerProvenanceMetaAdapter;
  href: string;
};

export type CareerRecommendationIndexCardAdapter = {
  authoritySource: string;
  dataStatus: CareerLightweightDataStatus;
  recommendationSubjectMeta: {
    typeCode: string | null;
    canonicalTypeCode: string | null;
    displayTitle: string;
    publicRouteSlug: string;
  };
  scoreSummary: {
    fitScore: CareerScoreResult;
    confidenceScore: CareerScoreResult;
  };
  trustSummary: {
    reviewerStatus: string | null;
    reviewedAt: string | null;
    contentVersion: string | null;
    dataVersion: string | null;
    logicVersion: string | null;
    allowStrongClaim: boolean;
    allowSalaryComparison: boolean;
    allowAiStrategy: boolean;
    reasonCodes: string[];
  };
  seoContract: CareerSeoContractAdapter;
  provenanceMeta: CareerProvenanceMetaAdapter;
  href: string;
};

export type CareerSearchResultCardAdapter = {
  authoritySource: string;
  dataStatus: CareerLightweightDataStatus;
  matchKind: string;
  matchedText: string | null;
  identity: {
    occupationUuid: string | null;
    canonicalSlug: string;
  };
  titles: {
    title: string;
    canonicalEn: string | null;
    canonicalZh: string | null;
  };
  trustSummary: {
    status: string | null;
    reviewerStatus: string | null;
    crossMarketNotice: string | null;
  };
  seoContract: CareerSeoContractAdapter;
  provenanceMeta: CareerProvenanceMetaAdapter;
  href: string;
};

export type CareerFirstWaveReadinessStatus =
  | "publish_ready"
  | "blocked_override_eligible"
  | "blocked_not_safely_remediable"
  | "partial_raw";

export type CareerFirstWaveReadinessOccupationAdapter = {
  occupationUuid: string | null;
  canonicalSlug: string;
  canonicalTitleEn: string | null;
  status: CareerFirstWaveReadinessStatus;
  blockerType: string | null;
  remediationClass: string | null;
  authorityOverrideSupplied: boolean;
  reviewRequired: boolean;
  crosswalkMode: string | null;
  reviewerStatus: string | null;
  indexState: string | null;
  indexEligible: boolean | null;
  reasonCodes: string[];
};

export type CareerFirstWaveReadinessSummaryAdapter = {
  authoritySource: string;
  summaryKind: string;
  summaryVersion: string;
  waveName: string;
  counts: {
    total: number;
    publishReady: number;
    blockedOverrideEligible: number;
    blockedNotSafelyRemediable: number;
    blockedTotal: number;
    partialRaw: number;
  };
  occupations: CareerFirstWaveReadinessOccupationAdapter[];
  occupationsBySlug: Record<string, CareerFirstWaveReadinessOccupationAdapter>;
};
