import { afterEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import * as testing from "next/experimental/testing/server";
import { config, proxy } from "@/proxy";

const ROOT = process.cwd();

function readSource(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("proxy boundary contract", () => {
  it("matches content roots and machine discoverability endpoints", () => {
    expect(testing.unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: "/articles" })).toBe(true);
    expect(testing.unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: "/career" })).toBe(true);
    expect(testing.unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: "/topics" })).toBe(true);
    expect(testing.unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: "/personality" })).toBe(true);

    expect(testing.unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: "/robots.txt" })).toBe(true);
    expect(testing.unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: "/sitemap.xml" })).toBe(true);
    expect(testing.unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: "/llms.txt" })).toBe(true);
  });

  it("redirects locale-less legacy types routes into the localized personality hub", () => {
    const response = proxy(
      new NextRequest("https://example.com/types/intj?utm=a", {
        headers: {
          "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
        },
      })
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://example.com/zh/personality/intj-a?utm=a");
  });

  it("forces locale-less content roots to chinese for china country traffic", () => {
    const response = proxy(
      new NextRequest("https://example.com/career?utm=a", {
        headers: {
          cookie: "fm_locale=en",
          "cf-ipcountry": "CN",
          "accept-language": "en-US,en;q=0.9",
        },
      })
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://example.com/zh/career?utm=a");
  });

  it("redirects localized types detail pages into localized personality detail pages", () => {
    const response = proxy(new NextRequest("https://example.com/en/types/intj"));

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://example.com/en/personality/intj-a");
  });

  it("keeps professions retired with 410 and noindex", () => {
    const response = proxy(new NextRequest("https://example.com/en/professions"));

    expect(response.status).toBe(410);
    expect(response.headers.get("x-robots-tag")?.toLowerCase()).toContain("noindex");
  });

  it("bypasses anon-id side effects for static asset paths", () => {
    const response = proxy(new NextRequest("https://example.com/site.webmanifest"));

    expect(response.headers.get("set-cookie")).toBeNull();
    expect(response.headers.get("x-middleware-request-x-anon-id")).toBeNull();
  });

  it("creates anon-id state when missing and forwards it to the request", () => {
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("proxy-anon-id");

    const response = proxy(new NextRequest("https://example.com/en/tests/mbti-personality-test-16-personality-types/take"));

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

  it("marks private route requests for server-side analytics bootstrap suppression", () => {
    for (const url of [
      "https://example.com/zh/orders/lookup?orderNo=SYNTHETIC_DO_NOT_USE",
      "https://example.com/zh/orders/SYNTHETIC_DO_NOT_USE",
      "https://example.com/zh/result/SYNTHETIC_DO_NOT_USE",
      "https://example.com/zh/share/SYNTHETIC_DO_NOT_USE",
      "https://example.com/en/result/SYNTHETIC_DO_NOT_USE",
      "https://example.com/en/orders/lookup?orderNo=SYNTHETIC_DO_NOT_USE",
      "https://example.com/en/share/SYNTHETIC_DO_NOT_USE",
    ]) {
      const response = proxy(new NextRequest(url));

      expect(response.headers.get("x-middleware-request-x-fm-private-analytics-suppressed"), url).toBe("true");
      expect(response.headers.get("x-robots-tag")?.toLowerCase(), url).toContain("noindex");
      expect(response.headers.get("x-robots-tag")?.toLowerCase(), url).toContain("nocache");
      expect(response.headers.get("cache-control")?.toLowerCase(), url).toContain("no-store");
      expect(response.headers.get("referrer-policy"), url).toBe("no-referrer");
    }
  });

  it("does not mark public indexable pages for analytics bootstrap suppression", () => {
    for (const url of [
      "https://example.com/",
      "https://example.com/zh/tests",
      "https://example.com/zh/tests/mbti-personality-test-16-personality-types",
      "https://example.com/zh/tests/holland-career-interest-test-riasec",
      "https://example.com/zh/articles",
      "https://example.com/zh/personality",
    ]) {
      const response = proxy(new NextRequest(url));

      expect(response.headers.get("x-middleware-request-x-fm-private-analytics-suppressed"), url).toBeNull();
    }
  });

  it("reuses cookie anon-id on exact test landing pages for rollout consistency", () => {
    const response = proxy(
      new NextRequest("https://example.com/en/tests/mbti-personality-test-16-personality-types", {
        headers: {
          cookie: "fap_anonymous_id_v1=known-landing-anon",
        },
      })
    );

    expect(response.headers.get("set-cookie")).toBeNull();
    expect(response.headers.get("x-middleware-override-headers")).toContain("x-anon-id");
    expect(response.headers.get("x-middleware-request-x-anon-id")).toBe("known-landing-anon");
  });

  it("creates proxy-owned anon identity for test landing pages when absent", () => {
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("proxy-landing-id");

    const response = proxy(new NextRequest("https://example.com/en/tests/mbti-personality-test-16-personality-types"));

    expect(response.cookies.get("fap_anonymous_id_v1")?.value).toBe("proxy-landing-id");
    expect(response.headers.get("x-middleware-request-x-anon-id")).toBe("proxy-landing-id");
  });

  it("does not attach anon identity to tests category pages", () => {
    const response = proxy(
      new NextRequest("https://example.com/en/tests/category/personality", {
        headers: {
          cookie: "fap_anonymous_id_v1=known-category-anon",
          "x-anon-id": "caller-controlled-id",
        },
      })
    );

    expect(response.headers.get("x-middleware-request-x-anon-id")).toBeNull();
    expect(response.headers.get("x-middleware-override-headers") ?? "").not.toContain("x-anon-id");
    expect(response.cookies.get("fap_anonymous_id_v1")).toBeUndefined();
  });

  it("does not persist caller-supplied anon-id headers", () => {
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("proxy-generated-id");

    const response = proxy(
      new NextRequest("https://example.com/en/tests/mbti-personality-test-16-personality-types/take", {
        headers: {
          "x-anon-id": "caller-controlled-id",
        },
      })
    );

    expect(response.cookies.get("fap_anonymous_id_v1")?.value).toBe("proxy-generated-id");
    expect(response.headers.get("x-middleware-request-x-anon-id")).toBe("proxy-generated-id");
    expect(response.headers.get("x-middleware-request-x-anon-id")).not.toBe("caller-controlled-id");
  });

  it("keeps ordinary page routes sanitized when callers supply anon-id headers", () => {
    const response = proxy(
      new NextRequest("https://example.com/en/articles/career-fit", {
        headers: {
          "x-anon-id": "caller-controlled-id",
        },
      })
    );

    expect(response.headers.get("x-middleware-request-x-anon-id")).toBeNull();
    expect(response.headers.get("x-middleware-override-headers") ?? "").not.toContain("x-anon-id");
    expect(response.cookies.get("fap_anonymous_id_v1")).toBeUndefined();
  });

  it("does not keep anonymous identity plumbing for retired SBTI fun routes", () => {
    const response = proxy(new NextRequest("https://example.com/zh/fun/sbti/result"));

    expect(response.headers.get("x-middleware-request-x-anon-id")).toBeNull();
    expect(response.headers.get("x-middleware-override-headers") ?? "").not.toContain("x-anon-id");
    expect(response.cookies.get("fap_anonymous_id_v1")).toBeUndefined();
  });

  it("forwards cookie-derived anon identity through same-origin attempt API proxy paths", () => {
    const response = proxy(
      new NextRequest("https://example.com/api/v0.3/attempts/submit", {
        headers: {
          cookie: "fap_anonymous_id_v1=known-api-anon",
          "x-anon-id": "caller-controlled-id",
        },
      })
    );

    expect(response.headers.get("x-middleware-override-headers")).toContain("x-anon-id");
    expect(response.headers.get("x-middleware-request-x-anon-id")).toBe("known-api-anon");
    expect(response.headers.get("x-middleware-request-x-anon-id")).not.toBe("caller-controlled-id");
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("creates proxy-owned anon identity for report API proxy paths when absent", () => {
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("proxy-api-generated-id");

    const response = proxy(new NextRequest("https://example.com/api/v0.3/attempts/attempt-1/report-access"));

    expect(response.cookies.get("fap_anonymous_id_v1")?.value).toBe("proxy-api-generated-id");
    expect(response.headers.get("x-middleware-request-x-anon-id")).toBe("proxy-api-generated-id");
  });

  it("replaces malformed anon cookies before forwarding identity", () => {
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("proxy-recovered-id");

    const response = proxy(
      new NextRequest("https://example.com/en/tests/mbti-personality-test-16-personality-types/take", {
        headers: {
          cookie: "fap_anonymous_id_v1=<script>",
        },
      })
    );

    expect(response.cookies.get("fap_anonymous_id_v1")?.value).toBe("proxy-recovered-id");
    expect(response.headers.get("x-middleware-request-x-anon-id")).toBe("proxy-recovered-id");
  });

  it("keeps rollout gates independent from request anonymous identity", () => {
    const landingSource = readSource("app/(localized)/[locale]/tests/[slug]/page.tsx");
    const takeSource = readSource("app/(localized)/[locale]/tests/[slug]/take/page.tsx");

    expect(landingSource).not.toContain("resolveRequestAnonId");
    expect(takeSource).not.toContain("resolveRequestAnonId");
    expect(landingSource).not.toMatch(/resolveScaleRollout\(\{[\s\S]*?anonId[\s\S]*?\}\)/);
    expect(takeSource).not.toMatch(/resolveScaleRollout\(\{[\s\S]*?anonId[\s\S]*?\}\)/);
  });
});
