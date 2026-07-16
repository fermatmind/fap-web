import { trackClientEvent, trackNetworkObservableFunnelEvent } from "@/lib/tracking/client";
import { getLocaleFromPathname } from "@/lib/i18n/locales";
import { getOrCreateAnonId } from "@/lib/anon";
import { hasAnalyticsConsent } from "@/lib/consent/store";
import {
  buildSeoConversionAttributionPayload,
  captureAttributionFromLocation,
  readStoredTrackingAttributionPayload,
} from "@/lib/tracking/attribution";
import {
  isSeoConversionFunnelEvent,
  normalizeTrackingEventName,
  TRACKING_EVENTS,
  type TrackingEventName,
} from "@/lib/tracking/events";
import { shouldAllowBrowserAnalyticsRuntime } from "@/lib/tracking/internalTraffic";
import { shouldHardStopPublicAnalyticsForUrl } from "@/lib/tracking/privacy";

const ANALYTICS_ENABLED = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true";
const LANDING_PV_STORAGE_PREFIX = "fm_landing_pv_sent_v1:";

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
  if (ANALYTICS_ENABLED && shouldAllowBrowserAnalyticsRuntime({ analyticsEnabled: ANALYTICS_ENABLED }).allowed && hasAnalyticsConsent()) {
    captureAttributionFromLocation({
      pathname: window.location.pathname,
      search: window.location.search,
      referrer: document.referrer,
    });
    trackLandingPageView();
  }
  if (!ANALYTICS_ENABLED) {
    clearAnalyticsQueue();
  }
}

function normalizeText(value: unknown, maxLength = 128): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized ? normalized.slice(0, maxLength) : undefined;
}

function currentBrowserPath(): string {
  return isBrowser() ? `${window.location.pathname}${window.location.search}` : "";
}

function routeSegments(path: string): string[] {
  try {
    return new URL(path, "https://fermatmind.local").pathname.split("/").filter(Boolean);
  } catch {
    return String(path ?? "").split("?")[0].split("/").filter(Boolean);
  }
}

function contentSegments(path: string): string[] {
  const segments = routeSegments(path);
  return segments[0] === "zh" || segments[0] === "en" ? segments.slice(1) : segments;
}

function inferPageType(path: string, properties: AnalyticsProperties): string | undefined {
  const explicit =
    normalizeText(properties.page_type, 64) ??
    normalizeText(properties.source_page_type, 64) ??
    normalizeText(properties.route_family, 64);
  if (explicit) return explicit;

  const [family, slug, child] = contentSegments(path);
  if (!family) return "home";
  if (family === "articles" && slug) return "article_detail";
  if (family === "topics" && slug) return "topic_detail";
  if (family === "tests" && slug && !child) return "test_detail";
  if (family === "tests" && slug && child === "take") return "test_take";
  return family;
}

function inferArticleSlug(path: string, properties: AnalyticsProperties): string | undefined {
  const explicit =
    normalizeText(properties.source_article, 128) ??
    normalizeText(properties.article_slug, 128) ??
    normalizeText(properties.source_slug, 128);
  if (explicit) return explicit;

  const [family, slug] = contentSegments(path);
  return family === "articles" ? normalizeText(slug, 128) : undefined;
}

function inferTargetTest(path: string, properties: AnalyticsProperties): string | undefined {
  const explicit =
    normalizeText(properties.target_test, 128) ??
    normalizeText(properties.target_test_slug, 128) ??
    normalizeText(properties.test_slug, 128) ??
    normalizeText(properties.slug, 128);
  if (explicit) return explicit;

  const [family, slug] = contentSegments(path);
  return family === "tests" ? normalizeText(slug, 128) : undefined;
}

function buildRuntimeSeoConversionPayload(
  eventName: string,
  properties: AnalyticsProperties,
  currentPath: string,
  locale: string
): AnalyticsProperties {
  const normalizedEventName = normalizeTrackingEventName(eventName as TrackingEventName);
  if (!isSeoConversionFunnelEvent(normalizedEventName)) return {};

  const landingPath = normalizeText(properties.landing_path, 2048);
  const sourcePath =
    normalizeText(properties.source_url, 2048) ??
    normalizeText(properties.source_path, 2048) ??
    landingPath ??
    currentPath;

  return buildSeoConversionAttributionPayload({
    url: normalizeText(properties.url, 2048) ?? currentPath,
    lang: normalizeText(properties.lang, 16) ?? normalizeText(properties.locale, 16) ?? locale,
    pageType: inferPageType(currentPath, properties),
    sourceUrl: sourcePath,
    sourceArticle: inferArticleSlug(sourcePath, properties),
    targetTest: inferTargetTest(currentPath, properties),
    scaleId:
      normalizeText(properties.scale_id, 64) ??
      normalizeText(properties.scale_code, 64) ??
      normalizeText(properties.scaleCode, 64),
    formId: normalizeText(properties.form_id, 64) ?? normalizeText(properties.form_code, 64),
    sessionId: normalizeText(properties.session_id, 96),
    referrer: normalizeText(properties.referrer, 2048) ?? (isBrowser() ? document.referrer : undefined),
  });
}

export function trackLandingPageView(properties: AnalyticsProperties = {}): void {
  if (!ANALYTICS_ENABLED || !isBrowser()) return;
  if (!shouldAllowBrowserAnalyticsRuntime({ analyticsEnabled: ANALYTICS_ENABLED }).allowed) return;
  if (!hasAnalyticsConsent()) return;

  const currentPath = currentBrowserPath();
  if (shouldHardStopPublicAnalyticsForUrl(currentPath)) return;

  const dedupeKey = `${LANDING_PV_STORAGE_PREFIX}${currentPath}`;
  try {
    if (window.sessionStorage.getItem(dedupeKey) === "1") return;
    window.sessionStorage.setItem(dedupeKey, "1");
  } catch {
    // Landing tracking must never block rendering.
  }

  trackEvent(TRACKING_EVENTS.LANDING_PV, {
    ...properties,
    url: currentPath,
    page_type: inferPageType(currentPath, properties),
  });
}

export function trackEvent(eventName: string, properties: AnalyticsProperties = {}): void {
  if (!ANALYTICS_ENABLED || !isBrowser() || !eventName) return;
  if (!shouldAllowBrowserAnalyticsRuntime({ analyticsEnabled: ANALYTICS_ENABLED }).allowed) return;
  if (!hasAnalyticsConsent()) return;

  const locale = getLocaleFromPathname(window.location.pathname);
  const currentPath = `${window.location.pathname}${window.location.search}`;
  const attributionPayload = readStoredTrackingAttributionPayload(currentPath);
  const anonymousId = getAnonymousId();
  const seoConversionPayload = buildRuntimeSeoConversionPayload(eventName, properties, currentPath, locale);
  const payload = {
    ...attributionPayload,
    ...seoConversionPayload,
    ...properties,
    locale: properties.locale ?? locale,
    current_path: properties.current_path ?? currentPath,
    session_id: properties.session_id ?? seoConversionPayload.session_id ?? anonymousId,
  };

  void trackClientEvent({
    eventName,
    payload,
    anonymousId,
    path: currentPath,
  });
}

export function trackObservableFunnelEvent(eventName: string, properties: AnalyticsProperties = {}): void {
  if (!ANALYTICS_ENABLED || !isBrowser() || !eventName) return;
  if (!shouldAllowBrowserAnalyticsRuntime({ analyticsEnabled: ANALYTICS_ENABLED }).allowed) return;
  if (!hasAnalyticsConsent()) return;

  const locale = getLocaleFromPathname(window.location.pathname);
  const currentPath = `${window.location.pathname}${window.location.search}`;
  const attributionPayload = readStoredTrackingAttributionPayload(currentPath);
  const anonymousId = getAnonymousId();
  const seoConversionPayload = buildRuntimeSeoConversionPayload(eventName, properties, currentPath, locale);
  const payload = {
    ...attributionPayload,
    ...seoConversionPayload,
    ...properties,
    locale: properties.locale ?? locale,
    current_path: properties.current_path ?? currentPath,
    session_id: properties.session_id ?? seoConversionPayload.session_id ?? anonymousId,
  };

  void trackNetworkObservableFunnelEvent({
    eventName,
    payload,
    anonymousId,
    path: currentPath,
  });
}

export async function flushEvents(): Promise<void> {
  // Kept for backward compatibility.
}
