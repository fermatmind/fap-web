import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { proxy } from "@/proxy";

const ROOT = process.cwd();
const RUNTIME_REPORT_PATH = "docs/seo/personality/big5-authority-v2-runtime-closeout-38-report-2026-07-15.json";

type RuntimeRecord = {
  route: string;
  page_family: string;
  expected_runtime_class: string;
  observed: {
    http_status: number;
    feed_membership: Record<string, boolean>;
    private_path_links: string[];
  };
};

function read(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function withheldRuntimeRecords(): RuntimeRecord[] {
  const report = JSON.parse(read(RUNTIME_REPORT_PATH)) as { records: RuntimeRecord[] };
  return report.records.filter((record) => record.expected_runtime_class === "NEW_FAIL_CLOSED_DRAFT_PRIMARY");
}

async function runProxy(pathname: string) {
  return await proxy(new NextRequest(`https://fermatmind.com${pathname}`));
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("BIG5-AUTHORITY-V2-SOFT404-39", () => {
  it("locks the exact 100 Article plus four technical-trust withheld runtime fixtures", () => {
    const records = withheldRuntimeRecords();
    const articleRecords = records.filter((record) => record.page_family === "article");
    const technicalTrustRecords = records.filter((record) => record.page_family === "technical_trust");

    expect(records).toHaveLength(104);
    expect(articleRecords).toHaveLength(100);
    expect(technicalTrustRecords).toHaveLength(4);
    expect(new Set(records.map((record) => record.route)).size).toBe(104);
    expect(articleRecords.every((record) => /^\/(en|zh)\/articles\/[^/]+$/.test(record.route))).toBe(true);
    expect(technicalTrustRecords.map((record) => record.route).sort()).toEqual([
      "/en/personality/big-five/methodology",
      "/en/personality/big-five/source-review-policy",
      "/zh/personality/big-five/methodology",
      "/zh/personality/big-five/source-review-policy",
    ]);
    expect(records.every((record) => record.observed.http_status === 200)).toBe(true);
    expect(records.every((record) => Object.values(record.observed.feed_membership).every((present) => !present))).toBe(true);
    expect(records.every((record) => record.observed.private_path_links.length === 0)).toBe(true);
  });

  it("returns authoritative non-200 responses for all 100 withheld Article routes before rendering streams", async () => {
    const articleRoutes = withheldRuntimeRecords()
      .filter((record) => record.page_family === "article")
      .map((record) => record.route);
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      expect(init?.method).toBe("HEAD");
      expect(init?.cache).toBe("no-store");
      return new Response(null, { status: 404 });
    });
    vi.stubGlobal("fetch", fetchMock);

    for (const route of articleRoutes) {
      const response = await runProxy(route);
      expect(response.status, route).toBe(404);
      expect(response.headers.get("x-robots-tag")?.toLowerCase(), route).toContain("noindex");
      expect(response.headers.get("cache-control"), route).toBe("no-store");
    }

    expect(fetchMock).toHaveBeenCalledTimes(100);
    for (const [input] of fetchMock.mock.calls) {
      const authorityUrl = String(input);
      expect(authorityUrl).toMatch(/^https:\/\/api\.fermatmind\.com\/api\/v0\.5\/articles\//);
      expect(authorityUrl).toContain("org_id=0");
      expect(authorityUrl).toMatch(/locale=(en|zh-CN)/);
    }
  });

  it("returns 404 for all four unknown technical-trust catch-all routes without inventing frontend authority", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const technicalTrustRoutes = withheldRuntimeRecords()
      .filter((record) => record.page_family === "technical_trust")
      .map((record) => record.route);

    for (const route of technicalTrustRoutes) {
      const response = await runProxy(route);
      expect(response.status, route).toBe(404);
      expect(response.headers.get("x-robots-tag")?.toLowerCase(), route).toContain("noindex");
    }

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("preserves authoritative 410 and published controls while transient probes fall through", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 410 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockRejectedValueOnce(new Error("temporary authority probe failure"));
    vi.stubGlobal("fetch", fetchMock);

    const gone = await runProxy("/en/articles/apply-personality-research-without-overclaiming");
    const publishedArticle = await runProxy("/en/articles/big-five-personality-test-vs-mbti");
    const transient = await runProxy("/en/articles/transient-authority-read");
    const networkFailure = await runProxy("/zh/articles/network-authority-read");
    const publishedBigFive = await runProxy("/en/personality/big-five/openness");

    expect(gone.status).toBe(410);
    expect(publishedArticle.status).toBe(200);
    expect(publishedArticle.headers.get("x-middleware-next")).toBe("1");
    expect(transient.status).toBe(200);
    expect(transient.headers.get("x-middleware-next")).toBe("1");
    expect(networkFailure.status).toBe(200);
    expect(networkFailure.headers.get("x-middleware-next")).toBe("1");
    expect(publishedBigFive.status).toBe(200);
    expect(publishedBigFive.headers.get("x-middleware-next")).toBe("1");
  });

  it("keeps route metadata on the not-found boundary and does not hard-code withheld Article slugs", () => {
    const articlePage = read("app/(localized)/[locale]/articles/[slug]/page.tsx");
    const technicalTrustPage = read("app/(localized)/[locale]/personality/big-five/[...slug]/page.tsx");
    const proxySource = read("proxy.ts");
    const articleMetadata = articlePage.slice(
      articlePage.indexOf("export async function generateMetadata"),
      articlePage.indexOf("export default async function ArticleDetailPage"),
    );
    const technicalTrustMetadata = technicalTrustPage.slice(
      technicalTrustPage.indexOf("export async function generateMetadata"),
      technicalTrustPage.indexOf("export default async function BigFiveDimensionPage"),
    );

    expect(articleMetadata).toContain("if (!article)");
    expect(articleMetadata).toContain("notFound();");
    expect(articleMetadata).not.toContain("Post Not Found");
    expect(technicalTrustMetadata.match(/notFound\(\);/g)).toHaveLength(2);
    expect(technicalTrustMetadata).not.toContain("buildFallbackMetadata");
    expect(proxySource).toContain('method: "HEAD"');
    expect(proxySource).toContain("buildApiUrl(`/v0.5/articles/");
    expect(proxySource).not.toContain("apply-personality-research-without-overclaiming");
    expect(proxySource).not.toContain("source-review-policy");
  });
});
