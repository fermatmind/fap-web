import { normalizePublicReview, type PublicReview } from "@/lib/public-content/publicReview";

export type CareerTrustSourceTraceItem = {
  ref: string;
  source: string;
  url: string | null;
  last_reviewed_at: string | null;
};

export type CareerTrustManifest = {
  manifest_version: string;
  entity_id: string;
  page_type: string;
  page_slug: string;
  content_version: string;
  data_version: string;
  logic_version: string;
  locale_context: {
    truth_market: string | null;
    display_market: string | null;
    locale: string | null;
  };
  source_trace: CareerTrustSourceTraceItem[];
  methodology: {
    crosswalk_mode: string | null;
    derivation_policy: string | null;
    notes: string[];
  };
  publicReview: PublicReview;
  legacyReview: {
    reviewed: boolean;
    reviewerStatus: string | null;
  };
  ai_assistance: {
    used: boolean;
    summary: string | null;
  };
  quality: {
    complete: boolean;
    reviewed: boolean;
    stale: boolean;
    blocked_reasons: string[];
  };
  last_substantive_update_at: string | null;
  next_review_due_at: string | null;
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

function normalizeBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeSourceTrace(value: unknown): CareerTrustSourceTraceItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map((item) => ({
      ref: normalizeString(item.ref) ?? "unspecified_source_ref",
      source: normalizeString(item.source) ?? "unspecified_source",
      url: normalizeString(item.url),
      last_reviewed_at: normalizeString(item.last_reviewed_at),
    }));
}

export function normalizeCareerTrustManifest(value: unknown): CareerTrustManifest | null {
  if (!isRecord(value)) {
    return null;
  }

  const localeContext = isRecord(value.locale_context) ? value.locale_context : {};
  const methodology = isRecord(value.methodology) ? value.methodology : {};
  const reviewer = isRecord(value.reviewer) ? value.reviewer : {};
  const legacyReviewerStatus = normalizeString(reviewer.reviewer_status ?? value.reviewer_status);
  const aiAssistance = isRecord(value.ai_assistance) ? value.ai_assistance : {};
  const quality = isRecord(value.quality) ? value.quality : {};
  const publicReview = normalizePublicReview(isRecord(value.public_review) ? value.public_review : value);

  return {
    manifest_version: normalizeString(value.manifest_version) ?? "trust_manifest.v1",
    entity_id: normalizeString(value.entity_id) ?? "",
    page_type: normalizeString(value.page_type) ?? "",
    page_slug: normalizeString(value.page_slug) ?? "",
    content_version: normalizeString(value.content_version) ?? "unknown",
    data_version: normalizeString(value.data_version) ?? "unknown",
    logic_version: normalizeString(value.logic_version) ?? "unknown",
    locale_context: {
      truth_market: normalizeString(localeContext.truth_market),
      display_market: normalizeString(localeContext.display_market),
      locale: normalizeString(localeContext.locale),
    },
    source_trace: normalizeSourceTrace(value.source_trace),
    methodology: {
      crosswalk_mode: normalizeString(methodology.crosswalk_mode),
      derivation_policy: normalizeString(methodology.derivation_policy),
      notes: normalizeStringArray(methodology.notes),
    },
    publicReview,
    legacyReview: {
      reviewed:
        normalizeBoolean(reviewer.reviewed) ||
        legacyReviewerStatus === "reviewed" ||
        legacyReviewerStatus === "approved",
      reviewerStatus: legacyReviewerStatus,
    },
    ai_assistance: {
      used: normalizeBoolean(aiAssistance.used),
      summary: normalizeString(aiAssistance.summary),
    },
    quality: {
      complete: normalizeBoolean(quality.complete),
      reviewed: normalizeBoolean(quality.reviewed),
      stale: normalizeBoolean(quality.stale),
      blocked_reasons: normalizeStringArray(quality.blocked_reasons),
    },
    last_substantive_update_at: normalizeString(value.last_substantive_update_at),
    next_review_due_at: normalizeString(value.next_review_due_at),
  };
}

export function isCareerTrustManifest(value: unknown): value is CareerTrustManifest {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.manifest_version === "string" &&
    typeof value.entity_id === "string" &&
    typeof value.page_type === "string" &&
    typeof value.page_slug === "string" &&
    typeof value.content_version === "string" &&
    typeof value.data_version === "string" &&
    typeof value.logic_version === "string" &&
    isRecord(value.locale_context) &&
    Array.isArray(value.source_trace) &&
    isRecord(value.methodology) &&
    isRecord(value.publicReview) &&
    isRecord(value.legacyReview) &&
    isRecord(value.ai_assistance) &&
    isRecord(value.quality)
  );
}
