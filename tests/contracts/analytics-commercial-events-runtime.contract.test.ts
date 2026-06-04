import { describe, expect, it } from "vitest";
import {
  buildBaiduTongjiConversionEvent,
  mapTrackingEventToGa4Name,
} from "@/lib/tracking/client";
import {
  STANDARD_COMMERCIAL_EVENTS,
  TRACKING_EVENTS,
  filterTrackingPayload,
  isTrackingEvent,
  normalizeCommercialEventName,
  normalizeTrackingEventName,
} from "@/lib/tracking/events";

describe("analytics commercial events runtime contract", () => {
  it("registers every standard commercial and safety event", () => {
    expect(STANDARD_COMMERCIAL_EVENTS).toEqual([
      "landing_pv",
      "article_to_test_click",
      "start_test",
      "complete_test",
      "view_result",
      "click_deep_report",
      "begin_checkout",
      "purchase_success",
      "report_unlock",
      "report_ready",
      "private_url_seen",
    ]);
    expect(STANDARD_COMMERCIAL_EVENTS.every(isTrackingEvent)).toBe(true);
  });

  it("normalizes legacy commercial aliases without double-sending standard events", () => {
    expect(normalizeTrackingEventName(TRACKING_EVENTS.VIEW_LANDING)).toBe(TRACKING_EVENTS.LANDING_PV);
    expect(normalizeTrackingEventName(TRACKING_EVENTS.LANDING_VIEW)).toBe(TRACKING_EVENTS.LANDING_PV);
    expect(normalizeTrackingEventName(TRACKING_EVENTS.START_ATTEMPT)).toBe(TRACKING_EVENTS.START_TEST);
    expect(normalizeTrackingEventName(TRACKING_EVENTS.SUBMIT_ATTEMPT)).toBe(TRACKING_EVENTS.COMPLETE_TEST);
    expect(normalizeTrackingEventName(TRACKING_EVENTS.CLICK_UNLOCK)).toBe(TRACKING_EVENTS.CLICK_DEEP_REPORT);
    expect(normalizeTrackingEventName(TRACKING_EVENTS.CREATE_ORDER)).toBe(TRACKING_EVENTS.BEGIN_CHECKOUT);
    expect(normalizeTrackingEventName(TRACKING_EVENTS.CHECKOUT_START)).toBe(TRACKING_EVENTS.BEGIN_CHECKOUT);
    expect(normalizeTrackingEventName(TRACKING_EVENTS.PURCHASE)).toBe(TRACKING_EVENTS.PURCHASE_SUCCESS);
    expect(normalizeTrackingEventName(TRACKING_EVENTS.PAY_SUCCESS)).toBe(TRACKING_EVENTS.PURCHASE_SUCCESS);
    expect(normalizeTrackingEventName(TRACKING_EVENTS.UNLOCK_SUCCESS)).toBe(TRACKING_EVENTS.REPORT_UNLOCK);
    expect(normalizeTrackingEventName(TRACKING_EVENTS.REPORT_LOADED)).toBe(TRACKING_EVENTS.REPORT_READY);

    expect(normalizeCommercialEventName(TRACKING_EVENTS.ARTICLE_TO_TEST_CLICK)).toBe(
      TRACKING_EVENTS.ARTICLE_TO_TEST_CLICK
    );
    expect(normalizeCommercialEventName(TRACKING_EVENTS.START_ATTEMPT)).toBe(TRACKING_EVENTS.START_TEST);
  });

  it("keeps content intent, checkout begin, and purchase success semantically separate", () => {
    expect(normalizeTrackingEventName(TRACKING_EVENTS.ARTICLE_TO_TEST_CLICK)).toBe(
      TRACKING_EVENTS.ARTICLE_TO_TEST_CLICK
    );
    expect(normalizeTrackingEventName(TRACKING_EVENTS.CREATE_ORDER)).toBe(TRACKING_EVENTS.BEGIN_CHECKOUT);
    expect(normalizeTrackingEventName(TRACKING_EVENTS.BEGIN_CHECKOUT)).not.toBe(
      TRACKING_EVENTS.PURCHASE_SUCCESS
    );
  });

  it("filters standard commercial payloads to safe dashboard fields", () => {
    const payload = filterTrackingPayload(TRACKING_EVENTS.BEGIN_CHECKOUT, {
      event_version: "commercial.v1",
      locale: "zh",
      route_family: "test_result",
      canonical_url: "https://fermatmind.com/zh/tests/mbti-personality-test-16-personality-types",
      test_slug: "mbti-personality-test-16-personality-types",
      test_type: "mbti",
      attemptIdMasked: "attempt...1234",
      orderNoMasked: "ord_12...3456",
      orderNo: "ord_raw_should_drop",
      order_no: "ord_raw_should_drop",
      order_id: "ord_raw_should_drop",
      transaction_id: "txn_raw_should_drop",
      raw_attemptId: "attempt_raw_should_drop",
      raw_resultId: "result_raw_should_drop",
      token: "secret",
      private_url: "/zh/orders/ord_raw_should_drop",
      full_order_url: "https://fermatmind.com/zh/orders/ord_raw_should_drop",
      session_id: "session-raw",
      value: 19.9,
      currency: "CNY",
      payment_provider: "alipay",
    });

    expect(payload).toMatchObject({
      event_version: "commercial.v1",
      locale: "zh",
      route_family: "test_result",
      test_slug: "mbti-personality-test-16-personality-types",
      test_type: "mbti",
      attemptIdMasked: "attempt...1234",
      orderNoMasked: "ord_12...3456",
      value: 19.9,
      currency: "CNY",
      payment_provider: "alipay",
    });
    expect(payload).not.toHaveProperty("orderNo");
    expect(payload).not.toHaveProperty("order_no");
    expect(payload).not.toHaveProperty("order_id");
    expect(payload).not.toHaveProperty("transaction_id");
    expect(payload).not.toHaveProperty("raw_attemptId");
    expect(payload).not.toHaveProperty("raw_resultId");
    expect(payload).not.toHaveProperty("token");
    expect(payload).not.toHaveProperty("private_url");
    expect(payload).not.toHaveProperty("full_order_url");
    expect(payload).not.toHaveProperty("session_id");
  });

  it("maps standard commercial events to GA4 and Baidu observation names", () => {
    expect(mapTrackingEventToGa4Name(TRACKING_EVENTS.START_TEST)).toBe("test_start");
    expect(mapTrackingEventToGa4Name(TRACKING_EVENTS.COMPLETE_TEST)).toBe("test_complete");
    expect(mapTrackingEventToGa4Name(TRACKING_EVENTS.CLICK_DEEP_REPORT)).toBe("report_click");
    expect(mapTrackingEventToGa4Name(TRACKING_EVENTS.BEGIN_CHECKOUT)).toBe("checkout_begin");
    expect(mapTrackingEventToGa4Name(TRACKING_EVENTS.PURCHASE_SUCCESS)).toBe("payment_success");
    expect(mapTrackingEventToGa4Name(TRACKING_EVENTS.REPORT_UNLOCK)).toBe("report_unlock");
    expect(mapTrackingEventToGa4Name(TRACKING_EVENTS.REPORT_READY)).toBe("report_ready");
    expect(mapTrackingEventToGa4Name(TRACKING_EVENTS.PRIVATE_URL_SEEN)).toBe("private_url_seen");

    expect(buildBaiduTongjiConversionEvent(TRACKING_EVENTS.COMPLETE_TEST, { test_type: "mbti" })).toEqual({
      category: "test",
      action: "complete",
      label: "mbti",
    });
    expect(buildBaiduTongjiConversionEvent(TRACKING_EVENTS.BEGIN_CHECKOUT, { test_type: "mbti" })).toEqual({
      category: "checkout",
      action: "begin",
      label: "mbti",
    });
    expect(buildBaiduTongjiConversionEvent(TRACKING_EVENTS.PURCHASE_SUCCESS, { test_type: "mbti" })).toEqual({
      category: "purchase",
      action: "success",
      label: "mbti",
    });
  });
});
