"use client";

import Link from "next/link";
import type { ComponentProps, MouseEventHandler } from "react";
import { trackEvent, type AnalyticsProperties } from "@/lib/analytics";

type TrackedEntryCtaLinkProps = ComponentProps<typeof Link> & {
  eventName?: string;
  eventProperties: AnalyticsProperties;
};

export function TrackedEntryCtaLink({
  eventName = "start_click",
  eventProperties,
  onClick,
  ...props
}: TrackedEntryCtaLinkProps) {
  const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    trackEvent(eventName, eventProperties);
    onClick?.(event);
  };

  return <Link {...props} onClick={handleClick} />;
}
