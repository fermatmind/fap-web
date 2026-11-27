"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useLocale } from "@/components/i18n/LocaleContext";
import { COOKIE_BANNER_ENABLED } from "@/components/layout/siteChromeRules";
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

export function CookieBanner({ traditional = false }: { traditional?: boolean } = {}) {
  const locale = useLocale();
  const dict = getDictSync(locale);
  const copy = traditional ? {
    message: "我們會使用必要的 Cookie 維持網站運作。你可以選擇是否同意使用分析 Cookie，幫助我們改善網站。",
    accept: "同意分析 Cookie",
    decline: "僅使用必要 Cookie",
  } : dict.cookie;
  const consent = useSyncExternalStore(subscribeConsentStore, getConsentSnapshot, getServerConsentSnapshot);

  useEffect(() => {
    if (!COOKIE_BANNER_ENABLED || consent === "pending") return;
    const hasVisitConsent = document.cookie.split("; ").includes("fm_uv_consent=1");
    if (consent === "granted" && !hasVisitConsent) {
      document.cookie = "fm_uv_consent=1; Path=/; Max-Age=31536000; SameSite=Lax; Secure";
    } else if (consent !== "granted" && hasVisitConsent) {
      document.cookie = "fm_uv_consent=; Path=/; Max-Age=0; SameSite=Lax; Secure";
    }
  }, [consent]);

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
      className="mx-auto mb-20 mt-4 w-[calc(100%-2rem)] max-w-[340px] rounded-xl border border-[var(--fm-border)] bg-white/95 p-4 shadow-md print:hidden min-[1280px]:fixed min-[1280px]:bottom-5 min-[1280px]:right-5 min-[1280px]:z-50 min-[1280px]:m-0 min-[1280px]:w-[min(340px,calc((100vw_-_680px)/2_-_20px))] min-[1280px]:backdrop-blur"
    >
      <p className="m-0 text-sm text-slate-700">{copy.message}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="min-h-11 rounded-full bg-[#111827] px-4 text-sm font-semibold text-white hover:bg-[#283346] focus-visible:outline-2 focus-visible:outline-offset-2"
          data-testid="cookie-banner-accept"
          onClick={() => updateConsent("granted")}
        >
          {copy.accept}
        </button>
        <button
          type="button"
          className="min-h-11 rounded-full border border-[var(--fm-border)] px-4 text-sm font-semibold text-[var(--fm-text)] hover:bg-[var(--fm-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2"
          data-testid="cookie-banner-decline"
          onClick={() => updateConsent("denied")}
        >
          {copy.decline}
        </button>
      </div>
    </div>
  );
}
