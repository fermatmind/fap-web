import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
  vi.unmock("next/link");
  vi.unmock("next/navigation");
});

describe("career claim gate render contract", () => {
  it("blocks salary, outlook, fit, and answer surfaces when explicit claim permissions are missing", async () => {
    vi.doMock("next/link", () => ({
      default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
        <a href={href} {...props}>
          {children}
        </a>
      ),
    }));
    vi.doMock("next/navigation", () => ({
      notFound: vi.fn(() => {
        throw new Error("not-found");
      }),
    }));
    vi.doMock("@/lib/i18n/getDict", () => ({
      resolveLocale: vi.fn(() => "en"),
    }));
    vi.doMock("@/lib/i18n/locales", async () => {
      const actual = await vi.importActual<typeof import("@/lib/i18n/locales")>("@/lib/i18n/locales");
      return {
        ...actual,
        localizedPath: vi.fn((pathname: string, locale: string) => `/${locale}${pathname}`),
      };
    });
    vi.doMock("@/lib/cms/career-jobs", () => ({
      buildCareerJobFrontendUrl: vi.fn((locale: string, slug: string) => `/${locale}/career/jobs/${slug}`),
      getCareerJobFromCmsBySlug: vi.fn(async () => ({
        id: 1,
        orgId: 0,
        jobCode: "product-manager",
        slug: "product-manager",
        locale: "en",
        title: "Product Manager",
        summary: "Shape product direction.",
        industrySlug: "technology",
        industryLabel: "Technology",
        heroKicker: "Career",
        heroQuote: "Lead through product decisions.",
        coverImageUrl: null,
        workContents: ["Define product direction"],
        skills: ["roadmapping"],
        salaryText: "USD 80,000 - 180,000 annually",
        outlookText: "Growing fast",
        growthPathItems: ["Associate PM", "PM", "Senior PM"],
        fitPersonalityItems: ["INTJ"],
        mbtiPrimary: ["INTJ"],
        mbtiSecondary: ["ENTJ"],
        riasecVector: { R: null, I: 70, A: null, S: null, E: 60, C: null },
        bodyMarkdown: "",
        bodyHtml: "",
        sections: [],
        seoMeta: null,
        landingSurface: null,
        answerSurface: {
          summaryBlocks: [{ key: "summary", title: null, body: "Strong-fit copy." }],
          faqBlocks: [],
          compareBlocks: [],
          sceneSummaryBlocks: [],
          nextStepBlocks: [],
          surfaceType: "career_job_public_detail",
        },
        renderState: {
          careerDataStatus: "trust_limited",
          canRenderSalarySurface: false,
          canRenderOutlookSurface: false,
          canRenderFitSurface: false,
          canRenderAnswerSurface: false,
          canRenderStructuredData: false,
          canIndexPage: false,
          missingFields: ["claim_permissions", "trust_manifest"],
        },
        protocol: {
          claimPermissions: {
            allow_strong_claim: false,
            allow_salary_comparison: false,
            allow_ai_strategy: false,
            allow_transition_recommendation: false,
            allow_cross_market_pay_copy: false,
            reason_codes: ["missing_claim_permissions"],
          },
          trustManifest: null,
          careerAsset: {
            seo_contract: {
              index_eligible: false,
              index_state: "blocked",
            },
            audit: {
              created_by: "career_jobs_cms.v0.5",
            },
          },
        },
        status: "published",
        isPublic: true,
        isIndexable: false,
        publishedAt: null,
        updatedAt: null,
      })),
      getCareerJobSeoFromCmsBySlug: vi.fn(async () => null),
    }));

    const { default: CareerJobDetailPage } = await import("@/app/(localized)/[locale]/career/jobs/[slug]/page");
    const page = await CareerJobDetailPage({
      params: Promise.resolve({ locale: "en", slug: "product-manager" }),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain("career-job-protocol-status");
    expect(html).toContain("Career claim gate");
    expect(html).not.toContain("USD 80,000 - 180,000 annually");
    expect(html).not.toContain("Future outlook");
    expect(html).not.toContain("MBTI:");
    expect(html).not.toContain("Strong-fit copy.");
  });
});
