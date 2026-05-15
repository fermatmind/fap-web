"use client";

import { useEffect, useMemo, useRef } from "react";
import { sanitizeCmsHtml } from "@/lib/cms/sanitizeCmsRichText";
import type { Locale } from "@/lib/i18n/locales";
import {
  extractAttributionParamsFromRecord,
  extractAttributionParamsFromSearchParams,
  readStoredTrackingAttributionPayload,
} from "@/lib/tracking/attribution";
import {
  buildSeoCtaNavigationHref,
  extractTargetTestSlugFromHref,
  type SeoCtaSourceRouteFamily,
} from "@/lib/tracking/seoCtaAttribution";

type AttributedSanitizedCmsHtmlProps = {
  className?: string;
  html: string;
  locale: Locale;
  sourceRouteFamily: SeoCtaSourceRouteFamily;
  sourceSlug: string;
  sourcePath: string;
  contentId?: string | number | null;
};

function pathFromHref(href: string): string {
  try {
    return new URL(href, "https://fermatmind.com").pathname;
  } catch {
    return href.split("?")[0] ?? "";
  }
}

function isTrackableTestDetailHref(href: string): boolean {
  const pathname = pathFromHref(href);
  const segments = pathname.split("/").filter(Boolean);
  const testsIndex = segments.indexOf("tests");
  const testSlug = extractTargetTestSlugFromHref(pathname);
  const childSegment = testsIndex >= 0 ? segments[testsIndex + 2] : undefined;

  return Boolean(testSlug) && !["take", "result", "orders", "share", "pay"].includes(childSegment ?? "");
}

export function AttributedSanitizedCmsHtml({
  className,
  html,
  locale,
  sourceRouteFamily,
  sourceSlug,
  sourcePath,
  contentId,
}: AttributedSanitizedCmsHtmlProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const sanitizedHtml = useMemo(() => sanitizeCmsHtml(html), [html]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof window === "undefined") {
      return;
    }

    const currentPath = `${window.location.pathname}${window.location.search}`;
    const searchAttributionParams = extractAttributionParamsFromSearchParams(
      new URLSearchParams(window.location.search)
    );
    const storedAttributionParams = extractAttributionParamsFromRecord(
      readStoredTrackingAttributionPayload(currentPath)
    );
    const attributionParams = {
      ...storedAttributionParams,
      ...searchAttributionParams,
    };

    for (const anchor of Array.from(root.querySelectorAll<HTMLAnchorElement>("a[href]"))) {
      const originalHref = anchor.dataset.seoOriginalHref || anchor.getAttribute("href") || "";
      if (!originalHref || !isTrackableTestDetailHref(originalHref)) {
        continue;
      }

      anchor.dataset.seoOriginalHref = originalHref;
      anchor.dataset.seoCtaAttributed = "true";
      anchor.setAttribute(
        "href",
        buildSeoCtaNavigationHref({
          locale,
          sourceRouteFamily,
          sourceSlug,
          sourcePath,
          contentId,
          href: originalHref,
          ctaId: `cms_html_${extractTargetTestSlugFromHref(originalHref) ?? "test_cta"}`,
          targetTestSlug: extractTargetTestSlugFromHref(originalHref),
          attributionParams,
        })
      );
    }
  }, [contentId, locale, sanitizedHtml, sourcePath, sourceRouteFamily, sourceSlug]);

  return <div ref={rootRef} className={className} dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
}
