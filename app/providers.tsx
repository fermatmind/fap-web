"use client";

import { useEffect, type ReactNode } from "react";
import { initAnalytics } from "@/lib/analytics";
import { initSentry } from "@/lib/observability/sentry";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    initSentry();
    initAnalytics();
  }, []);

  return <>{children}</>;
}
