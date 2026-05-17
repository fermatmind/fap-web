import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildGoogleAdsPurchaseConversionPayload,
  trackClientEvent,
} from "@/lib/tracking/client";
import {
  buildSearchIntelligenceTrackingPayload,
  deriveSearchIntelligenceSourceEngine,
  deriveSearchIntelligenceTrafficLabels,
} from "@/lib/tracking/attribution";
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
    JSON.stringify({ analytics: "granted", updatedAt: "2026-05-17T00:00:00.000Z" })
  );
}

function denyAnalyticsConsent() {
  window.localStorage.setItem(
    CONSENT_KEY,
    JSON.stringify({ analytics: "denied", updatedAt: "2026-05-17T00:00:00.000Z" })
  );
}

afterEach(() => {
  window.localStorage.clear();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Search Intelligence tracking transport fields", () => {
  it.each([
    [{ utm_source: "google", referrer: "https://www.google.com/search?q=mbti" }, "google"],
    [{ utm_source: "baidu", referrer: "https://www.baidu.com/s?wd=mbti" }, "baidu"],
    [{ gclid: "test-click-id", utm_source: "google", utm_medium: "cpc" }, "paid_google"],
    [{ utm_source: "baidu", utm_medium: "cpc", utm_campaign: "sem_launch" }, "paid_baidu"],
    [{}, "direct"],
    [{ utm_source: "newsletter", referrer: "https://example.com/path" }, "unknown"],
  ] as const)("derives source_engine %# as %s", (payload, expected) => {
    expect(deriveSearchIntelligenceSourceEngine(payload)).toBe(expected);
  });

  it("marks QA and bot traffic without raw IPs, emails, or user agents", () => {
    expect(
      deriveSearchIntelligenceTrafficLabels({
        payload: { utm_source: "codex_qa", utm_campaign: "acceptance" },
        userAgent: "Mozilla/5.0",
        environment: "production",
      })
    ).toMatchObject({
      is_internal: false,
      is_qa: true,
      is_bot: false,
      environment: "production",
      traffic_quality: "qa",
    });

    expect(
      deriveSearchIntelligenceTrafficLabels({
        payload: {},
        userAgent: "Googlebot/2.1 (+http://www.google.com/bot.html)",
        environment: "production",
      })
    ).toMatchObject({
      is_bot: true,
      traffic_quality: "bot",
    });

    expect(JSON.stringify(buildSearchIntelligenceTrackingPayload({
      payload: { utm_campaign: "controlled_pilot" },
      userAgent: "Baiduspider",
      environment: "production",
      consentState: "granted",
    }))).not.toContain("Baiduspider");
  });

  it("allows only safe Search Intelligence fields through the tracking sanitizer", () => {
    const payload = filterTrackingPayload(TRACKING_EVENTS.START_ATTEMPT, {
      test_slug: "mbti-personality-test-16-personality-types",
      source_engine: "google",
      consent_state: "granted",
      is_internal: false,
      is_qa: true,
      is_bot: false,
      environment: "production",
      traffic_quality: "qa",
      email: "person@example.com",
      cookie: "session=secret",
      order_no: "ord_raw_123456",
      attempt_id: "attempt_raw_123456",
      payment_id: "pay_raw_123456",
      provider_event_id: "evt_raw_123456",
      raw_payload: "{\"secret\":true}",
      payment_payload: "{\"payment\":true}",
      token: "secret-token",
      checkout_url: "https://pay.example/checkout?token=secret",
      report_url: "https://fermatmind.com/report?attempt_id=attempt_raw_123456",
    });

    expect(payload).toMatchObject({
      test_slug: "mbti-personality-test-16-personality-types",
      source_engine: "google",
      consent_state: "granted",
      is_internal: false,
      is_qa: true,
      is_bot: false,
      environment: "production",
      traffic_quality: "qa",
      attempt_id: "attemp...3456",
    });
    expect(payload).not.toHaveProperty("email");
    expect(payload).not.toHaveProperty("cookie");
    expect(payload).not.toHaveProperty("payment_id");
    expect(payload).not.toHaveProperty("provider_event_id");
    expect(payload).not.toHaveProperty("raw_payload");
    expect(payload).not.toHaveProperty("payment_payload");
    expect(payload).not.toHaveProperty("token");
    expect(payload).not.toHaveProperty("checkout_url");
    expect(payload).not.toHaveProperty("report_url");
    expect(JSON.stringify(payload)).not.toContain("ord_raw_123456");
    expect(JSON.stringify(payload)).not.toContain("attempt_raw_123456");
  });

  it("includes consent_state and source_engine after consent while preserving the hard stop when denied", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    const gtagMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    Object.defineProperty(window, "gtag", {
      configurable: true,
      value: gtagMock,
    });

    denyAnalyticsConsent();
    await trackClientEvent({
      eventName: TRACKING_EVENTS.START_ATTEMPT,
      payload: { test_slug: "mbti-personality-test-16-personality-types", locale: "en" },
      anonymousId: "anon-session-1",
      path: "/en/tests/mbti-personality-test-16-personality-types",
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(gtagMock).not.toHaveBeenCalled();

    grantAnalyticsConsent();
    await trackClientEvent({
      eventName: TRACKING_EVENTS.START_ATTEMPT,
      payload: {
        test_slug: "mbti-personality-test-16-personality-types",
        utm_source: "google",
        locale: "en",
      },
      anonymousId: "anon-session-1",
      path: "/en/tests/mbti-personality-test-16-personality-types?utm_source=google",
    });

    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body ?? "{}")) as {
      payload?: Record<string, unknown>;
    };
    expect(body.payload).toMatchObject({
      source_engine: "google",
      consent_state: "granted",
      is_internal: true,
      is_qa: false,
      is_bot: false,
      environment: "test",
      traffic_quality: "internal",
    });
  });

  it("keeps funnel taxonomy and purchase conversion semantics unchanged", () => {
    expect(CANONICAL_SEO_FUNNEL_EVENTS).toEqual([
      "start_attempt",
      "submit_attempt",
      "view_result",
      "click_unlock",
      "create_order",
      "payment_confirmed",
      "purchase_success",
    ]);
    expect(SEO_FUNNEL_EVENT_ALIAS_MAP.pay_success).toBe("purchase_success");
    expect(normalizeTrackingEventName(TRACKING_EVENTS.PAY_SUCCESS)).toBe("purchase_success");
    expect(
      buildGoogleAdsPurchaseConversionPayload(
        { amount: 88, currency: "CNY", source_engine: "google" },
        { conversionId: "AW-TEST1234", purchaseConversionLabel: "purchase_label_test" }
      )
    ).toEqual({
      send_to: "AW-TEST1234/purchase_label_test",
      value: 88,
      currency: "CNY",
    });
  });

  it("records the transport-only contract artifact for the new fields", () => {
    const artifact = JSON.parse(
      readFileSync("docs/analytics/generated/search-intelligence-tracking-fields.v1.json", "utf8")
    ) as {
      version?: string;
      added_fields?: string[];
      api_track_role?: string;
      purchase_truth_source?: string;
      consent_hard_stop_preserved?: boolean;
      new_event_names_added?: boolean;
      payment_semantics_changed?: boolean;
      sitemap_llms_changed?: boolean;
      backend_files_changed?: boolean;
      next_task?: string;
      pii_forbidden_fields?: string[];
    };

    expect(artifact.version).toBe("search_intelligence_tracking_fields.v1");
    expect(artifact.added_fields).toEqual(
      expect.arrayContaining([
        "source_engine",
        "consent_state",
        "is_internal",
        "is_qa",
        "is_bot",
        "environment",
        "traffic_quality",
      ])
    );
    expect(artifact.api_track_role).toBe("transport_only");
    expect(artifact.purchase_truth_source).toBe("backend_orders_payment_benefits");
    expect(artifact.consent_hard_stop_preserved).toBe(true);
    expect(artifact.new_event_names_added).toBe(false);
    expect(artifact.payment_semantics_changed).toBe(false);
    expect(artifact.sitemap_llms_changed).toBe(false);
    expect(artifact.backend_files_changed).toBe(false);
    expect(artifact.next_task).toBe("SEO-DASH-03B");
    expect(artifact.pii_forbidden_fields).toEqual(expect.arrayContaining(["email", "cookie", "raw_order_no"]));
  });
});
