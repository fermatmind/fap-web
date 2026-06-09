import { describe, expect, it } from "vitest";

import {
  buildArticleH1AuditReport,
  parseSitemapArticleUrls,
  renderMarkdownReport,
  selectArticleSample,
} from "../../scripts/seo/audit-article-h1.mjs";

describe("article H1 live audit contract", () => {
  it("extracts only localized public article detail URLs from sitemap XML", () => {
    const urls = parseSitemapArticleUrls(`
      <urlset>
        <url><loc>https://fermatmind.com/en/articles/mbti-basics</loc></url>
        <url><loc>https://fermatmind.com/zh/articles/mbti-basics/</loc></url>
        <url><loc>https://fermatmind.com/en/articles</loc></url>
        <url><loc>https://fermatmind.com/en/blog/legacy</loc></url>
        <url><loc>https://fermatmind.com/en/result/private</loc></url>
        <url><loc>https://example.com/en/articles/off-site</loc></url>
      </urlset>
    `);

    expect(urls).toEqual([
      "https://fermatmind.com/en/articles/mbti-basics",
      "https://fermatmind.com/zh/articles/mbti-basics",
    ]);
  });

  it("uses deterministic seeded random sampling for repeatable live audit reports", () => {
    const urls = [
      "https://fermatmind.com/en/articles/a",
      "https://fermatmind.com/en/articles/b",
      "https://fermatmind.com/en/articles/c",
      "https://fermatmind.com/en/articles/d",
      "https://fermatmind.com/en/articles/e",
    ];

    expect(selectArticleSample(urls, 3, "stable-seed")).toEqual(selectArticleSample(urls, 3, "stable-seed"));
    expect(selectArticleSample(urls, 3, "stable-seed")).toHaveLength(3);
  });

  it("passes only when at least 20 sampled article pages each have exactly one final DOM h1", () => {
    const pages = Array.from({ length: 20 }, (_, index) => ({
      url: `https://fermatmind.com/en/articles/sample-${index + 1}`,
      final_url: `https://fermatmind.com/en/articles/sample-${index + 1}`,
      status: 200,
      duration_ms: 10,
      h1_count: 1,
      h1_texts: [`Sample ${index + 1}`],
      passed: true,
      issues: [],
    }));

    const report = buildArticleH1AuditReport({
      fetchedAt: "2026-06-09T00:00:00.000Z",
      sampleSize: 20,
      sitemapStatus: 200,
      sitemapArticleUrlCount: 44,
      sampledUrls: pages.map((page) => page.url),
      pageResults: pages,
    });

    expect(report.summary).toMatchObject({
      passed: true,
      audited_page_count: 20,
      passed_page_count: 20,
      failed_page_count: 0,
      h1_count_distribution: { "1": 20 },
    });
    expect(report.sample.strategy).toBe("seeded_random_from_live_sitemap_article_detail_urls");

    const markdown = renderMarkdownReport(report);
    expect(markdown).toContain("# Article H1 Audit Report");
    expect(markdown).toContain("Playwright Chromium DOM");
    expect(markdown).toContain("Audited pages: 20");
  });

  it("fails closed for short samples non-200 pages or pages with zero or multiple h1 elements", () => {
    const report = buildArticleH1AuditReport({
      sampleSize: 20,
      sitemapStatus: 200,
      sitemapArticleUrlCount: 19,
      sampledUrls: ["https://fermatmind.com/en/articles/bad"],
      pageResults: [
        {
          url: "https://fermatmind.com/en/articles/bad",
          final_url: "https://fermatmind.com/en/articles/bad",
          status: 200,
          duration_ms: 10,
          h1_count: 2,
          h1_texts: ["Title", "Body H1"],
          passed: false,
          issues: [{ reason: "h1_count_not_one", detail: "h1_count=2" }],
        },
      ],
    });

    expect(report.summary.passed).toBe(false);
    expect(report.issues.map((issue) => issue.reason)).toEqual([
      "insufficient_article_urls",
      "insufficient_sample_size",
      "page_h1_failures",
    ]);
    expect(renderMarkdownReport(report)).toContain("h1_count_not_one");
  });
});
