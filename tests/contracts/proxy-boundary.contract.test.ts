import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import * as testing from "next/experimental/testing/server";
import { config, proxy } from "@/proxy";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("proxy boundary contract", () => {
  it("matches content roots and excludes robots, sitemap, and llms endpoints", () => {
    expect(testing.unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: "/articles" })).toBe(true);
    expect(testing.unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: "/career" })).toBe(true);
    expect(testing.unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: "/topics" })).toBe(true);
    expect(testing.unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: "/personality" })).toBe(true);

    expect(testing.unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: "/robots.txt" })).toBe(false);
    expect(testing.unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: "/sitemap.xml" })).toBe(false);
    expect(testing.unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: "/llms.txt" })).toBe(false);
  });

  it("bypasses anon-id side effects for static asset paths", () => {
    const response = proxy(new NextRequest("https://example.com/site.webmanifest"));

    expect(response.headers.get("set-cookie")).toBeNull();
    expect(response.headers.get("x-middleware-request-x-anon-id")).toBeNull();
  });

  it("creates anon-id state when missing and forwards it to the request", () => {
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("proxy-anon-id");

    const response = proxy(new NextRequest("https://example.com/en/tests/mbti-personality-test-16-personality-types"));

    expect(response.cookies.get("fap_anonymous_id_v1")?.value).toBe("proxy-anon-id");
    expect(response.headers.get("x-middleware-override-headers")).toContain("x-anon-id");
    expect(response.headers.get("x-middleware-request-x-anon-id")).toBe("proxy-anon-id");
  });

  it("reuses cookie anon-id and keeps take pages noindexed", () => {
    const response = proxy(
      new NextRequest("https://example.com/en/tests/mbti-personality-test-16-personality-types/take", {
        headers: {
          cookie: "fap_anonymous_id_v1=known-anon",
        },
      })
    );

    expect(response.headers.get("set-cookie")).toBeNull();
    expect(response.headers.get("x-middleware-request-x-anon-id")).toBe("known-anon");
    expect(response.headers.get("x-robots-tag")?.toLowerCase()).toContain("noindex");
  });
});
