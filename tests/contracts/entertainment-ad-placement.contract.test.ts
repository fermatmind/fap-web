import type { NextConfig } from "next";
import { getRewrittenUrl, unstable_getResponseFromNextConfig } from "next/experimental/testing/server";
import { NextRequest } from "next/server";
import nextConfig from "../../next.config.mjs";
import { describe, expect, it, vi } from "vitest";
import { proxy } from "@/proxy";

const origin = "https://fermatmind.com";
const history = "/zh/tests/play/global-history-quiz";
const adHeader = "x-fermat-entertainment-ad";

async function rewritten(path: string, response: Response) {
  const mode = response.headers.get(`x-middleware-request-${adHeader}`);
  const resolved = await unstable_getResponseFromNextConfig({
    url: new URL(path, origin).href,
    nextConfig: { rewrites: (nextConfig as unknown as NextConfig).rewrites },
    headers: mode ? { [adHeader]: mode } : {},
  });
  return getRewrittenUrl(resolved);
}

function request(path: string, host = "fermatmind.com", headers: Record<string, string> = {}) {
  return proxy(new NextRequest(new URL(path, origin), { headers: { host, ...headers } }));
}

describe("public entertainment AdSense routes", () => {
  it.each([
    [history, "/zh/ad-placement/play/global-history-quiz"],
    [`${history}/take`, "/zh/ad-placement/play/global-history-quiz/take"],
    ["/en/tests/play/changan-history-quiz/take?start=1", "/en/ad-placement/play/changan-history-quiz/take"],
    ["/en/tests/play/friendship-quiz/take", "/en/ad-placement/play/friendship-quiz/take"],
    ["/en/tests/explore/soldier-poet-king-quiz", "/en/ad-placement/explore/soldier-poet-king-quiz"],
    ["/zh-TW/tests/explore/seven-sins-virtues-test/take", "/zh-TW/ad-placement/explore/seven-sins-virtues-test/take"],
  ])("keeps %s public while selecting the isolated document", async (path, placement) => {
    const response = await request(path);
    expect(response.headers.get("location")).toBeNull();
    expect(new URL((await rewritten(path, response))!).pathname).toBe(placement);
    expect(response.headers.get("x-middleware-request-x-fermat-entertainment-ad")).toBe("enabled");
    if (placement.endsWith("/take")) {
      expect(response.headers.get("referrer-policy")).toBe("strict-origin");
      expect(response.headers.get("x-robots-tag")).toContain("noindex");
      expect(response.headers.get("cache-control")).toContain("no-store");
    }
  });

  it.each([
    `${history}/results/mansa-musa`, `${history}/take?session=private`,
    "/zh/tests/explore/rice-purity-test", "/en/tests/explore/sbti-test/take",
    "/en/tests/explore/natal-chart", "/zh/tests/explore/disc/take", "/zh/tests/explore/mental-age/take",
    "/en/share/friendship/6c7adb91-7236-47b5-a04d-e8bf9cd769cc/manage",
  ])("keeps ads out of %s", async (path) => {
    const response = await request(path, "fermatmind.com", { "x-fermat-entertainment-ad": "enabled" });
    expect(await rewritten(path, response)).toBeNull();
    expect(response.headers.get("x-middleware-request-x-fermat-entertainment-ad")).toBeNull();
  });

  it("allows consent preview and Next navigation without treating them as ordinary query parameters", async () => {
    const preview = await request(`${history}?fc=alwaysshow&fctype=gdpr`);
    expect(preview.headers.get("x-middleware-request-x-fermat-entertainment-ad")).toBe("preview");
    const navigation = await request(`${history}?_rsc=abc12`, "fermatmind.com", { rsc: "1" });
    expect(navigation.headers.get("x-middleware-request-x-fermat-entertainment-ad")).toBe("enabled");
  });

  it("keeps the internal route inaccessible and staging ad-free", async () => {
    const direct = await request("/zh-TW/ad-placement/explore/chiikawa");
    expect(direct.status).toBe(404);
    expect(await rewritten(history, await request(history, "localhost:3189"))).toBeNull();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://staging.fermatmind.com");
    try {
      expect(await rewritten(history, await request(history))).toBeNull();
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
