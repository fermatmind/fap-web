// @vitest-environment-options {"url":"https://fermatmind.com"}
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function grantAnalyticsConsent() {
  window.localStorage.setItem("fm_consent_v1", JSON.stringify({
    analytics: "granted",
    updatedAt: "2026-11-27T00:00:00.000Z",
  }));
}

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_ANALYTICS_ENABLED", "true");
  vi.stubEnv("NEXT_PUBLIC_ANALYTICS_ENV", "production");
  vi.stubEnv("TRACK_INGEST_TOKEN", "track-test-token");
  vi.stubEnv("TRACK_INGEST_API_ORIGIN", "https://api.fermatmind.com");
  vi.stubEnv("MBTI_ATTRIBUTION_INGEST_ENDPOINT", "https://api.fermatmind.com/api/v0.3/analytics/mbti-attribution-events");
  for (const key of ["ANALYTICS_ENDPOINT", "EDM_ENDPOINT"]) {
    vi.stubEnv(key, undefined);
  }
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
  window.history.replaceState({}, "", "/");
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("public post-result assessment CTA", () => {
  it.each(["en", "zh", "zh-TW"] as const)("one %s click sends exactly one click through the Web proxy", async (locale) => {
    grantAnalyticsConsent();
    const source = `/${locale}/tests/play/woodland-animal`;
    window.history.replaceState({}, "", `${source}/take?utm_source=example`);
    const { POST } = await import("@/app/api/track/route");
    const { ResultCoreBridge } = await import("@/components/questionnaires/ResultCoreBridge");
    const received: Array<{ url: string; body: Record<string, unknown> }> = [];
    const fetchMock = vi.fn(async (url: string, init: RequestInit) => {
      if (url === "/api/track") {
        const headers = new Headers(init.headers);
        headers.set("x-forwarded-for", "198.51.100.77");
        return POST(new NextRequest("https://fermatmind.com/api/track", {
          method: init.method,
          headers,
          body: String(init.body),
        }));
      }
      received.push({ url, body: JSON.parse(String(init.body)) });
      return new Response(null, { status: 202 });
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<ResultCoreBridge locale={locale} target="MBTI" />);
    const link = screen.getByRole("link");
    // Avoid a real document navigation in jsdom while letting React handle the CTA.
    window.addEventListener("click", (event) => event.preventDefault(), { once: true });
    fireEvent.click(link);

    await vi.waitFor(() => expect(received).toHaveLength(1));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][1].referrerPolicy).toBe("no-referrer");
    expect(new Headers(fetchMock.mock.calls[1][1].headers).has("X-FermatMind-IP-Day-Hash")).toBe(false);
    expect(received[0]).toMatchObject({
      url: "https://api.fermatmind.com/api/v0.5/seo/attribution/events",
      body: {
        eventName: "article_to_test_click",
        anonymousId: "",
        path: source,
        payload: {
          locale,
          lang: locale,
          landing_path: source,
          source_url: source,
          target_action: "questionnaire_result_mbti",
          target_test: "mbti-personality-test-16-personality-types",
        },
      },
    });
    expect(received[0].body.payload).not.toHaveProperty("session_id");
    expect(JSON.stringify(received)).not.toContain("utm_source");
  });

  it.each([
    ["/en/tests/play/woodland-animal/take", false],
    ["/en/tests/explore/four-axes-test", true],
    ["/en/tests/explore/natal-chart", true],
    ["/en/tests/play/woodland-animal/results/private-attempt", true],
    ["/en/results/private-attempt", true],
    ["/en/tests/play/woodland-animal/take?token=private", true],
  ] as const)("keeps tracking suppressed at %s (consent: %s)", async (path, consent) => {
    if (consent) grantAnalyticsConsent();
    window.history.replaceState({}, "", path);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { trackPublicResultCta } = await import("@/lib/tracking/publicResultCta");
    trackPublicResultCta("en", "/en/tests/mbti-personality-test-16-personality-types", "questionnaire_result_mbti", "MBTI");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
