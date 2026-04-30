import { describe, expect, it } from "vitest";
import {
  buildAnalyticsBootstrapScript,
  getAnalyticsScriptConfig,
} from "@/components/analytics/AnalyticsScripts";
import { mapTrackingEventToGa4Name } from "@/lib/tracking/client";
import { TRACKING_EVENTS } from "@/lib/tracking/events";

describe("analytics scripts contract", () => {
  it("does not expose GA4 or Baidu scripts when analytics env is missing", () => {
    expect(
      getAnalyticsScriptConfig({
        NEXT_PUBLIC_ANALYTICS_ENABLED: "true",
      })
    ).toEqual({
      enabled: true,
      gaMeasurementId: "",
      baiduTongjiId: "",
    });
  });

  it("renders a consent-aware GA4 and Baidu bootstrap when env IDs are set", () => {
    const script = buildAnalyticsBootstrapScript({
      enabled: true,
      gaMeasurementId: "G-TEST1234",
      baiduTongjiId: "BAIDU_TEST_ID",
    });

    expect(script).toContain("G-TEST1234");
    expect(script).toContain("BAIDU_TEST_ID");
    expect(script).toContain("dataLayer");
    expect(script).toContain("gtag");
    expect(script).toContain("googletagmanager.com/gtag/js");
    expect(script).toContain("_hmt");
    expect(script).toContain("hm.baidu.com/hm.js");
    expect(script).toContain("fm:analytics-consent-updated");
    expect(script).toContain('parsed.analytics === "granted"');
  });

  it("maps purchase funnel events to GA4 ecommerce event names", () => {
    expect(mapTrackingEventToGa4Name(TRACKING_EVENTS.CREATE_ORDER)).toBe("begin_checkout");
    expect(mapTrackingEventToGa4Name(TRACKING_EVENTS.PAYMENT_CONFIRMED)).toBe("add_payment_info");
    expect(mapTrackingEventToGa4Name(TRACKING_EVENTS.PURCHASE_SUCCESS)).toBe("purchase");
    expect(mapTrackingEventToGa4Name(TRACKING_EVENTS.PAY_SUCCESS)).toBe("purchase");
  });
});
