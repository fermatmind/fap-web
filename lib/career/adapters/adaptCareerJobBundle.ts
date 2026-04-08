import {
  normalizeCareerClaimPermissions,
  normalizeCareerScoreResult,
  normalizeCareerTrustManifest,
  type CareerTrustManifest,
} from "@/lib/career/contracts";
import { getCareerJobRenderState } from "@/lib/career/protocolReadiness";
import type { CareerJobBundleResponseRaw } from "@/lib/career/api/types";
import type {
  CareerIntegritySummaryAdapter,
  CareerJobBundleAdapter,
  CareerProvenanceMetaAdapter,
  CareerScoreBundleAdapter,
  CareerSeoContractAdapter,
  CareerWarningsAdapter,
} from "@/lib/career/adapters/types";

type AdaptCareerJobBundleInput = {
  locale: "en" | "zh";
  requestedSlug: string;
  payload: CareerJobBundleResponseRaw | null;
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

function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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
    datasetEligible: normalizeBoolean(seoContract.dataset_eligible),
    articleEligible: normalizeBoolean(seoContract.article_eligible),
  };
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

function buildTrustManifest(raw: Record<string, unknown>, slug: string): CareerTrustManifest | null {
  const trustRaw = isRecord(raw.trust_manifest) ? raw.trust_manifest : null;
  if (!trustRaw) {
    return null;
  }

  const reviewerStatus = normalizeString(trustRaw.reviewer_status);
  const reviewed = reviewerStatus === "reviewed" || reviewerStatus === "approved";

  return normalizeCareerTrustManifest({
    manifest_version: trustRaw.manifest_version ?? "trust_manifest.v1",
    entity_id: trustRaw.entity_id ?? slug,
    page_type: trustRaw.page_type ?? "career_job_detail",
    page_slug: trustRaw.page_slug ?? slug,
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

export function adaptCareerJobBundle(input: AdaptCareerJobBundleInput): CareerJobBundleAdapter | null {
  const raw = unwrapPayload(input.payload);
  if (!raw) {
    return null;
  }

  const identity = isRecord(raw.identity) ? raw.identity : {};
  const titles = isRecord(raw.titles) ? raw.titles : {};
  const truthLayer = isRecord(raw.truth_layer) ? raw.truth_layer : {};
  const aliasIndex = Array.isArray(raw.alias_index) ? raw.alias_index : [];

  const slug = normalizeString(identity.canonical_slug) ?? String(input.requestedSlug).trim().toLowerCase();
  if (!slug) {
    return null;
  }

  const titleEn = normalizeString(titles.canonical_en);
  const titleZh = normalizeString(titles.canonical_zh);
  const title =
    input.locale === "zh" ? titleZh ?? titleEn ?? humanizeSlug(slug) : titleEn ?? titleZh ?? humanizeSlug(slug);

  const scoreBundle = buildScoreBundle(raw);
  const warnings = buildWarnings(raw);
  const trustManifest = buildTrustManifest(raw, slug);
  const claimPermissions = normalizeCareerClaimPermissions(raw.claim_permissions);
  const seoContract = buildSeoContract(raw);
  const provenanceMeta = buildProvenanceMeta(raw, trustManifest);
  const integritySummary = buildIntegritySummary(raw, scoreBundle);

  const adapter: CareerJobBundleAdapter = {
    authoritySource: "career_backend_bundle.v0.5",
    slug,
    locale: input.locale,
    title,
    summary: normalizeString((truthLayer as Record<string, unknown>).summary) ?? "",
    titles: {
      canonicalEn: titleEn,
      canonicalZh: titleZh,
    },
    aliasIndex: aliasIndex
      .filter(isRecord)
      .map((item) => ({
        alias: normalizeString(item.alias) ?? "",
        normalized: normalizeString(item.normalized) ?? "",
        lang: normalizeString(item.lang) ?? "",
      }))
      .filter((item) => item.alias),
    truthLayer: {
      medianPayUsdAnnual: normalizeNumber(truthLayer.median_pay_usd_annual),
      outlookPct20242034: normalizeNumber(truthLayer.outlook_pct_2024_2034),
      outlookDescription: normalizeString(truthLayer.outlook_description),
      aiExposure: normalizeNumber(truthLayer.ai_exposure),
      entryEducation: normalizeString(truthLayer.entry_education),
      workExperience: normalizeString(truthLayer.work_experience),
      onTheJobTraining: normalizeString(truthLayer.on_the_job_training),
      sourceRefs: normalizeStringArray(truthLayer.source_refs),
    },
    scoreBundle,
    warnings,
    claimPermissions,
    trustManifest,
    seoContract,
    provenanceMeta,
    integritySummary,
    renderState: getCareerJobRenderState({
      authoritySource: "career_backend_bundle.v0.5",
      claimPermissions,
      trustManifest,
      seoContract: {
        index_eligible: seoContract.indexEligible,
        index_state: seoContract.indexState,
      },
      hasSalaryData: normalizeNumber(truthLayer.median_pay_usd_annual) !== null,
      hasOutlookData:
        normalizeNumber(truthLayer.outlook_pct_2024_2034) !== null || normalizeString(truthLayer.outlook_description) !== null,
      hasFitData:
        scoreBundle.fitScore.value !== null ||
        scoreBundle.strainScore.value !== null ||
        scoreBundle.confidenceScore.value !== null,
      warnings,
      integritySummary,
    }),
  };

  return adapter;
}
