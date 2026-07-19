import {
  normalizeCareerClaimPermissions,
  normalizeCareerScoreResult,
  normalizeCareerTrustManifest,
  type CareerTrustManifest,
} from "@/lib/career/contracts";
import { getCareerJobRenderState } from "@/lib/career/protocolReadiness";
import { adaptCareerDisplaySurface } from "@/lib/career/displaySurface";
import { buildCareerJobFrontendUrl, normalizeCareerBundleCanonicalPath } from "@/lib/career/urls";
import type { CareerJobBundleResponseRaw } from "@/lib/career/api/types";
import type { SeoSurfaceRaw } from "@/lib/api/v0_3";
import type {
  CareerConversionClosureAdapter,
  CareerLifecycleFeedbackCheckinAdapter,
  CareerIntegritySummaryAdapter,
  CareerJobBundleAdapter,
  CareerLifecycleOperationalAdapter,
  CareerProjectionDeltaSummaryAdapter,
  CareerProjectionTimelineAdapter,
  CareerProvenanceMetaAdapter,
  CareerScoreBundleAdapter,
  CareerSeoContractAdapter,
  CareerShortlistContractAdapter,
  CareerWhiteBoxStrainRadarAxisKey,
  CareerWhiteBoxStrainScoreAdapter,
  CareerWhiteBoxScoresAdapter,
  CareerWarningsAdapter,
} from "@/lib/career/adapters/types";
import { localizedPath } from "@/lib/i18n/locales";
import { normalizeSeoSurface, type SeoSurfaceViewModel } from "@/lib/seo/seoSurface";
import { canonicalUrl } from "@/lib/site";

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

function readSeoAuthorityPayload(payload: CareerJobBundleResponseRaw | null): Record<string, unknown> | null {
  if (!payload || !isRecord(payload)) {
    return null;
  }

  if (isRecord(payload.seo_authority_v1)) {
    return payload.seo_authority_v1;
  }

  if (isRecord(payload.data) && isRecord(payload.data.seo_authority_v1)) {
    return payload.data.seo_authority_v1;
  }

  return null;
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

const STRAIN_RADAR_AXES: CareerWhiteBoxStrainRadarAxisKey[] = [
  "people_friction",
  "context_switch_load",
  "political_load",
  "uncertainty_load",
  "low_autonomy_trap",
  "repetition_mismatch",
];

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
    reasonCodes: normalizeStringArray(seoContract.reason_codes),
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

function buildWhiteBoxStrainRadarDimensions(
  value: unknown
): Record<CareerWhiteBoxStrainRadarAxisKey, number | null> | null {
  const raw = isRecord(value) ? value : null;
  if (!raw) {
    return null;
  }

  return Object.fromEntries(
    STRAIN_RADAR_AXES.map((axis) => {
      const axisValue = raw[axis];
      const normalized = isRecord(axisValue) ? normalizeNumber(axisValue.value) : normalizeNumber(axisValue);
      return [axis, normalized];
    })
  ) as Record<CareerWhiteBoxStrainRadarAxisKey, number | null>;
}

function buildWhiteBoxStrainScore(value: unknown): CareerWhiteBoxStrainScoreAdapter | null {
  const raw = isRecord(value) ? value : null;
  if (!raw) {
    return null;
  }

  const formulaBreakdown = Array.isArray(raw.formula_breakdown)
    ? raw.formula_breakdown
        .filter(isRecord)
        .map((item) => ({
          code: normalizeString(item.code) ?? "unknown",
          label: normalizeString(item.label),
          value: normalizeNumber(item.value),
          weight: normalizeNumber(item.weight),
          contribution: normalizeNumber(item.contribution),
        }))
    : [];

  const componentWeights = isRecord(raw.component_weights)
    ? Object.fromEntries(
        Object.entries(raw.component_weights).map(([key, item]) => [key, normalizeNumber(item)])
      )
    : {};

  const penalties = Array.isArray(raw.penalties)
    ? raw.penalties
        .filter(isRecord)
        .map((item) => ({
          code: normalizeString(item.code) ?? "unknown_penalty",
          value: normalizeNumber(item.value),
          reason: normalizeString(item.reason),
        }))
    : [];

  return {
    score: normalizeNumber(raw.score),
    integrityState: normalizeString(raw.integrity_state),
    degradationFactor: normalizeNumber(raw.degradation_factor),
    formulaBreakdown,
    componentWeights,
    penalties,
    warnings: normalizeStringArray(raw.warnings),
    radarDimensions: buildWhiteBoxStrainRadarDimensions(raw.radar_dimensions),
  };
}

function buildWhiteBoxScores(raw: Record<string, unknown>): CareerWhiteBoxScoresAdapter {
  const whiteBoxScores = isRecord(raw.white_box_scores) ? raw.white_box_scores : {};
  return {
    strainScore: buildWhiteBoxStrainScore(whiteBoxScores.strain_score),
  };
}

function buildTrustManifest(raw: Record<string, unknown>, slug: string): CareerTrustManifest | null {
  const trustRaw = isRecord(raw.trust_manifest) ? raw.trust_manifest : null;
  if (!trustRaw) {
    return null;
  }

  const reviewerStatus = normalizeString(trustRaw.reviewer_status);
  const reviewed = reviewerStatus === "reviewed" || reviewerStatus === "approved";
  const quality = isRecord(trustRaw.quality) ? trustRaw.quality : {};

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
    public_review: isRecord(trustRaw.public_review) ? trustRaw.public_review : trustRaw,
    reviewer: {
      reviewed: trustRaw.reviewed ?? reviewed,
      reviewer_status: reviewerStatus,
    },
    ai_assistance: trustRaw.ai_assistance ?? {
      used: false,
      summary: null,
    },
    quality: isRecord(trustRaw.quality)
      ? {
          reviewed,
          stale: false,
          blocked_reasons: [],
          ...quality,
        }
      : {
          complete: reviewed,
          reviewed,
          stale: false,
          blocked_reasons: [],
        },
    last_substantive_update_at: trustRaw.last_substantive_update_at ?? null,
    next_review_due_at: trustRaw.next_review_due_at ?? null,
  });
}

function normalizeStructuredDataUrl(
  locale: "en" | "zh",
  value: unknown,
  fallbackPath?: string | null
): string | null {
  const raw = normalizeString(value) ?? normalizeString(fallbackPath);
  if (!raw) {
    return null;
  }

  const normalized = /^https?:\/\//i.test(raw)
    ? (() => {
        try {
          return new URL(raw).pathname || raw;
        } catch {
          return raw;
        }
      })()
    : raw;

  if (/^https?:\/\//i.test(normalized)) {
    return null;
  }

  if (/^\/(en|zh)(\/|$)/i.test(normalized)) {
    return canonicalUrl(normalized);
  }

  if (normalized === "/career" || normalized.startsWith("/career/")) {
    return canonicalUrl(localizedPath(normalized, locale));
  }

  if (normalized.startsWith("/")) {
    return canonicalUrl(normalized);
  }

  return null;
}

function buildStructuredData(
  raw: Record<string, unknown>,
  locale: "en" | "zh",
  slug: string
): CareerJobBundleAdapter["structuredData"] {
  const structuredData = isRecord(raw.structured_data) ? raw.structured_data : {};
  const occupation = isRecord(structuredData.occupation) ? structuredData.occupation : null;
  const breadcrumbList = isRecord(structuredData.breadcrumb_list) ? structuredData.breadcrumb_list : null;
  const fallbackJobPath = buildCareerJobFrontendUrl(locale, slug);
  const occupationCanonicalPath = normalizeCareerBundleCanonicalPath(
    locale,
    normalizeString(occupation?.url) ?? normalizeString(occupation?.mainEntityOfPage),
    fallbackJobPath
  );

  const normalizedOccupation = occupation
    ? (arrayFilterRecord({
        "@context": normalizeString(occupation["@context"]),
        "@type": normalizeString(occupation["@type"]),
        name: normalizeString(occupation.name),
        url: normalizeStructuredDataUrl(locale, occupation.url, occupationCanonicalPath),
        mainEntityOfPage: normalizeStructuredDataUrl(locale, occupation.mainEntityOfPage, occupationCanonicalPath),
        educationRequirements: normalizeString(occupation.educationRequirements),
        experienceRequirements: normalizeString(occupation.experienceRequirements),
      }) as Record<string, unknown>)
    : null;

  const normalizedBreadcrumbItems = Array.isArray(breadcrumbList?.itemListElement)
    ? breadcrumbList.itemListElement
        .filter(isRecord)
        .map((item) =>
          arrayFilterRecord({
            "@type": normalizeString(item["@type"]),
            position: normalizeNumber(item.position),
            name: normalizeString(item.name),
            item: normalizeStructuredDataUrl(locale, item.item),
          })
        )
        .filter((item) => typeof item.name === "string" && typeof item.item === "string")
    : [];

  const normalizedBreadcrumbList = breadcrumbList
    ? (arrayFilterRecord({
        "@context": normalizeString(breadcrumbList["@context"]),
        "@type": normalizeString(breadcrumbList["@type"]),
        itemListElement: normalizedBreadcrumbItems,
      }) as Record<string, unknown>)
    : null;

  return {
    occupation:
      normalizedOccupation && typeof normalizedOccupation["@type"] === "string" ? normalizedOccupation : null,
    breadcrumbList:
      normalizedBreadcrumbList && typeof normalizedBreadcrumbList["@type"] === "string" ? normalizedBreadcrumbList : null,
  };
}

function jsonLdTypeMatches(value: unknown, expectedType: string): boolean {
  if (typeof value === "string") {
    return value === expectedType;
  }

  if (Array.isArray(value)) {
    return value.some((item) => item === expectedType);
  }

  return false;
}

function findJsonLdNodeByType(value: unknown, expectedType: string): Record<string, unknown> | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const match = findJsonLdNodeByType(item, expectedType);
      if (match) {
        return match;
      }
    }
    return null;
  }

  if (!isRecord(value)) {
    return null;
  }

  if (jsonLdTypeMatches(value["@type"], expectedType)) {
    return value;
  }

  return findJsonLdNodeByType(value["@graph"], expectedType);
}

function hasStructuredDataKey(seoSurface: SeoSurfaceViewModel | null, key: string): boolean {
  const normalizedKey = key.toLowerCase();
  return Boolean(seoSurface?.structuredDataKeys.some((item) => item.toLowerCase() === normalizedKey));
}

function buildSeoAuthorityOccupationJsonLd(
  seoAuthority: Record<string, unknown> | null,
  seoSurface: SeoSurfaceViewModel | null
): Record<string, unknown> | null {
  if (!seoAuthority || !hasStructuredDataKey(seoSurface, "Occupation")) {
    return null;
  }

  return findJsonLdNodeByType(seoAuthority.jsonld, "Occupation");
}

function arrayFilterRecord(input: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== null && value !== undefined));
}

function buildFeedbackCheckin(value: unknown): CareerLifecycleFeedbackCheckinAdapter | null {
  const feedback = isRecord(value) ? value : null;
  if (!feedback) {
    return null;
  }

  return {
    feedbackUuid: normalizeString(feedback.feedback_uuid),
    burnoutCheckin: normalizeNumber(feedback.burnout_checkin),
    careerSatisfaction: normalizeNumber(feedback.career_satisfaction),
    switchUrgency: normalizeNumber(feedback.switch_urgency),
    createdAt: normalizeString(feedback.created_at),
  };
}

function buildProjectionTimeline(value: unknown): CareerProjectionTimelineAdapter | null {
  const timeline = isRecord(value) ? value : null;
  if (!timeline) {
    return null;
  }

  return {
    timelineKind: normalizeString(timeline.timeline_kind),
    timelineVersion: normalizeString(timeline.timeline_version),
    currentProjectionUuid: normalizeString(timeline.current_projection_uuid),
    currentRecommendationSnapshotUuid: normalizeString(timeline.current_recommendation_snapshot_uuid),
    entries: Array.isArray(timeline.entries)
      ? timeline.entries.filter(isRecord).map((entry) => ({
          projectionUuid: normalizeString(entry.projection_uuid),
          recommendationSnapshotUuid: normalizeString(entry.recommendation_snapshot_uuid),
          contextSnapshotUuid: normalizeString(entry.context_snapshot_uuid),
          feedbackUuid: normalizeString(entry.feedback_uuid),
          entryKind: normalizeString(entry.entry_kind),
          entryLabel: normalizeString(entry.entry_label),
          createdAt: normalizeString(entry.created_at),
        }))
      : [],
  };
}

function buildProjectionDeltaSummary(value: unknown): CareerProjectionDeltaSummaryAdapter | null {
  const delta = isRecord(value) ? value : null;
  if (!delta) {
    return null;
  }

  const scoreDeltasRaw = isRecord(delta.score_deltas) ? delta.score_deltas : {};
  const feedbackDeltasRaw = isRecord(delta.feedback_deltas) ? delta.feedback_deltas : {};
  const claimChangedRaw = isRecord(delta.claim_permissions_changed) ? delta.claim_permissions_changed : {};

  return {
    deltaAvailable: delta.delta_available === true,
    previousProjectionUuid: normalizeString(delta.previous_projection_uuid),
    currentProjectionUuid: normalizeString(delta.current_projection_uuid),
    scoreDeltas: Object.fromEntries(
      Object.entries(scoreDeltasRaw).map(([key, metric]) => {
        const valueRecord = isRecord(metric) ? metric : {};
        return [
          key,
          {
            previous: normalizeNumber(valueRecord.previous),
            current: normalizeNumber(valueRecord.current),
            delta: normalizeNumber(valueRecord.delta),
          },
        ];
      })
    ),
    feedbackDeltas: Object.fromEntries(
      Object.entries(feedbackDeltasRaw).map(([key, item]) => [key, normalizeNumber(item)])
    ),
    transitionChanged: delta.transition_changed === true,
    targetJobsChanged: delta.target_jobs_changed === true,
    claimPermissionsChanged: Object.fromEntries(
      Object.entries(claimChangedRaw).map(([key, item]) => [key, item === true])
    ),
  };
}

function buildLifecycleOperational(raw: Record<string, unknown>): CareerLifecycleOperationalAdapter {
  const operational = isRecord(raw.lifecycle_operational) ? raw.lifecycle_operational : {};

  return {
    memberKind: normalizeString(operational.member_kind),
    canonicalSlug: normalizeString(operational.canonical_slug),
    currentProjectionUuid: normalizeString(operational.current_projection_uuid),
    currentRecommendationSnapshotUuid: normalizeString(operational.current_recommendation_snapshot_uuid),
    timelineEntryCount: normalizeNumber(operational.timeline_entry_count) ?? 0,
    latestFeedbackAt: normalizeString(operational.latest_feedback_at),
    deltaAvailable: operational.delta_available === true,
    lifecycleState: normalizeString(operational.lifecycle_state),
    closureState: normalizeString(operational.closure_state),
  };
}

function buildShortlistContract(raw: Record<string, unknown>): CareerShortlistContractAdapter {
  const contract = isRecord(raw.shortlist_contract) ? raw.shortlist_contract : {};

  return {
    enabled: contract.enabled === true,
    subjectKind: normalizeString(contract.subject_kind),
    subjectSlug: normalizeString(contract.subject_slug),
    sourcePageType: normalizeString(contract.source_page_type),
    stateEndpoint: normalizeString(contract.state_endpoint),
    writeEndpoint: normalizeString(contract.write_endpoint),
  };
}

function buildConversionClosure(raw: Record<string, unknown>): CareerConversionClosureAdapter {
  const closure = isRecord(raw.conversion_closure) ? raw.conversion_closure : {};
  const countsRaw = isRecord(closure.counts) ? closure.counts : {};
  const readinessRaw = isRecord(closure.readiness) ? closure.readiness : {};

  return {
    subjectSlug: normalizeString(closure.subject_slug),
    counts: Object.fromEntries(
      Object.entries(countsRaw).map(([key, value]) => [key, normalizeNumber(value) ?? 0])
    ),
    readiness: Object.fromEntries(
      Object.entries(readinessRaw).map(([key, value]) => [key, value === true])
    ),
  };
}

function buildContentSections(raw: Record<string, unknown>): CareerJobBundleAdapter["contentSections"] {
  const rows = Array.isArray(raw.content_sections) ? raw.content_sections : [];

  return rows
    .filter(isRecord)
    .map((section) => ({
      sectionKey: normalizeString(section.section_key) ?? "",
      title: normalizeString(section.title) ?? "",
      renderVariant: normalizeString(section.render_variant),
      bodyMd: normalizeString(section.body_md) ?? "",
      sortOrder: normalizeNumber(section.sort_order),
    }))
    .filter((section) => section.sectionKey && section.title && section.bodyMd)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export function adaptCareerJobBundle(input: AdaptCareerJobBundleInput): CareerJobBundleAdapter | null {
  const seoAuthority = readSeoAuthorityPayload(input.payload);
  const seoSurface = normalizeSeoSurface((seoAuthority?.seo_surface_v1 ?? null) as SeoSurfaceRaw | null);
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
  const whiteBoxScores = buildWhiteBoxScores(raw);
  const structuredData = buildStructuredData(raw, input.locale, slug);
  const seoAuthorityOccupation = buildSeoAuthorityOccupationJsonLd(seoAuthority, seoSurface);
  const lifecycleCompanionRaw = isRecord(raw.lifecycle_companion) ? raw.lifecycle_companion : {};

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
    contentSections: buildContentSections(raw),
    contentBodyMd: normalizeString(raw.content_body_md),
    displaySurfaceV1: adaptCareerDisplaySurface(raw.display_surface_v1, input.locale, undefined, slug, title),
    seoSurface,
    scoreBundle,
    warnings,
    claimPermissions,
    trustManifest,
    seoContract,
    provenanceMeta,
    integritySummary,
    whiteBoxScores,
    lifecycleCompanion: {
      timeline: buildProjectionTimeline(lifecycleCompanionRaw.timeline),
      deltaSummary: buildProjectionDeltaSummary(lifecycleCompanionRaw.delta_summary),
      latestFeedback: buildFeedbackCheckin(lifecycleCompanionRaw.latest_feedback),
    },
    lifecycleOperational: buildLifecycleOperational(raw),
    shortlistContract: buildShortlistContract(raw),
    conversionClosure: buildConversionClosure(raw),
    structuredData: {
      ...structuredData,
      occupation: seoAuthorityOccupation ?? structuredData.occupation,
    },
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
