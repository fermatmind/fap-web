"use client";

import type { ComponentProps } from "react";
import { useEffect, useMemo, useState, type MouseEventHandler } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { TrackedEntryCtaLink } from "@/components/analytics/TrackedEntryCtaLink";
import {
  appendAttributionParamsToHref,
  buildTrackingAttributionPayload,
  extractAttributionParamsFromRecord,
  captureAttributionFromLocation,
  extractAttributionParamsFromSearchParams,
  readStoredTrackingAttributionPayload,
  type TrackingAttributionPayload,
} from "@/lib/tracking/attribution";
import {
  buildSeoCtaNavigationHref,
  buildSeoCtaTrackingPayload,
  type SeoCtaAttributionInput,
} from "@/lib/tracking/seoCtaAttribution";

type SeoTrackedCtaLinkProps = Omit<ComponentProps<typeof Link>, "href"> &
  SeoCtaAttributionInput & {
    href: string;
  };

export function SeoTrackedCtaLink({
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
  onClick,
  ...props
}: SeoTrackedCtaLinkProps) {
  const pathname = usePathname() ?? sourcePath;
  const searchParams = useSearchParams();
  const routerSearch = searchParams.toString();
  const [browserSearch, setBrowserSearch] = useState("");
  const search = routerSearch || browserSearch;
  const [storedAttributionPayload, setStoredAttributionPayload] = useState<TrackingAttributionPayload>({});

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setBrowserSearch(window.location.search.replace(/^\?/, ""));
  }, [pathname, routerSearch]);

  const searchAttributionParams = useMemo(
    () => extractAttributionParamsFromSearchParams(new URLSearchParams(search)),
    [search]
  );
  useEffect(() => {
    setStoredAttributionPayload(
      readStoredTrackingAttributionPayload(`${pathname}${search ? `?${search}` : ""}`)
    );
  }, [pathname, search]);
  const storedAttributionParams = useMemo(
    () => extractAttributionParamsFromRecord(storedAttributionPayload),
    [storedAttributionPayload]
  );
  const attributionParams = useMemo(
    () => ({
      ...storedAttributionParams,
      ...searchAttributionParams,
    }),
    [searchAttributionParams, storedAttributionParams]
  );
  const sourcePathWithAttribution = useMemo(
    () => appendAttributionParamsToHref(sourcePath, attributionParams),
    [attributionParams, sourcePath]
  );
  const currentPathWithAttribution = useMemo(
    () => appendAttributionParamsToHref(pathname, attributionParams),
    [attributionParams, pathname]
  );
  const resolvedHref = useMemo(
    () => buildSeoCtaNavigationHref({
      locale,
      sourceRouteFamily,
      sourceSlug,
      contentId,
      topicId,
      sourcePath: sourcePathWithAttribution,
      href,
      ctaId,
      targetAction,
      targetTestSlug,
      attributionParams,
    }),
    [
      attributionParams,
      contentId,
      ctaId,
      href,
      locale,
      sourcePathWithAttribution,
      sourceRouteFamily,
      sourceSlug,
      targetAction,
      targetTestSlug,
      topicId,
    ]
  );
  const liveAttributionPayload = useMemo(
    () => ({
      ...attributionPayload,
      ...buildTrackingAttributionPayload(attributionParams, {
        landingPath: sourcePathWithAttribution,
        currentPath: currentPathWithAttribution,
      }),
    }),
    [attributionParams, attributionPayload, currentPathWithAttribution, sourcePathWithAttribution]
  );
  const eventProperties = buildSeoCtaTrackingPayload({
    locale,
    sourceRouteFamily,
    sourceSlug,
    contentId,
    topicId,
    sourcePath: sourcePathWithAttribution,
    href: resolvedHref,
    ctaId,
    targetAction,
    targetTestSlug,
    formCode,
    scaleCode,
    attributionPayload: liveAttributionPayload,
  });
  const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    const safeSearchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(attributionParams)) {
      if (value) {
        safeSearchParams.set(key, value);
      }
    }
    const safeSearch = safeSearchParams.toString();
    captureAttributionFromLocation({
      pathname,
      search: safeSearch ? `?${safeSearch}` : "",
      referrer: typeof document !== "undefined" ? document.referrer : undefined,
    });
    onClick?.(event);
  };

  return (
    <TrackedEntryCtaLink
      {...props}
      href={resolvedHref}
      eventName="start_attempt"
      eventProperties={eventProperties}
      onClick={handleClick}
    />
  );
}
