import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildGoogleAdsPurchaseConversionPayload,
  trackClientEvent,
} from "@/lib/tracking/client";
import {
  CANONICAL_SEO_FUNNEL_EVENTS,
  SEO_FUNNEL_EVENT_ALIAS_MAP,
  TRACKING_EVENTS,
  filterTrackingPayload,
  normalizeTrackingEventName,
} from "@/lib/tracking/events";

const CONSENT_KEY = "fm_consent_v1";

function grantAnalyticsConsent() {
  window.localStorage.setItem(
    CONSENT_KEY,
    JSON.stringify({ analytics: "granted", updatedAt: "2026-05-14T00:00:00.000Z" })
  );
}

function withGoogleAdsEnv() {
  vi.stubEnv("NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID", "AW-TEST1234");
  vi.stubEnv("NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_CONVERSION_LABEL", "purchase_label_test");
}

afterEach(() => {
  window.localStorage.clear();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("SEO funnel tracking taxonomy parity", () => {
  it("declares the canonical funnel event list used for SEO growth reporting", () => {
    expect(CANONICAL_SEO_FUNNEL_EVENTS).toEqual([
      "start_attempt",
      "submit_attempt",
      "view_result",
      "click_unlock",
      "create_order",
      "payment_confirmed",
      "purchase_success",
    ]);
  });

  it("keeps legacy scale events as aliases rather than primary funnel events", () => {
    expect(SEO_FUNNEL_EVENT_ALIAS_MAP).toMatchObject({
      start_click: "start_attempt",
      clinical_start: "start_attempt",
      submit_click: "submit_attempt",
      clinical_submit: "submit_attempt",
      report_view_free: "view_result",
      clinical_report_view: "view_result",
      riasec_result_view: "view_result",
      checkout_start: "create_order",
      clinical_checkout_start: "create_order",
      pay_success: "purchase_success",
    });

    expect(normalizeTrackingEventName(TRACKING_EVENTS.START_CLICK)).toBe(TRACKING_EVENTS.START_ATTEMPT);
    expect(normalizeTrackingEventName(TRACKING_EVENTS.SUBMIT_CLICK)).toBe(TRACKING_EVENTS.SUBMIT_ATTEMPT);
    expect(normalizeTrackingEventName(TRACKING_EVENTS.PAY_SUCCESS)).toBe(TRACKING_EVENTS.PURCHASE_SUCCESS);
  });

  it("normalizes legacy start and submit aliases before browser and network dispatch", async () => {
    grantAnalyticsConsent();
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    const gtagMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    Object.defineProperty(window, "gtag", {
      configurable: true,
      value: gtagMock,
    });

    await trackClientEvent({
      eventName: TRACKING_EVENTS.START_CLICK,
      payload: {
        test_slug: "big-five-personality-test",
        email: "person@example.com",
        locale: "en",
      },
      anonymousId: "anon-session-1",
      path: "/en/tests/big-five-personality-test",
    });
    await trackClientEvent({
      eventName: TRACKING_EVENTS.SUBMIT_CLICK,
      payload: {
        attempt_id: "attempt-big5-123456",
        answered_count: 60,
        duration_ms: 121000,
        email: "person@example.com",
        locale: "en",
      },
      anonymousId: "anon-session-1",
      path: "/en/tests/big-five-personality-test/take",
    });

    expect(gtagMock).toHaveBeenCalledWith("event", "start_test", expect.any(Object));
    expect(gtagMock).toHaveBeenCalledWith("event", "complete_test", expect.any(Object));

    const startBody = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body ?? "{}")) as {
      eventName?: string;
      payload?: Record<string, unknown>;
    };
    const submitBody = JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body ?? "{}")) as {
      eventName?: string;
      payload?: Record<string, unknown>;
    };

    expect(startBody.eventName).toBe("start_attempt");
    expect(submitBody.eventName).toBe("submit_attempt");
    expect(submitBody.payload).toMatchObject({
      attempt_id: "attemp...3456",
      answered_count: 60,
      duration_ms: 121000,
      locale: "en",
    });
    expect(JSON.stringify([startBody, submitBody])).not.toContain("person@example.com");
  });

  it("keeps purchase conversion limited to purchase aliases without order identifiers", async () => {
    grantAnalyticsConsent();
    withGoogleAdsEnv();
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    const gtagMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    Object.defineProperty(window, "gtag", {
      configurable: true,
      value: gtagMock,
    });

    await trackClientEvent({
      eventName: TRACKING_EVENTS.CREATE_ORDER,
      payload: { order_no: "ord_not_purchase_1", amount: 88, currency: "CNY", locale: "zh" },
      anonymousId: "anon-session-1",
      path: "/zh/orders/ord_not_purchase_1",
    });
    await trackClientEvent({
      eventName: TRACKING_EVENTS.PAYMENT_CONFIRMED,
      payload: { order_no: "ord_not_purchase_1", amount: 88, currency: "CNY", locale: "zh" },
      anonymousId: "anon-session-1",
      path: "/zh/orders/ord_not_purchase_1",
    });
    await trackClientEvent({
      eventName: TRACKING_EVENTS.PAY_SUCCESS,
      payload: {
        order_no: "ord_purchase_alias_1",
        order_id: "ord_purchase_order_id_1",
        transaction_id: "ord_purchase_transaction_1",
        amount: 88,
        currency: "CNY",
        email: "person@example.com",
        locale: "zh",
      },
      anonymousId: "anon-session-1",
      path: "/zh/orders/ord_purchase_alias_1",
    });

    expect(gtagMock).toHaveBeenCalledTimes(4);
    expect(gtagMock).toHaveBeenCalledWith("event", "conversion", {
      send_to: "AW-TEST1234/purchase_label_test",
      value: 88,
      currency: "CNY",
    });

    const paySuccessBody = JSON.parse(String(fetchMock.mock.calls[2]?.[1]?.body ?? "{}")) as {
      eventName?: string;
      payload?: Record<string, unknown>;
    };
    expect(paySuccessBody.eventName).toBe("purchase_success");
    expect(paySuccessBody.payload?.order_no).toBe("ord_pu...as_1");
    expect(paySuccessBody.payload?.order_id).toBe("ord_pu...id_1");
    expect(paySuccessBody.payload?.transaction_id).toBe("ord_pu...on_1");
    expect(JSON.stringify(paySuccessBody)).not.toContain("person@example.com");
    expect(JSON.stringify(paySuccessBody)).not.toContain("ord_purchase_alias_1");
    expect(JSON.stringify(paySuccessBody)).not.toContain("ord_purchase_order_id_1");
    expect(JSON.stringify(paySuccessBody)).not.toContain("ord_purchase_transaction_1");
  });

  it("preserves submit_attempt support fields while filtering email from payloads", () => {
    const payload = filterTrackingPayload(TRACKING_EVENTS.SUBMIT_ATTEMPT, {
      attempt_id: "attempt-big5-123456",
      answered_count: 60,
      durationMs: 122000,
      duration_ms: 122000,
      duration_bucket: "1_3m",
      scale_code: "BIG5_OCEAN",
      email: "person@example.com",
      locale: "en",
    });

    expect(payload).toMatchObject({
      attempt_id: "attemp...3456",
      answered_count: 60,
      durationMs: 122000,
      duration_ms: 122000,
      duration_bucket: "1_3m",
      scale_code: "BIG5_OCEAN",
      locale: "en",
    });
    expect(JSON.stringify(payload)).not.toContain("person@example.com");
  });

  it("does not rely on the Big Five take flow start_click-only or submit_click-only path", () => {
    const big5TakeClient = readFileSync(
      "app/(localized)/[locale]/tests/[slug]/take/Big5TakeClient.tsx",
      "utf8"
    );
    expect(big5TakeClient).not.toContain('"start_click"');
    expect(big5TakeClient).not.toContain('"submit_click"');
    expect(big5TakeClient).toContain('"start_attempt"');
    expect(big5TakeClient).toContain('"submit_attempt"');
  });

  it("never derives Google Ads transaction_id from email or order fields", () => {
    expect(
      buildGoogleAdsPurchaseConversionPayload(
        {
          amount: 88,
          currency: "CNY",
          email: "person@example.com",
          order_no: "ord_purchase_alias_1",
          order_id: "ord_purchase_order_id_1",
          transaction_id: "person@example.com",
        },
        { conversionId: "AW-TEST1234", purchaseConversionLabel: "purchase_label_test" }
      )
    ).toEqual({
      send_to: "AW-TEST1234/purchase_label_test",
      value: 88,
      currency: "CNY",
    });
  });
});
