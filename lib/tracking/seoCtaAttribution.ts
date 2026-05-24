import type { Locale } from "@/lib/i18n/locales";
import {
  appendAttributionParamsToHref,
  buildTrackingAttributionPayload,
  extractAttributionParamsFromSearchParams,
  toAttemptAttributionPayload,
  type AttributionParams,
  type TrackingAttributionPayload,
} from "@/lib/tracking/attribution";
import { sanitizeTrackingUrl } from "@/lib/tracking/privacy";

export const SEO_CTA_DEFERRED_ATTRIBUTION_FIELDS = [
  {
    field: "source_route_family",
    reason: "Use source_page_type until backend attribution ingest explicitly owns this field.",
  },
  {
    field: "source_slug",
    reason: "Use landing_path/current_path until backend attribution ingest explicitly owns source slugs.",
  },
  {
    field: "content_id",
    reason: "CMS numeric identifiers are not yet part of the backend attribution ingest contract.",
  },
  {
    field: "topic_id",
    reason: "CMS numeric identifiers are not yet part of the backend attribution ingest contract.",
  },
  {
    field: "target_test_slug",
    reason: "Use test_slug until backend attribution ingest explicitly owns target_test_slug.",
  },
  {
    field: "cta_id",
    reason: "Encode CTA identity in target_action until backend attribution ingest explicitly owns cta_id.",
  },
  {
    field: "campaign",
    reason: "Use UTM fields until backend attribution ingest explicitly owns a generic campaign field.",
  },
] as const;

export type SeoCtaSourceRouteFamily = "article_detail" | "topic_detail" | "test_detail";

export const SEO_CTA_CONTEXT_QUERY_KEYS = [
  "entry_surface",
  "source_page_type",
  "source_route_family",
  "source_slug",
  "content_id",
  "topic_id",
  "target_action",
  "test_slug",
  "target_test_slug",
  "cta_id",
  "landing_path",
  "entrypoint",
] as const;

export type SeoCtaContextQueryKey = (typeof SEO_CTA_CONTEXT_QUERY_KEYS)[number];
export type SeoCtaContextParams = Partial<Record<SeoCtaContextQueryKey, string>>;

export type SeoCtaAttributionInput = {
  locale: Locale;
  sourceRouteFamily: SeoCtaSourceRouteFamily;
  sourceSlug: string;
  contentId?: string | number | null;
  topicId?: string | number | null;
  sourcePath: string;
  href: string;
  ctaId: string;
  targetAction?: string;
  targetTestSlug?: string | null;
  formCode?: string | null;
  scaleCode?: string | null;
  attributionPayload?: TrackingAttributionPayload;
};

export type SeoAttemptStartAttribution = {
  meta: Record<string, string>;
  attribution: ReturnType<typeof toAttemptAttributionPayload>;
  trackingAttribution: TrackingAttributionPayload;
};

function normalizeToken(value: unknown, fallback: string): string {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 96);

  return normalized || fallback;
}

function normalizeOptionalToken(value: unknown, maxLength = 96): string | undefined {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._:-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, maxLength);

  return normalized || undefined;
}

function normalizeId(value: unknown): string | undefined {
  const normalized = String(value ?? "").trim().slice(0, 64);
  return /^[a-zA-Z0-9_-]+$/.test(normalized) ? normalized : undefined;
}

function normalizeRouteFamily(sourceRouteFamily: SeoCtaSourceRouteFamily): string {
  return sourceRouteFamily.replace(/_detail$/, "");
}

function normalizeContextValue(key: SeoCtaContextQueryKey, value: unknown): string | undefined {
  if (key === "landing_path") {
    return sanitizeSeoLandingPath(value);
  }

  if (key === "content_id" || key === "topic_id") {
    return normalizeId(value);
  }

  return normalizeOptionalToken(value);
}

function firstRecordValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function normalizeContextParams(params: SeoCtaContextParams): SeoCtaContextParams {
  return SEO_CTA_CONTEXT_QUERY_KEYS.reduce<SeoCtaContextParams>((acc, key) => {
    const normalized = normalizeContextValue(key, params[key]);
    if (normalized) {
      acc[key] = normalized;
    }
    return acc;
  }, {});
}

export function sanitizeSeoLandingPath(value: unknown): string | undefined {
  const sanitized = sanitizeTrackingUrl(value);
  if (!sanitized) {
    return undefined;
  }

  try {
    const parsed = new URL(sanitized, "https://tracking.local");
    const params = extractAttributionParamsFromSearchParams(parsed.searchParams);
    return appendAttributionParamsToHref(parsed.pathname || "/", params);
  } catch {
    return sanitized;
  }
}

function safeCurrentPathWithAttribution(value: string | null | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  return sanitizeSeoLandingPath(value);
}

export function extractTargetTestSlugFromHref(href: string): string | null {
  const pathname = String(href ?? "").split("?")[0] ?? "";
  const segments = pathname.split("/").filter(Boolean);
  const testsIndex = segments.indexOf("tests");
  if (testsIndex < 0) {
    return null;
  }

  const slug = segments[testsIndex + 1] ?? "";
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? slug : null;
}

export function extractSeoCtaContextParamsFromRecord(
  record: Record<string, string | string[] | undefined>
): SeoCtaContextParams {
  return SEO_CTA_CONTEXT_QUERY_KEYS.reduce<SeoCtaContextParams>((acc, key) => {
    const normalized = normalizeContextValue(key, firstRecordValue(record[key]));
    if (normalized) {
      acc[key] = normalized;
    }
    return acc;
  }, {});
}

export function extractSeoCtaContextParamsFromSearchParams(searchParams: URLSearchParams): SeoCtaContextParams {
  return SEO_CTA_CONTEXT_QUERY_KEYS.reduce<SeoCtaContextParams>((acc, key) => {
    const normalized = normalizeContextValue(key, searchParams.get(key));
    if (normalized) {
      acc[key] = normalized;
    }
    return acc;
  }, {});
}

export function appendSeoCtaContextParamsToHref(href: string, params: SeoCtaContextParams): string {
  const normalizedParams = normalizeContextParams(params);
  if (!Object.keys(normalizedParams).length) {
    return href;
  }

  const [pathname, rawQuery = ""] = href.split("?");
  const searchParams = new URLSearchParams(rawQuery);

  for (const key of SEO_CTA_CONTEXT_QUERY_KEYS) {
    const value = normalizedParams[key];
    if (value) {
      searchParams.set(key, value);
    }
  }

  const serialized = searchParams.toString();
  return serialized ? `${pathname}?${serialized}` : pathname;
}

export function buildSeoCtaContextParams({
  locale,
  sourceRouteFamily,
  sourceSlug,
  contentId,
  topicId,
  sourcePath,
  href,
  ctaId,
  targetAction,
  targetTestSlug,
  attributionParams = {},
}: Omit<SeoCtaAttributionInput, "attributionPayload" | "formCode" | "scaleCode"> & {
  attributionParams?: AttributionParams;
}): SeoCtaContextParams {
  void locale;

  const normalizedCtaId = normalizeToken(ctaId, "seo_cta");
  const normalizedTargetAction = normalizeToken(targetAction, `seo_cta_${normalizedCtaId}`);
  const resolvedTargetTestSlug = targetTestSlug || extractTargetTestSlugFromHref(href);
  const landingPath = appendAttributionParamsToHref(sourcePath, attributionParams);

  return normalizeContextParams({
    entry_surface: `${sourceRouteFamily}_seo_cta`,
    source_page_type: sourceRouteFamily,
    source_route_family: normalizeRouteFamily(sourceRouteFamily),
    source_slug: sourceSlug,
    ...(contentId !== null && contentId !== undefined ? { content_id: String(contentId) } : {}),
    ...(topicId !== null && topicId !== undefined ? { topic_id: String(topicId) } : {}),
    target_action: normalizedTargetAction,
    ...(resolvedTargetTestSlug ? { test_slug: resolvedTargetTestSlug, target_test_slug: resolvedTargetTestSlug } : {}),
    cta_id: normalizedCtaId,
    landing_path: landingPath,
    entrypoint: "seo_cta",
  });
}

export function buildSeoCtaNavigationHref({
  attributionParams = {},
  ...input
}: Omit<SeoCtaAttributionInput, "attributionPayload" | "formCode" | "scaleCode"> & {
  attributionParams?: AttributionParams;
}): string {
  const hrefWithAttribution = appendAttributionParamsToHref(input.href, attributionParams);
  return appendSeoCtaContextParamsToHref(
    hrefWithAttribution,
    buildSeoCtaContextParams({
      ...input,
      attributionParams,
    })
  );
}

export function buildSeoAttemptStartAttributionFromSearchParams({
  searchParams,
  currentPath,
  storedAttribution = {},
  fallbackTestSlug,
  fallbackSourcePageType,
  fallbackTargetAction,
}: {
  searchParams: URLSearchParams;
  currentPath?: string | null;
  storedAttribution?: TrackingAttributionPayload;
  fallbackTestSlug?: string | null;
  fallbackSourcePageType?: string | null;
  fallbackTargetAction?: string | null;
}): SeoAttemptStartAttribution {
  const attributionParams = extractAttributionParamsFromSearchParams(searchParams);
  const contextParams = extractSeoCtaContextParamsFromSearchParams(searchParams);
  const landingPath = contextParams.landing_path ?? storedAttribution.landing_path;
  const trackingAttribution = {
    ...storedAttribution,
    ...buildTrackingAttributionPayload(attributionParams, {
      referrer: storedAttribution.referrer,
      landingPath,
      currentPath: safeCurrentPathWithAttribution(currentPath),
    }),
  };
  const resolvedTestSlug = contextParams.test_slug ?? contextParams.target_test_slug ?? normalizeOptionalToken(fallbackTestSlug);
  const sourcePageType = contextParams.source_page_type ?? normalizeOptionalToken(fallbackSourcePageType);
  const targetAction = contextParams.target_action ?? normalizeOptionalToken(fallbackTargetAction);
  const meta = normalizeContextParams({
    ...contextParams,
    ...(resolvedTestSlug ? { test_slug: resolvedTestSlug, target_test_slug: contextParams.target_test_slug ?? resolvedTestSlug } : {}),
    ...(sourcePageType ? { source_page_type: sourcePageType } : {}),
    ...(targetAction ? { target_action: targetAction } : {}),
    ...(trackingAttribution.landing_path ? { landing_path: trackingAttribution.landing_path } : {}),
  }) as Record<string, string>;

  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "msclkid", "fbclid"] as const) {
    const value = trackingAttribution[key];
    if (value) {
      meta[key] = value;
    }
  }

  return {
    meta,
    attribution: toAttemptAttributionPayload(trackingAttribution),
    trackingAttribution,
  };
}

export function buildSeoCtaTrackingPayload({
  locale,
  sourceRouteFamily,
  sourceSlug,
  contentId,
  topicId,
  sourcePath,
  href,
  ctaId,
  targetAction,
  targetTestSlug,
  formCode,
  scaleCode,
  attributionPayload,
}: SeoCtaAttributionInput): Record<string, string> {
  void sourceSlug;
  void contentId;
  void topicId;

  const resolvedTargetTestSlug = targetTestSlug || extractTargetTestSlugFromHref(href);
  const normalizedCtaId = normalizeToken(ctaId, "seo_cta");
  const normalizedTargetAction = normalizeToken(targetAction, `seo_cta_${normalizedCtaId}`);
  const entrySurface = `${sourceRouteFamily}_seo_cta`;

  return {
    ...(attributionPayload ?? {}),
    ...(resolvedTargetTestSlug ? { slug: resolvedTargetTestSlug, test_slug: resolvedTargetTestSlug } : {}),
    ...(formCode ? { form_code: formCode } : {}),
    ...(scaleCode ? { scale_code: scaleCode } : {}),
    entry_surface: entrySurface,
    source_page_type: sourceRouteFamily,
    target_action: normalizedTargetAction,
    landing_path: sourcePath,
    current_path: sourcePath,
    locale,
  };
}
