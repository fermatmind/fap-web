import { trackClientEvent } from "@/lib/tracking/client";
import { getLocaleFromPathname } from "@/lib/i18n/locales";
import { getOrCreateAnonId } from "@/lib/anon";

const ANALYTICS_ENABLED = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true";

export type AnalyticsProperties = Record<string, unknown>;

const isBrowser = () => typeof window !== "undefined";

export function getAnonymousId(): string {
  if (!isBrowser()) return "";
  return getOrCreateAnonId();
}

export function clearAnalyticsQueue(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem("fap_event_queue_v1");
    window.localStorage.removeItem("fap_analytics_last_flush");
  } catch {
    // Ignore cleanup errors.
  }
}

export function initAnalytics(): void {
  if (!isBrowser()) return;
  if (!ANALYTICS_ENABLED) {
    clearAnalyticsQueue();
  }
}

export function trackEvent(eventName: string, properties: AnalyticsProperties = {}): void {
  if (!ANALYTICS_ENABLED || !isBrowser() || !eventName) return;

  const locale = getLocaleFromPathname(window.location.pathname);
  const payload = {
    ...properties,
    locale: properties.locale ?? locale,
  };

  void trackClientEvent({
    eventName,
    payload,
    anonymousId: getAnonymousId(),
    path: `${window.location.pathname}${window.location.search}`,
  });
}

export async function flushEvents(): Promise<void> {
  // Kept for backward compatibility.
}
