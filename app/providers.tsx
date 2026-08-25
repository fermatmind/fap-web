"use client";

import { useEffect, type ReactNode } from "react";
import { useReportWebVitals } from "next/web-vitals";
import { usePathname } from "next/navigation";
import { initAnalytics, trackReturnToPublicContentIfEligible } from "@/lib/analytics";
import { initSentry } from "@/lib/observability/sentry";
import {
  PUBLIC_CWV_RUM_ENABLED,
  reportPublicWebVital,
} from "@/lib/tracking/webVitals";

function PublicWebVitalsReporter() {
  useReportWebVitals(reportPublicWebVital);
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();

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

  useEffect(() => {
    trackReturnToPublicContentIfEligible(pathname);
  }, [pathname]);

  return (
    <>
      {children}
      {PUBLIC_CWV_RUM_ENABLED ? <PublicWebVitalsReporter /> : null}
    </>
  );
}
