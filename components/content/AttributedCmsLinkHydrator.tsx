"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
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

type AttributedCmsLinkHydratorProps = {
  children: ReactNode;
  className?: string;
  locale: Locale;
  sourceRouteFamily: SeoCtaSourceRouteFamily;
  sourceSlug: string;
  sourcePath: string;
  contentId?: string | number | null;
};

const FERMATMIND_ORIGIN = "https://fermatmind.com";
const FERMATMIND_ALLOWED_HOSTS = new Set(["fermatmind.com", "www.fermatmind.com"]);

type SafeCmsHref = {
  href: string;
  pathname: string;
};

function normalizeSafeCmsHref(href: string | null | undefined): SafeCmsHref | null {
  const candidate = String(href ?? "").trim();
  if (!candidate) {
    return null;
  }

  try {
    const parsed = new URL(candidate, FERMATMIND_ORIGIN);
    if (parsed.protocol !== "https:" || !FERMATMIND_ALLOWED_HOSTS.has(parsed.hostname.toLowerCase())) {
      return null;
    }

    return {
      href: candidate,
      pathname: parsed.pathname,
    };
  } catch {
    return null;
  }
}

function resolveTrackableCmsHref(anchor: HTMLAnchorElement): SafeCmsHref | null {
  const originalHref = normalizeSafeCmsHref(anchor.dataset.seoOriginalHref);
  const safeHref = originalHref ?? normalizeSafeCmsHref(anchor.getAttribute("href"));
  if (!safeHref) {
    return null;
  }

  const segments = safeHref.pathname.split("/").filter(Boolean);
  const testsIndex = segments.indexOf("tests");
  const testSlug = extractTargetTestSlugFromHref(safeHref.pathname);
  const childSegment = testsIndex >= 0 ? segments[testsIndex + 2] : undefined;
  if (!testSlug || ["take", "result", "orders", "share", "pay"].includes(childSegment ?? "")) {
    return null;
  }

  return safeHref;
}

export function AttributedCmsLinkHydrator({
  children,
  className,
  locale,
  sourceRouteFamily,
  sourceSlug,
  sourcePath,
  contentId,
}: AttributedCmsLinkHydratorProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

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
      const originalHref = resolveTrackableCmsHref(anchor);
      if (!originalHref) {
        continue;
      }

      const targetTestSlug = extractTargetTestSlugFromHref(originalHref.pathname);
      anchor.dataset.seoOriginalHref = originalHref.href;
      anchor.dataset.seoCtaAttributed = "true";
      anchor.setAttribute(
        "href",
        buildSeoCtaNavigationHref({
          locale,
          sourceRouteFamily,
          sourceSlug,
          sourcePath,
          contentId,
          href: originalHref.href,
          ctaId: `cms_content_${targetTestSlug ?? "test_cta"}`,
          targetTestSlug,
          attributionParams,
        })
      );
    }
  }, [contentId, locale, sourcePath, sourceRouteFamily, sourceSlug]);

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  );
}
