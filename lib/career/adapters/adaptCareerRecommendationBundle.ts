import {
  normalizeCareerClaimPermissions,
  normalizeCareerScoreResult,
  normalizeCareerTrustManifest,
  type CareerTrustManifest,
} from "@/lib/career/contracts";
import { getCareerRecommendationRenderState } from "@/lib/career/protocolReadiness";
import type { CareerRecommendationBundleResponseRaw } from "@/lib/career/api/types";
import type {
  CareerIntegritySummaryAdapter,
  CareerProvenanceMetaAdapter,
  CareerRecommendationBundleAdapter,
  CareerRecommendationMatchedGuideAdapter,
  CareerRecommendationMatchedJobAdapter,
  CareerScoreBundleAdapter,
  CareerSeoContractAdapter,
  CareerWarningsAdapter,
} from "@/lib/career/adapters/types";
import { buildCareerJobFrontendUrl } from "@/lib/career/urls";

type AdaptCareerRecommendationBundleInput = {
  locale: "en" | "zh";
  requestedType: string;
  payload: CareerRecommendationBundleResponseRaw | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unwrapPayload<T extends { data?: unknown }>(payload: T | null): Record<string, unknown> | null {
  if (!payload) {
    return null;
  }

  if (isRecord(payload.data)) {
    return payload.data;
  }

  return isRecord(payload) ? payload : null;
}

function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized || null;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.map((item) => String(item ?? "").trim()).filter(Boolean))];
}

function normalizeNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function normalizeBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function normalizeTypeCode(value: string): string {
  return String(value ?? "")
    .trim()
    .toUpperCase();
}

function normalizeTypeSlug(value: string): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function stripVariant(typeCode: string): string {
  const normalized = normalizeTypeCode(typeCode);
  return normalized.replace(/-(A|T)$/i, "");
}

function readSlugFromCanonicalPath(value: string | null, fallbackSlug: string): string {
  if (!value) {
    return fallbackSlug;
  }

  const match = value.match(/\/career\/recommendations\/mbti\/([^/?#]+)/i);
  return match?.[1]?.toLowerCase() ?? fallbackSlug;
}

function buildScoreBundle(raw: Record<string, unknown>): CareerScoreBundleAdapter {
  const scoreBundle = isRecord(raw.score_bundle) ? raw.score_bundle : {};

  return {
    fitScore: normalizeCareerScoreResult(scoreBundle.fit_score, "missing_fit_score"),
    strainScore: normalizeCareerScoreResult(scoreBundle.strain_score, "missing_strain_score"),
    aiSurvivalScore: normalizeCareerScoreResult(scoreBundle.ai_survival_score, "missing_ai_survival_score"),
    mobilityScore: normalizeCareerScoreResult(scoreBundle.mobility_score, "missing_mobility_score"),
    confidenceScore: normalizeCareerScoreResult(scoreBundle.confidence_score, "missing_confidence_score"),
  };
}

function buildWarnings(raw: Record<string, unknown>): CareerWarningsAdapter {
  const warnings = isRecord(raw.warnings) ? raw.warnings : {};

  return {
    redFlags: normalizeStringArray(warnings.red_flags),
    amberFlags: normalizeStringArray(warnings.amber_flags),
    blockedClaims: normalizeStringArray(warnings.blocked_claims),
  };
}

function buildSeoContract(raw: Record<string, unknown>): CareerSeoContractAdapter {
  const seoContract = isRecord(raw.seo_contract) ? raw.seo_contract : {};

  return {
    canonicalPath: normalizeString(seoContract.canonical_path),
    canonicalTarget: normalizeString(seoContract.canonical_target),
    indexState: normalizeString(seoContract.index_state),
    indexEligible: normalizeBoolean(seoContract.index_eligible),
    reasonCodes: normalizeStringArray(seoContract.reason_codes),
    datasetEligible: normalizeBoolean(seoContract.dataset_eligible),
    articleEligible: normalizeBoolean(seoContract.article_eligible),
  };
}

function buildSeoContractFromValue(value: unknown): CareerSeoContractAdapter {
  return buildSeoContract(isRecord(value) ? { seo_contract: value } : {});
}

function buildTrustManifest(raw: Record<string, unknown>, pageSlug: string): CareerTrustManifest | null {
  const trustRaw = isRecord(raw.trust_manifest) ? raw.trust_manifest : null;
  if (!trustRaw) {
    return null;
  }

  const reviewerStatus = normalizeString(trustRaw.reviewer_status);
  const reviewed = reviewerStatus === "reviewed" || reviewerStatus === "approved";

  return normalizeCareerTrustManifest({
    manifest_version: trustRaw.manifest_version ?? "trust_manifest.v1",
    entity_id: trustRaw.entity_id ?? pageSlug,
    page_type: trustRaw.page_type ?? "career_recommendation_detail",
    page_slug: trustRaw.page_slug ?? pageSlug,
    content_version: trustRaw.content_version ?? "unknown",
    data_version: trustRaw.data_version ?? "unknown",
    logic_version: trustRaw.logic_version ?? "unknown",
    locale_context: trustRaw.locale_context ?? {},
    source_trace: trustRaw.source_trace ?? [],
    methodology: trustRaw.methodology ?? {},
    reviewer: {
      reviewed: trustRaw.reviewed ?? reviewed,
      reviewer_id: trustRaw.reviewer_id ?? null,
      reviewer_status: reviewerStatus,
    },
    ai_assistance: trustRaw.ai_assistance ?? {
      used: false,
      summary: null,
    },
    quality: trustRaw.quality ?? {
      complete: reviewed,
      reviewed,
      stale: false,
      blocked_reasons: [],
    },
    last_substantive_update_at: trustRaw.last_substantive_update_at ?? null,
    next_review_due_at: trustRaw.next_review_due_at ?? null,
  });
}

function buildProvenanceMeta(
  raw: Record<string, unknown>,
  trustManifest: CareerTrustManifest | null
): CareerProvenanceMetaAdapter {
  const provenance = isRecord(raw.provenance_meta) ? raw.provenance_meta : {};

  return {
    contentVersion: normalizeString(provenance.content_version) ?? trustManifest?.content_version ?? "unknown",
    dataVersion: normalizeString(provenance.data_version) ?? trustManifest?.data_version ?? "unknown",
    logicVersion: normalizeString(provenance.logic_version) ?? trustManifest?.logic_version ?? "unknown",
    compilerVersion: normalizeString(provenance.compiler_version),
    compiledAt: normalizeString(provenance.compiled_at),
    truthMetricId: normalizeString(provenance.truth_metric_id),
    trustManifestId: normalizeString(provenance.trust_manifest_id),
    indexStateId: normalizeString(provenance.index_state_id),
    compileRunId: normalizeString(provenance.compile_run_id),
    importRunId: normalizeString(provenance.import_run_id),
    compileRefs: isRecord(provenance.compile_refs) ? provenance.compile_refs : {},
  };
}

function buildIntegritySummary(
  raw: Record<string, unknown>,
  scoreBundle: CareerScoreBundleAdapter
): CareerIntegritySummaryAdapter {
  const summary = isRecord(raw.integrity_summary) ? raw.integrity_summary : {};
  const confidenceScore = scoreBundle.confidenceScore;

  return {
    integrityState:
      normalizeString(summary.integrity_state) ?? normalizeString(summary.status) ?? confidenceScore.integrity_state,
    criticalMissingFields:
      normalizeStringArray(summary.critical_missing_fields).length > 0
        ? normalizeStringArray(summary.critical_missing_fields)
        : confidenceScore.critical_missing_fields,
    confidenceCap: normalizeNumber(summary.confidence_cap) ?? confidenceScore.confidence_cap,
    degradationFactor: normalizeNumber(summary.degradation_factor) ?? confidenceScore.degradation_factor,
  };
}

function normalizeMatchedJobs(value: unknown, locale: "en" | "zh"): CareerRecommendationMatchedJobAdapter[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map((item) => {
      const canonicalSlug = normalizeString(item.canonical_slug) ?? normalizeString(item.slug);
      if (!canonicalSlug) {
        return null;
      }

      const normalizedFitBucket = normalizeString(item.fit_bucket);
      const trustSummary = isRecord(item.trust_summary) ? item.trust_summary : {};

      return {
        occupationUuid: normalizeString(item.occupation_uuid),
        canonicalSlug,
        title: normalizeString(item.title) ?? canonicalSlug,
        summary: normalizeString(item.summary) ?? "",
        fitBucket:
          normalizedFitBucket === "primary" || normalizedFitBucket === "secondary"
            ? normalizedFitBucket
            : null,
        fitPersonalityCodes: normalizeStringArray(item.fit_personality_codes).map((code) => code.toUpperCase()),
        mbtiPrimaryCodes: normalizeStringArray(item.mbti_primary_codes).map((code) => code.toUpperCase()),
        mbtiSecondaryCodes: normalizeStringArray(item.mbti_secondary_codes).map((code) => code.toUpperCase()),
        seoContract: buildSeoContractFromValue(item.seo_contract),
        trustSummary: {
          reviewerStatus: normalizeString(trustSummary.reviewer_status),
        },
        href: buildCareerJobFrontendUrl(locale, canonicalSlug),
      };
    })
    .filter((item): item is CareerRecommendationMatchedJobAdapter => item !== null);
}

function normalizeMatchedGuides(value: unknown, locale: "en" | "zh"): CareerRecommendationMatchedGuideAdapter[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map((item) => {
      const slug = normalizeString(item.slug);
      if (!slug) {
        return null;
      }

      return {
        slug,
        title: normalizeString(item.title) ?? slug,
        summary: normalizeString(item.summary) ?? "",
        fitPersonalityCodes: normalizeStringArray(item.fit_personality_codes).map((code) => code.toUpperCase()),
        href: `/${locale}/career/guides/${slug}`,
      };
    })
    .filter((item): item is CareerRecommendationMatchedGuideAdapter => item !== null);
}

export function adaptCareerRecommendationBundle(
  input: AdaptCareerRecommendationBundleInput
): CareerRecommendationBundleAdapter | null {
  const raw = unwrapPayload(input.payload);
  if (!raw) {
    return null;
  }

  const identity = isRecord(raw.identity) ? raw.identity : {};
  const subjectMeta = isRecord(raw.recommendation_subject_meta) ? raw.recommendation_subject_meta : {};
  const supportingTruth = isRecord(raw.supporting_truth_summary) ? raw.supporting_truth_summary : {};

  const requestedType = normalizeTypeCode(input.requestedType);
  const identityType = normalizeString(identity.mbti_type);
  const canonicalType = normalizeTypeCode(
    normalizeString(subjectMeta.canonical_type) ?? stripVariant(identityType ?? requestedType)
  );
  const displayType = normalizeTypeCode(identityType ?? requestedType);
  const seoContract = buildSeoContract(raw);
  const publicRouteSlug = readSlugFromCanonicalPath(seoContract.canonicalPath, normalizeTypeSlug(input.requestedType));
  const trustManifest = buildTrustManifest(raw, publicRouteSlug);
  const claimPermissions = normalizeCareerClaimPermissions(raw.claim_permissions);
  const scoreBundle = buildScoreBundle(raw);
  const warnings = buildWarnings(raw);
  const provenanceMeta = buildProvenanceMeta(raw, trustManifest);
  const integritySummary = buildIntegritySummary(raw, scoreBundle);
  const matchedJobs = normalizeMatchedJobs(raw.matched_jobs, input.locale);
  const matchedGuides = normalizeMatchedGuides(raw.matched_guides, input.locale);
  const hasSupportingTruth =
    normalizeNumber((supportingTruth as Record<string, unknown>).median_pay_usd_annual) !== null ||
    normalizeNumber((supportingTruth as Record<string, unknown>).outlook_pct_2024_2034) !== null ||
    normalizeNumber((supportingTruth as Record<string, unknown>).ai_exposure) !== null ||
    normalizeString((supportingTruth as Record<string, unknown>).summary) !== null;

  const renderState = getCareerRecommendationRenderState({
    authoritySource: "career_backend_bundle.v0.5",
    claimPermissions,
    trustManifest,
    matchedJobs,
    seoContract: {
      index_eligible: seoContract.indexEligible,
      index_state: seoContract.indexState,
    },
    hasStrongContent:
      scoreBundle.fitScore.value !== null ||
      scoreBundle.strainScore.value !== null ||
      scoreBundle.aiSurvivalScore.value !== null ||
      scoreBundle.mobilityScore.value !== null ||
      scoreBundle.confidenceScore.value !== null ||
      warnings.redFlags.length > 0 ||
      warnings.amberFlags.length > 0 ||
      hasSupportingTruth,
    hasSummaryText: normalizeString((supportingTruth as Record<string, unknown>).summary) !== null,
    hasSalaryData: normalizeNumber((supportingTruth as Record<string, unknown>).median_pay_usd_annual) !== null,
    hasOutlookData: normalizeNumber((supportingTruth as Record<string, unknown>).outlook_pct_2024_2034) !== null,
    hasAiData: normalizeNumber((supportingTruth as Record<string, unknown>).ai_exposure) !== null,
    integritySummary,
  });

  return {
    authoritySource: "career_backend_bundle.v0.5",
    requestedType,
    displayType,
    canonicalTypeCode: canonicalType,
    graphTypeCode: canonicalType,
    publicRouteSlug,
    typeName: displayType,
    nickname: normalizeString(identity.nickname) ?? null,
    careerDataStatus: renderState.careerDataStatus,
    recommendationSubjectMeta: {
      canonicalType: normalizeString(subjectMeta.canonical_type) ?? canonicalType,
    },
    scoreBundle,
    warnings,
    claimPermissions,
    trustManifest,
    seoContract,
    provenanceMeta,
    integritySummary,
    supportingTruthSummary: {
      medianPayUsdAnnual: normalizeNumber((supportingTruth as Record<string, unknown>).median_pay_usd_annual),
      outlookPct20242034: normalizeNumber((supportingTruth as Record<string, unknown>).outlook_pct_2024_2034),
      aiExposure: normalizeNumber((supportingTruth as Record<string, unknown>).ai_exposure),
      summary: normalizeString((supportingTruth as Record<string, unknown>).summary),
    },
    matchedJobs,
    matchedGuides,
    sceneEntryBlocks: [],
    renderState,
  };
}
