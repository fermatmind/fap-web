"use client";

import { useEffect, type ReactNode } from "react";
import { initAnalytics } from "@/lib/analytics";
import { initSentry } from "@/lib/observability/sentry";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    initSentry();
    initAnalytics();

    const handleAnalyticsConsentUpdated = (event: Event) => {
      const detail = event instanceof CustomEvent ? event.detail : undefined;
      if (detail?.analytics === "granted") {
        initAnalytics();
      }
    };

    window.addEventListener("fm:analytics-consent-updated", handleAnalyticsConsentUpdated);
    return () => {
      window.removeEventListener("fm:analytics-consent-updated", handleAnalyticsConsentUpdated);
    };
  }, []);

  return <>{children}</>;
}
