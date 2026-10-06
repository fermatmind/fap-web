"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";
import type { Locale } from "@/lib/i18n/locales";
import {
  appendAttributionParamsToHref,
  buildTrackingAttributionPayload,
  extractAttributionParamsFromRecord,
  extractAttributionParamsFromSearchParams,
  readStoredTrackingAttributionPayload,
} from "@/lib/tracking/attribution";
import {
  buildSeoCtaNavigationHref,
  buildSeoCtaTrackingPayload,
  extractTargetTestSlugFromHref,
  extractPublicReadingPathFromHref,
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
    if (parsed.protocol !== "https:" || !FERMATMIND_ALLOWED_HOSTS.has(parsed.hostname.toLowerCase())
      || parsed.port || parsed.username || parsed.password) {
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

function resolveTrackableCmsHref(anchor: HTMLAnchorElement, locale: Locale): SafeCmsHref | null {
  const originalHref = normalizeSafeCmsHref(anchor.dataset.seoOriginalHref);
  const safeHref = originalHref ?? normalizeSafeCmsHref(anchor.getAttribute("href"));
  if (!safeHref) {
    return null;
  }

  const segments = safeHref.pathname.split("/").filter(Boolean);
  const testsIndex = segments.indexOf("tests");
  const testSlug = extractTargetTestSlugFromHref(safeHref.pathname);
  const publicTest = testSlug && segments[0] === locale && testsIndex === 1 && segments.length === 3;
  if (!publicTest && !extractPublicReadingPathFromHref(safeHref.href, locale)) {
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

    const hydrate = () => {
      for (const anchor of Array.from(root.querySelectorAll<HTMLAnchorElement>("a[href]"))) {
        const originalHref = resolveTrackableCmsHref(anchor, locale);
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
            ctaId: `cms_content_${targetTestSlug ?? "reading_link"}`,
            ...(!targetTestSlug ? { targetAction: "read_related_content" } : {}),
            targetTestSlug,
            attributionParams,
          })
        );
      }
    };
    hydrate();
    // Curated edges can arrive after Suspense streams the article shell.
    const observer = new MutationObserver(hydrate);
    observer.observe(root, { childList: true, subtree: true });
    const onClick = (event: MouseEvent) => {
      if (sourceRouteFamily !== "article_detail" || !(event.target instanceof Element)) return;
      const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || !root.contains(anchor)) return;
      const safeHref = resolveTrackableCmsHref(anchor, locale);
      const targetTestSlug = safeHref ? extractTargetTestSlugFromHref(safeHref.pathname) : null;
      if (!safeHref || !targetTestSlug) return;
      trackEvent("article_to_test_click", buildSeoCtaTrackingPayload({
        locale, sourceRouteFamily, sourceSlug, sourcePath: appendAttributionParamsToHref(sourcePath, attributionParams), contentId,
        href: safeHref.pathname, targetTestSlug, ctaId: `cms_content_${targetTestSlug}`,
        attributionPayload: buildTrackingAttributionPayload(attributionParams, { landingPath: sourcePath, currentPath }),
      }));
    };
    root.addEventListener("click", onClick);
    return () => {
      observer.disconnect();
      root.removeEventListener("click", onClick);
    };
  }, [contentId, locale, sourcePath, sourceRouteFamily, sourceSlug]);

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  );
}
