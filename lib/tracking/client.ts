"use client";

import { hasAnalyticsConsent } from "@/lib/consent/store";
import {
  filterTrackingPayload,
  isTrackingEvent,
  type TrackingEventName,
} from "@/lib/tracking/events";

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
        path,
        timestamp: new Date().toISOString(),
      }),
      keepalive: true,
    });
  } catch {
    // Never block user flow on tracking transport errors.
  }
}
