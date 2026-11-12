import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/friendship-browser/[...operation]/route";

const origin = "https://fermatmind.com";
const session = "a".repeat(64);
const id = "f306f552-29e5-482d-bf52-28372aaec66e";
const cookie = `__Host-fm-friendship=${session}`;

function dispatch(method: "GET" | "POST", operation: string, headers: HeadersInit = {}, body?: string) {
  const request = new NextRequest(origin + "/friendship-browser/" + operation, { method, headers, body });
  const context = { params: Promise.resolve({ operation: operation.split("/") }) };
  return (method === "POST" ? POST : GET)(request, context);
}

afterEach(() => vi.unstubAllGlobals());

describe("friendship browser session boundary", () => {
  it("issues a private cookie only on a same-origin request", async () => {
    expect((await dispatch("POST", "session", { origin: "https://staging.fermatmind.com" })).status).toBe(403);
    const response = await dispatch("POST", "session", { origin });
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toMatch(/__Host-fm-friendship=[a-f0-9]{64}.*Secure.*HttpOnly.*SameSite=lax/i);
    expect(await response.json()).toEqual({});
    const forwarded = new NextRequest("http://127.0.0.1:3000/friendship-browser/session", {
      method: "POST", headers: { host: "fermatmind.com", origin },
    });
    expect((await POST(forwarded, { params: Promise.resolve({ operation: ["session"] }) })).status).toBe(200);
  });

  it("relays only scoped operations and derives authorization from the session cookie", async () => {
    const upstream = vi.fn(async () => Response.json({ granted: true, key: "must not escape" }));
    vi.stubGlobal("fetch", upstream);
    expect((await dispatch("POST", `challenges/${id}/browser-grant`, { origin })).status).toBe(401);
    expect((await dispatch("GET", `challenges/${id}/backup`, { cookie })).status).toBe(404);
    expect(upstream).not.toHaveBeenCalled();

    const result = await dispatch("POST", `challenges/${id}/browser-grant`, {
      origin, cookie, authorization: "Bearer ignored", "x-friendship-browser-session": "ignored",
      "x-real-ip": "192.0.2.1", "x-forwarded-for": "192.0.2.2",
    }, JSON.stringify({ role: "player" }));
    expect(result.status).toBe(200);
    expect(result.headers.get("cache-control")).toBe("private, no-store");
    expect(await result.json()).toEqual({ granted: true });
    expect(upstream).toHaveBeenCalledWith(expect.stringContaining(`/v0.3/friendship/challenges/${id}/browser-grant`), expect.objectContaining({
      redirect: "error", cache: "no-store", headers: expect.any(Headers),
    }));
    const call = upstream.mock.calls[0] as unknown as [string, RequestInit];
    const sent = new Headers(call[1].headers);
    expect(sent.get("x-friendship-browser-session")).toBe(session);
    expect(sent.has("authorization")).toBe(false);
    expect(sent.has("cookie")).toBe(false);
    expect(sent.get("x-forwarded-for")).toBe("192.0.2.1");
  });
  it("returns the management file only for a user-initiated navigation", async () => {
    const upstream = vi.fn(async () => Response.json({ key: "b".repeat(64) }));
    vi.stubGlobal("fetch", upstream);
    const path = `challenges/${id}/backup`;
    expect((await dispatch("POST", path, { origin, cookie }, "locale=en")).status).toBe(403);
    expect(upstream).not.toHaveBeenCalled();
    const navigation = { "sec-fetch-mode": "navigate", "sec-fetch-dest": "document", "sec-fetch-user": "?1" };
    expect((await dispatch("POST", path, { origin: "null", cookie, ...navigation, "sec-fetch-site": "cross-site" }, "locale=en")).status).toBe(403);
    const download = await dispatch("POST", path, {
      origin: "null", cookie, ...navigation, "sec-fetch-site": "same-origin",
    }, "locale=en");
    expect(download.headers.get("content-disposition")).toContain("attachment");
    expect(download.headers.get("cache-control")).toBe("private, no-store");
    expect(await download.text()).toContain(`/en/share/friendship/${id}/manage#key=`);
  });
});
