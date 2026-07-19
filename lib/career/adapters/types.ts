import type { CareerClaimPermissions, CareerScoreResult, CareerTrustManifest } from "@/lib/career/contracts";
import type { CareerDisplaySurfaceViewModel } from "@/lib/career/displaySurface";
import type {
  CareerDataStatus,
  CareerJobRenderState,
  CareerRecommendationRenderState,
} from "@/lib/career/protocolReadiness";
import type { SeoSurfaceViewModel } from "@/lib/seo/seoSurface";
import type { PublicReview } from "@/lib/public-content/publicReview";

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

export type CareerWarningCopyVariant = "control" | "softer" | "strict";

export type CareerExplorerPrimaryPathVariant = "jobs_first" | "guided_discovery";

export type CareerTransitionEmphasisVariant = "balanced" | "risk_first" | "upside_first";

export type CareerRuntimeConfigAdapter = {
  authorityKind: string;
  authorityVersion: string;
  snapshotKey: string;
  thresholds: {
    confidence: {
      publishMin: number;
      promotionCandidateMin: number;
      stableMin: number;
    };
    warnings: {
      lowConfidenceThreshold: number;
      highStrainThreshold: number;
      aiRiskThreshold: number;
    };
    promotion: {
      nextStepLinksMin: number;
      strongClaimRequired: boolean;
    };
  };
  experiments: {
    warningCopy: {
      enabled: boolean;
      variant: CareerWarningCopyVariant;
    };
    explorerPrimaryPath: {
      enabled: boolean;
      variant: CareerExplorerPrimaryPathVariant;
    };
    transitionEmphasis: {
      enabled: boolean;
      variant: CareerTransitionEmphasisVariant;
    };
  };
};

export type CareerCrosswalkOpsQueueItemAdapter = {
  subjectSlug: string;
  canonicalTitleEn: string | null;
  familySlug: string | null;
  currentCrosswalkMode: string | null;
  candidateTargetKind: string | null;
  candidateTargetSlug: string | null;
  queueReasons: string[];
  requiresEditorialPatch: boolean;
  batchOrigin: string | null;
  publishTrack: string | null;
  blockingFlags: string[];
  hasApprovedPatch: boolean;
  latestPatchKey: string | null;
  latestPatchStatus: string | null;
  latestPatchVersion: string | null;
  latestPatchCreatedAt: string | null;
};

export type CareerCrosswalkOpsQueueAdapter = {
  queueKind: string;
  queueVersion: string;
  scope: string;
  counts: Record<string, number>;
  items: CareerCrosswalkOpsQueueItemAdapter[];
};

export type CareerCrosswalkPatchRecordAdapter = {
  patchKey: string;
  patchVersion: string;
  patchStatus: string;
  subjectSlug: string | null;
  targetKind: string | null;
  targetSlug: string | null;
  crosswalkModeOverride: string | null;
  reviewNotes: string | null;
  createdBy: string | null;
  reviewedBy: string | null;
  createdAt: string | null;
  reviewedAt: string | null;
  isLatest: boolean;
};

export type CareerCrosswalkPatchHistoryAdapter = {
  historyKind: string;
  historyVersion: string;
  subjectSlug: string;
  count: number;
  patches: CareerCrosswalkPatchRecordAdapter[];
  latestPatch: CareerCrosswalkPatchRecordAdapter | null;
};

export type CareerCrosswalkOverrideSummaryAdapter = {
  overrideKind: string;
  overrideVersion: string;
  subjectSlug: string;
  canonicalTitleEn: string | null;
  originalCrosswalkMode: string | null;
  resolvedCrosswalkMode: string | null;
  resolvedTargetKind: string | null;
  resolvedTargetSlug: string | null;
  overrideApplied: boolean;
  appliedPatchKey: string | null;
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

export type CareerWhiteBoxStrainRadarAxisKey =
  | "people_friction"
  | "context_switch_load"
  | "political_load"
  | "uncertainty_load"
  | "low_autonomy_trap"
  | "repetition_mismatch";

export type CareerWhiteBoxScoreFormulaBreakdownItemAdapter = {
  code: string;
  label: string | null;
  value: number | null;
  weight: number | null;
  contribution: number | null;
};

export type CareerWhiteBoxScorePenaltyItemAdapter = {
  code: string;
  value: number | null;
  reason: string | null;
};

export type CareerWhiteBoxStrainScoreAdapter = {
  score: number | null;
  integrityState: string | null;
  degradationFactor: number | null;
  formulaBreakdown: CareerWhiteBoxScoreFormulaBreakdownItemAdapter[];
  componentWeights: Record<string, number | null>;
  penalties: CareerWhiteBoxScorePenaltyItemAdapter[];
  warnings: string[];
  radarDimensions: Record<CareerWhiteBoxStrainRadarAxisKey, number | null> | null;
};

export type CareerWhiteBoxScoresAdapter = {
  strainScore: CareerWhiteBoxStrainScoreAdapter | null;
};

export type CareerLifecycleFeedbackCheckinAdapter = {
  feedbackUuid: string | null;
  burnoutCheckin: number | null;
  careerSatisfaction: number | null;
  switchUrgency: number | null;
  createdAt: string | null;
};

export type CareerProjectionTimelineEntryAdapter = {
  projectionUuid: string | null;
  recommendationSnapshotUuid: string | null;
  contextSnapshotUuid: string | null;
  feedbackUuid: string | null;
  entryKind: string | null;
  entryLabel: string | null;
  createdAt: string | null;
};

export type CareerProjectionTimelineAdapter = {
  timelineKind: string | null;
  timelineVersion: string | null;
  currentProjectionUuid: string | null;
  currentRecommendationSnapshotUuid: string | null;
  entries: CareerProjectionTimelineEntryAdapter[];
};

export type CareerProjectionDeltaMetricAdapter = {
  previous: number | null;
  current: number | null;
  delta: number | null;
};

export type CareerProjectionDeltaSummaryAdapter = {
  deltaAvailable: boolean;
  previousProjectionUuid: string | null;
  currentProjectionUuid: string | null;
  scoreDeltas: Record<string, CareerProjectionDeltaMetricAdapter>;
  feedbackDeltas: Record<string, number | null>;
  transitionChanged: boolean;
  targetJobsChanged: boolean;
  claimPermissionsChanged: Record<string, boolean>;
};

export type CareerLifecycleOperationalAdapter = {
  memberKind: string | null;
  canonicalSlug: string | null;
  currentProjectionUuid: string | null;
  currentRecommendationSnapshotUuid: string | null;
  timelineEntryCount: number;
  latestFeedbackAt: string | null;
  deltaAvailable: boolean;
  lifecycleState: string | null;
  closureState: string | null;
};

export type CareerShortlistContractAdapter = {
  enabled: boolean;
  subjectKind: string | null;
  subjectSlug: string | null;
  sourcePageType: string | null;
  stateEndpoint: string | null;
  writeEndpoint: string | null;
};

export type CareerConversionClosureAdapter = {
  subjectSlug: string | null;
  counts: Record<string, number>;
  readiness: Record<string, boolean>;
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

export type CareerExplainabilityStrainRadarAxisKey =
  | "peopleFriction"
  | "contextSwitchLoad"
  | "politicalLoad"
  | "uncertaintyLoad"
  | "lowAutonomyTrap"
  | "repetitionMismatch";

export type CareerExplainabilityStrainRadarAxisAdapter = {
  value: number | null;
};

export type CareerExplainabilityStrainRadarAdapter = {
  integrityState: string | null;
  confidenceCap: number | null;
  degradationFactor: number | null;
  formulaVersion: string | null;
  axes: Record<CareerExplainabilityStrainRadarAxisKey, CareerExplainabilityStrainRadarAxisAdapter>;
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
  strainRadar: CareerExplainabilityStrainRadarAdapter | null;
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
  contentSections: Array<{
    sectionKey: string;
    title: string;
    renderVariant: string | null;
    bodyMd: string;
    sortOrder: number | null;
  }>;
  contentBodyMd: string | null;
  displaySurfaceV1: CareerDisplaySurfaceViewModel | null;
  seoSurface: SeoSurfaceViewModel | null;
  scoreBundle: CareerScoreBundleAdapter;
  warnings: CareerWarningsAdapter;
  claimPermissions: CareerClaimPermissions;
  trustManifest: CareerTrustManifest | null;
  seoContract: CareerSeoContractAdapter;
  provenanceMeta: CareerProvenanceMetaAdapter;
  integritySummary: CareerIntegritySummaryAdapter;
  whiteBoxScores: CareerWhiteBoxScoresAdapter;
  lifecycleCompanion: {
    timeline: CareerProjectionTimelineAdapter | null;
    deltaSummary: CareerProjectionDeltaSummaryAdapter | null;
    latestFeedback: CareerLifecycleFeedbackCheckinAdapter | null;
  };
  lifecycleOperational: CareerLifecycleOperationalAdapter;
  shortlistContract: CareerShortlistContractAdapter;
  conversionClosure: CareerConversionClosureAdapter;
  structuredData: {
    occupation: Record<string, unknown> | null;
    breadcrumbList: Record<string, unknown> | null;
  };
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

export type CareerTransitionPreviewDeltaDirection = "same" | "higher" | "lower";

export type CareerTransitionPreviewDeltaEntryAdapter = {
  sourceValue: string;
  targetValue: string;
  direction: CareerTransitionPreviewDeltaDirection;
};

export type CareerTransitionBridgeStepTimeHorizon = "days_0_30" | "days_31_60" | "days_61_90";

export type CareerTransitionBridgeStepAdapter = {
  stepKey: string;
  title: string;
  description: string;
  timeHorizon: CareerTransitionBridgeStepTimeHorizon;
};

export type CareerTransitionPreviewAdapter = {
  pathType: string;
  steps?: string[];
  delta?: {
    entryEducationDelta?: CareerTransitionPreviewDeltaEntryAdapter;
    workExperienceDelta?: CareerTransitionPreviewDeltaEntryAdapter;
    trainingDelta?: CareerTransitionPreviewDeltaEntryAdapter;
  };
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
    publicReview: PublicReview;
    reasonCodes: string[];
  };
  whyThisPath?: string | null;
  whatIsLost?: string | null;
  bridgeSteps90d?: CareerTransitionBridgeStepAdapter[];
  rationaleCodes?: string[];
  tradeoffCodes?: string[];
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

export type CareerFamilyHubSeoContractAdapter = {
  canonicalPath: string | null;
  canonicalTitle: string | null;
  indexState: string | null;
  indexEligible: boolean | null;
  robotsPolicy: string | null;
};

export type CareerFamilyHubAdapter = {
  authoritySource: string;
  seoContract: CareerFamilyHubSeoContractAdapter;
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
  structuredData: {
    collectionPage: Record<string, unknown> | null;
    itemList: Record<string, unknown> | null;
    breadcrumbList: Record<string, unknown> | null;
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
  whiteBoxScores: CareerWhiteBoxScoresAdapter;
  feedbackCheckin: CareerLifecycleFeedbackCheckinAdapter | null;
  projectionTimeline: CareerProjectionTimelineAdapter;
  projectionDeltaSummary: CareerProjectionDeltaSummaryAdapter;
  lifecycleOperational: CareerLifecycleOperationalAdapter;
  shortlistContract: CareerShortlistContractAdapter;
  conversionClosure: CareerConversionClosureAdapter;
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

export type CareerFirstWaveLaunchTier = "stable" | "candidate" | "hold";

export type CareerFirstWaveLaunchTierOccupationAdapter = {
  occupationUuid: string | null;
  canonicalSlug: string;
  canonicalTitleEn: string | null;
  launchTier: CareerFirstWaveLaunchTier;
  readinessStatus: string | null;
  lifecycleState: string | null;
  publicIndexState: string | null;
  indexEligible: boolean | null;
  reviewerStatus: string | null;
  crosswalkMode: string | null;
  allowStrongClaim: boolean;
  confidenceScore: number | null;
  blockedGovernanceStatus: string | null;
  reasonCodes: string[];
};

export type CareerFirstWaveLaunchTierSummaryAdapter = {
  authoritySource: string;
  summaryKind: string;
  summaryVersion: string;
  scope: string;
  counts: {
    total: number;
    stable: number;
    candidate: number;
    hold: number;
  };
  occupations: CareerFirstWaveLaunchTierOccupationAdapter[];
  occupationsBySlug: Record<string, CareerFirstWaveLaunchTierOccupationAdapter>;
  launchTierBySlug: Record<string, CareerFirstWaveLaunchTier>;
};

export type CareerFirstWaveDiscoverabilityManifestRouteKind = "career_job_detail" | "career_family_hub";

export type CareerFirstWaveDiscoverabilityState = "discoverable" | "excluded";

type CareerFirstWaveDiscoverabilityManifestRouteBaseAdapter = {
  routeKind: CareerFirstWaveDiscoverabilityManifestRouteKind;
  canonicalPath: string;
  discoverabilityState: CareerFirstWaveDiscoverabilityState;
  reasonCodes: string[];
};

export type CareerFirstWaveDiscoverabilityManifestJobDetailRouteAdapter =
  CareerFirstWaveDiscoverabilityManifestRouteBaseAdapter & {
    routeKind: "career_job_detail";
    occupationUuid: string | null;
    canonicalSlug: string;
    canonicalTitleEn: string | null;
    launchTier: CareerFirstWaveLaunchTier | null;
    readinessStatus: string | null;
    publicIndexState: string | null;
    indexEligible: boolean | null;
    reviewerStatus: string | null;
    crosswalkMode: string | null;
    blockedGovernanceStatus: string | null;
  };

export type CareerFirstWaveDiscoverabilityManifestFamilyHubRouteAdapter =
  CareerFirstWaveDiscoverabilityManifestRouteBaseAdapter & {
    routeKind: "career_family_hub";
    familyUuid: string | null;
    canonicalSlug: string;
    titleEn: string | null;
    visibleChildrenCount: number;
  };

export type CareerFirstWaveDiscoverabilityManifestRouteAdapter =
  | CareerFirstWaveDiscoverabilityManifestJobDetailRouteAdapter
  | CareerFirstWaveDiscoverabilityManifestFamilyHubRouteAdapter;

export type CareerFirstWaveDiscoverabilityManifestAdapter = {
  authoritySource: string;
  manifestKind: string;
  manifestVersion: string;
  scope: string;
  routes: CareerFirstWaveDiscoverabilityManifestRouteAdapter[];
  routesByPath: Record<string, CareerFirstWaveDiscoverabilityManifestRouteAdapter>;
  jobDetailBySlug: Record<string, CareerFirstWaveDiscoverabilityManifestJobDetailRouteAdapter>;
  familyHubBySlug: Record<string, CareerFirstWaveDiscoverabilityManifestFamilyHubRouteAdapter>;
  discoverableJobDetailSlugs: string[];
  discoverableFamilyHubSlugs: string[];
};

export type CareerFirstWaveNextStepLinkRouteKind = "career_family_hub" | "career_job_detail";

export type CareerFirstWaveNextStepLinkReasonCode =
  | "family_hub_discoverable"
  | "same_family_sibling_discoverable";

type CareerFirstWaveNextStepLinkBaseAdapter = {
  routeKind: CareerFirstWaveNextStepLinkRouteKind;
  canonicalPath: string;
  canonicalSlug: string;
  linkReasonCode: CareerFirstWaveNextStepLinkReasonCode;
};

export type CareerFirstWaveNextStepFamilyHubLinkAdapter = CareerFirstWaveNextStepLinkBaseAdapter & {
  routeKind: "career_family_hub";
  familyUuid: string | null;
  titleEn: string | null;
};

export type CareerFirstWaveNextStepJobDetailLinkAdapter = CareerFirstWaveNextStepLinkBaseAdapter & {
  routeKind: "career_job_detail";
  occupationUuid: string | null;
  canonicalTitleEn: string | null;
};

export type CareerFirstWaveNextStepLinkAdapter =
  | CareerFirstWaveNextStepFamilyHubLinkAdapter
  | CareerFirstWaveNextStepJobDetailLinkAdapter;

export type CareerFirstWaveNextStepLinksSummaryAdapter = {
  authoritySource: string;
  summaryKind: string;
  summaryVersion: string;
  scope: string;
  subjectKind: string;
  subjectIdentity: {
    occupationUuid: string | null;
    canonicalSlug: string | null;
    canonicalTitleEn: string | null;
  };
  counts: {
    total: number;
    jobDetail: number;
    familyHub: number;
  };
  nextStepLinks: CareerFirstWaveNextStepLinkAdapter[];
  familyHubLinks: CareerFirstWaveNextStepFamilyHubLinkAdapter[];
  jobDetailLinks: CareerFirstWaveNextStepJobDetailLinkAdapter[];
};

export type CareerFirstWaveRecommendationCompanionLinkRouteKind =
  | "career_family_hub"
  | "career_job_detail"
  | "test_landing"
  | "topic_detail";

export type CareerFirstWaveRecommendationCompanionLinkReasonCode =
  | "target_job_detail_companion"
  | "target_family_hub_companion"
  | "matched_job_detail_companion"
  | "recommendation_test_support"
  | "recommendation_topic_support";

type CareerFirstWaveRecommendationCompanionLinkBaseAdapter = {
  routeKind: CareerFirstWaveRecommendationCompanionLinkRouteKind;
  canonicalPath: string;
  canonicalSlug: string;
  linkReasonCode: CareerFirstWaveRecommendationCompanionLinkReasonCode;
};

export type CareerFirstWaveRecommendationCompanionFamilyHubLinkAdapter =
  CareerFirstWaveRecommendationCompanionLinkBaseAdapter & {
    routeKind: "career_family_hub";
    familyUuid: string | null;
    titleEn: string | null;
  };

export type CareerFirstWaveRecommendationCompanionJobDetailLinkAdapter =
  CareerFirstWaveRecommendationCompanionLinkBaseAdapter & {
    routeKind: "career_job_detail";
    occupationUuid: string | null;
    canonicalTitleEn: string | null;
  };

export type CareerFirstWaveRecommendationCompanionTestLandingLinkAdapter =
  CareerFirstWaveRecommendationCompanionLinkBaseAdapter & {
    routeKind: "test_landing";
    scaleCode: string | null;
  };

export type CareerFirstWaveRecommendationCompanionTopicDetailLinkAdapter =
  CareerFirstWaveRecommendationCompanionLinkBaseAdapter & {
    routeKind: "topic_detail";
    topicCode: string | null;
  };

export type CareerFirstWaveRecommendationCompanionLinkAdapter =
  | CareerFirstWaveRecommendationCompanionFamilyHubLinkAdapter
  | CareerFirstWaveRecommendationCompanionJobDetailLinkAdapter
  | CareerFirstWaveRecommendationCompanionTestLandingLinkAdapter
  | CareerFirstWaveRecommendationCompanionTopicDetailLinkAdapter;

export type CareerFirstWaveRecommendationCompanionLinksSummaryAdapter = {
  authoritySource: string;
  summaryKind: string;
  summaryVersion: string;
  scope: string;
  subjectKind: string;
  subjectIdentity: {
    typeCode: string | null;
    canonicalTypeCode: string | null;
    publicRouteSlug: string | null;
    displayTitle: string | null;
  };
  counts: {
    total: number;
    jobDetail: number;
    familyHub: number;
    testLanding: number;
    topicDetail: number;
  };
  companionLinks: CareerFirstWaveRecommendationCompanionLinkAdapter[];
  familyHubLinks: CareerFirstWaveRecommendationCompanionFamilyHubLinkAdapter[];
  jobDetailLinks: CareerFirstWaveRecommendationCompanionJobDetailLinkAdapter[];
  testLandingLinks: CareerFirstWaveRecommendationCompanionTestLandingLinkAdapter[];
  topicDetailLinks: CareerFirstWaveRecommendationCompanionTopicDetailLinkAdapter[];
};

export type CareerDatasetHubAdapter = {
  datasetKey: string;
  datasetScope: string;
  datasetName: string;
  datasetNameZh: string;
  publication: {
    publisherName: string;
    publisherUrl: string;
    licenseName: string;
    licenseUrl: string;
    licenseSummary: string;
    usageSummary: string;
    allowedForPublicDisplay: boolean;
    allowedForDownload: boolean;
    accessMode: string;
    downloadUrl: string;
    formats: string[];
    methodUrl: string;
    documentationUrl: string;
  };
  collectionSummary: {
    memberKind: string;
    memberCount: number;
    includedCount: number;
    excludedCount: number;
    publicDetailIndexableCount: number;
    publicDetailConservativeCount: number;
    stableCount: number;
    candidateCount: number;
    holdCount: number;
    discoverableCount: number;
    manifestVersion: string;
    selectionPolicyVersion: string;
    releaseCohortCounts: Record<string, number>;
    publicIndexStateCounts: Record<string, number>;
    strongIndexDecisionCounts: Record<string, number>;
    trackingCounts: Record<string, number | boolean>;
    facetDistributions: Record<string, Record<string, number>>;
  };
  filters: {
    family: boolean;
    publishTrack: boolean;
    indexPosture: boolean;
  };
  scopeSummary: {
    memberCount: number;
    includedCount: number;
    excludedCount: number;
  };
  facetDistributions: Record<string, Record<string, number>>;
  methodUrl: string;
  members: CareerDatasetMemberAdapter[];
  structuredData: {
    dataset: Record<string, unknown> | null;
    breadcrumbList: Record<string, unknown> | null;
  };
};

export type CareerDatasetMemberAdapter = {
  memberKind: string;
  canonicalSlug: string;
  canonicalTitleEn: string;
  canonicalTitleZh?: string | null;
  familySlug: string | null;
  publishTrack: string | null;
  batchOrigin: string | null;
  releaseCohort: string | null;
  publicIndexState: string | null;
  strongIndexDecision: string | null;
  includedInPublicDataset: boolean;
  exclusionReasons: string[];
};

export type CareerDatasetMethodAdapter = {
  datasetKey: string;
  datasetScope: string;
  methodUrl: string;
  hubUrl: string;
  title: string;
  summary: string;
  sourceSummary: string;
  reviewDisciplineSummary: string;
  included: string[];
  excluded: string[];
  boundaryNotes: string[];
  scopeSummary: {
    memberCount: number;
    includedCount: number;
    excludedCount: number;
    releaseCohortCounts: Record<string, number>;
    strongIndexDecisionCounts: Record<string, number>;
  };
  publication: {
    publisherName: string;
    publisherUrl: string;
    licenseName: string;
    licenseUrl: string;
    usageSummary: string;
    downloadUrl: string;
  };
  structuredData: {
    article: Record<string, unknown> | null;
    breadcrumbList: Record<string, unknown> | null;
  };
};

export type CareerLaunchGovernanceState =
  | "mature_public_launch"
  | "public_but_conservative"
  | "not_yet_mature";

export type CareerOperationsState = "strong_operations_ready" | "not_strong_operations_ready";

export type CareerLaunchGovernanceClosureMemberAdapter = {
  canonicalSlug: string;
  releaseState: string;
  strongIndexState: string;
  operationsState: CareerOperationsState;
  governanceState: CareerLaunchGovernanceState;
  strongIndexReady: boolean;
  strongOperationsReady: boolean;
  blockingReasons: string[];
};

export type CareerLaunchGovernanceClosureAdapter = {
  authoritySource: string;
  governanceKind: string;
  governanceVersion: string;
  scope: string;
  trackingCounts: {
    expectedTotalOccupations: number;
    trackedTotalOccupations: number;
    trackingComplete: boolean;
  };
  summary: {
    maturePublicLaunchCount: number;
    publicButConservativeCount: number;
    strongIndexReadyCount: number;
    strongOperationsReadyCount: number;
    notYetReadyCount: number;
  };
  publicStatement: {
    canClaimMaturePublicLaunch: boolean;
    canClaimStrongIndexReady: boolean;
    canClaimStrongOperationsReady: boolean;
    allowedExternalStatement: string;
  };
  members: CareerLaunchGovernanceClosureMemberAdapter[];
  membersBySlug: Record<string, CareerLaunchGovernanceClosureMemberAdapter>;
};
