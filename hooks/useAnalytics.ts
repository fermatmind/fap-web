"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackEvent, type AnalyticsProperties } from "@/lib/analytics";

export function useAnalyticsPageView(
  eventName: string,
  properties: AnalyticsProperties = {},
  enabled = true
): void {
  const pathname = usePathname();
  const propertiesRef = useRef<AnalyticsProperties>(properties);

  useEffect(() => {
    propertiesRef.current = properties;
  }, [properties]);

  useEffect(() => {
    if (!enabled || !eventName) return;
    trackEvent(eventName, propertiesRef.current);
  }, [enabled, eventName, pathname]);
}

export function AnalyticsPageViewTracker({
  eventName,
  properties,
  enabled = true,
}: {
  eventName: string;
  properties?: AnalyticsProperties;
  enabled?: boolean;
}) {
  useAnalyticsPageView(eventName, properties, enabled);
  return null;
}
