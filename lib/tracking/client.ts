"use client";

import { hasAnalyticsConsent } from "@/lib/consent/store";
import {
  filterTrackingPayload,
  isTrackingEvent,
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
  transaction_id?: string;
};

const GA4_EVENT_NAME_MAP: Partial<Record<TrackingEventName, string>> = {
  landing_view: "page_view",
  view_landing: "page_view",
  view_test: "view_item",
  view_test_landing: "view_item",
  start_click: "select_content",
  start_attempt: "start_attempt",
  submit_attempt: "submit_attempt",
  view_result: "view_result",
  checkout_start: "begin_checkout",
  create_order: "begin_checkout",
  payment_confirmed: "add_payment_info",
  purchase_success: "purchase",
  pay_success: "purchase",
  unlock_success: "unlock_success",
};

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
  const transactionId = firstNonEmptyString(payload, ["order_no", "orderNo", "order_id", "transaction_id"]);

  if (value !== undefined) conversionPayload.value = value;
  if (currency) conversionPayload.currency = currency;
  if (transactionId) conversionPayload.transaction_id = transactionId;

  return conversionPayload;
}

function dispatchGoogleAdsPurchaseConversion(
  analyticsWindow: AnalyticsWindow,
  eventName: TrackingEventName,
  payload: Record<string, unknown>
): void {
  if (eventName !== "purchase_success" && eventName !== "pay_success") return;
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
  } catch {
    // Browser analytics must never block product flows.
  }
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

  const filteredPayload = filterTrackingPayload(eventName as TrackingEventName, payload ?? {});
  const safePath = sanitizeTrackingUrl(path) ?? "";
  dispatchBrowserAnalyticsEvent(eventName as TrackingEventName, filteredPayload, payload ?? {});

  try {
    await fetch("/api/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        eventName,
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
