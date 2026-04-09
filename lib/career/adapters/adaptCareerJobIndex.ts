import { normalizeCareerScoreResult } from "@/lib/career/contracts";
import type { CareerJobIndexResponseRaw } from "@/lib/career/api/types";
import { buildCareerJobFrontendUrl, normalizeCareerBundleCanonicalPath } from "@/lib/career/urls";
import { deriveCareerLightweightDataStatus } from "@/lib/career/lightweightGate";
import type {
  CareerJobIndexCardAdapter,
  CareerProvenanceMetaAdapter,
  CareerSeoContractAdapter,
} from "@/lib/career/adapters/types";

type AdaptCareerJobIndexInput = {
  locale: "en" | "zh";
  payload: CareerJobIndexResponseRaw | null;
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

function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildSeoContract(raw: Record<string, unknown>): CareerSeoContractAdapter {
  const seoContract = isRecord(raw.seo_contract) ? raw.seo_contract : {};

  return {
    canonicalPath: normalizeString(seoContract.canonical_path),
    canonicalTarget: normalizeString(seoContract.canonical_target),
    indexState: normalizeString(seoContract.index_state),
    indexEligible: normalizeBoolean(seoContract.index_eligible),
    reasonCodes: normalizeStringArray(seoContract.reason_codes),
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

function adaptItem(raw: Record<string, unknown>, locale: "en" | "zh"): CareerJobIndexCardAdapter | null {
  const identity = isRecord(raw.identity) ? raw.identity : {};
  const titles = isRecord(raw.titles) ? raw.titles : {};
  const truthSummary = isRecord(raw.truth_summary) ? raw.truth_summary : {};
  const trustSummary = isRecord(raw.trust_summary) ? raw.trust_summary : {};
  const scoreSummary = isRecord(raw.score_summary) ? raw.score_summary : {};
  const seoContract = buildSeoContract(raw);
  const provenanceMeta = buildProvenanceMeta(raw);

  const canonicalSlug = normalizeString(identity.canonical_slug);
  if (!canonicalSlug) {
    return null;
  }

  const canonicalEn = normalizeString(titles.canonical_en);
  const canonicalZh = normalizeString(titles.canonical_zh);
  const title =
    locale === "zh"
      ? canonicalZh ?? canonicalEn ?? humanizeSlug(canonicalSlug)
      : canonicalEn ?? canonicalZh ?? humanizeSlug(canonicalSlug);

  return {
    authoritySource: "career_backend_lightweight_index.v0.5",
    dataStatus: deriveCareerLightweightDataStatus({
      authoritySource: "career_backend_lightweight_index.v0.5",
      indexEligible: seoContract.indexEligible,
      indexState: seoContract.indexState,
      reviewerStatus: normalizeString(trustSummary.reviewer_status),
    }),
    identity: {
      occupationUuid: normalizeString(identity.occupation_uuid),
      canonicalSlug,
      entityLevel: normalizeString(identity.entity_level),
      familyUuid: normalizeString(identity.family_uuid),
    },
    titles: {
      title,
      canonicalEn,
      canonicalZh,
      searchH1Zh: normalizeString(titles.search_h1_zh),
    },
    truthSummary: {
      truthMarket: normalizeString(truthSummary.truth_market),
      medianPayUsdAnnual: normalizeNumber(truthSummary.median_pay_usd_annual),
      outlookPct20242034: normalizeNumber(truthSummary.outlook_pct_2024_2034),
      outlookDescription: normalizeString(truthSummary.outlook_description),
      aiExposure: normalizeNumber(truthSummary.ai_exposure),
    },
    trustSummary: {
      reviewerStatus: normalizeString(trustSummary.reviewer_status),
      reviewedAt: normalizeString(trustSummary.reviewed_at),
      contentVersion: normalizeString(trustSummary.content_version),
      dataVersion: normalizeString(trustSummary.data_version),
      logicVersion: normalizeString(trustSummary.logic_version),
      editorialPatchRequired: trustSummary.editorial_patch_required === true,
      editorialPatchStatus: normalizeString(trustSummary.editorial_patch_status),
      allowStrongClaim: trustSummary.allow_strong_claim === true,
      allowSalaryComparison: trustSummary.allow_salary_comparison === true,
      allowAiStrategy: trustSummary.allow_ai_strategy === true,
      reasonCodes: normalizeStringArray(trustSummary.reason_codes),
    },
    scoreSummary: {
      fitScore: normalizeCareerScoreResult(scoreSummary.fit_score, "missing_fit_score"),
      confidenceScore: normalizeCareerScoreResult(scoreSummary.confidence_score, "missing_confidence_score"),
    },
    seoContract,
    provenanceMeta,
    href: normalizeCareerBundleCanonicalPath(
      locale,
      seoContract.canonicalPath,
      buildCareerJobFrontendUrl(locale, canonicalSlug)
    ),
  };
}

export function adaptCareerJobIndex(input: AdaptCareerJobIndexInput): CareerJobIndexCardAdapter[] {
  const rawItems = Array.isArray(input.payload?.items) ? input.payload?.items : [];

  return rawItems
    .filter(isRecord)
    .map((item) => adaptItem(item, input.locale))
    .filter((item): item is CareerJobIndexCardAdapter => item !== null);
}
