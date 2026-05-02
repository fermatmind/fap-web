import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  AnalyticsScripts,
  buildAnalyticsBootstrapScript,
  getAnalyticsScriptConfig,
} from "@/components/analytics/AnalyticsScripts";
import { mapTrackingEventToGa4Name } from "@/lib/tracking/client";
import { TRACKING_EVENTS } from "@/lib/tracking/events";

describe("analytics scripts contract", () => {
  const originalEnv = process.env;

  function renderAnalyticsScripts(env: Record<string, string | undefined>) {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_ANALYTICS_ENABLED: env.NEXT_PUBLIC_ANALYTICS_ENABLED,
      NEXT_PUBLIC_GA_MEASUREMENT_ID: env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      NEXT_PUBLIC_BAIDU_TONGJI_ID: env.NEXT_PUBLIC_BAIDU_TONGJI_ID,
    };

    try {
      return renderToStaticMarkup(createElement(AnalyticsScripts));
    } finally {
      process.env = originalEnv;
    }
  }

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

  it("renders a deterministic SSR bootstrap marker when analytics env IDs are set", () => {
    const html = renderAnalyticsScripts({
      NEXT_PUBLIC_ANALYTICS_ENABLED: "true",
      NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-TEST1234",
      NEXT_PUBLIC_BAIDU_TONGJI_ID: "BAIDU_TEST_ID",
    });

    expect(html).toContain('id="fm-analytics-bootstrap"');
    expect(html).toContain('data-analytics-bootstrap="true"');
    expect(html).toContain("G-TEST1234");
    expect(html).toContain("BAIDU_TEST_ID");
    expect(html).toContain("dataLayer");
    expect(html).toContain("gtag");
    expect(html).toContain("hm.baidu.com/hm.js");
    expect(html).toContain("_hmt");
  });

  it("does not render the SSR bootstrap when analytics is disabled or IDs are missing", () => {
    expect(
      renderAnalyticsScripts({
        NEXT_PUBLIC_ANALYTICS_ENABLED: "false",
        NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-TEST1234",
        NEXT_PUBLIC_BAIDU_TONGJI_ID: "BAIDU_TEST_ID",
      })
    ).toBe("");

    expect(
      renderAnalyticsScripts({
        NEXT_PUBLIC_ANALYTICS_ENABLED: "true",
        NEXT_PUBLIC_GA_MEASUREMENT_ID: "",
        NEXT_PUBLIC_BAIDU_TONGJI_ID: "",
      })
    ).toBe("");
  });

  it("keeps analytics mounted for root and localized layout trees", () => {
    for (const layoutPath of ["app/(root)/layout.tsx", "app/(localized)/[locale]/layout.tsx"]) {
      const source = readFileSync(layoutPath, "utf8");
      expect(source).toContain('from "@/components/analytics/AnalyticsScripts"');
      expect(source).toContain("<AnalyticsScripts />");
    }
  });

  it("maps purchase funnel events to GA4 ecommerce event names", () => {
    expect(mapTrackingEventToGa4Name(TRACKING_EVENTS.CREATE_ORDER)).toBe("begin_checkout");
    expect(mapTrackingEventToGa4Name(TRACKING_EVENTS.PAYMENT_CONFIRMED)).toBe("add_payment_info");
    expect(mapTrackingEventToGa4Name(TRACKING_EVENTS.PURCHASE_SUCCESS)).toBe("purchase");
    expect(mapTrackingEventToGa4Name(TRACKING_EVENTS.PAY_SUCCESS)).toBe("purchase");
  });
});
