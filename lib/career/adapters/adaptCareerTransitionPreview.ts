import { normalizeCareerScoreResult } from "@/lib/career/contracts";
import type { CareerTransitionPreviewResponseRaw } from "@/lib/career/api/types";
import type { CareerSeoContractAdapter, CareerTransitionPreviewAdapter } from "@/lib/career/adapters/types";
import { buildCareerJobFrontendUrl, normalizeCareerBundleCanonicalPath } from "@/lib/career/urls";

type AdaptCareerTransitionPreviewInput = {
  locale: "en" | "zh";
  payload: CareerTransitionPreviewResponseRaw | null;
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

function normalizeBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
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

export function adaptCareerTransitionPreview(
  input: AdaptCareerTransitionPreviewInput
): CareerTransitionPreviewAdapter | null {
  const raw = unwrapPayload(input.payload);
  if (!raw) {
    return null;
  }

  const pathType = normalizeString(raw.path_type);
  const targetJob = isRecord(raw.target_job) ? raw.target_job : {};
  const scoreSummary = isRecord(raw.score_summary) ? raw.score_summary : {};
  const trustSummary = isRecord(raw.trust_summary) ? raw.trust_summary : {};
  const seoContract = buildSeoContract(raw);

  const canonicalSlug = normalizeString(targetJob.canonical_slug);
  if (!pathType || !canonicalSlug) {
    return null;
  }

  const allowTransitionRecommendation = normalizeBoolean(trustSummary.allow_transition_recommendation) === true;
  if (!allowTransitionRecommendation || seoContract.indexEligible !== true) {
    return null;
  }

  return {
    pathType,
    targetJob: {
      occupationUuid: normalizeString(targetJob.occupation_uuid),
      canonicalSlug,
      title: normalizeString(targetJob.title) ?? canonicalSlug,
      href: normalizeCareerBundleCanonicalPath(
        input.locale,
        seoContract.canonicalPath,
        buildCareerJobFrontendUrl(input.locale, canonicalSlug)
      ),
    },
    scoreSummary: {
      mobilityScore: normalizeCareerScoreResult(scoreSummary.mobility_score, "missing_mobility_score"),
      confidenceScore: normalizeCareerScoreResult(scoreSummary.confidence_score, "missing_confidence_score"),
    },
    trustSummary: {
      allowTransitionRecommendation,
      reviewerStatus: normalizeString(trustSummary.reviewer_status),
      reasonCodes: normalizeStringArray(trustSummary.reason_codes),
    },
    seoContract,
  };
}
