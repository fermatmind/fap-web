"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackEvent, type AnalyticsProperties } from "@/lib/analytics";
import { hasAnalyticsConsent } from "@/lib/consent/store";

export function useAnalyticsPageView(
  eventName: string,
  properties: AnalyticsProperties = {},
  enabled = true,
  trackingKey?: string
): void {
  const pathname = usePathname();
  const propertiesRef = useRef<AnalyticsProperties>(properties);
  const trackedKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    propertiesRef.current = properties;
  }, [properties]);

  useEffect(() => {
    if (!enabled || !eventName) return;

    const pageViewKey = `${eventName}:${trackingKey ?? pathname}`;
    const trackPageViewOnce = () => {
      if (!hasAnalyticsConsent()) return;
      if (trackedKeysRef.current.has(pageViewKey)) return;
      trackedKeysRef.current.add(pageViewKey);
      trackEvent(eventName, propertiesRef.current);
    };

    const handleConsentUpdated = (event: Event) => {
      const detail = event instanceof CustomEvent ? event.detail : undefined;
      if (detail?.analytics === "granted") {
        trackPageViewOnce();
      }
    };

    trackPageViewOnce();
    window.addEventListener("fm:analytics-consent-updated", handleConsentUpdated);

    return () => {
      window.removeEventListener("fm:analytics-consent-updated", handleConsentUpdated);
    };
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
