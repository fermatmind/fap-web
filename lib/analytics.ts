import { trackClientEvent } from "@/lib/tracking/client";
import { getLocaleFromPathname } from "@/lib/i18n/locales";
import { getOrCreateAnonId } from "@/lib/anon";
import {
  captureAttributionFromLocation,
  readStoredTrackingAttributionPayload,
} from "@/lib/tracking/attribution";

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
  if (ANALYTICS_ENABLED) {
    captureAttributionFromLocation({
      pathname: window.location.pathname,
      search: window.location.search,
      referrer: document.referrer,
    });
  }
  if (!ANALYTICS_ENABLED) {
    clearAnalyticsQueue();
  }
}

export function trackEvent(eventName: string, properties: AnalyticsProperties = {}): void {
  if (!ANALYTICS_ENABLED || !isBrowser() || !eventName) return;

  const locale = getLocaleFromPathname(window.location.pathname);
  const currentPath = `${window.location.pathname}${window.location.search}`;
  const attributionPayload = readStoredTrackingAttributionPayload(currentPath);
  const anonymousId = getAnonymousId();
  const payload = {
    ...attributionPayload,
    ...properties,
    locale: properties.locale ?? locale,
    current_path: properties.current_path ?? currentPath,
    session_id: properties.session_id ?? anonymousId,
  };

  void trackClientEvent({
    eventName,
    payload,
    anonymousId,
    path: currentPath,
  });
}

export async function flushEvents(): Promise<void> {
  // Kept for backward compatibility.
}
