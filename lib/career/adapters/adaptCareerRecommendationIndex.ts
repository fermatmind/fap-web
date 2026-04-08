import { normalizeCareerScoreResult } from "@/lib/career/contracts";
import type { CareerRecommendationIndexResponseRaw } from "@/lib/career/api/types";
import { buildCareerRecommendationFrontendUrl, normalizeCareerBundleCanonicalPath } from "@/lib/career/urls";
import { deriveCareerLightweightDataStatus } from "@/lib/career/lightweightGate";
import type {
  CareerProvenanceMetaAdapter,
  CareerRecommendationIndexCardAdapter,
  CareerSeoContractAdapter,
} from "@/lib/career/adapters/types";

type AdaptCareerRecommendationIndexInput = {
  locale: "en" | "zh";
  payload: CareerRecommendationIndexResponseRaw | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

function normalizeBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function normalizeTypeSlug(value: string): string {
  return String(value ?? "").trim().toLowerCase();
}

function buildSeoContract(raw: Record<string, unknown>): CareerSeoContractAdapter {
  const seoContract = isRecord(raw.seo_contract) ? raw.seo_contract : {};

  return {
    canonicalPath: normalizeString(seoContract.canonical_path),
    canonicalTarget: normalizeString(seoContract.canonical_target),
    indexState: normalizeString(seoContract.index_state),
    indexEligible: normalizeBoolean(seoContract.index_eligible),
    datasetEligible: null,
    articleEligible: null,
  };
}

function buildProvenanceMeta(raw: Record<string, unknown>): CareerProvenanceMetaAdapter {
  const provenance = isRecord(raw.provenance_meta) ? raw.provenance_meta : {};

  return {
    contentVersion: normalizeString(provenance.content_version) ?? "unknown",
    dataVersion: normalizeString(provenance.data_version) ?? "unknown",
    logicVersion: normalizeString(provenance.logic_version) ?? "unknown",
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

function humanizeType(value: string): string {
  return value.toUpperCase();
}

function adaptItem(raw: Record<string, unknown>, locale: "en" | "zh"): CareerRecommendationIndexCardAdapter | null {
  const subjectMeta = isRecord(raw.recommendation_subject_meta) ? raw.recommendation_subject_meta : {};
  const scoreSummary = isRecord(raw.score_summary) ? raw.score_summary : {};
  const trustSummary = isRecord(raw.trust_summary) ? raw.trust_summary : {};
  const seoContract = buildSeoContract(raw);
  const provenanceMeta = buildProvenanceMeta(raw);

  const publicRouteSlug = normalizeTypeSlug(
    normalizeString(subjectMeta.public_route_slug) ??
      normalizeString(subjectMeta.canonical_type_code) ??
      normalizeString(subjectMeta.type_code) ??
      ""
  );
  if (!publicRouteSlug) {
    return null;
  }

  const canonicalTypeCode = normalizeString(subjectMeta.canonical_type_code);
  const typeCode = normalizeString(subjectMeta.type_code);
  const displayTitle =
    normalizeString(subjectMeta.display_title) ??
    canonicalTypeCode ??
    typeCode ??
    humanizeType(publicRouteSlug);

  return {
    authoritySource: "career_backend_lightweight_index.v0.5",
    dataStatus: deriveCareerLightweightDataStatus({
      authoritySource: "career_backend_lightweight_index.v0.5",
      indexEligible: seoContract.indexEligible,
      indexState: seoContract.indexState,
      reviewerStatus: normalizeString(trustSummary.reviewer_status),
    }),
    recommendationSubjectMeta: {
      typeCode,
      canonicalTypeCode,
      displayTitle,
      publicRouteSlug,
    },
    scoreSummary: {
      fitScore: normalizeCareerScoreResult(scoreSummary.fit_score, "missing_fit_score"),
      confidenceScore: normalizeCareerScoreResult(scoreSummary.confidence_score, "missing_confidence_score"),
    },
    trustSummary: {
      reviewerStatus: normalizeString(trustSummary.reviewer_status),
      reviewedAt: normalizeString(trustSummary.reviewed_at),
      contentVersion: normalizeString(trustSummary.content_version),
      dataVersion: normalizeString(trustSummary.data_version),
      logicVersion: normalizeString(trustSummary.logic_version),
      allowStrongClaim: trustSummary.allow_strong_claim === true,
      allowSalaryComparison: trustSummary.allow_salary_comparison === true,
      allowAiStrategy: trustSummary.allow_ai_strategy === true,
      reasonCodes: normalizeStringArray(trustSummary.reason_codes),
    },
    seoContract,
    provenanceMeta,
    href: normalizeCareerBundleCanonicalPath(
      locale,
      seoContract.canonicalPath,
      buildCareerRecommendationFrontendUrl(locale, publicRouteSlug)
    ),
  };
}

export function adaptCareerRecommendationIndex(
  input: AdaptCareerRecommendationIndexInput
): CareerRecommendationIndexCardAdapter[] {
  const rawItems = Array.isArray(input.payload?.items) ? input.payload?.items : [];

  return rawItems
    .filter(isRecord)
    .map((item) => adaptItem(item, input.locale))
    .filter((item): item is CareerRecommendationIndexCardAdapter => item !== null);
}
