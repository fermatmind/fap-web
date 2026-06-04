import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { POST as postTrackingEvent } from "@/app/api/track/route";
import { trackObservableFunnelEvent as trackAnalyticsObservableFunnelEvent } from "@/lib/analytics";
import { trackClientEvent, trackNetworkObservableFunnelEvent } from "@/lib/tracking/client";
import { TRACKING_EVENTS, filterTrackingPayload } from "@/lib/tracking/events";
import { sanitizeAnalyticsTrackingUrl, shouldSuppressAnalyticsForUrl } from "@/lib/tracking/privacy";

const CONSENT_KEY = "fm_consent_v1";
const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function grantAnalyticsConsent() {
  window.localStorage.setItem(
    CONSENT_KEY,
    JSON.stringify({ analytics: "granted", updatedAt: "2026-05-01T00:00:00.000Z" })
  );
}

afterEach(() => {
  window.localStorage.clear();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("analytics payload privacy contract", () => {
  it("redacts sensitive URL query values before tracking dispatch", () => {
    const payload = filterTrackingPayload(TRACKING_EVENTS.PAYMENT_CONFIRMED, {
      current_path:
        "/en/pay/wait?order_no=ord_raw_1&payment_recovery_token=recovery_secret&utm_source=ads",
      landing_path:
        "/en/orders/ord_raw_1?checkout_url=https%3A%2F%2Fpay.example%2Fcheckout%3Ftoken%3Dsecret&utm_medium=cpc",
      referrer: "https://search.example/en/result/attempt-abcdef-123456?authorization=Bearer%20secret&utm_campaign=launch",
      orderNoMasked: "ord_raw_1",
      attemptIdMasked: "attempt-abcdef-123456",
      provider: "alipay",
      locale: "en",
    });

    expect(payload).toMatchObject({
      current_path: "private_route:pay",
      landing_path: "private_route:orders",
      referrer: "private_route:result",
      orderNoMasked: "ord_ra...aw_1",
      attemptIdMasked: "attemp...3456",
      provider: "alipay",
      locale: "en",
    });
    expect(JSON.stringify(payload)).not.toContain("recovery_secret");
    expect(JSON.stringify(payload)).not.toContain("Bearer%20secret");
    expect(JSON.stringify(payload)).not.toContain("/ord_raw_1");
    expect(JSON.stringify(payload)).not.toContain("/en/pay");
    expect(JSON.stringify(payload)).not.toContain("/en/orders");
    expect(JSON.stringify(payload)).not.toContain("/en/result");
  });

  it("redacts private route families to stable analytics markers", () => {
    expect(sanitizeAnalyticsTrackingUrl("/zh/history/history-clear-123456")).toBe("private_route:history");
    expect(sanitizeAnalyticsTrackingUrl("/zh/result/attempt-clear-123456?report_url=https%3A%2F%2Fevil.example%2Fprivate")).toBe(
      "private_route:result"
    );
    expect(sanitizeAnalyticsTrackingUrl("/zh/orders/lookup?orderNo=ord_clear_123456&utm_source=wechat")).toBe(
      "private_route:orders"
    );
    expect(sanitizeAnalyticsTrackingUrl("/zh/orders/ord_clear_123456?payment_recovery_token=secret")).toBe(
      "private_route:orders"
    );
    expect(sanitizeAnalyticsTrackingUrl("/zh/share/share-clear-123456")).toBe("private_route:share");
    expect(sanitizeAnalyticsTrackingUrl("/zh/pay/wait?order_no=ord_clear_123456")).toBe("private_route:pay");
    expect(sanitizeAnalyticsTrackingUrl("/zh/payment/success?payment_id=pay_clear_123456")).toBe(
      "private_route:payment"
    );
    expect(sanitizeAnalyticsTrackingUrl("/zh/tests/mbti/take?token=secret&utm_source=ads")).toBe(
      "/zh/tests/mbti/take?token=redacted&utm_source=ads"
    );
    expect(shouldSuppressAnalyticsForUrl("/zh/history/history-clear-123456")).toBe(true);
    expect(shouldSuppressAnalyticsForUrl("/zh/tests/mbti/take?token=secret&utm_source=ads")).toBe(false);
  });

  it("redacts private paths from dashboard-readable URL-valued payload fields", () => {
    const payload = filterTrackingPayload(TRACKING_EVENTS.ARTICLE_TO_TEST_CLICK, {
      slug: "mbti-personality-test-16-personality-types",
      test_slug: "mbti-personality-test-16-personality-types",
      source_page_type: "history",
      target_action: "start_mbti_test_primary",
      source_path: "/zh/history/history-clear-123456",
      destination_path: "/zh/result/result-clear-123456",
      canonical_url: "https://fermatmind.com/zh/share/share-clear-123456",
      page_location: "https://fermatmind.com/zh/payment/success?payment_id=pay_clear_123456",
      landing_path: "/zh/orders/lookup?orderNo=ord_clear_123456",
      current_path: "/zh/pay/wait?payment_recovery_token=secret",
      referrer: "https://fermatmind.com/zh/history/history-clear-123456",
      locale: "zh",
    });

    expect(payload).toMatchObject({
      source_path: "private_route:history",
      destination_path: "private_route:result",
      canonical_url: "private_route:share",
      page_location: "private_route:payment",
      landing_path: "private_route:orders",
      current_path: "private_route:pay",
      referrer: "private_route:history",
    });
    expect(JSON.stringify(payload)).not.toContain("/zh/history");
    expect(JSON.stringify(payload)).not.toContain("/zh/result");
    expect(JSON.stringify(payload)).not.toContain("/zh/orders");
    expect(JSON.stringify(payload)).not.toContain("/zh/share");
    expect(JSON.stringify(payload)).not.toContain("/zh/pay");
    expect(JSON.stringify(payload)).not.toContain("/zh/payment");
  });

  it("does not construct cleartext order numbers for purchase analytics in the order status client", () => {
    const source = read("app/(localized)/[locale]/orders/[orderNo]/OrdersClient.tsx");
    const purchasePayloadBlock = source.match(/trackEvent\("purchase_success", \{[\s\S]*?\n\s*\}\);/)?.[0] ?? "";

    expect(purchasePayloadBlock).toContain('trackEvent("purchase_success"');
    expect(purchasePayloadBlock).not.toContain("order_no: orderNo");
    expect(purchasePayloadBlock).not.toContain("transaction_id: orderNo");
    expect(purchasePayloadBlock).not.toContain("transaction_id:");
    expect(purchasePayloadBlock).toContain("transaction_id_hash: maskedOrder");
  });

  it("drops raw attempt identifiers while preserving safe attribution fields", () => {
    const payload = filterTrackingPayload(TRACKING_EVENTS.START_TEST, {
      slug: "mbti-personality-test-16-personality-types",
      test_slug: "mbti-personality-test-16-personality-types",
      scaleCode: "MBTI",
      attempt_id: "attempt-start-123456",
      attemptIdMasked: "abc123...xyz9",
      form_code: "mbti_144",
      entry_surface: "mbti_personality_detail",
      source_page_type: "personality_detail",
      target_action: "start_mbti_test_primary",
      landing_path: "/zh/personality/intj-a?utm_source=zhihu&utm_campaign=launch",
      current_path: "/zh/personality/intj-a?utm_source=zhihu&utm_campaign=launch",
      utm_source: "zhihu",
      utm_campaign: "launch",
      locale: "zh",
    });

    expect(payload).toMatchObject({
      attemptIdMasked: "abc123...xyz9",
      landing_path: "/zh/personality/intj-a?utm_source=zhihu&utm_campaign=launch",
      current_path: "/zh/personality/intj-a?utm_source=zhihu&utm_campaign=launch",
      utm_source: "zhihu",
      utm_campaign: "launch",
      locale: "zh",
    });
    expect(payload).not.toHaveProperty("attempt_id");
    expect(payload).not.toHaveProperty("session_id");
  });

  it("keeps consent denial as a hard stop before browser or network dispatch", async () => {
    const fetchMock = vi.fn();
    const gtagMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    Object.defineProperty(window, "gtag", {
      configurable: true,
      value: gtagMock,
    });

    await trackClientEvent({
      eventName: TRACKING_EVENTS.START_ATTEMPT,
      payload: { attempt_id: "attempt-start-123456", locale: "en" },
      anonymousId: "anon-session-1",
      path: "/en/tests/mbti/take?attempt_id=attempt-start-123456",
    });

    expect(gtagMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps observable funnel dispatch blocked before analytics consent is granted", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    const gtagMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    Object.defineProperty(window, "gtag", {
      configurable: true,
      value: gtagMock,
    });

    trackAnalyticsObservableFunnelEvent(TRACKING_EVENTS.START_ATTEMPT, {
      test_slug: "mbti-personality-test-16-personality-types",
      scale_code: "MBTI",
      email: "person@example.com",
      locale: "en",
    });

    await trackNetworkObservableFunnelEvent({
      eventName: TRACKING_EVENTS.START_ATTEMPT,
      payload: {
        test_slug: "holland-career-interest-test-riasec",
        scale_code: "RIASEC",
        form_code: "riasec_60",
        email: "person@example.com",
        locale: "zh",
      },
      anonymousId: "anon-session-1",
      path: "/zh/tests/holland-career-interest-test-riasec/take",
    });

    await trackNetworkObservableFunnelEvent({
      eventName: TRACKING_EVENTS.CREATE_ORDER,
      payload: {
        order_no: "ord_not_observable_without_consent",
        amount: 88,
        currency: "CNY",
        locale: "zh",
      },
      anonymousId: "anon-session-1",
      path: "/zh/orders/ord_not_observable_without_consent",
    });

    expect(gtagMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("allows network-visible funnel events after consent while filtering PII", async () => {
    grantAnalyticsConsent();
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    const gtagMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    Object.defineProperty(window, "gtag", {
      configurable: true,
      value: gtagMock,
    });

    await trackNetworkObservableFunnelEvent({
      eventName: TRACKING_EVENTS.START_ATTEMPT,
      payload: {
        test_slug: "holland-career-interest-test-riasec",
        scale_code: "RIASEC",
        form_code: "riasec_60",
        email: "person@example.com",
        locale: "zh",
      },
      anonymousId: "anon-session-1",
      path: "/zh/tests/holland-career-interest-test-riasec/take?payment_recovery_token=secret&utm_source=seo",
    });
    await trackNetworkObservableFunnelEvent({
      eventName: TRACKING_EVENTS.CREATE_ORDER,
      payload: {
        order_no: "ord_not_observable_without_consent",
        order_id: "ord_order_id_raw",
        transaction_id: "ord_transaction_id_raw",
        amount: 88,
        currency: "CNY",
        locale: "zh",
      },
      anonymousId: "anon-session-1",
      path: "/zh/orders/ord_not_observable_without_consent",
    });

    expect(gtagMock).toHaveBeenCalledWith("event", "test_start", expect.any(Object));
    expect(gtagMock).toHaveBeenCalledWith("event", "checkout_begin", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body ?? "{}")) as {
      eventName?: string;
      path?: string;
      payload?: Record<string, unknown>;
    };
    expect(body.eventName).toBe("start_test");
    expect(body.path).toBe(
      "/zh/tests/holland-career-interest-test-riasec/take?payment_recovery_token=redacted&utm_source=seo"
    );
    expect(body.payload).toMatchObject({
      test_slug: "holland-career-interest-test-riasec",
      scale_code: "RIASEC",
      form_code: "riasec_60",
      test_type: "holland",
      test_version: "riasec_60",
      locale: "zh",
    });
    expect(JSON.stringify(body)).not.toContain("person@example.com");
    const createOrderBody = JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body ?? "{}")) as {
      eventName?: string;
      path?: string;
      payload?: Record<string, unknown>;
    };
    expect(createOrderBody.eventName).toBe("begin_checkout");
    expect(createOrderBody.path).toBe("private_route:orders");
    expect(createOrderBody.payload).not.toHaveProperty("order_no");
    expect(createOrderBody.payload).not.toHaveProperty("order_id");
    expect(createOrderBody.payload).not.toHaveProperty("transaction_id");
    expect(JSON.stringify(createOrderBody)).not.toContain("person@example.com");
    expect(JSON.stringify(createOrderBody)).not.toContain("ord_not_observable_without_consent");
    expect(JSON.stringify(createOrderBody)).not.toContain("ord_order_id_raw");
    expect(JSON.stringify(createOrderBody)).not.toContain("ord_transaction_id_raw");
    expect(JSON.stringify(createOrderBody)).not.toContain("/zh/orders");
  });

  it("sends only route-family markers for non-history private tracking after analytics consent is granted", async () => {
    grantAnalyticsConsent();
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    const gtagMock = vi.fn();
    const hmtQueue: unknown[] = [];
    vi.stubGlobal("fetch", fetchMock);
    Object.defineProperty(window, "gtag", {
      configurable: true,
      value: gtagMock,
    });
    Object.defineProperty(window, "_hmt", {
      configurable: true,
      value: hmtQueue,
    });

    await trackClientEvent({
      eventName: TRACKING_EVENTS.PAYMENT_CONFIRMED,
      payload: {
        current_path: "/en/pay/wait?payment_recovery_token=recovery_secret&utm_source=ads",
        attemptIdMasked: "attempt-abcdef-123456",
        orderNoMasked: "ord_raw_1",
        provider: "alipay",
        locale: "en",
      },
      anonymousId: "anon-session-1",
      path: "/en/pay/wait?payment_recovery_token=recovery_secret&utm_source=ads",
    });

    expect(gtagMock).toHaveBeenCalledWith(
      "event",
      "payment_success",
      expect.objectContaining({
        current_path: "private_route:pay",
        attemptIdMasked: "attemp...3456",
        orderNoMasked: "ord_ra...aw_1",
      })
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body ?? "{}")) as {
      path?: string;
      payload?: Record<string, unknown>;
    };
    expect(body.path).toBe("private_route:pay");
    expect(body.payload?.current_path).toBe("private_route:pay");
    expect(JSON.stringify(body)).not.toContain("recovery_secret");
    expect(JSON.stringify(body)).not.toContain("/en/pay");
    expect(hmtQueue.join(" ")).not.toContain("/en/pay");
  });

  it("suppresses history route family browser and first-party dispatch after analytics consent is granted", async () => {
    grantAnalyticsConsent();
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    const gtagMock = vi.fn();
    const hmtQueue: unknown[] = [];
    vi.stubGlobal("fetch", fetchMock);
    Object.defineProperty(window, "gtag", {
      configurable: true,
      value: gtagMock,
    });
    Object.defineProperty(window, "_hmt", {
      configurable: true,
      value: hmtQueue,
    });

    await trackClientEvent({
      eventName: TRACKING_EVENTS.START_ATTEMPT,
      payload: {
        current_path: "/zh/history/history-clear-123456",
        landing_path: "/zh/history/history-clear-123456",
        referrer: "https://fermatmind.com/zh/history/history-clear-123456",
        locale: "zh",
      },
      anonymousId: "anon-session-1",
      path: "/zh/history/history-clear-123456",
    });

    expect(gtagMock).not.toHaveBeenCalled();
    expect(hmtQueue).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("suppresses private route family posts at the first-party tracking endpoint", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
    const previousEndpoint = process.env.ANALYTICS_ENDPOINT;
    process.env.ANALYTICS_ENDPOINT = "https://analytics.example.test/ingest";

    try {
      const response = await postTrackingEvent(new NextRequest("https://fermatmind.com/api/track", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          eventName: TRACKING_EVENTS.START_ATTEMPT,
          anonymousId: "anon-session-1",
          path: "/zh/history/history-clear-123456",
          payload: {
            current_path: "/zh/history/history-clear-123456",
            landing_path: "/zh/history/history-clear-123456",
            referrer: "https://fermatmind.com/zh/history/history-clear-123456",
            locale: "zh",
          },
        }),
      }));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toMatchObject({ ok: true, forwarded: 0, suppressed: true });
      expect(fetchMock).not.toHaveBeenCalled();
      expect(JSON.stringify(body)).not.toContain("history-clear-123456");
    } finally {
      if (previousEndpoint === undefined) {
        delete process.env.ANALYTICS_ENDPOINT;
      } else {
        process.env.ANALYTICS_ENDPOINT = previousEndpoint;
      }
      fetchMock.mockRestore();
    }
  });
});
