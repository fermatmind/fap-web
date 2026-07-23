"use client";

import { useSyncExternalStore } from "react";
import { useLocale } from "@/components/i18n/LocaleContext";
import { COOKIE_BANNER_ENABLED } from "@/components/layout/siteChromeRules";
import { Button } from "@/components/ui/button";
import { getConsent, setAnalyticsConsent, type AnalyticsConsent } from "@/lib/consent/store";
import { getDictSync } from "@/lib/i18n/getDict";

type BannerConsent = AnalyticsConsent;
type BannerSnapshot = BannerConsent | "pending";

const CONSENT_UPDATED_EVENT = "fm:analytics-consent-updated";

function subscribeConsentStore(onStoreChange: () => void) {
  window.addEventListener(CONSENT_UPDATED_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener(CONSENT_UPDATED_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getConsentSnapshot(): BannerSnapshot {
  return getConsent().analytics;
}

function getServerConsentSnapshot(): BannerSnapshot {
  return "pending";
}

export function CookieBanner() {
  const locale = useLocale();
  const dict = getDictSync(locale);
  const consent = useSyncExternalStore(subscribeConsentStore, getConsentSnapshot, getServerConsentSnapshot);

  const updateConsent = (next: Extract<BannerConsent, "granted" | "denied">) => {
    setAnalyticsConsent(next);
    window.dispatchEvent(
      new CustomEvent(CONSENT_UPDATED_EVENT, {
        detail: { analytics: next },
      })
    );
  };

  if (!COOKIE_BANNER_ENABLED || consent !== "unknown") return null;

  return (
    <div
      data-visual-volatile="true"
      data-cookie-banner="true"
      className="fixed bottom-4 left-0 right-0 z-50 mx-auto w-[min(920px,calc(100%-2rem))] rounded-2xl border border-slate-300 bg-white p-4 shadow-lg"
    >
      <p className="m-0 text-sm text-slate-700">{dict.cookie.message}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          data-testid="cookie-banner-accept"
          onClick={() => updateConsent("granted")}
        >
          {dict.cookie.accept}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          data-testid="cookie-banner-decline"
          onClick={() => updateConsent("denied")}
        >
          {dict.cookie.decline}
        </Button>
      </div>
    </div>
  );
}
