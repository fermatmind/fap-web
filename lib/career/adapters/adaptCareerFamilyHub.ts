import type { CareerFamilyHubResponseRaw } from "@/lib/career/api/types";
import type {
  CareerFamilyHubAdapter,
  CareerFamilyHubVisibleChildAdapter,
  CareerSeoContractAdapter,
} from "@/lib/career/adapters/types";
import { buildCareerJobFrontendUrl, normalizeCareerBundleCanonicalPath } from "@/lib/career/urls";

type AdaptCareerFamilyHubInput = {
  locale: "en" | "zh";
  payload: CareerFamilyHubResponseRaw | null;
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

function normalizeNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
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

function adaptVisibleChild(
  raw: Record<string, unknown>,
  locale: "en" | "zh"
): CareerFamilyHubVisibleChildAdapter | null {
  const canonicalSlug = normalizeString(raw.canonical_slug);
  if (!canonicalSlug) {
    return null;
  }

  const canonicalTitleEn = normalizeString(raw.canonical_title_en);
  const canonicalTitleZh = normalizeString(raw.canonical_title_zh);
  const seoContract = buildSeoContract(raw);
  const trustSummary = isRecord(raw.trust_summary) ? raw.trust_summary : {};

  return {
    occupationUuid: normalizeString(raw.occupation_uuid),
    canonicalSlug,
    canonicalTitleEn,
    canonicalTitleZh,
    title:
      locale === "zh"
        ? canonicalTitleZh ?? canonicalTitleEn ?? humanizeSlug(canonicalSlug)
        : canonicalTitleEn ?? canonicalTitleZh ?? humanizeSlug(canonicalSlug),
    href: normalizeCareerBundleCanonicalPath(
      locale,
      seoContract.canonicalPath,
      buildCareerJobFrontendUrl(locale, canonicalSlug)
    ),
    seoContract,
    trustSummary: {
      reviewerStatus: normalizeString(trustSummary.reviewer_status),
    },
  };
}

export function adaptCareerFamilyHub(input: AdaptCareerFamilyHubInput): CareerFamilyHubAdapter | null {
  const raw = unwrapPayload(input.payload);
  if (!raw) {
    return null;
  }

  const family = isRecord(raw.family) ? raw.family : {};
  const counts = isRecord(raw.counts) ? raw.counts : {};
  const canonicalSlug = normalizeString(family.canonical_slug);
  if (!canonicalSlug) {
    return null;
  }

  const titleEn = normalizeString(family.title_en);
  const titleZh = normalizeString(family.title_zh);
  const visibleChildren = Array.isArray(raw.visible_children)
    ? raw.visible_children.filter(isRecord).map((item) => adaptVisibleChild(item, input.locale)).filter(Boolean)
    : [];

  return {
    authoritySource: "career_backend_family_hub.v0.5",
    family: {
      familyUuid: normalizeString(family.family_uuid),
      canonicalSlug,
      titleEn,
      titleZh,
      title:
        input.locale === "zh"
          ? titleZh ?? titleEn ?? humanizeSlug(canonicalSlug)
          : titleEn ?? titleZh ?? humanizeSlug(canonicalSlug),
    },
    visibleChildren: visibleChildren as CareerFamilyHubVisibleChildAdapter[],
    counts: {
      visibleChildrenCount: normalizeNumber(counts.visible_children_count),
      publishReadyCount: normalizeNumber(counts.publish_ready_count),
      blockedOverrideEligibleCount: normalizeNumber(counts.blocked_override_eligible_count),
      blockedNotSafelyRemediableCount: normalizeNumber(counts.blocked_not_safely_remediable_count),
      blockedTotal: normalizeNumber(counts.blocked_total),
    },
  };
}
