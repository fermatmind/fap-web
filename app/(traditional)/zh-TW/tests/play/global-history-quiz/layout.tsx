import type { ReactNode } from "react";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";

export default function GlobalHistoryTraditionalLayout({ children }: { children: ReactNode }) {
  return <>
    <AnalyticsPageViewTracker eventName="landing_pv" />
    {children}
  </>;
}
