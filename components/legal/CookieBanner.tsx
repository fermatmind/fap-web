"use client";

import { useState } from "react";
import { useLocale } from "@/components/i18n/LocaleContext";
import { Button } from "@/components/ui/button";
import { getConsent, setAnalyticsConsent, type AnalyticsConsent } from "@/lib/consent/store";
import { getDictSync } from "@/lib/i18n/getDict";

type BannerConsent = AnalyticsConsent;

export function CookieBanner() {
  const locale = useLocale();
  const dict = getDictSync(locale);
  const [consent, setConsent] = useState<BannerConsent>(() => getConsent().analytics);

  const updateConsent = (next: Extract<BannerConsent, "granted" | "denied">) => {
    setAnalyticsConsent(next);
    setConsent(next);
  };

  if (consent !== "unknown") return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 mx-auto w-[min(920px,calc(100%-2rem))] rounded-2xl border border-slate-300 bg-white p-4 shadow-lg">
      <p className="m-0 text-sm text-slate-700">{dict.cookie.message}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={() => updateConsent("granted")}>
          {dict.cookie.accept}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => updateConsent("denied")}>
          {dict.cookie.decline}
        </Button>
      </div>
    </div>
  );
}
