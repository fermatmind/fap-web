import type { SeoSurfaceRaw } from "@/lib/api/v0_3";

export type SeoSurfaceViewModel = {
  version: string;
  metadataContractVersion: string;
  metadataFingerprint: string;
  metadataScope: string;
  surfaceType: string;
  canonicalUrl: string | null;
  robotsPolicy: string;
  title: string;
  description: string;
  og: {
    title: string;
    description: string;
    image: string | null;
    type: string | null;
    url: string | null;
  };
  twitter: {
    card: string | null;
    title: string;
    description: string;
    image: string | null;
  };
  alternates: Record<string, string>;
  structuredDataKeys: string[];
  indexabilityState: string;
  sitemapState: string;
  llmsExposureState: string;
  shareSafetyState: string | null;
  publicSummaryFingerprint: string | null;
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

function normalizeStringMap(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const normalized: Record<string, string> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    const text = normalizeText(item);
    if (!text) continue;
    normalized[key] = text;
  }

  return normalized;
}

export function normalizeSeoSurface(raw: SeoSurfaceRaw | null | undefined): SeoSurfaceViewModel | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const title = normalizeText(raw.title);
  const description = normalizeText(raw.description);
  const canonicalUrl = normalizeNullableText(raw.canonical_url);
  const alternates = normalizeStringMap(raw.alternates);
  const ogPayload = raw.og_payload && typeof raw.og_payload === "object" ? raw.og_payload : {};
  const twitterPayload = raw.twitter_payload && typeof raw.twitter_payload === "object" ? raw.twitter_payload : {};

  if (!title && !description && !canonicalUrl && !normalizeText(raw.robots_policy)) {
    return null;
  }

  return {
    version: normalizeText(raw.version || raw.metadata_contract_version || "seo.surface.v1"),
    metadataContractVersion: normalizeText(raw.metadata_contract_version || raw.version || "seo.surface.v1"),
    metadataFingerprint: normalizeText(raw.metadata_fingerprint),
    metadataScope: normalizeText(raw.metadata_scope),
    surfaceType: normalizeText(raw.surface_type),
    canonicalUrl,
    robotsPolicy: normalizeText(raw.robots_policy || "index,follow") || "index,follow",
    title,
    description,
    og: {
      title: normalizeText(ogPayload.title || raw.title),
      description: normalizeText(ogPayload.description || raw.description),
      image: normalizeNullableText(ogPayload.image),
      type: normalizeNullableText(ogPayload.type),
      url: normalizeNullableText(ogPayload.url || raw.canonical_url),
    },
    twitter: {
      card: normalizeNullableText(twitterPayload.card),
      title: normalizeText(twitterPayload.title || raw.title),
      description: normalizeText(twitterPayload.description || raw.description),
      image: normalizeNullableText(twitterPayload.image),
    },
    alternates,
    structuredDataKeys: Array.isArray(raw.structured_data_keys)
      ? raw.structured_data_keys.map((item) => normalizeText(item)).filter(Boolean)
      : [],
    indexabilityState: normalizeText(raw.indexability_state),
    sitemapState: normalizeText(raw.sitemap_state),
    llmsExposureState: normalizeText(raw.llms_exposure_state),
    shareSafetyState: normalizeNullableText(raw.share_safety_state),
    publicSummaryFingerprint: normalizeNullableText(raw.public_summary_fingerprint),
    runtimeArtifactRef: normalizeNullableText(raw.runtime_artifact_ref),
  };
}
