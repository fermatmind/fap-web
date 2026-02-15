export const TRACKING_EVENTS = {
  VIEW_LANDING: "view_landing",
  VIEW_TEST: "view_test",
  VIEW_TEST_LANDING: "view_test_landing",
  START_ATTEMPT: "start_attempt",
  SUBMIT_ATTEMPT: "submit_attempt",
  VIEW_RESULT: "view_result",
  VIEW_PAYWALL: "view_paywall",
  CLICK_UNLOCK: "click_unlock",
  CREATE_ORDER: "create_order",
  PAYMENT_CONFIRMED: "payment_confirmed",
  PAYMENT_FAILED: "payment_failed",
  ABANDONED_PAYWALL: "abandoned_paywall",
  PURCHASE_SUCCESS: "purchase_success",
} as const;

export type TrackingEventName = (typeof TRACKING_EVENTS)[keyof typeof TRACKING_EVENTS];

const EVENT_FIELD_WHITELIST: Record<TrackingEventName, readonly string[]> = {
  view_landing: ["locale"],
  view_test: ["slug", "locale"],
  view_test_landing: ["slug", "locale"],
  start_attempt: ["slug", "scaleCode", "attemptIdMasked", "locale"],
  submit_attempt: ["slug", "attemptIdMasked", "durationMs", "locale"],
  view_result: ["attemptIdMasked", "locked", "typeCode", "locale"],
  view_paywall: ["attemptIdMasked", "sku", "priceShown", "locale"],
  click_unlock: ["attemptIdMasked", "sku", "priceShown", "locale"],
  create_order: ["attemptIdMasked", "orderNoMasked", "sku", "locale"],
  payment_confirmed: ["orderNoMasked", "attemptIdMasked", "locale"],
  payment_failed: ["orderNoMasked", "attemptIdMasked", "reason", "locale"],
  abandoned_paywall: ["attemptIdMasked", "locked", "stayMs", "locale"],
  purchase_success: ["orderNoMasked", "attemptIdMasked", "sku", "amount", "currency", "locale"],
};

const FORBIDDEN_FIELD_FRAGMENTS = ["answer", "report", "email", "token", "authorization"];

function sanitizeString(value: string): string {
  return value.slice(0, 256);
}

function sanitizeValue(value: unknown): string | number | boolean | null {
  if (typeof value === "string") return sanitizeString(value);
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "boolean") return value;
  if (value === null) return null;
  return sanitizeString(String(value));
}

export function isTrackingEvent(eventName: string): eventName is TrackingEventName {
  return Object.values(TRACKING_EVENTS).includes(eventName as TrackingEventName);
}

export function filterTrackingPayload(
  eventName: TrackingEventName,
  payload: Record<string, unknown>
): Record<string, string | number | boolean | null> {
  const allowed = EVENT_FIELD_WHITELIST[eventName];

  return allowed.reduce<Record<string, string | number | boolean | null>>((acc, key) => {
    const forbidden = FORBIDDEN_FIELD_FRAGMENTS.some((fragment) => key.toLowerCase().includes(fragment));
    if (forbidden) return acc;

    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      acc[key] = sanitizeValue(payload[key]);
    }

    return acc;
  }, {});
}
