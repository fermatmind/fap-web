import type { CareerDatasetHubResponseRaw } from "@/lib/career/api/types";
import type { CareerDatasetHubAdapter, CareerDatasetMemberAdapter } from "@/lib/career/adapters/types";

type AdaptCareerDatasetHubInput = {
  payload: CareerDatasetHubResponseRaw | null;
};

function normalizeString(value: unknown, fallback = ""): string {
  if (typeof value !== "string") {
    return fallback;
  }
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : fallback;
}

function normalizeBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => normalizeString(item)).filter((item) => item.length > 0);
}

function normalizeObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function normalizeRecordOfNumbers(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const normalized: Record<string, number> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (typeof raw === "number" && Number.isFinite(raw)) {
      normalized[key] = raw;
    }
  }

  return normalized;
}

function normalizeRecordOfRecordNumbers(value: unknown): Record<string, Record<string, number>> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const normalized: Record<string, Record<string, number>> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    normalized[key] = normalizeRecordOfNumbers(raw);
  }

  return normalized;
}

function normalizeMember(value: unknown): CareerDatasetMemberAdapter | null {
  const member = normalizeObject(value);
  const canonicalSlug = normalizeString(member.canonical_slug);
  if (!canonicalSlug) {
    return null;
  }

  return {
    memberKind: normalizeString(member.member_kind, "career_tracked_occupation"),
    canonicalSlug,
    canonicalTitleEn: normalizeString(member.canonical_title_en, canonicalSlug),
    canonicalTitleZh: normalizeString(member.canonical_title_zh) || null,
    familySlug: normalizeString(member.family_slug) || null,
    publishTrack: normalizeString(member.publish_track) || null,
    batchOrigin: normalizeString(member.batch_origin) || null,
    releaseCohort: normalizeString(member.release_cohort) || null,
    publicIndexState: normalizeString(member.public_index_state) || null,
    strongIndexDecision: normalizeString(member.strong_index_decision) || null,
    includedInPublicDataset: normalizeBoolean(member.included_in_public_dataset),
    exclusionReasons: normalizeStringArray(member.exclusion_reasons),
  };
}

export function adaptCareerDatasetHub(input: AdaptCareerDatasetHubInput): CareerDatasetHubAdapter | null {
  const root = normalizeObject(input.payload);
  if (Object.keys(root).length === 0) {
    return null;
  }

  const publication = normalizeObject(root.publication);
  const publisher = normalizeObject(publication.publisher);
  const license = normalizeObject(publication.license);
  const usage = normalizeObject(publication.usage);
  const distribution = normalizeObject(publication.distribution);
  const collectionSummary = normalizeObject(root.collection_summary);
  const filters = normalizeObject(root.filters);
  const scopeSummary = normalizeObject(root.scope_summary);
  const facetDistributions = normalizeObject(root.facet_distributions);
  const structuredData = normalizeObject(root.structured_data);
  const members = Array.isArray(root.members) ? root.members.map(normalizeMember).filter((item): item is CareerDatasetMemberAdapter => item !== null) : [];

  return {
    datasetKey: normalizeString(root.dataset_key),
    datasetScope: normalizeString(root.dataset_scope),
    datasetName: normalizeString(root.dataset_name, "Career occupations dataset"),
    datasetNameZh: normalizeString(root.dataset_name_zh, "职业数据库"),
    publication: {
      publisherName: normalizeString(publisher.name, "FermatMind"),
      publisherUrl: normalizeString(publisher.url, "https://www.fermatmind.com"),
      licenseName: normalizeString(license.name),
      licenseUrl: normalizeString(license.url),
      licenseSummary: normalizeString(license.summary),
      usageSummary: normalizeString(usage.summary),
      allowedForPublicDisplay: normalizeBoolean(usage.allowed_for_public_display),
      allowedForDownload: normalizeBoolean(usage.allowed_for_download),
      accessMode: normalizeString(distribution.access_mode),
      downloadUrl: normalizeString(distribution.download_url),
      formats: normalizeStringArray(distribution.format),
      methodUrl: normalizeString(distribution.methodology_url),
      documentationUrl: normalizeString(distribution.documentation_url),
    },
    collectionSummary: {
      memberKind: normalizeString(collectionSummary.member_kind),
      memberCount: normalizeNumber(collectionSummary.member_count),
      includedCount: normalizeNumber(collectionSummary.included_count),
      excludedCount: normalizeNumber(collectionSummary.excluded_count),
      publicDetailIndexableCount: normalizeNumber(collectionSummary.public_detail_indexable_count),
      publicDetailConservativeCount: normalizeNumber(collectionSummary.public_detail_conservative_count),
      stableCount: normalizeNumber(collectionSummary.stable_count),
      candidateCount: normalizeNumber(collectionSummary.candidate_count),
      holdCount: normalizeNumber(collectionSummary.hold_count),
      discoverableCount: normalizeNumber(collectionSummary.discoverable_count),
      manifestVersion: normalizeString(collectionSummary.manifest_version),
      selectionPolicyVersion: normalizeString(collectionSummary.selection_policy_version),
      releaseCohortCounts: normalizeRecordOfNumbers(collectionSummary.release_cohort_counts),
      publicIndexStateCounts: normalizeRecordOfNumbers(collectionSummary.public_index_state_counts),
      strongIndexDecisionCounts: normalizeRecordOfNumbers(collectionSummary.strong_index_decision_counts),
      trackingCounts: {
        ...normalizeRecordOfNumbers(collectionSummary.tracking_counts),
        tracking_complete: normalizeBoolean(normalizeObject(collectionSummary.tracking_counts).tracking_complete),
      },
      facetDistributions: normalizeRecordOfRecordNumbers(collectionSummary.facet_distributions),
    },
    filters: {
      family: normalizeBoolean(filters.family),
      publishTrack: normalizeBoolean(filters.publish_track),
      indexPosture: normalizeBoolean(filters.index_posture),
    },
    scopeSummary: {
      memberCount: normalizeNumber(scopeSummary.member_count, normalizeNumber(collectionSummary.member_count)),
      includedCount: normalizeNumber(scopeSummary.included_count, normalizeNumber(collectionSummary.included_count)),
      excludedCount: normalizeNumber(scopeSummary.excluded_count, normalizeNumber(collectionSummary.excluded_count)),
    },
    facetDistributions: normalizeRecordOfRecordNumbers(Object.keys(facetDistributions).length > 0 ? facetDistributions : collectionSummary.facet_distributions),
    methodUrl: normalizeString(root.method_url),
    members,
    structuredData: {
      dataset: normalizeObject(structuredData.dataset),
      breadcrumbList: normalizeObject(structuredData.breadcrumb_list),
    },
  };
}
