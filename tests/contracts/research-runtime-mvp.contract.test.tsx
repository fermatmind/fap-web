import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getResearchReport, type ResearchReport } from "@/lib/research/reports";

const ROOT = process.cwd();

function readSource(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function sampleReport(overrides: Partial<ResearchReport> = {}): ResearchReport {
  return {
    id: 101,
    slug: "backend-research-report",
    locale: "en",
    pageEntityType: "research_report",
    title: "Backend Supplied Research Title",
    executiveSummary: "Backend supplied executive summary.",
    bodyMd: "Backend supplied body block.",
    researchType: "market_observation",
    methodology: "Backend supplied methodology.",
    sampleDisclaimer: "Backend supplied sample disclaimer.",
    claimBoundary: "Backend supplied claim boundary.",
    authorName: "CMS Author",
    publicReview: { reviewState: "approved", lastReviewedAt: "2026-05-18T00:00:00.000Z", reviewer: null },
    references: ["Backend supplied reference"],
    downloadableAssetPlaceholder: "Backend supplied downloadable asset placeholder.",
    publishedAt: "2026-05-18T00:00:00Z",
    seoTitle: "Backend SEO Title",
    seoDescription: "Backend SEO description.",
    canonicalPath: "/research/backend-research-report",
    ...overrides,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("Research runtime MVP contract", () => {
  it("normalizes only the public backend Research payload and does not repair draft exposure", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      expect(url).toContain("/api/v0.5/research/backend-research-report?");
      expect(url).toContain("locale=zh-CN");
      expect(url).toContain("org_id=0");

      return jsonResponse({
        ok: true,
        report: {
          id: 101,
          slug: "backend-research-report",
          locale: "zh-CN",
          page_entity_type: "research_report",
          title: "Backend Supplied Research Title",
          executive_summary: "Backend supplied executive summary.",
          body_md: "Backend supplied body block.",
          research_type: "market_observation",
          methodology: "Backend supplied methodology.",
          sample_disclaimer: "Backend supplied sample disclaimer.",
          claim_boundary: "Backend supplied claim boundary.",
          author_name: "CMS Author",
          reviewer_name: "CMS Reviewer",
          review_state: "approved",
          reviewer: null,
          references: ["Backend supplied reference"],
          downloadable_asset_placeholder: "Backend supplied downloadable asset placeholder.",
          last_reviewed_at: "2026-05-18",
          published_at: "2026-05-18T00:00:00Z",
          seo_title: "Backend SEO Title",
          seo_description: "Backend SEO description.",
          canonical_path: "/research/backend-research-report",
        },
      });
    });

    vi.stubGlobal("fetch", fetchMock);

    const report = await getResearchReport("backend-research-report", "zh");

    expect(report).toMatchObject({
      slug: "backend-research-report",
      locale: "zh",
      pageEntityType: "research_report",
      title: "Backend Supplied Research Title",
      methodology: "Backend supplied methodology.",
      sampleDisclaimer: "Backend supplied sample disclaimer.",
      claimBoundary: "Backend supplied claim boundary.",
      publicReview: {
        reviewState: "unknown",
        lastReviewedAt: null,
        reviewer: null,
      },
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("returns null for not found backend responses instead of using frontend fallback content", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ ok: false, error: { code: "NOT_FOUND" } }, 404))
    );

    await expect(getResearchReport("missing-research-report", "en")).resolves.toBeNull();
  });

  it("returns null for draft or unpublished Research payloads even when the backend returns report fields", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          ok: true,
          report: {
            id: 102,
            slug: "draft-research-report",
            locale: "en",
            page_entity_type: "research_report",
            title: "Draft Research Title",
            executive_summary: "Draft executive summary.",
            body_md: "Draft body block.",
            methodology: "Draft methodology.",
            sample_disclaimer: "Draft sample disclaimer.",
            claim_boundary: "Draft claim boundary.",
            status: "draft",
            published_at: "2026-05-18T00:00:00Z",
            published_revision_id: 19,
          },
        })
      )
    );

    await expect(getResearchReport("draft-research-report", "en")).resolves.toBeNull();
  });

  it("returns null when the backend Research payload slug differs from the requested public slug", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          ok: true,
          report: {
            id: 103,
            slug: "different-research-report",
            locale: "en",
            page_entity_type: "research_report",
            title: "Different Research Title",
            executive_summary: "Different executive summary.",
            body_md: "Different body block.",
            methodology: "Different methodology.",
            sample_disclaimer: "Different sample disclaimer.",
            claim_boundary: "Different claim boundary.",
            status: "published",
            published_at: "2026-05-18T00:00:00Z",
            published_revision_id: 20,
          },
        })
      )
    );

    await expect(getResearchReport("requested-research-report", "en")).resolves.toBeNull();
  });

  it("renders the detail shell from backend payload and not local report copy", async () => {
    const getResearchReportMock = vi.fn(async () => sampleReport());

    vi.doMock("@/lib/research/reports", () => ({
      getResearchReport: getResearchReportMock,
      buildResearchReportPath: (slug: string, locale: string) => `/${locale}/research/${slug}`,
    }));
    vi.doMock("next/navigation", () => ({
      notFound: () => {
        throw new Error("NEXT_NOT_FOUND");
      },
    }));

    const page = await import("@/app/(localized)/[locale]/research/[slug]/page");
    const element = await page.default({
      params: Promise.resolve({ locale: "en", slug: "backend-research-report" }),
    });
    const html = renderToStaticMarkup(element);

    expect(getResearchReportMock).toHaveBeenCalledWith("backend-research-report", "en");
    expect(html).toContain("Backend Supplied Research Title");
    expect(html).toContain("Backend supplied executive summary.");
    expect(html).toContain("Backend supplied methodology.");
    expect(html).toContain("Backend supplied sample disclaimer.");
    expect(html).toContain("Backend supplied claim boundary.");
    expect(html).toContain("Backend supplied reference");
    expect(html).toContain("Backend supplied downloadable asset placeholder.");
    expect(html).not.toContain("MBTI Salary & Turnover Report");
  });

  it("generates Research metadata from backend SEO fields without frontend editorial fallback", async () => {
    const getResearchReportMock = vi.fn(async () =>
      sampleReport({
        seoTitle: "Backend Research SEO Title",
        seoDescription: "Backend Research SEO description.",
        canonicalPath: "/en/research/backend-research-report",
      })
    );

    vi.doMock("@/lib/research/reports", async () => {
      const actual = await vi.importActual<typeof import("@/lib/research/reports")>("@/lib/research/reports");

      return {
        ...actual,
        getResearchReport: getResearchReportMock,
      };
    });
    vi.doMock("next/navigation", () => ({
      notFound: () => {
        throw new Error("NEXT_NOT_FOUND");
      },
    }));

    const page = await import("@/app/(localized)/[locale]/research/[slug]/page");
    const metadata = await page.generateMetadata({
      params: Promise.resolve({ locale: "en", slug: "backend-research-report" }),
    });

    expect(getResearchReportMock).toHaveBeenCalledWith("backend-research-report", "en");
    expect(metadata.title).toBe("Backend Research SEO Title");
    expect(metadata.description).toBe("Backend Research SEO description.");
    expect(metadata.alternates?.canonical).toBe("http://localhost:3000/en/research/backend-research-report");
    expect(metadata.openGraph?.title).toBe("Backend Research SEO Title");
    expect(metadata.openGraph?.description).toBe("Backend Research SEO description.");
    expect(metadata.openGraph?.url).toBe("http://localhost:3000/en/research/backend-research-report");
    expect(metadata.openGraph?.images).toEqual(["https://api.fermatmind.com/static/share/mbti_wide_1200x630.png"]);
    expect(metadata.twitter?.title).toBe("Backend Research SEO Title");
    expect(metadata.twitter?.description).toBe("Backend Research SEO description.");
    expect(metadata.twitter?.images).toEqual(["https://api.fermatmind.com/static/share/mbti_wide_1200x630.png"]);
    expect(readSource("app/(localized)/[locale]/research/[slug]/page.tsx")).not.toContain("Dataset");
    expect(readSource("app/(localized)/[locale]/research/[slug]/page.tsx")).not.toContain("MBTI Salary & Turnover Report");
  });

  it("404s when the backend returns no public Research payload", async () => {
    vi.doMock("@/lib/research/reports", () => ({
      getResearchReport: vi.fn(async () => null),
      buildResearchReportPath: (slug: string, locale: string) => `/${locale}/research/${slug}`,
    }));
    vi.doMock("next/navigation", () => ({
      notFound: () => {
        throw new Error("NEXT_NOT_FOUND");
      },
    }));

    const page = await import("@/app/(localized)/[locale]/research/[slug]/page");

    await expect(
      page.default({
        params: Promise.resolve({ locale: "en", slug: "draft-research-report" }),
      })
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("keeps Research discoverability out of sitemap and llms until the SEO contract PR", () => {
    const routeSource = readSource("app/(localized)/[locale]/research/[slug]/page.tsx");
    const adapterSource = readSource("lib/research/reports.ts");
    const nextSitemap = readSource("next-sitemap.config.js");
    const llms = readSource("app/llms.txt/route.ts");
    const llmsFull = readSource("app/llms-full.txt/route.ts");

    expect(routeSource).toContain("getResearchReport");
    expect(adapterSource).toContain("/v0.5/research/");
    expect(adapterSource).not.toContain("/v0.5/articles");
    expect(routeSource).not.toContain("getCmsArticle");
    expect(routeSource).not.toContain("Dataset");
    expect(routeSource).not.toContain("application/ld+json");
    expect(nextSitemap).not.toContain("/research");
    expect(llms).not.toContain("/research");
    expect(llms).not.toContain("research_report");
    expect(llmsFull).not.toContain("/research");
    expect(llmsFull).not.toContain("research_report");
  });

  it("documents Research runtime as backend authoritative without publish expansion", () => {
    const doc = readSource("docs/seo/research-runtime-mvp.md");

    expect(doc).toContain("CMS/backend-authoritative");
    expect(doc).toContain("does not add Research URLs");
    expect(doc).toContain("sitemap generation");
    expect(doc).toContain("llms.txt");
    expect(doc).toContain("Search Channel Queue");
    expect(doc).toContain("Dataset schema is not emitted");
  });
});
