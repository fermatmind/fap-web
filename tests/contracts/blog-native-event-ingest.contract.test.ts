import { afterEach, describe, expect, it, vi } from "vitest";
import { POST, toSeoAttributionIngestEnvelope } from "@/app/api/track/route";
import { NextRequest } from "next/server";
import { trackClientEvent } from "@/lib/tracking/client";

afterEach(() => { localStorage.clear(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe("blog native attribution ingest", () => {
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
