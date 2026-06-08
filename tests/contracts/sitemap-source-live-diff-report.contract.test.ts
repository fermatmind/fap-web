import { describe, expect, it } from "vitest";

import {
  assertSitemapDiffGate,
  buildSitemapDiffReport,
  getSitemapDiffGateViolations,
  normalizeUrl,
  parseSitemapLocs,
  parseSourceItems,
  renderMarkdownReport,
} from "../../scripts/seo/diff-sitemap-source-vs-live.mjs";

describe("sitemap source vs live diff report", () => {
  it("normalizes backend source items and XML sitemap locs for deterministic comparison", () => {
    expect(normalizeUrl("https://www.fermatmind.com/en/tests/")).toBe("https://fermatmind.com/en/tests");
    expect(normalizeUrl("/zh/tests?x=1")).toBe("https://fermatmind.com/zh/tests?x=1");

    expect(
      parseSourceItems({
        items: [
          { loc: "https://fermatmind.com/en/tests/" },
          { url: "/zh/tests" },
          "https://fermatmind.com/en/tests",
        ],
      })
    ).toEqual(["https://fermatmind.com/en/tests", "https://fermatmind.com/zh/tests"]);

    expect(
      parseSitemapLocs(`
        <urlset>
          <url><loc>https://fermatmind.com/en/tests?x=1&amp;y=2</loc></url>
          <url><loc>https://www.fermatmind.com/zh/tests/</loc></url>
        </urlset>
      `)
    ).toEqual(["https://fermatmind.com/en/tests?x=1&y=2", "https://fermatmind.com/zh/tests"]);
  });

  it("labels every current diff family with source-backed explanations", () => {
    const report = buildSitemapDiffReport({
      fetchedAt: "2026-06-09T00:00:00.000Z",
      sourcePayload: {
        count: 6,
        items: [
          { loc: "https://fermatmind.com/en/tests" },
          { loc: "https://fermatmind.com/tests/mbti-personality-test-16-personality-types" },
          { loc: "https://fermatmind.com/en/help/about" },
          { loc: "https://fermatmind.com/en/career/jobs" },
          { loc: "https://fermatmind.com/en/result/demo" },
          { loc: "https://fermatmind.com/en/unexplained-backend-only" },
        ],
      },
      sitemapXml: `
        <urlset>
          <url><loc>https://fermatmind.com/en/tests</loc></url>
          <url><loc>https://fermatmind.com/en/tests/mbti-personality-test-16-personality-types</loc></url>
          <url><loc>https://fermatmind.com/en/about</loc></url>
        </urlset>
      `,
      sourceHeaders: { "x-fermat-cache": "stale" },
      sitemapHeaders: { "last-modified": "Tue, 09 Jun 2026 00:00:00 GMT" },
    });

    expect(report.summary).toMatchObject({
      included_count: 1,
      backend_only_count: 5,
      live_only_count: 2,
      private_live_url_count: 0,
      difference_label_counts: {
        excluded_by_rule: 2,
        excluded_by_noindex: 1,
        excluded_by_private_path: 1,
        missing_unexpectedly: 2,
        cache_stale: 0,
        unknown: 1,
      },
    });
    expect(report.source.cache_state).toBe("stale");
    expect(report.live_sitemap.last_modified).toBe("Tue, 09 Jun 2026 00:00:00 GMT");

    const byUrl = new Map(report.differences.map((row) => [new URL(row.url).pathname, row]));
    expect(byUrl.get("/tests/mbti-personality-test-16-personality-types")).toMatchObject({
      side: "backend_only",
      label: "excluded_by_rule",
    });
    expect(byUrl.get("/en/help/about")).toMatchObject({ side: "backend_only", label: "excluded_by_rule" });
    expect(byUrl.get("/en/career/jobs")).toMatchObject({ side: "backend_only", label: "excluded_by_noindex" });
    expect(byUrl.get("/en/result/demo")).toMatchObject({
      side: "backend_only",
      label: "excluded_by_private_path",
    });
    expect(byUrl.get("/en/unexplained-backend-only")).toMatchObject({ side: "backend_only", label: "unknown" });
    expect(byUrl.get("/en/tests/mbti-personality-test-16-personality-types")).toMatchObject({
      side: "live_only",
      label: "missing_unexpectedly",
    });
    expect(byUrl.get("/en/about")).toMatchObject({ side: "live_only", label: "missing_unexpectedly" });

    const markdown = renderMarkdownReport(report);
    expect(markdown).toContain("# Sitemap Source vs Live Diff Report");
    expect(markdown).toContain("excluded_by_rule");
    expect(markdown).toContain("Live private URL violations: 0");
    expect(markdown).toContain("lib/seo/sitemapAuthorityAdapters.cjs");
    expect(markdown).toContain("fap-api/backend/app/Services/SEO/SitemapGenerator.php");
  });

  it("flags private live sitemap inclusions as safety violations", () => {
    const report = buildSitemapDiffReport({
      sourcePayload: { items: [] },
      sitemapXml: `
        <urlset>
          <url><loc>https://fermatmind.com/en/orders/demo</loc></url>
          <url><loc>https://fermatmind.com/zh/tests/mbti/take</loc></url>
        </urlset>
      `,
    });

    expect(report.summary.private_live_url_count).toBe(2);
    expect(report.private_live_urls).toEqual([
      "https://fermatmind.com/en/orders/demo",
      "https://fermatmind.com/zh/tests/mbti/take",
    ]);
    expect(report.differences.every((row) => row.label === "excluded_by_private_path")).toBe(true);
    expect(getSitemapDiffGateViolations(report)).toEqual([
      {
        label: "private_live_url",
        count: 2,
        message: "Live sitemap contains private URL families.",
      },
      {
        label: "excluded_by_private_path",
        count: 2,
        message: "Backend source or live sitemap includes private URL families that must stay out of sitemap authority.",
      },
    ]);
  });

  it("keeps the final live parity gate narrow and fail-closed for unexpected or unsafe differences", () => {
    const cleanReport = buildSitemapDiffReport({
      sourcePayload: {
        items: [
          { loc: "https://fermatmind.com/en/tests" },
          { loc: "https://fermatmind.com/zh/tests" },
        ],
      },
      sitemapXml: `
        <urlset>
          <url><loc>https://fermatmind.com/en/tests</loc></url>
          <url><loc>https://fermatmind.com/zh/tests</loc></url>
        </urlset>
      `,
    });
    expect(getSitemapDiffGateViolations(cleanReport)).toEqual([]);
    expect(() => assertSitemapDiffGate(cleanReport)).not.toThrow();

    const missingReport = buildSitemapDiffReport({
      sourcePayload: { items: [{ loc: "https://fermatmind.com/en/tests" }] },
      sitemapXml: `
        <urlset>
          <url><loc>https://fermatmind.com/en/tests</loc></url>
          <url><loc>https://fermatmind.com/en/business</loc></url>
        </urlset>
      `,
    });
    expect(getSitemapDiffGateViolations(missingReport)).toMatchObject([
      { label: "missing_unexpectedly", count: 1 },
    ]);
    expect(() => assertSitemapDiffGate(missingReport)).toThrow(
      "sitemap_diff_gate_failed: missing_unexpectedly=1"
    );

    const unknownReport = buildSitemapDiffReport({
      sourcePayload: {
        items: [
          { loc: "https://fermatmind.com/en/tests" },
          { loc: "https://fermatmind.com/en/not-explained-by-known-rules" },
        ],
      },
      sitemapXml: `
        <urlset>
          <url><loc>https://fermatmind.com/en/tests</loc></url>
        </urlset>
      `,
    });
    expect(getSitemapDiffGateViolations(unknownReport)).toMatchObject([{ label: "unknown", count: 1 }]);
    expect(() => assertSitemapDiffGate(unknownReport)).toThrow("sitemap_diff_gate_failed: unknown=1");
  });
});
