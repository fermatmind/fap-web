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

function dispatchBrowserAnalyticsEvent(
  eventName: TrackingEventName,
  payload: Record<string, string | number | boolean | null>
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
  dispatchBrowserAnalyticsEvent(eventName as TrackingEventName, filteredPayload);

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
