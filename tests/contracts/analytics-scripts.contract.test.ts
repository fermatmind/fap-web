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
import {
  hasSensitiveAnalyticsQuery,
  isNoindexAnalyticsSuppressedPath,
  isPrivateAnalyticsSuppressedPath,
  shouldLoadBrowserAnalyticsScripts,
} from "@/lib/tracking/browserAnalyticsSuppression";
import {
  isBlockedAnalyticsRoute,
  isPollutingAnalyticsReferrer,
  shouldAllowAnalyticsRuntime,
} from "@/lib/tracking/internalTraffic";

describe("analytics scripts contract", () => {
  const originalEnv = process.env;

  function countOccurrences(value: string, needle: string): number {
    return value.split(needle).length - 1;
  }

  function renderAnalyticsScripts(env: Record<string, string | undefined>) {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_ANALYTICS_ENABLED: env.NEXT_PUBLIC_ANALYTICS_ENABLED,
      NEXT_PUBLIC_GA_MEASUREMENT_ID: env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID: env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID,
      NEXT_PUBLIC_BAIDU_TONGJI_ID: env.NEXT_PUBLIC_BAIDU_TONGJI_ID,
    };

    try {
      return renderToStaticMarkup(createElement(AnalyticsScripts));
    } finally {
      process.env = originalEnv;
    }
  }

  function buildTestBootstrapScript(config: {
    gaMeasurementId?: string;
    googleAdsConversionId?: string;
    baiduTongjiId?: string;
    deploymentEnvironment?: string;
    allowedHosts?: string[];
  }) {
    return buildAnalyticsBootstrapScript({
      enabled: true,
      gaMeasurementId: config.gaMeasurementId ?? "",
      googleAdsConversionId: config.googleAdsConversionId ?? "",
      baiduTongjiId: config.baiduTongjiId ?? "",
      deploymentEnvironment: config.deploymentEnvironment ?? "production",
      allowedHosts: config.allowedHosts ?? ["fermatmind.com", "www.fermatmind.com"],
    });
  }

  it("does not expose GA4 or Baidu scripts when analytics env is missing", () => {
    expect(
      getAnalyticsScriptConfig({
        NEXT_PUBLIC_ANALYTICS_ENABLED: "true",
      })
    ).toEqual({
      enabled: true,
      gaMeasurementId: "",
      googleAdsConversionId: "",
      baiduTongjiId: "",
      deploymentEnvironment: "unknown",
      allowedHosts: ["fermatmind.com", "www.fermatmind.com"],
    });
  });

  it("renders a consent-aware GA4 and Baidu bootstrap when env IDs are set", () => {
    const script = buildTestBootstrapScript({
      gaMeasurementId: "G-TEST1234",
      googleAdsConversionId: "AW-TEST1234",
      baiduTongjiId: "BAIDU_TEST_ID",
    });

    expect(script).toContain("G-TEST1234");
    expect(script).toContain("AW-TEST1234");
    expect(script).toContain("BAIDU_TEST_ID");
    expect(script).toContain("dataLayer");
    expect(script).toContain('"g" + "tag"');
    expect(script).toContain('"_" + "hmt"');
    expect(script).toContain('"google" + "tagmanager.com/" + "g" + "tag/js?id="');
    expect(script).toContain('["hm", "baidu", "com"].join(".")');
    expect(script).toContain("fm:analytics-consent-updated");
    expect(script).toContain('parsed.analytics === "granted"');
    expect(script).toContain("privateRouteSegments");
    expect(script).toContain("sensitiveQueryKeys");
    expect(script).toContain("hasSensitiveQuery(window.location.search)");
    expect(script).toContain('deploymentEnvironment !== "production"');
    expect(script).toContain('allowedHosts.indexOf(hostname) === -1');
    expect(script).toContain('referrerHostname === "tongji.baidu.com"');
    expect(script).not.toContain("googletagmanager.com/gtag/js");
    expect(script).not.toContain("hm.baidu.com");
    expect(script).not.toContain("_hmt");
    expect(script).not.toContain("window.gtag");
    expect(script).not.toContain("GTM-");
    expect(script).not.toContain("bp.js");
  });

  it("configures GA4 and Google Ads destinations while loading gtag once", () => {
    const script = buildTestBootstrapScript({
      gaMeasurementId: "G-TEST1234",
      googleAdsConversionId: "AW-TEST1234",
      baiduTongjiId: "",
    });

    expect(countOccurrences(script, '"google" + "tagmanager.com/" + "g" + "tag/js?id="')).toBe(1);
    expect(script).toContain('window[tagFnName]("config", gaMeasurementId, { send_page_view: false });');
    expect(script).toContain('window[tagFnName]("config", googleAdsConversionId, { send_page_view: false });');
    expect(script).not.toContain('window[tagFnName]("config", googleAdsConversionId);');
    expect(script).not.toContain("googletagmanager.com/gtm.js");
  });

  it("supports Google Ads without a GA4 measurement ID", () => {
    const html = renderAnalyticsScripts({
      NEXT_PUBLIC_ANALYTICS_ENABLED: "true",
      NEXT_PUBLIC_GA_MEASUREMENT_ID: "",
      NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID: "AW-TEST1234",
      NEXT_PUBLIC_BAIDU_TONGJI_ID: "",
    });

    expect(html).toContain('id="fm-analytics-bootstrap"');
    expect(html).toContain("AW-TEST1234");
    expect(html).toContain("tagmanager.com/");
    expect(html).not.toContain("googletagmanager.com/gtag/js");
    expect(html).toContain('var baiduTongjiId = "";');
  });

  it("renders a deterministic SSR bootstrap marker when analytics env IDs are set", () => {
    const html = renderAnalyticsScripts({
      NEXT_PUBLIC_ANALYTICS_ENABLED: "true",
      NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-TEST1234",
      NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID: "",
      NEXT_PUBLIC_BAIDU_TONGJI_ID: "0123456789abcdef",
    });

    expect(html).toContain('id="fm-analytics-bootstrap"');
    expect(html).toContain('data-analytics-bootstrap="true"');
    expect(html).toContain("G-TEST1234");
    expect(html).toContain("0123456789abcdef");
    expect(html).toContain("dataLayer");
    expect(html).toContain("tagmanager.com/");
    expect(html).not.toContain("googletagmanager.com/gtag/js");
    expect(html).not.toContain("hm.baidu.com");
    expect(html).not.toContain("_hmt");
    expect(html).not.toContain("window.gtag");
  });

  it("does not render the SSR bootstrap when analytics is disabled or IDs are missing", () => {
    expect(
      renderAnalyticsScripts({
        NEXT_PUBLIC_ANALYTICS_ENABLED: "false",
        NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-TEST1234",
        NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID: "AW-TEST1234",
        NEXT_PUBLIC_BAIDU_TONGJI_ID: "BAIDU_TEST_ID",
      })
    ).toBe("");

    expect(
      renderAnalyticsScripts({
        NEXT_PUBLIC_ANALYTICS_ENABLED: "true",
        NEXT_PUBLIC_GA_MEASUREMENT_ID: "",
        NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID: "",
        NEXT_PUBLIC_BAIDU_TONGJI_ID: "",
      })
    ).toBe("");
  });

  it("blocks production analytics runtime on local, preview, dashboard, and analytics-dashboard referrers", () => {
    expect(
      shouldAllowAnalyticsRuntime({
        analyticsEnabled: true,
        deploymentEnvironment: "production",
        hostname: "fermatmind.com",
        pathname: "/zh/tests/mbti-personality-test-16-personality-types",
        referrer: "https://www.baidu.com/s?wd=mbti",
      })
    ).toEqual({ allowed: true, reason: "allowed" });

    expect(
      shouldAllowAnalyticsRuntime({
        analyticsEnabled: true,
        deploymentEnvironment: "development",
        hostname: "localhost",
        pathname: "/zh/tests/mbti-personality-test-16-personality-types",
      })
    ).toMatchObject({ allowed: false, reason: "non_production_environment" });

    expect(
      shouldAllowAnalyticsRuntime({
        analyticsEnabled: true,
        deploymentEnvironment: "production",
        hostname: "preview-fermatmind.vercel.app",
        pathname: "/zh/tests/mbti-personality-test-16-personality-types",
      })
    ).toMatchObject({ allowed: false, reason: "host_not_allowed" });

    expect(
      shouldAllowAnalyticsRuntime({
        analyticsEnabled: true,
        deploymentEnvironment: "production",
        hostname: "fermatmind.com",
        pathname: "/zh/dashboard",
      })
    ).toMatchObject({ allowed: false, reason: "blocked_route" });

    expect(
      shouldAllowAnalyticsRuntime({
        analyticsEnabled: true,
        deploymentEnvironment: "production",
        hostname: "fermatmind.com",
        pathname: "/zh/tests/mbti-personality-test-16-personality-types",
        referrer: "https://tongji.baidu.com/web/welcome/login",
      })
    ).toMatchObject({ allowed: false, reason: "polluting_referrer" });

    expect(
      shouldAllowAnalyticsRuntime({
        analyticsEnabled: true,
        deploymentEnvironment: "production",
        hostname: "fermatmind.com",
        pathname: "/zh/orders/lookup",
        search: "?orderNo=SYNTHETIC_DO_NOT_USE",
      })
    ).toMatchObject({ allowed: false, reason: "private_route" });
  });

  it("suppresses third-party browser analytics scripts on private route families with locale prefixes", () => {
    const privatePaths = [
      "/result/SYNTHETIC_DO_NOT_USE",
      "/orders/lookup",
      "/share/SYNTHETIC_DO_NOT_USE",
      "/pay/checkout",
      "/payment/success",
      "/history",
      "/zh/result/SYNTHETIC_DO_NOT_USE",
      "/zh/orders/lookup",
      "/zh/share/SYNTHETIC_DO_NOT_USE",
      "/en/result/SYNTHETIC_DO_NOT_USE",
      "/en/orders/lookup",
      "/en/share/SYNTHETIC_DO_NOT_USE",
    ];

    for (const pathname of privatePaths) {
      expect(isPrivateAnalyticsSuppressedPath(pathname)).toBe(true);
      expect(isNoindexAnalyticsSuppressedPath(pathname)).toBe(true);
      expect(
        shouldLoadBrowserAnalyticsScripts({
          analyticsEnabled: true,
          env: "production",
          host: "fermatmind.com",
          pathname,
          search: "",
          consent: true,
        })
      ).toEqual({ allowed: false, reason: "private_route" });
    }
  });

  it("suppresses third-party browser analytics scripts when sensitive query keys are present", () => {
    for (const key of [
      "orderNo",
      "order_no",
      "orderId",
      "transaction_id",
      "payment_id",
      "resultId",
      "attemptId",
      "reportId",
      "token",
    ]) {
      const search = `?utm_source=contract&${key}=SYNTHETIC_DO_NOT_USE`;
      expect(hasSensitiveAnalyticsQuery(search)).toBe(true);
      expect(
        shouldLoadBrowserAnalyticsScripts({
          analyticsEnabled: true,
          env: "production",
          host: "fermatmind.com",
          pathname: "/zh/tests/mbti-personality-test-16-personality-types",
          search,
          consent: true,
        })
      ).toEqual({ allowed: false, reason: "sensitive_query" });
    }
  });

  it("allows public indexable routes to load browser analytics scripts when consent and env permit it", () => {
    for (const pathname of [
      "/",
      "/zh",
      "/zh/tests",
      "/zh/tests/mbti-personality-test-16-personality-types",
      "/zh/tests/holland-career-interest-test-riasec",
      "/zh/articles",
      "/zh/personality",
    ]) {
      expect(
        shouldLoadBrowserAnalyticsScripts({
          analyticsEnabled: true,
          env: "production",
          host: "fermatmind.com",
          pathname,
          search: "",
          consent: true,
        })
      ).toEqual({ allowed: true, reason: "allowed" });
    }
  });

  it("keeps private synthetic HTML free of third-party pageview loader literals and raw synthetic ids", () => {
    const html = renderAnalyticsScripts({
      NEXT_PUBLIC_ANALYTICS_ENABLED: "true",
      NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-TEST1234",
      NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID: "AW-TEST1234",
      NEXT_PUBLIC_BAIDU_TONGJI_ID: "0123456789abcdef",
    });

    for (const syntheticUrl of [
      { pathname: "/zh/orders/lookup", search: "?orderNo=SYNTHETIC_DO_NOT_USE" },
      { pathname: "/zh/result/SYNTHETIC_DO_NOT_USE", search: "" },
      { pathname: "/zh/share/SYNTHETIC_DO_NOT_USE", search: "" },
    ]) {
      expect(
        shouldLoadBrowserAnalyticsScripts({
          analyticsEnabled: true,
          env: "production",
          host: "fermatmind.com",
          pathname: syntheticUrl.pathname,
          search: syntheticUrl.search,
          consent: true,
        }).allowed
      ).toBe(false);
    }

    expect(html).not.toContain("hm.baidu.com");
    expect(html).not.toContain("_hmt");
    expect(html).not.toContain("googletagmanager.com/gtag/js");
    expect(html).not.toContain("window.gtag");
    expect(html).not.toContain("SYNTHETIC_DO_NOT_USE");
  });

  it("detects analytics governance routes and referrers without hardcoded team IPs", () => {
    expect(isBlockedAnalyticsRoute("/zh/admin/reports")).toBe(true);
    expect(isBlockedAnalyticsRoute("/en/internal/tools")).toBe(true);
    expect(isBlockedAnalyticsRoute("/dashboard")).toBe(true);
    expect(isBlockedAnalyticsRoute("/zh/tests/mbti-personality-test-16-personality-types")).toBe(false);
    expect(isPollutingAnalyticsReferrer("https://tongji.baidu.com/main/overview")).toBe(true);
    expect(isPollutingAnalyticsReferrer("https://www.baidu.com/s?wd=mbti")).toBe(false);

    const source = readFileSync("lib/tracking/internalTraffic.ts", "utf8");
    expect(source).not.toContain("TEAM_IP");
    expect(source).not.toContain("office_ip");
    expect(source).toContain("NEXT_PUBLIC_ANALYTICS_ALLOWED_HOSTS");
  });

  it("keeps analytics mounted for root and localized layout trees", () => {
    for (const layoutPath of ["app/(root)/layout.tsx", "app/(localized)/[locale]/layout.tsx"]) {
      const source = readFileSync(layoutPath, "utf8");
      expect(source).toContain('from "@/components/analytics/AnalyticsScripts"');
      expect(source).toContain("<AnalyticsScripts />");
    }
  });

  it("maps funnel events to GA4 key-event taxonomy names", () => {
    expect(mapTrackingEventToGa4Name(TRACKING_EVENTS.START_ATTEMPT)).toBe("start_test");
    expect(mapTrackingEventToGa4Name(TRACKING_EVENTS.SUBMIT_ATTEMPT)).toBe("complete_test");
    expect(mapTrackingEventToGa4Name(TRACKING_EVENTS.VIEW_RESULT)).toBe("view_result");
    expect(mapTrackingEventToGa4Name(TRACKING_EVENTS.CLICK_UNLOCK)).toBe("click_deep_report");
    expect(mapTrackingEventToGa4Name(TRACKING_EVENTS.CREATE_ORDER)).toBe("begin_checkout");
    expect(mapTrackingEventToGa4Name(TRACKING_EVENTS.PAYMENT_CONFIRMED)).toBe("add_payment_info");
    expect(mapTrackingEventToGa4Name(TRACKING_EVENTS.PURCHASE_SUCCESS)).toBe("purchase_success");
    expect(mapTrackingEventToGa4Name(TRACKING_EVENTS.PAY_SUCCESS)).toBe("purchase_success");
  });
});
