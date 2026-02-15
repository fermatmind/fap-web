import { trackClientEvent } from "@/lib/tracking/client";
import { getLocaleFromPathname } from "@/lib/i18n/locales";

const ANALYTICS_ENABLED = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true";
const ANON_ID_KEY = "fap_anonymous_id_v1";

export type AnalyticsProperties = Record<string, unknown>;

const isBrowser = () => typeof window !== "undefined";

const buildFallbackId = () => `anon_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const generateAnonymousId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return buildFallbackId();
};

export function getAnonymousId(): string {
  if (!isBrowser()) return "";

  try {
    const cached = window.localStorage.getItem(ANON_ID_KEY);
    if (cached) return cached;

    const nextId = generateAnonymousId();
    window.localStorage.setItem(ANON_ID_KEY, nextId);
    return nextId;
  } catch {
    return generateAnonymousId();
  }
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
