import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildGoogleAdsPurchaseConversionPayload,
  trackClientEvent,
} from "@/lib/tracking/client";
import { TRACKING_EVENTS } from "@/lib/tracking/events";

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

describe("tracking activation contract", () => {
  it("declares analytics env placeholders without real IDs in .env.example", () => {
    const envExample = readFileSync(".env.example", "utf8");
    for (const key of [
      "NEXT_PUBLIC_ANALYTICS_ENABLED",
      "NEXT_PUBLIC_GA_MEASUREMENT_ID",
      "NEXT_PUBLIC_BAIDU_TONGJI_ID",
      "NEXT_PUBLIC_BAIDU_SITE_VERIFICATION",
      "NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID",
      "NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_CONVERSION_LABEL",
      "NEXT_PUBLIC_GOOGLE_ADS_TEST_SUBMIT_CONVERSION_LABEL",
      "NEXT_PUBLIC_GOOGLE_ADS_BEGIN_CHECKOUT_CONVERSION_LABEL",
    ]) {
      expect(envExample).toContain(`${key}=`);
    }

    expect(envExample).not.toMatch(/GTM-[A-Z0-9]+/);
    expect(envExample).not.toMatch(/AW-[A-Z0-9-]+/);
    expect(envExample).not.toMatch(/G-[A-Z0-9]{4,32}/);
    expect(envExample).not.toMatch(/NEXT_PUBLIC_BAIDU_TONGJI_ID=[a-f0-9]{16,64}/i);
    expect(envExample).not.toMatch(/NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_CONVERSION_LABEL=[A-Za-z0-9_-]{4,}/);
  });

  it("documents the activation boundary without GTM, Baidu Ads, SEO, recommendation, profile, checkout, or entitlement changes", () => {
    const contract = JSON.parse(
      readFileSync("docs/analytics/generated/tracking-activation-contract.v1.json", "utf8")
    ) as {
      version?: string;
      gtmEnabled?: boolean;
      baiduAdsEnabled?: boolean;
      realIdsCommitted?: boolean;
      seoGeoChanged?: boolean;
      recommendationChanged?: boolean;
      profileMemoryChanged?: boolean;
      checkoutChanged?: boolean;
      reportEntitlementChanged?: boolean;
      adsDisabledEvents?: string[];
      eventMapping?: Record<string, string>;
      canonicalFunnelEvents?: string[];
      legacyAliasMapping?: Record<string, string>;
    };

    expect(contract.version).toBe("tracking.activation_contract.v1");
    expect(contract.gtmEnabled).toBe(false);
    expect(contract.baiduAdsEnabled).toBe(false);
    expect(contract.realIdsCommitted).toBe(false);
    expect(contract.seoGeoChanged).toBe(false);
    expect(contract.recommendationChanged).toBe(false);
    expect(contract.profileMemoryChanged).toBe(false);
    expect(contract.checkoutChanged).toBe(false);
    expect(contract.reportEntitlementChanged).toBe(false);
    expect(contract.eventMapping?.purchase_success).toBe("ga4_purchase_and_google_ads_purchase_conversion");
    expect(contract.canonicalFunnelEvents).toEqual([
      "start_attempt",
      "submit_attempt",
      "view_result",
      "click_unlock",
      "create_order",
      "payment_confirmed",
      "purchase_success",
    ]);
    expect(contract.legacyAliasMapping).toMatchObject({
      start_click: "start_attempt",
      submit_click: "submit_attempt",
      pay_success: "purchase_success",
    });
    expect(contract.adsDisabledEvents).toEqual(
      expect.arrayContaining([
        "start_attempt",
        "submit_attempt",
        "view_result",
        "click_unlock",
        "create_order",
        "payment_confirmed",
      ])
    );
  });

  it("builds Google Ads purchase conversion payload only when Ads ID and purchase label exist", () => {
    expect(
      buildGoogleAdsPurchaseConversionPayload(
        {
          amount: 19.9,
          currency: "CNY",
          order_no: "ord_public_transaction_001",
        },
        { conversionId: "", purchaseConversionLabel: "purchase_label_test" }
      )
    ).toBeNull();

    expect(
      buildGoogleAdsPurchaseConversionPayload(
        {
          amount: 19.9,
          currency: "CNY",
          order_no: "ord_public_transaction_001",
        },
        { conversionId: "AW-TEST1234", purchaseConversionLabel: "purchase_label_test" }
      )
    ).toEqual({
      send_to: "AW-TEST1234/purchase_label_test",
      value: 19.9,
      currency: "CNY",
      transaction_id: "ord_public_transaction_001",
    });
  });

  it("does not invent value currency or transaction id for Google Ads purchase conversion", () => {
    expect(
      buildGoogleAdsPurchaseConversionPayload(
        {},
        { conversionId: "AW-TEST1234", purchaseConversionLabel: "purchase_label_test" }
      )
    ).toEqual({
      send_to: "AW-TEST1234/purchase_label_test",
    });
  });

  it("sends Google Ads conversion for purchase_success when env is configured", async () => {
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
      eventName: TRACKING_EVENTS.PURCHASE_SUCCESS,
      payload: {
        amount: 88,
        currency: "CNY",
        order_no: "ord_ads_purchase_001",
        locale: "zh",
      },
      anonymousId: "anon-session-1",
      path: "/zh/orders/ord_ads_purchase_001",
    });

    expect(gtagMock).toHaveBeenCalledWith("event", "purchase", expect.any(Object));
    expect(gtagMock).toHaveBeenCalledWith("event", "conversion", {
      send_to: "AW-TEST1234/purchase_label_test",
      value: 88,
      currency: "CNY",
      transaction_id: "ord_ads_purchase_001",
    });
  });

  it.each([
    TRACKING_EVENTS.PAYMENT_CONFIRMED,
    TRACKING_EVENTS.CREATE_ORDER,
    TRACKING_EVENTS.START_ATTEMPT,
    TRACKING_EVENTS.SUBMIT_ATTEMPT,
    TRACKING_EVENTS.VIEW_RESULT,
    TRACKING_EVENTS.CLICK_UNLOCK,
  ])("does not send Google Ads purchase conversion for %s", async (eventName) => {
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
      eventName,
      payload: {
        amount: 88,
        currency: "CNY",
        order_no: "ord_ads_purchase_001",
        locale: "zh",
      },
      anonymousId: "anon-session-1",
      path: "/zh/tests/mbti",
    });

    expect(gtagMock).not.toHaveBeenCalledWith("event", "conversion", expect.any(Object));
  });
});
