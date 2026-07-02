import type { LandingSurfaceRaw } from "@/lib/api/v0_3";
import {
  deriveSeoCtaPriorityFromKey,
  normalizeSeoCtaPriority,
  type SeoCtaPriority,
} from "@/lib/tracking/seoCtaAttribution";
import { normalizeInternalHref } from "@/lib/url/safeContentUrls";

export type LandingSummaryBlockViewModel = {
  key: string;
  title: string;
  body: string;
  kind: string | null;
};

export type LandingCtaViewModel = {
  key: string;
  label: string;
  href: string;
  kind: string | null;
  priority?: SeoCtaPriority;
};

export type LandingDiscoverabilityItemViewModel = {
  key: string;
  title: string;
  summary: string;
  href: string;
  kind: string | null;
  badgeLabel: string | null;
};

export type LandingSurfaceViewModel = {
  version: string;
  landingContractVersion: string;
  landingFingerprint: string;
  landingScope: string;
  entrySurface: string;
  entryType: string;
  summaryBlocks: LandingSummaryBlockViewModel[];
  discoverabilityItems: LandingDiscoverabilityItemViewModel[];
  discoverabilityKeys: string[];
  continueReadingKeys: string[];
  startTestTarget: string | null;
  resultResumeTarget: string | null;
  contentContinueTarget: string | null;
  ctaBundle: LandingCtaViewModel[];
  indexabilityState: string;
  attributionScope: string;
  seoSurfaceRef: string | null;
  publicSurfaceRef: string | null;
  surfaceFamily: string | null;
  primaryContentRef: string | null;
  relatedSurfaceKeys: string[];
  shareSafetyState: string | null;
  runtimeArtifactRef: string | null;
};

function normalizeText(value: unknown): string {
  if (typeof value !== "string" && typeof value !== "number") {
    return "";
  }

  return String(value).trim();
}

function normalizeNullableText(value: unknown): string | null {
  const normalized = normalizeText(value);
  return normalized || null;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.map((item) => normalizeText(item)).filter(Boolean))];
}

function readAllowedField(record: unknown, allowedFields: ReadonlySet<string>, key: string): unknown {
  if (!record || typeof record !== "object" || Array.isArray(record) || !allowedFields.has(key)) {
    return null;
  }

  return (record as Record<string, unknown>)[key];
}

const LANDING_SUMMARY_BLOCK_FIELDS = new Set(["key", "title", "body", "kind"]);
const LANDING_CTA_FIELDS = new Set(["key", "label", "href", "kind", "priority", "cta_priority"]);
const LANDING_DISCOVERABILITY_ITEM_FIELDS = new Set(["key", "title", "summary", "body", "href", "url", "kind", "badge_label", "badge"]);

export function normalizeLandingSurface(raw: LandingSurfaceRaw | null | undefined): LandingSurfaceViewModel | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const summaryBlocks = Array.isArray(raw.summary_blocks)
    ? raw.summary_blocks
        .map((item) => {
          const record = item && typeof item === "object" && !Array.isArray(item) ? item : {};
          const key = normalizeText(readAllowedField(record, LANDING_SUMMARY_BLOCK_FIELDS, "key"));
          const title = normalizeText(readAllowedField(record, LANDING_SUMMARY_BLOCK_FIELDS, "title"));
          const body = normalizeText(readAllowedField(record, LANDING_SUMMARY_BLOCK_FIELDS, "body"));
          const kind = normalizeNullableText(readAllowedField(record, LANDING_SUMMARY_BLOCK_FIELDS, "kind"));

          if (!key && !title && !body) {
            return null;
          }

          return {
            key: key || title || body,
            title,
            body,
            kind,
          };
        })
        .filter((item): item is LandingSummaryBlockViewModel => item !== null)
    : [];

  const ctaBundle = Array.isArray(raw.cta_bundle)
    ? raw.cta_bundle
        .map((item, index) => {
          const record = item && typeof item === "object" && !Array.isArray(item) ? item : {};
          const label = normalizeText(readAllowedField(record, LANDING_CTA_FIELDS, "label"));
          const href = normalizeInternalHref(readAllowedField(record, LANDING_CTA_FIELDS, "href"));
          if (!label || !href) {
            return null;
          }
          const key = normalizeText(readAllowedField(record, LANDING_CTA_FIELDS, "key")) || href;

          return {
            key,
            label,
            href,
            kind: normalizeNullableText(readAllowedField(record, LANDING_CTA_FIELDS, "kind")),
            priority: normalizeSeoCtaPriority(
              readAllowedField(record, LANDING_CTA_FIELDS, "priority") ?? readAllowedField(record, LANDING_CTA_FIELDS, "cta_priority"),
              deriveSeoCtaPriorityFromKey(key, index)
            ),
          };
        })
        .filter((item): item is Exclude<typeof item, null> => item !== null)
    : [];

  const discoverabilityItems = Array.isArray(raw.discoverability_items)
    ? raw.discoverability_items
        .map((item) => {
          const record = item && typeof item === "object" && !Array.isArray(item) ? item : {};
          const title = normalizeText(readAllowedField(record, LANDING_DISCOVERABILITY_ITEM_FIELDS, "title"));
          const href = normalizeInternalHref(
            readAllowedField(record, LANDING_DISCOVERABILITY_ITEM_FIELDS, "href") ??
              readAllowedField(record, LANDING_DISCOVERABILITY_ITEM_FIELDS, "url")
          );
          if (!title || !href) {
            return null;
          }

          return {
            key: normalizeText(readAllowedField(record, LANDING_DISCOVERABILITY_ITEM_FIELDS, "key")) || href,
            title,
            summary: normalizeText(
              readAllowedField(record, LANDING_DISCOVERABILITY_ITEM_FIELDS, "summary") ??
                readAllowedField(record, LANDING_DISCOVERABILITY_ITEM_FIELDS, "body")
            ),
            href,
            kind: normalizeNullableText(readAllowedField(record, LANDING_DISCOVERABILITY_ITEM_FIELDS, "kind")),
            badgeLabel: normalizeNullableText(
              readAllowedField(record, LANDING_DISCOVERABILITY_ITEM_FIELDS, "badge_label") ??
                readAllowedField(record, LANDING_DISCOVERABILITY_ITEM_FIELDS, "badge")
            ),
          };
        })
        .filter((item): item is LandingDiscoverabilityItemViewModel => item !== null)
    : [];

  if (
    !summaryBlocks.length &&
    !discoverabilityItems.length &&
    !ctaBundle.length &&
    !normalizeText(raw.entry_surface) &&
    !normalizeText(raw.entry_type)
  ) {
    return null;
  }

  return {
    version: normalizeText(raw.version || raw.landing_contract_version || "landing.surface.v1"),
    landingContractVersion: normalizeText(raw.landing_contract_version || raw.version || "landing.surface.v1"),
    landingFingerprint: normalizeText(raw.landing_fingerprint),
    landingScope: normalizeText(raw.landing_scope),
    entrySurface: normalizeText(raw.entry_surface),
    entryType: normalizeText(raw.entry_type),
    summaryBlocks,
    discoverabilityItems,
    discoverabilityKeys: normalizeStringArray(raw.discoverability_keys),
    continueReadingKeys: normalizeStringArray(raw.continue_reading_keys),
    startTestTarget: normalizeNullableText(raw.start_test_target),
    resultResumeTarget: normalizeNullableText(raw.result_resume_target),
    contentContinueTarget: normalizeNullableText(raw.content_continue_target),
    ctaBundle,
    indexabilityState: normalizeText(raw.indexability_state),
    attributionScope: normalizeText(raw.attribution_scope),
    seoSurfaceRef: normalizeNullableText(raw.seo_surface_ref),
    publicSurfaceRef: normalizeNullableText(raw.public_surface_ref),
    surfaceFamily: normalizeNullableText(raw.surface_family),
    primaryContentRef: normalizeNullableText(raw.primary_content_ref),
    relatedSurfaceKeys: normalizeStringArray(raw.related_surface_keys),
    shareSafetyState: normalizeNullableText(raw.share_safety_state),
    runtimeArtifactRef: normalizeNullableText(raw.runtime_artifact_ref),
  };
}

export function findLandingCta(
  surface: LandingSurfaceViewModel | null | undefined,
  key: string
): LandingCtaViewModel | null {
  if (!surface) {
    return null;
  }

  return surface.ctaBundle.find((item) => item.key === key) ?? null;
}
