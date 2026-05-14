import type { Locale } from "@/lib/i18n/locales";
import type { TrackingAttributionPayload } from "@/lib/tracking/attribution";

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

function normalizeToken(value: unknown, fallback: string): string {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 96);

  return normalized || fallback;
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
