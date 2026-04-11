"use client";

import Link from "next/link";
import type { ComponentProps, MouseEventHandler } from "react";
import { buildCareerAttributionPayload, type CareerAttributionPayloadInput } from "@/lib/career/attribution";
import { trackEvent } from "@/lib/analytics";
import type { CareerTrackingEventName } from "@/lib/tracking/events";

type TrackedCareerLinkProps = ComponentProps<typeof Link> & {
  eventName: CareerTrackingEventName;
  eventPayload: CareerAttributionPayloadInput;
};

export function TrackedCareerLink({
  eventName,
  eventPayload,
  onClick,
  prefetch = false,
  ...props
}: TrackedCareerLinkProps) {
  const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    trackEvent(eventName, buildCareerAttributionPayload(eventPayload));
    onClick?.(event);
  };

  return <Link {...props} prefetch={prefetch} onClick={handleClick} />;
}
