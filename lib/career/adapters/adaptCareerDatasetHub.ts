import type { CareerDatasetHubResponseRaw } from "@/lib/career/api/types";
import type { CareerDatasetHubAdapter } from "@/lib/career/adapters/types";

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
  const structuredData = normalizeObject(root.structured_data);

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
      stableCount: normalizeNumber(collectionSummary.stable_count),
      candidateCount: normalizeNumber(collectionSummary.candidate_count),
      holdCount: normalizeNumber(collectionSummary.hold_count),
      discoverableCount: normalizeNumber(collectionSummary.discoverable_count),
      excludedCount: normalizeNumber(collectionSummary.excluded_count),
      manifestVersion: normalizeString(collectionSummary.manifest_version),
      selectionPolicyVersion: normalizeString(collectionSummary.selection_policy_version),
    },
    filters: {
      family: normalizeBoolean(filters.family),
      publishTrack: normalizeBoolean(filters.publish_track),
      indexPosture: normalizeBoolean(filters.index_posture),
    },
    methodUrl: normalizeString(root.method_url),
    structuredData: {
      dataset: normalizeObject(structuredData.dataset),
      breadcrumbList: normalizeObject(structuredData.breadcrumb_list),
    },
  };
}

