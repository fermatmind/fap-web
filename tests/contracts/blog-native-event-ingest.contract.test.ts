// @vitest-environment-options {"url":"https://fermatmind.com"}
import { afterEach, describe, expect, it, vi } from "vitest";
import { POST, toSeoAttributionIngestEnvelope } from "@/app/api/track/route";
import { NextRequest } from "next/server";
import { trackClientEvent } from "@/lib/tracking/client";
import { buildSeoCtaTrackingPayload } from "@/lib/tracking/seoCtaAttribution";

afterEach(() => { localStorage.clear(); sessionStorage.clear(); window.history.replaceState(null, "", "/"); vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe("blog native attribution ingest", () => {
  it.each(["en", "zh"] as const)("carries the public Big Five scale through a %s article click to native ingest", async (locale) => {
    localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "granted" }));
    const sourceSlug = "big-five-vs-riasec-personality-traits-and-career-interests";
    const path = `/${locale}/articles/${sourceSlug}`;
    const browserFetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    vi.stubGlobal("fetch", browserFetch);
    vi.stubEnv("NEXT_PUBLIC_ANALYTICS_ENABLED", "true");
    vi.stubEnv("NEXT_PUBLIC_ANALYTICS_ENV", "production");
    window.history.replaceState(null, "", path);
    vi.resetModules();
    const { trackEvent } = await import("@/lib/analytics");
    trackEvent("article_to_test_click", buildSeoCtaTrackingPayload({ locale, sourceRouteFamily: "article_detail",
      sourceSlug, sourcePath: path, href: `/${locale}/tests/big-five-personality-test-ocean-model`, ctaId: "take_test" }));
    await vi.waitFor(() => expect(browserFetch).toHaveBeenCalledTimes(1));
    expect(browserFetch).toHaveBeenCalledTimes(1);
    const browserEnvelope = JSON.parse(browserFetch.mock.calls[0][1].body);
    expect(browserEnvelope.payload.scale_code).toBe("BIG5_OCEAN");
    vi.stubEnv("TRACK_INGEST_TOKEN", "test-ingest-identity");
    for (const key of ["ANALYTICS_ENDPOINT", "MBTI_ATTRIBUTION_INGEST_ENDPOINT", "EDM_ENDPOINT"]) vi.stubEnv(key, "");
    const nativeFetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 202 }));
    vi.stubGlobal("fetch", nativeFetch);
    const response = await POST(new NextRequest("https://fermatmind.com/api/track", { method: "POST", body: JSON.stringify(browserEnvelope) }));
    expect(response.status).toBe(200);
    expect(nativeFetch).toHaveBeenCalledTimes(1);
    const nativeEnvelope = JSON.parse(nativeFetch.mock.calls[0][1].body);
    expect(nativeEnvelope.payload).toMatchObject({ scale_code: "BIG5_OCEAN", source_article: sourceSlug,
      source_url: path, page_type: "article_detail", target_test: "big-five-personality-test-ocean-model", locale });
    expect(nativeEnvelope.payload).not.toHaveProperty("source_slug");
    expect(nativeEnvelope.payload).not.toHaveProperty("article_slug");
  });

  it.each([
    ["external", "https://other.example/en/tests/big-five-personality-test-ocean-model", "big-five-personality-test-ocean-model", "article_detail"],
    ["private take", "/en/tests/big-five-personality-test-ocean-model/take", "big-five-personality-test-ocean-model", "article_detail"],
    ["unknown", "/en/tests/unknown-test", "unknown-test", "article_detail"],
    ["conflicting target", "/en/tests/big-five-personality-test-ocean-model", "mbti-personality-test-16-personality-types", "article_detail"],
    ["different source family", "/en/tests/big-five-personality-test-ocean-model", "big-five-personality-test-ocean-model", "topic_detail"],
  ] as const)("does not derive a scale from %s", (_name, href, targetTestSlug, sourceRouteFamily) => {
    const payload = buildSeoCtaTrackingPayload({ locale: "en", sourceRouteFamily, sourceSlug: "source",
      sourcePath: "/en/articles/source", href, targetTestSlug, ctaId: "take_test" });
    expect(payload).not.toHaveProperty("scale_code");
  });

  it("preserves an explicit caller scale instead of replacing its authority", () => {
    const payload = buildSeoCtaTrackingPayload({ locale: "en", sourceRouteFamily: "article_detail", sourceSlug: "source",
      sourcePath: "/en/articles/source", href: "/en/tests/big-five-personality-test-ocean-model", ctaId: "take_test", scaleCode: "BIG_FIVE_OCEAN_MODEL" });
    expect(payload.scale_code).toBe("BIG_FIVE_OCEAN_MODEL");
  });

  it("forwards the real route's strict SEO envelope and keeps request identity in the header", async () => {
    vi.stubEnv("TRACK_INGEST_TOKEN", "test-ingest-identity");
    for (const key of ["ANALYTICS_ENDPOINT", "MBTI_ATTRIBUTION_INGEST_ENDPOINT", "EDM_ENDPOINT"]) vi.stubEnv(key, "");
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 202 }));
    vi.stubGlobal("fetch", fetch);
    const response = await POST(new NextRequest("https://fermatmind.com/api/track", { method: "POST",
      body: JSON.stringify({ eventName: "article_to_test_click", anonymousId: "codex_probe_test",
        path: "/en/articles/source", timestamp: "2026-10-06T12:00:00Z",
        payload: { locale: "en", source_slug: "source", article_slug: "source", cta_priority: "contextual",
          source_route_family: "article", source_article: "source", source_url: "/en/articles/source",
          page_type: "article_detail", target_test: "big-five-personality-test-ocean-model", session_id: "seo_sess_1234567890abcdef" } }) }));
    expect(response.status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(1);
    const request = fetch.mock.calls[0][1];
    expect(request.headers["X-Request-Id"]).toEqual(expect.any(String));
    const envelope = JSON.parse(request.body);
    expect(envelope).not.toHaveProperty("requestId");
    expect(envelope.payload).not.toHaveProperty("source_slug");
    expect(envelope.payload).not.toHaveProperty("article_slug");
    expect(envelope.payload).toMatchObject({ source_article: "source", source_url: "/en/articles/source", locale: "en" });
    expect(await response.json()).toMatchObject({ ok: true, forwarded: 1 });
  });

  it("projects the native strict envelope while retaining article and language dimensions", () => {
    const input = {
      requestId: "request-probe", eventName: "article_to_test_click", anonymousId: "codex_probe_test",
      path: "/zh/articles/source?utm_source=qa", timestamp: "2026-10-06T12:00:00Z",
      payload: { source_slug: "source", source_route_family: "article", cta_id: "cms_content_test",
        article_slug: "source", cta_priority: "contextual", translation_group_id: 17,
        source_url: "/zh/articles/source", source_article: "source", lang: "zh", locale: "zh",
        target_test: "/zh/tests/test", source_page_type: "article_detail", session_id: "seo_sess_test1234",
        utm_source: "qa", consent_state: "granted", traffic_quality: "qa" },
    };
    const result = toSeoAttributionIngestEnvelope(input);
    expect(Object.keys(result).sort()).toEqual(["anonymousId", "eventName", "path", "payload", "timestamp"]);
    expect(result.path).toBe("/zh/articles/source");
    expect(result.payload).toMatchObject({ source_article: "source", source_url: "/zh/articles/source", lang: "zh", locale: "zh", target_test: "/zh/tests/test" });
    for (const key of ["source_slug", "source_route_family", "cta_id", "article_slug", "cta_priority", "translation_group_id"]) expect(result.payload).not.toHaveProperty(key);
  });

  it.each(["en", "zh"])("keeps long %s attributed navigation out of the native path length field", async (locale) => {
    localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "granted" }));
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    vi.stubGlobal("fetch", fetch);
    const path = `/${locale}/tests/big-five-personality-test-ocean-model`;
    await trackClientEvent({ eventName: "landing_pv", anonymousId: "codex_probe_test",
      path: `${path}?landing_path=${encodeURIComponent(`/${locale}/articles/source`)}&utm_source=${"x".repeat(600)}`,
      payload: { source_article: "source", locale, utm_source: "qa" } });
    expect(fetch).toHaveBeenCalledTimes(1);
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.path).toBe(path);
    expect(body.payload.source_article).toBe("source");
    expect(body.payload.utm_source).toBe("qa");
    localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied" }));
    await trackClientEvent({ eventName: "landing_pv", anonymousId: "codex_probe_test", path });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
