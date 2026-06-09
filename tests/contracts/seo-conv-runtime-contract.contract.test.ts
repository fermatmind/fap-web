import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { POST as postTrackingEvent } from "@/app/api/track/route";
import { TRACKING_EVENTS } from "@/lib/tracking/events";
import { isSeoConvRuntime03AllowedFile } from "./helpers/currentPrScope";

const CONSENT_KEY = "fm_consent_v1";

function grantAnalyticsConsent() {
  window.localStorage.setItem(
    CONSENT_KEY,
    JSON.stringify({ analytics: "granted", updatedAt: "2026-06-09T00:00:00.000Z" })
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
  vi.useRealTimers();
  window.localStorage.clear();
  window.sessionStorage.clear();
  window.history.pushState({}, "", "/");
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("SEO-CONV-RUNTIME-03 runtime funnel contract", () => {
  it("sends one public landing_pv with safe SEO conversion dimensions", async () => {
    grantAnalyticsConsent();
    window.history.pushState({}, "", "/zh/articles/mbti-career-path?utm_source=google&email=person%40example.com");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    vi.stubGlobal("fetch", fetchMock);

    const { initAnalytics } = await importAnalyticsRuntime();
    initAnalytics();
    initAnalytics();

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(String(init?.body ?? "{}")) as {
      eventName?: string;
      path?: string;
      payload?: Record<string, unknown>;
    };

    expect(body.eventName).toBe(TRACKING_EVENTS.LANDING_PV);
    expect(body.path).toBe("/zh/articles/mbti-career-path?utm_source=google&email=redacted");
    expect(body.payload).toMatchObject({
      url: "/zh/articles/mbti-career-path?utm_source=google&email=redacted",
      lang: "zh",
      page_type: "article_detail",
      source_url: "/zh/articles/mbti-career-path?utm_source=google&email=redacted",
      source_article: "mbti-career-path",
    });
    expect(String(body.payload?.session_id)).toMatch(/^seo_sess_[A-Za-z0-9_-]{16,80}$/);
    expect(JSON.stringify(body)).not.toContain("person@example.com");
  });

  it("keeps article_to_test_click distinct from start_test while preserving the same SEO session", async () => {
    grantAnalyticsConsent();
    window.history.pushState({}, "", "/zh/articles/mbti-career-path?utm_source=baidu");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    vi.stubGlobal("fetch", fetchMock);
    const { trackEvent, trackObservableFunnelEvent } = await importAnalyticsRuntime();

    trackEvent(TRACKING_EVENTS.ARTICLE_TO_TEST_CLICK, {
      locale: "zh",
      article_slug: "mbti-career-path",
      source_path: "/zh/articles/mbti-career-path?utm_source=baidu&token=secret",
      destination_path: "/zh/tests/mbti-personality-test-16-personality-types",
      target_test_slug: "mbti-personality-test-16-personality-types",
      scale_code: "MBTI",
      form_code: "mbti_93",
    });
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    window.history.pushState(
      {},
      "",
      "/zh/tests/mbti-personality-test-16-personality-types/take?landing_path=%2Fzh%2Farticles%2Fmbti-career-path%3Futm_source%3Dbaidu&target_test_slug=mbti-personality-test-16-personality-types"
    );
    trackObservableFunnelEvent(TRACKING_EVENTS.START_ATTEMPT, {
      locale: "zh",
      landing_path: "/zh/articles/mbti-career-path?utm_source=baidu&token=secret",
      test_slug: "mbti-personality-test-16-personality-types",
      target_test_slug: "mbti-personality-test-16-personality-types",
      scale_code: "MBTI",
      form_code: "mbti_93",
      attempt_id: "attempt_raw_should_mask",
    });

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const clickBody = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body ?? "{}")) as {
      eventName?: string;
      payload?: Record<string, unknown>;
    };
    const startBody = JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body ?? "{}")) as {
      eventName?: string;
      payload?: Record<string, unknown>;
    };

    expect(clickBody.eventName).toBe(TRACKING_EVENTS.ARTICLE_TO_TEST_CLICK);
    expect(startBody.eventName).toBe(TRACKING_EVENTS.START_TEST);
    expect(clickBody.payload).toMatchObject({
      source_article: "mbti-career-path",
      target_test: "mbti-personality-test-16-personality-types",
      scale_id: "MBTI",
      form_id: "mbti_93",
    });
    expect(startBody.payload).toMatchObject({
      source_article: "mbti-career-path",
      target_test: "mbti-personality-test-16-personality-types",
      scale_id: "MBTI",
      form_id: "mbti_93",
    });
    expect(startBody.payload?.session_id).toBe(clickBody.payload?.session_id);
    expect(startBody.payload).not.toHaveProperty("attempt_id");
    expect(JSON.stringify(startBody)).not.toContain("attempt_raw_should_mask");
    expect(JSON.stringify(startBody)).not.toContain("token=secret");
  });

  it("hard-stops runtime public analytics dispatch on private result paths", async () => {
    grantAnalyticsConsent();
    window.history.pushState({}, "", "/zh/result/attempt_raw_should_not_send?token=secret");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    vi.stubGlobal("fetch", fetchMock);
    const { trackEvent, initAnalytics } = await importAnalyticsRuntime();

    initAnalytics();
    trackEvent(TRACKING_EVENTS.VIEW_RESULT, {
      attempt_id: "attempt_raw_should_not_send",
      test_slug: "mbti-personality-test-16-personality-types",
    });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards canonical SEO funnel events from /api/track to backend sitemap-free ingest", async () => {
    const previousEnv = {
      TRACK_INGEST_TOKEN: process.env.TRACK_INGEST_TOKEN,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      MBTI_ATTRIBUTION_INGEST_ENDPOINT: process.env.MBTI_ATTRIBUTION_INGEST_ENDPOINT,
      ANALYTICS_ENDPOINT: process.env.ANALYTICS_ENDPOINT,
      EDM_ENDPOINT: process.env.EDM_ENDPOINT,
    };
    process.env.TRACK_INGEST_TOKEN = "track-token";
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.test";
    delete process.env.MBTI_ATTRIBUTION_INGEST_ENDPOINT;
    delete process.env.ANALYTICS_ENDPOINT;
    delete process.env.EDM_ENDPOINT;
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));

    try {
      const response = await postTrackingEvent(new NextRequest("https://fermatmind.com/api/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          eventName: TRACKING_EVENTS.ARTICLE_TO_TEST_CLICK,
          anonymousId: "anon-seo-runtime",
          path: "/zh/articles/mbti-career-path",
          payload: {
            url: "/zh/articles/mbti-career-path",
            lang: "zh",
            page_type: "article_detail",
            source_article: "mbti-career-path",
            target_test: "mbti-personality-test-16-personality-types",
            scale_id: "MBTI",
            form_id: "mbti_93",
            session_id: "seo_sess_ABCDEFGHIJKLMNOPQRSTUVWX",
          },
        }),
      }));

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toMatchObject({ ok: true, forwarded: 1 });
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe("https://api.example.test/api/v0.5/seo/attribution/events");
      expect(init?.headers).toMatchObject({ Authorization: "Bearer track-token" });
      const forwardedBody = JSON.parse(String(init?.body ?? "{}")) as { eventName?: string; payload?: Record<string, unknown> };
      expect(forwardedBody.eventName).toBe(TRACKING_EVENTS.ARTICLE_TO_TEST_CLICK);
      expect(forwardedBody.payload).toMatchObject({
        source_article: "mbti-career-path",
        target_test: "mbti-personality-test-16-personality-types",
        session_id: "seo_sess_ABCDEFGHIJKLMNOPQRSTUVWX",
      });
    } finally {
      process.env.TRACK_INGEST_TOKEN = previousEnv.TRACK_INGEST_TOKEN;
      process.env.NEXT_PUBLIC_API_URL = previousEnv.NEXT_PUBLIC_API_URL;
      process.env.MBTI_ATTRIBUTION_INGEST_ENDPOINT = previousEnv.MBTI_ATTRIBUTION_INGEST_ENDPOINT;
      process.env.ANALYTICS_ENDPOINT = previousEnv.ANALYTICS_ENDPOINT;
      process.env.EDM_ENDPOINT = previousEnv.EDM_ENDPOINT;
    }
  });

  it("keeps the PR scope limited to runtime tracking files and metadata", () => {
    for (const file of [
      "lib/analytics.ts",
      "app/api/track/route.ts",
      "tests/contracts/seo-conv-runtime-contract.contract.test.ts",
      "tests/contracts/helpers/currentPrScope.ts",
      "docs/codex/pr-train.yaml",
      "docs/codex/pr-train-state.json",
    ]) {
      expect(isSeoConvRuntime03AllowedFile(file)).toBe(true);
    }

    expect(isSeoConvRuntime03AllowedFile("backend/app/Services/Analytics/Daily.php")).toBe(false);
    expect(isSeoConvRuntime03AllowedFile("components/ops/seo/SeoConversionDashboard.tsx")).toBe(false);
  });
});
