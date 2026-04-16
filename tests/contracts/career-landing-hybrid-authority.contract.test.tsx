import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("career landing hybrid authority contract", () => {
  it("keeps explicit section-level authority ownership on the landing page", async () => {
    vi.doMock("next/link", () => ({
      default: ({
        href,
        children,
        prefetch: _prefetch,
        ...props
      }: {
        href: string;
        children: ReactNode;
        prefetch?: boolean;
      }) => {
        void _prefetch;
        return (
          <a href={href} {...props}>
            {children}
          </a>
        );
      },
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
    vi.doMock("@/lib/career/api/fetchCareerJobIndex", () => ({
      fetchCareerJobIndex: vi.fn(async () => ({
        bundle_kind: "career_job_index",
        items: [
          {
            identity: { canonical_slug: "data-scientists" },
            titles: { canonical_en: "Data Scientists" },
            truth_summary: {
              outlook_description: "High-trust systems work.",
              median_pay_usd_annual: 182000,
              outlook_pct_2024_2034: 14,
            },
            trust_summary: { reviewer_status: "approved" },
            score_summary: {
              fit_score: { value: 84, integrity_state: "full", degradation_factor: 1.0 },
              confidence_score: { value: 79, integrity_state: "full", degradation_factor: 1.0 },
            },
            seo_contract: {
              canonical_path: "/career/jobs/data-scientists",
              index_state: "index",
              index_eligible: true,
            },
          },
        ],
      })),
    }));
    vi.doMock("@/lib/career/api/fetchCareerLaunchGovernanceClosure", () => ({
      fetchCareerLaunchGovernanceClosure: vi.fn(async () => ({
        governance_kind: "career_launch_governance_closure",
        governance_version: "career.governance.v1",
        scope: "career_all_342",
        counts: {
          tracking_counts: { expected_total_occupations: 342, tracked_total_occupations: 342, tracking_complete: true },
          summary: {},
        },
        members: [
          {
            canonical_slug: "data-scientists",
            release_state: "public_detail_indexable",
            strong_index_state: "strong_index_ready",
            operations_state: "strong_operations_ready",
            governance_state: "mature_public_launch",
            strong_index_ready: true,
            strong_operations_ready: true,
            blocking_reasons: [],
          },
        ],
        public_statement: { allowed_external_statement: "cohort-qualified only" },
      })),
    }));
    vi.doMock("@/lib/career/api/fetchCareerRecommendationIndex", () => ({
      fetchCareerRecommendationIndex: vi.fn(async () => ({
        bundle_kind: "career_recommendation_index",
        items: [
          {
            recommendation_subject_meta: {
              canonical_type_code: "INTJ",
              display_title: "INTJ Career Match",
              public_route_slug: "intj",
            },
            score_summary: {
              fit_score: { value: 82, integrity_state: "full", degradation_factor: 1.0 },
              confidence_score: { value: 76, integrity_state: "full", degradation_factor: 1.0 },
            },
            trust_summary: { reviewer_status: "reviewed" },
            seo_contract: {
              canonical_path: "/career/recommendations/mbti/intj",
              index_state: "index",
              index_eligible: true,
            },
          },
        ],
      })),
    }));
    vi.doMock("@/lib/cms/career-guides", () => ({
      listCareerGuidesFromCms: vi.fn(async () => [
        {
          slug: "from-mbti-to-job-fit",
          title: "From MBTI to Job Fit",
          summary: "Guide summary",
          href: "/en/career/guides/from-mbti-to-job-fit",
        },
      ]),
    }));

    const { default: CareerCenterPage } = await import("@/app/(localized)/[locale]/career/page");
    const page = await CareerCenterPage({
      params: Promise.resolve({ locale: "en" }),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain('data-testid="career-landing-jobs-preview"');
    expect(html).toContain('data-authority-owner="backend_lightweight_jobs"');
    expect(html).toContain('data-testid="career-landing-hero"');
    expect(html).toContain('data-authority-owner="editorial_local_wrapper"');
    expect(html).toContain('data-testid="career-landing-recommendation-preview"');
    expect(html).toContain('data-authority-owner="backend_lightweight_recommendations"');
    expect(html).toContain('data-testid="career-explorer-pathways"');
    expect(html).toContain('data-authority-owner="editorial_ia_shell"');
    expect(html).toContain('data-testid="career-family-exploration"');
    expect(html).toContain('data-authority-owner="editorial_curated_family_paths"');
    expect(html).toContain('data-testid="career-landing-trust-boundary"');
    expect(html).toContain('data-authority-owner="editorial_cta_only"');
    expect(html).toContain('data-testid="career-landing-search-entry"');
    expect(html).toContain('action="/en/career/jobs"');
    expect(html).toContain('formAction="/en/career/resolve"');
    expect(html).toContain('name="q"');
    expect(html).toContain("INTJ Career Match");
    expect(html).toContain("Data Scientists");
    expect(html).toContain("Choose your exploration path");
    expect(html).toContain("Career family exploration layer");
    expect(html).not.toContain("See growth path");
    expect(html).not.toContain("career-personalized-status");
  });

  it("hides non-stable job cards from the landing jobs preview while keeping recommendation preview intact", async () => {
    vi.doMock("next/link", () => ({
      default: ({
        href,
        children,
        prefetch: _prefetch,
        ...props
      }: {
        href: string;
        children: ReactNode;
        prefetch?: boolean;
      }) => {
        void _prefetch;
        return (
          <a href={href} {...props}>
            {children}
          </a>
        );
      },
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
    vi.doMock("@/lib/career/api/fetchCareerJobIndex", () => ({
      fetchCareerJobIndex: vi.fn(async () => ({
        bundle_kind: "career_job_index",
        items: [
          {
            identity: { canonical_slug: "financial-analysts" },
            titles: { canonical_en: "Financial Analysts" },
            truth_summary: {
              median_pay_usd_annual: 182000,
              outlook_pct_2024_2034: 14,
            },
            trust_summary: { reviewer_status: "reviewed" },
            score_summary: {
              fit_score: { value: 84, integrity_state: "full", degradation_factor: 1.0 },
              confidence_score: { value: 79, integrity_state: "full", degradation_factor: 1.0 },
            },
            seo_contract: {
              canonical_path: "/career/jobs/financial-analysts",
              index_state: "index",
              index_eligible: true,
            },
          },
        ],
      })),
    }));
    vi.doMock("@/lib/career/api/fetchCareerLaunchGovernanceClosure", () => ({
      fetchCareerLaunchGovernanceClosure: vi.fn(async () => ({
        governance_kind: "career_launch_governance_closure",
        governance_version: "career.governance.v1",
        scope: "career_all_342",
        counts: {
          tracking_counts: { expected_total_occupations: 342, tracked_total_occupations: 342, tracking_complete: true },
          summary: {},
        },
        members: [
          {
            canonical_slug: "financial-analysts",
            release_state: "review_needed",
            strong_index_state: "manual_only",
            operations_state: "not_strong_operations_ready",
            governance_state: "not_yet_mature",
            strong_index_ready: false,
            strong_operations_ready: false,
            blocking_reasons: ["crosswalk_backlog_not_converged"],
          },
        ],
        public_statement: { allowed_external_statement: "cohort-qualified only" },
      })),
    }));
    vi.doMock("@/lib/career/api/fetchCareerRecommendationIndex", () => ({
      fetchCareerRecommendationIndex: vi.fn(async () => ({
        bundle_kind: "career_recommendation_index",
        items: [
          {
            recommendation_subject_meta: {
              canonical_type_code: "INTJ",
              display_title: "INTJ Career Match",
              public_route_slug: "intj",
            },
            score_summary: {
              fit_score: { value: 82, integrity_state: "full", degradation_factor: 1.0 },
              confidence_score: { value: 76, integrity_state: "full", degradation_factor: 1.0 },
            },
            trust_summary: { reviewer_status: "reviewed" },
            seo_contract: {
              canonical_path: "/career/recommendations/mbti/intj",
              index_state: "noindex",
              index_eligible: false,
            },
          },
        ],
      })),
    }));
    vi.doMock("@/lib/cms/career-guides", () => ({
      listCareerGuidesFromCms: vi.fn(async () => []),
    }));

    const { default: CareerCenterPage } = await import("@/app/(localized)/[locale]/career/page");
    const page = await CareerCenterPage({
      params: Promise.resolve({ locale: "en" }),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain("No public job previews are currently available");
    expect(html).not.toContain("Financial Analysts");
    expect(html).toContain("INTJ Career Match");
  });
});
