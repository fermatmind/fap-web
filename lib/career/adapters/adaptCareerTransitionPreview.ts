import { normalizeCareerScoreResult } from "@/lib/career/contracts";
import type { CareerTransitionPreviewResponseRaw } from "@/lib/career/api/types";
import type {
  CareerTransitionBridgeStepAdapter,
  CareerTransitionBridgeStepTimeHorizon,
  CareerSeoContractAdapter,
  CareerTransitionPreviewAdapter,
  CareerTransitionPreviewDeltaDirection,
  CareerTransitionPreviewDeltaEntryAdapter,
} from "@/lib/career/adapters/types";
import { buildCareerJobFrontendUrl, normalizeCareerBundleCanonicalPath } from "@/lib/career/urls";
import { normalizePublicReview } from "@/lib/public-content/publicReview";

type AdaptCareerTransitionPreviewInput = {
  locale: "en" | "zh";
  payload: CareerTransitionPreviewResponseRaw | null;
};

const TRANSITION_PREVIEW_STEP_ALLOWLIST = new Set(["skill_overlap", "task_overlap", "tool_overlap"]);
const TRANSITION_PREVIEW_DELTA_DIRECTION_ALLOWLIST = new Set<CareerTransitionPreviewDeltaDirection>([
  "same",
  "higher",
  "lower",
]);
const TRANSITION_PREVIEW_BRIDGE_TIME_HORIZON_ALLOWLIST = new Set<CareerTransitionBridgeStepTimeHorizon>([
  "days_0_30",
  "days_31_60",
  "days_61_90",
]);

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

function normalizeTransitionPreviewDeltaEntry(value: unknown): CareerTransitionPreviewDeltaEntryAdapter | null {
  const entry = isRecord(value) ? value : null;
  if (!entry) {
    return null;
  }

  const sourceValue = normalizeString(entry.source_value);
  const targetValue = normalizeString(entry.target_value);
  const direction = normalizeString(entry.direction) as CareerTransitionPreviewDeltaDirection | null;

  if (!sourceValue || !targetValue || !direction || !TRANSITION_PREVIEW_DELTA_DIRECTION_ALLOWLIST.has(direction)) {
    return null;
  }

  return {
    sourceValue,
    targetValue,
    direction,
  };
}

function normalizeTransitionPreviewDelta(raw: Record<string, unknown>): CareerTransitionPreviewAdapter["delta"] {
  const delta = isRecord(raw.delta) ? raw.delta : null;
  if (!delta) {
    return undefined;
  }

  const entryEducationDelta = normalizeTransitionPreviewDeltaEntry(delta.entry_education_delta);
  const workExperienceDelta = normalizeTransitionPreviewDeltaEntry(delta.work_experience_delta);
  const trainingDelta = normalizeTransitionPreviewDeltaEntry(delta.training_delta);

  if (!entryEducationDelta && !workExperienceDelta && !trainingDelta) {
    return undefined;
  }

  return {
    ...(entryEducationDelta ? { entryEducationDelta } : {}),
    ...(workExperienceDelta ? { workExperienceDelta } : {}),
    ...(trainingDelta ? { trainingDelta } : {}),
  };
}

function normalizeBridgeSteps90d(value: unknown): CareerTransitionBridgeStepAdapter[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const row = isRecord(item) ? item : null;
      if (!row) {
        return null;
      }

      const stepKey = normalizeString(row.step_key);
      const title = normalizeString(row.title);
      const description = normalizeString(row.description);
      const timeHorizon = normalizeString(row.time_horizon) as CareerTransitionBridgeStepTimeHorizon | null;

      if (
        !stepKey ||
        !title ||
        !description ||
        !timeHorizon ||
        !TRANSITION_PREVIEW_BRIDGE_TIME_HORIZON_ALLOWLIST.has(timeHorizon)
      ) {
        return null;
      }

      return {
        stepKey,
        title,
        description,
        timeHorizon,
      };
    })
    .filter((item): item is CareerTransitionBridgeStepAdapter => item !== null);
}

export function adaptCareerTransitionPreview(
  input: AdaptCareerTransitionPreviewInput
): CareerTransitionPreviewAdapter | null {
  const raw = unwrapPayload(input.payload);
  if (!raw) {
    return null;
  }

  const pathType = normalizeString(raw.path_type);
  const rawSteps = normalizeStringArray(raw.steps);
  const whyThisPath = normalizeString(raw.why_this_path);
  const whatIsLost = normalizeString(raw.what_is_lost);
  const rationaleCodes = normalizeStringArray(raw.rationale_codes);
  const tradeoffCodes = normalizeStringArray(raw.tradeoff_codes);
  const bridgeSteps90d = normalizeBridgeSteps90d(raw.bridge_steps_90d);
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

  const steps =
    rawSteps.length > 0 && rawSteps.every((step) => TRANSITION_PREVIEW_STEP_ALLOWLIST.has(step))
      ? rawSteps
      : undefined;
  const delta = normalizeTransitionPreviewDelta(raw);

  return {
    pathType,
    ...(steps ? { steps } : {}),
    ...(delta ? { delta } : {}),
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
      publicReview: normalizePublicReview(trustSummary),
      reasonCodes: normalizeStringArray(trustSummary.reason_codes),
    },
    ...(whyThisPath ? { whyThisPath } : {}),
    ...(whatIsLost ? { whatIsLost } : {}),
    ...(bridgeSteps90d.length > 0 ? { bridgeSteps90d } : {}),
    ...(rationaleCodes.length > 0 ? { rationaleCodes } : {}),
    ...(tradeoffCodes.length > 0 ? { tradeoffCodes } : {}),
    seoContract,
  };
}
