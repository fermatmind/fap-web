import { describe, expect, it } from "vitest";

import {
  buildConfig,
  evaluateSitemapBody,
  isPrivateSitemapPath,
  parseSitemapLocs,
  stripLocalePrefix,
} from "../../scripts/seo/assert-live-sitemap-stability.mjs";

describe("live sitemap stability verifier contract", () => {
  it("parses sitemap locs and preserves XML-decoded canonical URLs", () => {
    const locs = parseSitemapLocs(`
      <urlset>
        <url><loc>https://fermatmind.com/</loc></url>
        <url><loc>https://fermatmind.com/en/tests?x=1&amp;y=2</loc></url>
        <url><loc>https://fermatmind.com/</loc></url>
      </urlset>
    `);

    expect(locs).toEqual(["https://fermatmind.com/", "https://fermatmind.com/en/tests?x=1&y=2"]);
  });

  it("treats localized result order share pay history and take paths as private sitemap families", () => {
    expect(stripLocalePrefix("/zh/result/abc")).toBe("/result/abc");

    for (const path of [
      "/result/abc",
      "/results/abc",
      "/order/abc",
      "/orders/abc",
      "/share/abc",
      "/pay/abc",
      "/payment/abc",
      "/payments/abc",
      "/history",
      "/tests/mbti/take",
      "/en/result/abc",
      "/zh/orders/abc",
      "/zh/tests/holland-career-interest-test-riasec/take",
    ]) {
      expect(isPrivateSitemapPath(path), path).toBe(true);
    }

    for (const path of ["/", "/en/tests", "/zh/tests/big-five-personality-test", "/en/privacy"]) {
      expect(isPrivateSitemapPath(path), path).toBe(false);
    }
  });

  it("fails closed when sitemap body is empty unsafe host or contains private locs", () => {
    const empty = evaluateSitemapBody("", {
      sourceUrl: "https://fermatmind.com/sitemap.xml",
      allowedLocHosts: ["fermatmind.com"],
    });
    expect(empty.issues.map((issue) => issue.reason)).toContain("empty-sitemap");

    const unsafe = evaluateSitemapBody(
      `
        <urlset>
          <url><loc>https://fermatmind.com/en/tests</loc></url>
          <url><loc>https://fermatmind.com/zh/orders/demo</loc></url>
          <url><loc>https://evil.example/en/tests</loc></url>
        </urlset>
      `,
      {
        sourceUrl: "https://fermatmind.com/sitemap.xml",
        allowedLocHosts: ["fermatmind.com"],
      }
    );

    expect(unsafe.locCount).toBe(3);
    expect(unsafe.privateLocs).toEqual(["https://fermatmind.com/zh/orders/demo"]);
    expect(unsafe.unsafeLocs).toEqual([
      {
        loc: "https://evil.example/en/tests",
        reason: "unexpected-host",
        detail: "evil.example",
      },
    ]);
    expect(unsafe.issues.map((issue) => issue.reason)).toEqual(["private-url-family", "unsafe-loc"]);
  });

  it("builds a safe live or staging verifier config without allowing arbitrary hosts", () => {
    expect(() =>
      buildConfig(["https://example.com/sitemap.xml"], {
        SEO_SITEMAP_STABILITY_REQUESTS: "3",
      })
    ).toThrow("unexpected_sitemap_host=example.com");

    const live = buildConfig(["https://fermatmind.com/sitemap.xml"], {
      SEO_SITEMAP_STABILITY_REQUESTS: "3",
      SEO_SITEMAP_STABILITY_TIMEOUT_MS: "12000",
      SEO_SITEMAP_STABILITY_DELAY_MS: "1",
    });

    expect(live).toMatchObject({
      url: "https://fermatmind.com/sitemap.xml",
      requests: 3,
      timeoutMs: 12000,
      delayMs: 1,
      allowedLocHosts: ["fermatmind.com"],
    });

    const staging = buildConfig(["https://staging.fermatmind.com/sitemap.xml"], {
      SEO_SITEMAP_STABILITY_LOC_HOSTS: "staging.fermatmind.com,fermatmind.com",
    });

    expect(staging.allowedLocHosts).toEqual(["staging.fermatmind.com", "fermatmind.com"]);
  });
});
