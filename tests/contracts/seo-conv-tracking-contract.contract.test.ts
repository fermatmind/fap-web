import { afterEach, describe, expect, it, vi } from "vitest";
import {
  SEO_CONVERSION_DIMENSION_FIELDS,
  buildSeoConversionAttributionPayload,
  getOrCreateSeoConversionSessionId,
  normalizeSeoConversionSessionId,
} from "@/lib/tracking/attribution";
import {
  SEO_CONVERSION_FUNNEL_EVENTS,
  TRACKING_EVENTS,
  filterTrackingPayload,
  isSeoConversionFunnelEvent,
} from "@/lib/tracking/events";
import {
  PRIVATE_PUBLIC_ANALYTICS_ROUTE_FAMILIES,
  sanitizeAnalyticsTrackingUrl,
  shouldHardStopPublicAnalyticsForUrl,
  shouldSuppressAnalyticsForUrl,
} from "@/lib/tracking/privacy";
import { isSeoConvTracking01AllowedFile } from "./helpers/currentPrScope";

afterEach(() => {
  window.sessionStorage.clear();
  vi.restoreAllMocks();
});

describe("SEO-CONV-TRACKING-01 tracking contract", () => {
  it("freezes the five-event SEO conversion taxonomy separately from commerce events", () => {
    expect(SEO_CONVERSION_FUNNEL_EVENTS).toEqual([
      "landing_pv",
      "article_to_test_click",
      "start_test",
      "complete_test",
      "view_result",
    ]);
    expect(SEO_CONVERSION_FUNNEL_EVENTS).not.toContain("begin_checkout");
    expect(SEO_CONVERSION_FUNNEL_EVENTS).not.toContain("purchase_success");
    expect(SEO_CONVERSION_FUNNEL_EVENTS.every((eventName) => isSeoConversionFunnelEvent(eventName))).toBe(true);
  });

  it("declares the safe SEO conversion dimensions required by the read model", () => {
    expect(SEO_CONVERSION_DIMENSION_FIELDS).toEqual([
      "url",
      "lang",
      "page_type",
      "source_url",
      "source_article",
      "target_test",
      "scale_id",
      "form_id",
      "session_id",
      "referrer",
    ]);
  });

  it("allows only safe session ids and never uses raw anonymous, order, result, or attempt identifiers", () => {
    expect(normalizeSeoConversionSessionId("seo_sess_ABCDEFGHIJKLMNOPQRSTUVWXYZ")).toBe(
      "seo_sess_ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    );
    expect(normalizeSeoConversionSessionId("anon-session-1")).toBeUndefined();
    expect(normalizeSeoConversionSessionId("attempt_raw_123456")).toBeUndefined();
    expect(normalizeSeoConversionSessionId("ord_raw_123456")).toBeUndefined();

    const payload = filterTrackingPayload(TRACKING_EVENTS.START_TEST, {
      session_id: "seo_sess_ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      url: "/en/articles/mbti-career-path?utm_source=google&email=person%40example.com",
      lang: "en",
      page_type: "article_detail",
      source_url: "/en/articles/mbti-career-path?token=secret&utm_campaign=launch",
      source_article: "mbti-career-path",
      target_test: "mbti-personality-test-16-personality-types",
      scale_id: "mbti",
      form_id: "mbti_93",
      referrer: "https://www.google.com/search?q=mbti&session_id=secret-session",
      attempt_id: "attempt_raw_123456",
      order_no: "ord_raw_123456",
      email: "person@example.com",
    });

    expect(payload).toMatchObject({
      session_id: "seo_sess_ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      url: "/en/articles/mbti-career-path?utm_source=google&email=redacted",
      lang: "en",
      page_type: "article_detail",
      source_url: "/en/articles/mbti-career-path?token=redacted&utm_campaign=launch",
      source_article: "mbti-career-path",
      target_test: "mbti-personality-test-16-personality-types",
      scale_id: "mbti",
      form_id: "mbti_93",
      referrer: "https://www.google.com/search?q=mbti&session_id=redacted",
    });
    expect(payload).not.toHaveProperty("attempt_id");
    expect(payload).not.toHaveProperty("order_no");
    expect(JSON.stringify(payload)).not.toContain("person@example.com");
    expect(JSON.stringify(payload)).not.toContain("secret-session");
  });

  it("drops unsafe session ids for SEO conversion events and for non-SEO conversion events", () => {
    expect(filterTrackingPayload(TRACKING_EVENTS.LANDING_PV, {
      session_id: "attempt_raw_123456",
      url: "/en/tests/mbti-personality-test-16-personality-types",
    })).toEqual({
      url: "/en/tests/mbti-personality-test-16-personality-types",
    });
    expect(filterTrackingPayload(TRACKING_EVENTS.BEGIN_CHECKOUT, {
      session_id: "seo_sess_ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      url: "/en/tests/mbti-personality-test-16-personality-types",
    })).not.toHaveProperty("session_id");
  });

  it("builds a session-scoped SEO conversion attribution payload without localStorage", () => {
    const sessionId = getOrCreateSeoConversionSessionId();
    expect(sessionId).toMatch(/^seo_sess_[A-Za-z0-9_-]{16,80}$/);
    expect(window.localStorage.getItem("fm_seo_conversion_session_v1")).toBeNull();
    expect(window.sessionStorage.getItem("fm_seo_conversion_session_v1")).toBe(sessionId);

    expect(buildSeoConversionAttributionPayload({
      url: "/zh/articles/riasec-careers?name=Rainie&session_id=raw",
      lang: "zh",
      pageType: "article_detail",
      sourceUrl: "/zh/articles/riasec-careers?access_token=secret",
      sourceArticle: "riasec-careers",
      targetTest: "holland-career-interest-test-riasec",
      scaleId: "riasec",
      formId: "riasec_60",
      sessionId,
      referrer: "https://www.baidu.com/s?wd=riasec&state=secret",
    })).toMatchObject({
      url: "/zh/articles/riasec-careers?name=redacted&session_id=redacted",
      lang: "zh",
      page_type: "article_detail",
      source_url: "/zh/articles/riasec-careers?access_token=redacted",
      source_article: "riasec-careers",
      target_test: "holland-career-interest-test-riasec",
      scale_id: "riasec",
      form_id: "riasec_60",
      session_id: sessionId,
      referrer: "https://www.baidu.com/s?wd=riasec&state=redacted",
    });
  });

  it("hard-stops public analytics for private result order share pay payment and history paths", () => {
    expect(PRIVATE_PUBLIC_ANALYTICS_ROUTE_FAMILIES).toEqual([
      "history",
      "result",
      "orders",
      "share",
      "pay",
      "payment",
    ]);

    for (const privatePath of [
      "/zh/history/history-clear-123456",
      "/zh/result/attempt-clear-123456",
      "/zh/orders/ord_clear_123456",
      "/zh/share/share-clear-123456",
      "/zh/pay/wait?order_no=ord_clear_123456",
      "/zh/payment/success?payment_id=pay_clear_123456",
    ]) {
      expect(shouldHardStopPublicAnalyticsForUrl(privatePath)).toBe(true);
      expect(shouldSuppressAnalyticsForUrl(privatePath)).toBe(true);
      expect(sanitizeAnalyticsTrackingUrl(privatePath)).toMatch(/^private_route:/);
    }

    expect(shouldHardStopPublicAnalyticsForUrl("/zh/tests/holland-career-interest-test-riasec?token=secret")).toBe(false);
    expect(sanitizeAnalyticsTrackingUrl("/zh/tests/holland-career-interest-test-riasec?token=secret")).toBe(
      "/zh/tests/holland-career-interest-test-riasec?token=redacted"
    );
  });

  it("keeps the PR scope limited to tracking contract files and docs/codex metadata", () => {
    for (const file of [
      "lib/tracking/events.ts",
      "lib/tracking/privacy.ts",
      "lib/tracking/attribution.ts",
      "tests/contracts/seo-conv-tracking-contract.contract.test.ts",
      "tests/contracts/helpers/currentPrScope.ts",
      "docs/codex/pr-train.yaml",
      "docs/codex/pr-train-state.json",
    ]) {
      expect(isSeoConvTracking01AllowedFile(file)).toBe(true);
    }

    expect(isSeoConvTracking01AllowedFile("lib/analytics.ts")).toBe(false);
    expect(isSeoConvTracking01AllowedFile("app/api/track/route.ts")).toBe(false);
  });
});
