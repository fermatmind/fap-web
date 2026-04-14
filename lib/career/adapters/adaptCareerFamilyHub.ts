import type { CareerFamilyHubResponseRaw } from "@/lib/career/api/types";
import type {
  CareerFamilyHubAdapter,
  CareerFamilyHubVisibleChildAdapter,
  CareerSeoContractAdapter,
} from "@/lib/career/adapters/types";
import {
  buildCareerFamilyFrontendUrl,
  buildCareerJobFrontendUrl,
  normalizeCareerBundleCanonicalPath,
} from "@/lib/career/urls";
import { localizedPath } from "@/lib/i18n/locales";
import { canonicalUrl } from "@/lib/site";

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

function arrayFilterRecord(input: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== null && value !== undefined));
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

function buildStructuredData(
  raw: Record<string, unknown>,
  locale: "en" | "zh",
  canonicalSlug: string
): CareerFamilyHubAdapter["structuredData"] {
  const structuredData = isRecord(raw.structured_data) ? raw.structured_data : {};
  const collectionPage = isRecord(structuredData.collection_page) ? structuredData.collection_page : null;
  const itemList = isRecord(structuredData.item_list) ? structuredData.item_list : null;
  const breadcrumbList = isRecord(structuredData.breadcrumb_list) ? structuredData.breadcrumb_list : null;
  const fallbackFamilyPath = buildCareerFamilyFrontendUrl(locale, canonicalSlug);
  const collectionPageCanonicalPath = normalizeCareerBundleCanonicalPath(
    locale,
    normalizeString(collectionPage?.url) ?? normalizeString(collectionPage?.mainEntityOfPage),
    fallbackFamilyPath
  );

  const normalizedCollectionPage = collectionPage
    ? (arrayFilterRecord({
        "@context": normalizeString(collectionPage["@context"]),
        "@type": normalizeString(collectionPage["@type"]),
        name: normalizeString(collectionPage.name),
        url: normalizeStructuredDataUrl(locale, collectionPage.url, collectionPageCanonicalPath),
        mainEntityOfPage: normalizeStructuredDataUrl(
          locale,
          collectionPage.mainEntityOfPage,
          collectionPageCanonicalPath
        ),
        numberOfItems: normalizeNumber(collectionPage.numberOfItems),
      }) as Record<string, unknown>)
    : null;

  const normalizedItemListElements = Array.isArray(itemList?.itemListElement)
    ? itemList.itemListElement
        .filter(isRecord)
        .map((item) =>
          arrayFilterRecord({
            "@type": normalizeString(item["@type"]),
            position: normalizeNumber(item.position),
            name: normalizeString(item.name),
            url: normalizeStructuredDataUrl(locale, item.url),
          })
        )
        .filter((item) => typeof item.name === "string" && typeof item.url === "string")
    : [];

  const normalizedItemList = itemList
    ? (arrayFilterRecord({
        "@context": normalizeString(itemList["@context"]),
        "@type": normalizeString(itemList["@type"]),
        numberOfItems: normalizeNumber(itemList.numberOfItems),
        itemListElement: normalizedItemListElements,
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
    collectionPage:
      normalizedCollectionPage && typeof normalizedCollectionPage["@type"] === "string"
        ? normalizedCollectionPage
        : null,
    itemList: normalizedItemList && typeof normalizedItemList["@type"] === "string" ? normalizedItemList : null,
    breadcrumbList:
      normalizedBreadcrumbList && typeof normalizedBreadcrumbList["@type"] === "string"
        ? normalizedBreadcrumbList
        : null,
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
  const structuredData = buildStructuredData(raw, input.locale, canonicalSlug);

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
    structuredData,
  };
}
