"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getConsent, setAnalyticsConsent, type AnalyticsConsent } from "@/lib/consent/store";

type BannerConsent = AnalyticsConsent;

export function CookieBanner() {
  const [consent, setConsent] = useState<BannerConsent>(() => getConsent().analytics);

  const updateConsent = (next: Extract<BannerConsent, "granted" | "denied">) => {
    setAnalyticsConsent(next);
    setConsent(next);
  };

  if (consent !== "unknown") return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 mx-auto w-[min(920px,calc(100%-2rem))] rounded-2xl border border-slate-300 bg-white p-4 shadow-lg">
      <p className="m-0 text-sm text-slate-700">
        We use cookies and analytics to improve service quality. You can accept
        or decline analytics tracking.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={() => updateConsent("granted")}>
          Accept
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => updateConsent("denied")}>
          Decline
        </Button>
      </div>
    </div>
  );
}
