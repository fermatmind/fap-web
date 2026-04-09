import type { CareerSearchResponseRaw } from "@/lib/career/api/types";
import { buildCareerJobFrontendUrl, normalizeCareerBundleCanonicalPath } from "@/lib/career/urls";
import { deriveCareerLightweightDataStatus, isCareerLightweightTrustReady } from "@/lib/career/lightweightGate";
import type {
  CareerLightweightDataStatus,
  CareerProvenanceMetaAdapter,
  CareerSearchResultCardAdapter,
  CareerSeoContractAdapter,
} from "@/lib/career/adapters/types";

type AdaptCareerSearchInput = {
  locale: "en" | "zh";
  payload: CareerSearchResponseRaw | null;
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

function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeSearchDataStatus(
  explicitStatus: string | null,
  indexEligible: boolean | null,
  indexState: string | null,
  reviewerStatus: string | null
): CareerLightweightDataStatus {
  const normalizedStatus = String(explicitStatus ?? "").trim().toLowerCase();
  if (normalizedStatus === "trust_limited" || normalizedStatus === "unavailable") {
    return normalizedStatus;
  }

  const derived = deriveCareerLightweightDataStatus({
    authoritySource: "career_backend_conservative_search.v0.5",
    indexEligible,
    indexState,
    reviewerStatus,
  });

  if (normalizedStatus === "available" && derived === "available") {
    return "available";
  }

  if (indexEligible === true && isCareerLightweightTrustReady(reviewerStatus)) {
    return "available";
  }

  return derived;
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

function adaptItem(raw: Record<string, unknown>, locale: "en" | "zh"): CareerSearchResultCardAdapter | null {
  const identity = isRecord(raw.identity) ? raw.identity : {};
  const titles = isRecord(raw.titles) ? raw.titles : {};
  const trustSummary = isRecord(raw.trust_summary) ? raw.trust_summary : {};
  const seoContract = buildSeoContract(raw);
  const provenanceMeta = buildProvenanceMeta(raw);

  const canonicalSlug = normalizeString(identity.canonical_slug);
  if (!canonicalSlug) {
    return null;
  }

  const canonicalEn = normalizeString(titles.canonical_en);
  const canonicalZh = normalizeString(titles.canonical_zh);
  const reviewerStatus = normalizeString(trustSummary.reviewer_status);
  const explicitStatus = normalizeString(trustSummary.status);
  const title =
    locale === "zh"
      ? canonicalZh ?? canonicalEn ?? humanizeSlug(canonicalSlug)
      : canonicalEn ?? canonicalZh ?? humanizeSlug(canonicalSlug);

  return {
    authoritySource: "career_backend_conservative_search.v0.5",
    dataStatus: normalizeSearchDataStatus(
      explicitStatus,
      seoContract.indexEligible,
      seoContract.indexState,
      reviewerStatus
    ),
    matchKind: normalizeString(raw.match_kind) ?? "unknown",
    matchedText: normalizeString(raw.matched_text),
    identity: {
      occupationUuid: normalizeString(identity.occupation_uuid),
      canonicalSlug,
    },
    titles: {
      title,
      canonicalEn,
      canonicalZh,
    },
    trustSummary: {
      status: explicitStatus,
      reviewerStatus,
      crossMarketNotice: normalizeString(trustSummary.cross_market_notice),
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

export function adaptCareerSearch(input: AdaptCareerSearchInput): CareerSearchResultCardAdapter[] {
  const rawItems = Array.isArray(input.payload?.items)
    ? input.payload.items
    : Array.isArray(input.payload?.data)
      ? input.payload.data
      : [];

  return rawItems
    .filter(isRecord)
    .map((item) => adaptItem(item, input.locale))
    .filter((item): item is CareerSearchResultCardAdapter => item !== null);
}
