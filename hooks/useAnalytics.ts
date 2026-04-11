"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackEvent, type AnalyticsProperties } from "@/lib/analytics";

export function useAnalyticsPageView(
  eventName: string,
  properties: AnalyticsProperties = {},
  enabled = true,
  trackingKey?: string
): void {
  const pathname = usePathname();
  const propertiesRef = useRef<AnalyticsProperties>(properties);

  useEffect(() => {
    propertiesRef.current = properties;
  }, [properties]);

  useEffect(() => {
    if (!enabled || !eventName) return;
    trackEvent(eventName, propertiesRef.current);
  }, [enabled, eventName, pathname, trackingKey]);
}

export function AnalyticsPageViewTracker({
  eventName,
  properties,
  enabled = true,
  trackingKey,
}: {
  eventName: string;
  properties?: AnalyticsProperties;
  enabled?: boolean;
  trackingKey?: string;
}) {
  useAnalyticsPageView(eventName, properties, enabled, trackingKey);
  return null;
}
