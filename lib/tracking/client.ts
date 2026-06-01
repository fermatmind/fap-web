"use client";

import { hasAnalyticsConsent } from "@/lib/consent/store";
import { buildSearchIntelligenceTrackingPayload } from "@/lib/tracking/attribution";
import {
  filterTrackingPayload,
  isCanonicalSeoFunnelEvent,
  isTrackingEvent,
  normalizeTrackingEventName,
  type TrackingEventName,
} from "@/lib/tracking/events";
import { sanitizeTrackingUrl } from "@/lib/tracking/privacy";

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  _hmt?: unknown[];
};

type GoogleAdsConversionConfig = {
  conversionId: string;
  purchaseConversionLabel: string;
};

type GoogleAdsPurchaseConversionPayload = {
  send_to: string;
  value?: number;
  currency?: string;
};

type BaiduTongjiConversionEvent = {
  category: "test" | "result" | "report" | "checkout" | "purchase";
  action: "start" | "complete" | "view" | "click" | "begin" | "success";
  label: string;
};

const NETWORK_OBSERVABLE_FUNNEL_EVENTS = new Set<TrackingEventName>([
  "start_attempt",
  "submit_attempt",
  "view_result",
  "click_unlock",
  "create_order",
]);

const GA4_EVENT_NAME_MAP: Partial<Record<TrackingEventName, string>> = {
  landing_view: "page_view",
  view_landing: "page_view",
  view_test: "view_item",
  view_test_landing: "view_item",
  start_click: "select_content",
  start_attempt: "start_test",
  submit_attempt: "complete_test",
  view_result: "view_result",
  checkout_start: "begin_checkout",
  create_order: "begin_checkout",
  payment_confirmed: "add_payment_info",
  click_unlock: "click_deep_report",
  purchase_success: "purchase_success",
  pay_success: "purchase_success",
  unlock_success: "unlock_success",
};

const BAIDU_TONGJI_CONVERSION_MAP: Record<string, Omit<BaiduTongjiConversionEvent, "label">> = {
  start_test: { category: "test", action: "start" },
  complete_test: { category: "test", action: "complete" },
  view_result: { category: "result", action: "view" },
  click_deep_report: { category: "report", action: "click" },
  begin_checkout: { category: "checkout", action: "begin" },
  purchase_success: { category: "purchase", action: "success" },
};

const CONVERSION_EVENT_DEDUPE_TTL_MS = 2000;
const recentConversionDispatches = new Map<string, number>();

export function mapTrackingEventToGa4Name(eventName: TrackingEventName): string {
  return GA4_EVENT_NAME_MAP[eventName] ?? eventName;
}

function normalizeEnvValue(value: string | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeGoogleAdsConversionId(value: string): string {
  return /^AW-[A-Z0-9-]{4,32}$/i.test(value) ? value : "";
}

function normalizeGoogleAdsConversionLabel(value: string): string {
  return /^[A-Za-z0-9_-]{4,128}$/.test(value) ? value : "";
}

export function getGoogleAdsConversionConfig(
  env: Partial<NodeJS.ProcessEnv> = process.env
): GoogleAdsConversionConfig {
  return {
    conversionId: normalizeGoogleAdsConversionId(normalizeEnvValue(env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID)),
    purchaseConversionLabel: normalizeGoogleAdsConversionLabel(
      normalizeEnvValue(env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_CONVERSION_LABEL)
    ),
  };
}

function firstFiniteNumber(payload: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const raw = payload[key];
    if (typeof raw === "number" && Number.isFinite(raw)) return raw;
    if (typeof raw === "string" && raw.trim() !== "") {
      const parsed = Number(raw);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return undefined;
}

function firstNonEmptyString(payload: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const raw = payload[key];
    if (typeof raw === "string" && raw.trim() !== "") return raw.trim();
    if (typeof raw === "number" && Number.isFinite(raw)) return String(raw);
  }
  return undefined;
}

function normalizeTaxonomyValue(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || undefined;
}

function inferTestType(payload: Record<string, unknown>): string | undefined {
  const explicit = normalizeTaxonomyValue(firstNonEmptyString(payload, ["test_type"]));
  if (explicit) return explicit;

  const scaleCode = normalizeTaxonomyValue(firstNonEmptyString(payload, ["scale_code", "scaleCode"]));
  if (scaleCode?.includes("big5") || scaleCode?.includes("ocean")) return "big_five";
  if (scaleCode?.includes("riasec") || scaleCode?.includes("holland")) return "holland";
  if (scaleCode?.includes("mbti")) return "mbti";
  if (scaleCode?.includes("enneagram")) return "enneagram";
  if (scaleCode?.includes("iq")) return "iq";
  if (scaleCode?.includes("eq")) return "eq";
  if (scaleCode?.includes("depression")) return "depression";

  const slug = normalizeTaxonomyValue(firstNonEmptyString(payload, ["test_slug", "slug", "form_code"]));
  if (slug?.includes("big_five") || slug?.includes("big5")) return "big_five";
  if (slug?.includes("holland") || slug?.includes("riasec")) return "holland";
  if (slug?.includes("mbti") || slug?.includes("16_personality")) return "mbti";
  if (slug?.includes("enneagram")) return "enneagram";
  if (slug?.includes("iq")) return "iq";
  if (slug?.includes("eq")) return "eq";
  if (slug?.includes("depression")) return "depression";

  return scaleCode ?? slug;
}

function inferTestVersion(payload: Record<string, unknown>): string | undefined {
  return normalizeTaxonomyValue(
    firstNonEmptyString(payload, ["test_version", "form_code", "variant", "pack_version"])
  );
}

function isStandardConversionEvent(eventName: TrackingEventName): boolean {
  return Object.prototype.hasOwnProperty.call(BAIDU_TONGJI_CONVERSION_MAP, mapTrackingEventToGa4Name(eventName));
}

export function enrichStandardConversionPayload(
  eventName: TrackingEventName,
  payload: Record<string, unknown>
): Record<string, unknown> {
  if (!isStandardConversionEvent(eventName)) return payload;

  const next: Record<string, unknown> = { ...payload };
  const testType = inferTestType(next);
  const testVersion = inferTestVersion(next);
  const resultId = firstNonEmptyString(next, ["result_id", "attemptIdMasked", "attempt_id"]);
  const value = firstFiniteNumber(next, ["value", "amount", "price"]);

  if (testType) next.test_type = testType;
  if (testVersion) next.test_version = testVersion;
  if (resultId && (eventName === "view_result" || eventName === "click_unlock")) next.result_id = resultId;
  if (eventName === "click_unlock" && !next.report_type) next.report_type = "deep";
  if (value !== undefined && (eventName === "create_order" || eventName === "purchase_success")) next.value = value;

  return next;
}

export function buildBaiduTongjiConversionEvent(
  eventName: TrackingEventName,
  payload: Record<string, string | number | boolean | null>
): BaiduTongjiConversionEvent | null {
  const conversionEventName = mapTrackingEventToGa4Name(eventName);
  const conversion = BAIDU_TONGJI_CONVERSION_MAP[conversionEventName];
  if (!conversion) return null;

  const label =
    firstNonEmptyString(payload, ["test_type", "scale_code", "form_code", "test_slug", "slug"]) ??
    conversionEventName;

  return {
    ...conversion,
    label: normalizeTaxonomyValue(label) ?? conversionEventName,
  };
}

export function buildGoogleAdsPurchaseConversionPayload(
  payload: Record<string, unknown>,
  config: GoogleAdsConversionConfig = getGoogleAdsConversionConfig()
): GoogleAdsPurchaseConversionPayload | null {
  if (!config.conversionId || !config.purchaseConversionLabel) return null;

  const conversionPayload: GoogleAdsPurchaseConversionPayload = {
    send_to: `${config.conversionId}/${config.purchaseConversionLabel}`,
  };
  const value = firstFiniteNumber(payload, ["amount", "value", "price"]);
  const currency = firstNonEmptyString(payload, ["currency"]);

  if (value !== undefined) conversionPayload.value = value;
  if (currency) conversionPayload.currency = currency;

  return conversionPayload;
}

function dispatchGoogleAdsPurchaseConversion(
  analyticsWindow: AnalyticsWindow,
  eventName: TrackingEventName,
  payload: Record<string, unknown>
): void {
  if (eventName !== "purchase_success") return;
  const conversionPayload = buildGoogleAdsPurchaseConversionPayload(payload);
  if (!conversionPayload) return;

  try {
    analyticsWindow.gtag?.("event", "conversion", conversionPayload);
  } catch {
    // Browser analytics must never block product flows.
  }
}

function dispatchBrowserAnalyticsEvent(
  eventName: TrackingEventName,
  payload: Record<string, string | number | boolean | null>,
  rawPayload: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;
  const analyticsWindow = window as AnalyticsWindow;
  const ga4EventName = mapTrackingEventToGa4Name(eventName);

  try {
    analyticsWindow.gtag?.("event", ga4EventName, {
      event_category: "funnel",
      event_label: eventName,
      ...payload,
    });
  } catch {
    // Browser analytics must never block product flows.
  }

  dispatchGoogleAdsPurchaseConversion(analyticsWindow, eventName, rawPayload);

  try {
    const baiduConversion = buildBaiduTongjiConversionEvent(eventName, payload);
    if (baiduConversion) {
      analyticsWindow._hmt?.push([
        "_trackEvent",
        baiduConversion.category,
        baiduConversion.action,
        baiduConversion.label,
      ]);
    } else {
      analyticsWindow._hmt?.push([
        "_trackEvent",
        "funnel",
        eventName,
        typeof payload.test_slug === "string"
          ? payload.test_slug
          : typeof payload.slug === "string"
            ? payload.slug
            : "",
      ]);
    }
  } catch {
    // Browser analytics must never block product flows.
  }
}

function pruneRecentConversionDispatches(now: number): void {
  for (const [key, timestamp] of recentConversionDispatches.entries()) {
    if (now - timestamp > CONVERSION_EVENT_DEDUPE_TTL_MS) {
      recentConversionDispatches.delete(key);
    }
  }
}

function shouldSuppressDuplicateConversionDispatch(
  eventName: TrackingEventName,
  safePath: string,
  payload: Record<string, string | number | boolean | null>
): boolean {
  if (!isStandardConversionEvent(eventName)) return false;

  const now = Date.now();
  pruneRecentConversionDispatches(now);

  const key = JSON.stringify([
    mapTrackingEventToGa4Name(eventName),
    safePath,
    payload.test_type,
    payload.test_version,
    payload.result_id,
    payload.attempt_id,
    payload.attemptIdMasked,
    payload.transaction_id,
    payload.orderNoMasked,
  ]);
  const lastSeen = recentConversionDispatches.get(key);
  if (lastSeen !== undefined && now - lastSeen <= CONVERSION_EVENT_DEDUPE_TTL_MS) {
    return true;
  }

  recentConversionDispatches.set(key, now);
  return false;
}

function browserReferrer(): string | undefined {
  return typeof document === "undefined" ? undefined : document.referrer;
}

function browserUserAgent(): string | undefined {
  return typeof navigator === "undefined" ? undefined : navigator.userAgent;
}

function enrichPayloadForSearchIntelligence(
  payload: Record<string, unknown>,
  safePath: string
): Record<string, unknown> {
  return {
    ...payload,
    ...buildSearchIntelligenceTrackingPayload({
      payload,
      referrer: typeof payload.referrer === "string" ? payload.referrer : browserReferrer(),
      currentPath: typeof payload.current_path === "string" ? payload.current_path : safePath,
      userAgent: browserUserAgent(),
      environment: process.env.NODE_ENV,
      consentState: "granted",
    }),
  };
}

export async function trackClientEvent({
  eventName,
  payload,
  anonymousId,
  path,
}: {
  eventName: string;
  payload?: Record<string, unknown>;
  anonymousId: string;
  path: string;
}): Promise<void> {
  if (!hasAnalyticsConsent()) return;
  if (!isTrackingEvent(eventName)) return;

  const normalizedEventName = normalizeTrackingEventName(eventName as TrackingEventName);
  const safePath = sanitizeTrackingUrl(path) ?? "";
  const rawPayload = enrichStandardConversionPayload(
    normalizedEventName,
    enrichPayloadForSearchIntelligence(payload ?? {}, safePath)
  );
  const filteredPayload = filterTrackingPayload(normalizedEventName, rawPayload);
  if (shouldSuppressDuplicateConversionDispatch(normalizedEventName, safePath, filteredPayload)) return;
  dispatchBrowserAnalyticsEvent(normalizedEventName, filteredPayload, rawPayload);

  try {
    await fetch("/api/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        eventName: normalizedEventName,
        payload: filteredPayload,
        anonymousId,
        path: safePath,
        timestamp: new Date().toISOString(),
      }),
      keepalive: true,
    });
  } catch {
    // Never block user flow on tracking transport errors.
  }
}

export async function trackNetworkObservableFunnelEvent({
  eventName,
  payload,
  anonymousId,
  path,
}: {
  eventName: string;
  payload?: Record<string, unknown>;
  anonymousId: string;
  path: string;
}): Promise<void> {
  if (!hasAnalyticsConsent()) return;
  if (!isTrackingEvent(eventName)) return;

  const normalizedEventName = normalizeTrackingEventName(eventName as TrackingEventName);
  if (!isCanonicalSeoFunnelEvent(normalizedEventName) || !NETWORK_OBSERVABLE_FUNNEL_EVENTS.has(normalizedEventName)) {
    return;
  }

  const safePath = sanitizeTrackingUrl(path) ?? "";
  const rawPayload = enrichStandardConversionPayload(
    normalizedEventName,
    enrichPayloadForSearchIntelligence(payload ?? {}, safePath)
  );
  const filteredPayload = filterTrackingPayload(normalizedEventName, rawPayload);
  if (shouldSuppressDuplicateConversionDispatch(normalizedEventName, safePath, filteredPayload)) return;

  dispatchBrowserAnalyticsEvent(normalizedEventName, filteredPayload, rawPayload);

  try {
    await fetch("/api/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        eventName: normalizedEventName,
        payload: filteredPayload,
        anonymousId,
        path: safePath,
        timestamp: new Date().toISOString(),
      }),
      keepalive: true,
    });
  } catch {
    // Never block user flow on tracking transport errors.
  }
}
