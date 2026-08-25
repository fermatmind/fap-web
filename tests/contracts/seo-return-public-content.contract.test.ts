import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { POST as postTrackingEvent } from "@/app/api/track/route";
import {
  SEO_CONVERSION_FUNNEL_EVENTS,
  TRACKING_EVENTS,
  filterTrackingPayload,
  isSeoConversionFunnelEvent,
} from "@/lib/tracking/events";
import {
  claimPublicReturnSurface,
  classifyPublicReturnSurface,
  markResultViewedForPublicReturn,
} from "@/lib/tracking/publicReturn";

const CONSENT_KEY = "fm_consent_v1";

function grantAnalyticsConsent() {
  window.localStorage.setItem(
    CONSENT_KEY,
    JSON.stringify({ analytics: "granted", updatedAt: "2026-08-25T00:00:00.000Z" })
  );
}

async function importAnalyticsRuntime() {
  vi.resetModules();
  vi.doMock("@/lib/tracking/internalTraffic", () => ({
    shouldAllowBrowserAnalyticsRuntime: () => ({ allowed: true, reason: "allowed" }),
  }));
  vi.stubEnv("NEXT_PUBLIC_ANALYTICS_ENABLED", "true");
  return import("@/lib/analytics");
}

afterEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  window.history.pushState({}, "", "/");
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("SEO-PLATFORM-06 public return event", () => {
  it("registers the event and filters every identity field including session correlation", () => {
    expect(SEO_CONVERSION_FUNNEL_EVENTS).toContain(TRACKING_EVENTS.RETURN_PUBLIC_CONTENT);
    expect(isSeoConversionFunnelEvent(TRACKING_EVENTS.RETURN_PUBLIC_CONTENT)).toBe(true);

    const payload = filterTrackingPayload(TRACKING_EVENTS.RETURN_PUBLIC_CONTENT, {
      url: "/zh/articles/personality-types",
      canonical_url: "/zh/articles/personality-types",
      current_path: "/zh/articles/personality-types",
      locale: "zh",
      route_family: "articles_topics",
      page_type: "articles_topics",
      session_id: "seo_sess_ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      attempt_id: "attempt-private",
      result_id: "result-private",
      order_id: "order-private",
      user_id: "user-private",
      email: "person@example.com",
    });

    expect(payload).toEqual({
      locale: "zh",
      route_family: "articles_topics",
      page_type: "articles_topics",
      canonical_url: "/zh/articles/personality-types",
      current_path: "/zh/articles/personality-types",
      url: "/zh/articles/personality-types",
    });
  });

  it("classifies only registered public Page Family Policy paths", () => {
    expect(classifyPublicReturnSurface("/zh/tests/mbti-personality-test-16-personality-types?utm_source=google"))
      .toEqual({ canonicalPath: "/zh/tests/mbti-personality-test-16-personality-types", locale: "zh", family: "tests" });
    expect(classifyPublicReturnSurface("/en/articles/personality-types")).toMatchObject({ family: "articles_topics" });
    expect(classifyPublicReturnSurface("/zh/career/jobs/software-engineer")).toMatchObject({ family: "career" });
    expect(classifyPublicReturnSurface("/en/personality/big-five")).toMatchObject({ family: "personality" });
    expect(classifyPublicReturnSurface("/zh/science/validity")).toMatchObject({ family: "trust_method_help" });
    expect(classifyPublicReturnSurface("/en/business")).toMatchObject({ family: "other_public" });

    for (const path of [
      "/zh/tests/mbti/take",
      "/zh/attempts/attempt-private",
      "/en/results/result-private",
      "/zh/reports/report-private",
      "/en/orders/order-private",
      "/zh/share/share-private",
      "/en/payment/success",
      "/zh/history",
      "/en/account",
      "/zh/recovery",
      "/zh/articles/%252Fresults%252Fresult-private",
      "/en/unknown-public-looking-page",
    ]) {
      expect(classifyPublicReturnSurface(path), path).toBeNull();
    }
  });

  it("atomically consumes the marker only on a public return", () => {
    markResultViewedForPublicReturn();
    expect(claimPublicReturnSurface("/zh/results/private")).toBeNull();
    expect(claimPublicReturnSurface("/zh/articles/personality-types")).toMatchObject({ family: "articles_topics" });
    expect(claimPublicReturnSurface("/zh/articles/personality-types")).toBeNull();
  });

  it("marks legacy scale-specific result view aliases without exposing their private route", async () => {
    grantAnalyticsConsent();
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    vi.stubGlobal("fetch", fetchMock);
    window.history.pushState({}, "", "/en/results/result-private");
    const { trackEvent } = await importAnalyticsRuntime();

    trackEvent(TRACKING_EVENTS.RIASEC_RESULT_VIEW, { result_id: "result-private" });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(claimPublicReturnSurface("/en/personality")).toMatchObject({ family: "personality" });
  });

  it("fires once after result view, ignores private transitions, and sends no private identity or query", async () => {
    grantAnalyticsConsent();
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    vi.stubGlobal("fetch", fetchMock);
    window.history.pushState({}, "", "/zh/results/result-private?token=secret");
    const { trackObservableFunnelEvent, trackReturnToPublicContentIfEligible } = await importAnalyticsRuntime();

    trackObservableFunnelEvent(TRACKING_EVENTS.VIEW_RESULT, {
      attempt_id: "attempt-private",
      result_id: "result-private",
    });
    trackReturnToPublicContentIfEligible("/zh/reports/report-private");
    expect(fetchMock).not.toHaveBeenCalled();

    window.history.pushState({}, "", "/zh/articles/personality-types?utm_source=google&token=secret");
    trackReturnToPublicContentIfEligible("/zh/articles/personality-types");
    trackReturnToPublicContentIfEligible("/zh/articles/personality-types");

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body ?? "{}")) as Record<string, unknown> & {
      payload?: Record<string, unknown>;
    };
    expect(body).toMatchObject({
      eventName: TRACKING_EVENTS.RETURN_PUBLIC_CONTENT,
      anonymousId: "",
      path: "/zh/articles/personality-types",
    });
    expect(body.payload).toMatchObject({
      url: "/zh/articles/personality-types",
      canonical_url: "/zh/articles/personality-types",
      current_path: "/zh/articles/personality-types",
      source_url: "/zh/articles/personality-types",
      locale: "zh",
      route_family: "articles_topics",
      page_type: "articles_topics",
    });
    expect(body.payload).not.toHaveProperty("session_id");
    expect(JSON.stringify(body)).not.toMatch(/attempt-private|result-private|token=secret/);

    trackReturnToPublicContentIfEligible("/zh/articles/personality-types");
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("forwards the new event through the real tracking route to the SEO ingest", async () => {
    const previousToken = process.env.TRACK_INGEST_TOKEN;
    const previousApiUrl = process.env.NEXT_PUBLIC_API_URL;
    process.env.TRACK_INGEST_TOKEN = "track-token";
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.test";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));

    try {
      const response = await postTrackingEvent(new NextRequest("https://fermatmind.com/api/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          eventName: TRACKING_EVENTS.RETURN_PUBLIC_CONTENT,
          anonymousId: "",
          path: "/en/articles/personality-types",
          payload: {
            url: "/en/articles/personality-types",
            canonical_url: "/en/articles/personality-types",
            current_path: "/en/articles/personality-types",
            source_url: "/en/articles/personality-types",
            locale: "en",
            route_family: "articles_topics",
            page_type: "articles_topics",
          },
        }),
      }));

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toMatchObject({ ok: true, forwarded: 1 });
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe("https://api.example.test/api/v0.5/seo/attribution/events");
      const forwarded = JSON.parse(String(init?.body ?? "{}"));
      expect(forwarded).toMatchObject({
        eventName: TRACKING_EVENTS.RETURN_PUBLIC_CONTENT,
        anonymousId: "",
        path: "/en/articles/personality-types",
        payload: {
          url: "/en/articles/personality-types",
          page_type: "articles_topics",
        },
      });
      expect(forwarded.payload).not.toHaveProperty("session_id");
    } finally {
      process.env.TRACK_INGEST_TOKEN = previousToken;
      process.env.NEXT_PUBLIC_API_URL = previousApiUrl;
    }
  });
});
