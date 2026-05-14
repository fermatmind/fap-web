"use client";

import type { ComponentProps } from "react";
import Link from "next/link";
import { TrackedEntryCtaLink } from "@/components/analytics/TrackedEntryCtaLink";
import {
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
  ...props
}: SeoTrackedCtaLinkProps) {
  const eventProperties = buildSeoCtaTrackingPayload({
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
  });

  return (
    <TrackedEntryCtaLink
      {...props}
      href={href}
      eventName="start_attempt"
      eventProperties={eventProperties}
    />
  );
}
