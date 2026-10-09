import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/track/route";

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
function setup(token = "fixture_only_not_a_live_token_123456789") {
  vi.stubEnv("TRACK_INGEST_TOKEN", token);
  vi.stubEnv("TRACK_INGEST_API_ORIGIN", "");
  vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.fermatmind.com");
  for (const key of ["CAREER_ATTRIBUTION_INGEST_ENDPOINT", "MBTI_ATTRIBUTION_INGEST_ENDPOINT", "ANALYTICS_ENDPOINT", "EDM_ENDPOINT"]) vi.stubEnv(key, "");
  const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 202 })); vi.stubGlobal("fetch", fetch);
  return fetch;
}
function request(path = "/en/articles/source", site = "https://fermatmind.com", headers: Record<string, string> = {}) {
  return new NextRequest(`${site}/api/track`, { method: "POST", headers: { "x-forwarded-for": "198.51.100.25", ...headers },
    body: JSON.stringify({ eventName: "article_to_test_click", path, timestamp: "2026-10-08T03:00:00Z", payload: { source_article: "source", page_type: "article_detail" } }) });
}
describe("native ingest credential boundary", () => {
  it("leaves absent-token behavior unchanged, including forwarded zero", async () => {
    const fetch = setup(""); const response = await POST(request());
    expect(await response.json()).toMatchObject({ ok: true, forwarded: 0 }); expect(fetch).not.toHaveBeenCalled();
    vi.stubEnv("ANALYTICS_ENDPOINT", "https://legacy.example.test/ingest");
    expect((await POST(request())).status).toBe(200);
    expect(fetch.mock.calls[0][1].headers).not.toHaveProperty("Authorization");
    expect(fetch.mock.calls[0][1].headers).not.toHaveProperty("X-FermatMind-IP-Day-Hash");
  });
  it("confines credentials to native HTTPS ingest and prohibits redirects", async () => {
    const fetch = setup(); expect((await POST(request())).status).toBe(200);
    expect(fetch.mock.calls[0][0]).toBe("https://api.fermatmind.com/api/v0.5/seo/attribution/events");
    expect(fetch.mock.calls[0][1]).toMatchObject({ redirect: "error", headers: { Authorization: "Bearer fixture_only_not_a_live_token_123456789" } });
  });
  it.each(["https://evil.example.test/ingest", "https://api.fermatmind.com.evil.test/api/v0.5/seo/attribution/events", "https://api.fermatmind.com/api/v0.5/seo/attribution/events?redirect=1", "https://user:pass@api.fermatmind.com/api/v0.5/seo/attribution/events", "https://api.fermatmind.com/api/v0.5/unrelated"])("rejects the entire fan-out before exposing a token to %s", async target => {
    const fetch = setup(); vi.stubEnv("ANALYTICS_ENDPOINT", target);
    const response = await POST(request()); expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({ error: "invalid_ingest_target" }); expect(fetch).not.toHaveBeenCalled();
  });
  it("uses the private runtime origin and keeps production/staging separated", async () => {
    const fetch = setup(); vi.stubEnv("TRACK_INGEST_API_ORIGIN", "https://staging-api.fermatmind.com");
    expect((await POST(request())).status).toBe(502); expect(fetch).not.toHaveBeenCalled();
    expect((await POST(request("/en/articles/source", "https://staging.fermatmind.com"))).status).toBe(200);
    expect(fetch.mock.calls[0][0]).toBe("https://staging-api.fermatmind.com/api/v0.5/seo/attribution/events");
  });
  it.each(["http://0.0.0.0:3000", "http://[::]:3000", "http://127.0.0.1:3000"])("uses the public Host for a standalone request at %s", async site => {
    const fetch = setup();
    expect((await POST(request("/en/articles/source", site, { host: "fermatmind.com" }))).status).toBe(200);
    expect(fetch.mock.calls[0][0]).toBe("https://api.fermatmind.com/api/v0.5/seo/attribution/events");
    expect(fetch.mock.calls[0][1]).toMatchObject({ redirect: "error" });
  });
  it("keeps environment separation when the request URL uses an internal listener", async () => {
    const fetch = setup();
    expect((await POST(request("/en/articles/source", "http://127.0.0.1:3000", { host: "staging.fermatmind.com" }))).status).toBe(502);
    expect(fetch).not.toHaveBeenCalled();
    vi.stubEnv("TRACK_INGEST_API_ORIGIN", "https://staging-api.fermatmind.com");
    expect((await POST(request("/en/articles/source", "http://0.0.0.0:3101", { host: "fermatmind.com" }))).status).toBe(502);
    expect(fetch).not.toHaveBeenCalled();
    expect((await POST(request("/en/articles/source", "http://0.0.0.0:3101", { host: "staging.fermatmind.com" }))).status).toBe(200);
    expect(fetch.mock.calls[0][0]).toBe("https://staging-api.fermatmind.com/api/v0.5/seo/attribution/events");
  });
  it.each(["evil.example.test", "fermatmind.com.evil.test", "user@fermatmind.com", "fermatmind.com/path", "fermatmind.com?x=1", "fermatmind.com,evil.example.test", "fermatmind .com", "fermatmind.com."])("rejects an untrusted or malformed standalone Host %s", async host => {
    const fetch = setup();
    const response = await POST(request("/en/articles/source", "http://0.0.0.0:3000", { host }));
    expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({ error: "invalid_ingest_target" });
    expect(fetch).not.toHaveBeenCalled();
  });
  it("refuses an unspecified listener without a public Host and refuses conflicting public authorities", async () => {
    const fetch = setup();
    for (const input of [request("/en/articles/source", "http://0.0.0.0:3000"), request("/en/articles/source", "https://evil.example.test", { host: "fermatmind.com" }), request("/en/articles/source", "https://fermatmind.com", { host: "staging.fermatmind.com" })]) {
      expect((await POST(input)).status).toBe(502);
      expect(fetch).not.toHaveBeenCalled();
    }
  });
  it("ignores spoofed forwarded-host when the actual Host is valid", async () => {
    const fetch = setup();
    expect((await POST(request("/en/articles/source", "http://0.0.0.0:3000", { host: "www.fermatmind.com", "x-forwarded-host": "evil.example.test" }))).status).toBe(200);
    expect(fetch.mock.calls[0][0]).toBe("https://api.fermatmind.com/api/v0.5/seo/attribution/events");
  });
  it("rejects an untrusted API origin instead of forwarding credentials", async () => {
    const fetch = setup(); vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.test");
    expect((await POST(request())).status).toBe(502); expect(fetch).not.toHaveBeenCalled();
  });
  it("keeps private result URLs suppressed before target selection", async () => {
    const fetch = setup(); vi.stubEnv("NEXT_PUBLIC_API_URL", "https://evil.example.test");
    expect(await (await POST(request("/en/result/fixture-private"))).json()).toMatchObject({ ok: true, suppressed: true, forwarded: 0 });
    expect(fetch).not.toHaveBeenCalled();
  });
  it("fails closed on redirected or failed native transport without returning credentials", async () => {
    const fetch = setup(); fetch.mockRejectedValue(new TypeError("redirect rejected"));
    const response = await POST(request()); expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({ error: "forward_failed" });
  });
});
