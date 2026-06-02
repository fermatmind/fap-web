import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { trackObservableFunnelEvent as trackAnalyticsObservableFunnelEvent } from "@/lib/analytics";
import { trackClientEvent, trackNetworkObservableFunnelEvent } from "@/lib/tracking/client";
import { TRACKING_EVENTS, filterTrackingPayload } from "@/lib/tracking/events";
import { sanitizeTrackingUrl } from "@/lib/tracking/privacy";

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
      current_path: "/en/pay/wait?order_no=redacted&payment_recovery_token=redacted&utm_source=ads",
      landing_path: "/en/orders/redacted?checkout_url=redacted&utm_medium=cpc",
      referrer: "https://search.example/en/result/redacted?authorization=redacted&utm_campaign=launch",
      orderNoMasked: "ord_ra...aw_1",
      attemptIdMasked: "attemp...3456",
      provider: "alipay",
      locale: "en",
    });
    expect(JSON.stringify(payload)).not.toContain("recovery_secret");
    expect(JSON.stringify(payload)).not.toContain("Bearer%20secret");
    expect(JSON.stringify(payload)).not.toContain("/ord_raw_1");
  });

  it("keeps order lookup route shape while redacting order identifiers from page locations", () => {
    expect(sanitizeTrackingUrl("/zh/orders/lookup?orderNo=ord_clear_123456&utm_source=wechat")).toBe(
      "/zh/orders/lookup?orderNo=redacted&utm_source=wechat"
    );
    expect(sanitizeTrackingUrl("/zh/orders/ord_clear_123456?payment_recovery_token=secret")).toBe(
      "/zh/orders/redacted?payment_recovery_token=redacted"
    );
    expect(sanitizeTrackingUrl("/zh/result/attempt-clear-123456?report_url=https%3A%2F%2Fevil.example%2Fprivate")).toBe(
      "/zh/result/redacted?report_url=redacted"
    );
  });

  it("does not construct cleartext order numbers for purchase analytics in the order status client", () => {
    const source = read("app/(localized)/[locale]/orders/[orderNo]/OrdersClient.tsx");
    const purchasePayloadBlock = source.match(/trackEvent\("purchase_success", \{[\s\S]*?\n\s*\}\);/)?.[0] ?? "";

    expect(purchasePayloadBlock).toContain('trackEvent("purchase_success"');
    expect(purchasePayloadBlock).not.toContain("order_no: orderNo");
    expect(purchasePayloadBlock).not.toContain("transaction_id: orderNo");
    expect(purchasePayloadBlock).toContain("transaction_id: maskedOrder");
  });

  it("masks full attempt identifiers while preserving safe attribution fields", () => {
    const payload = filterTrackingPayload(TRACKING_EVENTS.START_ATTEMPT, {
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
      session_id: "anon-session-1",
      locale: "zh",
    });

    expect(payload).toMatchObject({
      attempt_id: "attemp...3456",
      attemptIdMasked: "abc123...xyz9",
      landing_path: "/zh/personality/intj-a?utm_source=zhihu&utm_campaign=launch",
      current_path: "/zh/personality/intj-a?utm_source=zhihu&utm_campaign=launch",
      utm_source: "zhihu",
      utm_campaign: "launch",
      session_id: "anon-session-1",
      locale: "zh",
    });
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
    expect(gtagMock).toHaveBeenCalledWith("event", "order_created", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body ?? "{}")) as {
      eventName?: string;
      path?: string;
      payload?: Record<string, unknown>;
    };
    expect(body.eventName).toBe("start_attempt");
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
    expect(createOrderBody.eventName).toBe("create_order");
    expect(createOrderBody.path).toBe("/zh/orders/redacted");
    expect(createOrderBody.payload?.order_no).toBe("ord_no...sent");
    expect(createOrderBody.payload?.order_id).toBe("ord_or..._raw");
    expect(createOrderBody.payload?.transaction_id).toBe("ord_tr..._raw");
    expect(JSON.stringify(createOrderBody)).not.toContain("person@example.com");
    expect(JSON.stringify(createOrderBody)).not.toContain("ord_not_observable_without_consent");
    expect(JSON.stringify(createOrderBody)).not.toContain("ord_order_id_raw");
    expect(JSON.stringify(createOrderBody)).not.toContain("ord_transaction_id_raw");
  });

  it("sends only redacted path and payload values after analytics consent is granted", async () => {
    grantAnalyticsConsent();
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    const gtagMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    Object.defineProperty(window, "gtag", {
      configurable: true,
      value: gtagMock,
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
        current_path: "/en/pay/wait?payment_recovery_token=redacted&utm_source=ads",
        attemptIdMasked: "attemp...3456",
        orderNoMasked: "ord_ra...aw_1",
      })
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body ?? "{}")) as {
      path?: string;
      payload?: Record<string, unknown>;
    };
    expect(body.path).toBe("/en/pay/wait?payment_recovery_token=redacted&utm_source=ads");
    expect(body.payload?.current_path).toBe("/en/pay/wait?payment_recovery_token=redacted&utm_source=ads");
    expect(JSON.stringify(body)).not.toContain("recovery_secret");
  });
});
