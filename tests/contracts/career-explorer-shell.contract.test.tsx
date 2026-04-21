import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.resetModules();
});

const careerCenterContent = {
  seo: {
    title: "Career Explorer",
    description: "Explore career paths from backend-backed public surfaces.",
  },
  hero: {
    title: "Career Explorer",
  },
  pathways: [
    {
      eyebrow: "Jobs",
      title: "Job library",
      description: "Search backend-owned jobs.",
      href: "/career/jobs",
      searchPlaceholder: "Search jobs",
      ctaLabel: "Search jobs",
    },
    {
      eyebrow: "Recommendations",
      title: "Recommendations",
      description: "Explore recommendation surfaces.",
      href: "/career/recommendations",
      ctaLabel: "View recommendations",
    },
    {
      eyebrow: "Tests",
      title: "Tests",
      description: "Start from assessment context.",
      href: "/career/tests",
      ctaLabel: "View tests",
    },
  ],
  support: {
    title: "Explore more",
    links: [
      { href: "/career/resolve", label: "Resolve aliases" },
      { href: "/career/guides", label: "Guides" },
      { href: "/career/industries", label: "Industries" },
      { href: "/datasets/occupations", label: "Dataset" },
    ],
  },
};

function mockCareerCenterContent() {
  vi.doMock("@/lib/marketing/careerCenterContent", () => ({
    getCareerCenterContent: vi.fn(async () => careerCenterContent),
  }));
}

describe("career explorer shell contract", () => {
  it("keeps /career metadata distinct from jobs/resolve semantic contracts", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
    vi.doMock("@/lib/i18n/getDict", () => ({
      resolveLocale: vi.fn(() => "en"),
    }));
    mockCareerCenterContent();

    const { generateMetadata } = await import("@/app/(localized)/[locale]/career/page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en" }),
    });

    expect(String(metadata.alternates?.canonical ?? "")).toBe("https://fermatmind.com/en/career");
    expect(metadata.robots).toMatchObject({
      index: true,
      follow: true,
    });
    expect(String(metadata.title ?? "")).toContain("Career Explorer");
  });

  it("exposes three explicit doors and keeps jobs vs resolve responsibilities separate", async () => {
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
    mockCareerCenterContent();
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
    vi.doMock("@/lib/career/api/fetchCareerFirstWaveReadinessSummary", () => ({
      fetchCareerFirstWaveReadinessSummary: vi.fn(async () => ({
        summary_kind: "career_first_wave_readiness",
        summary_version: "career.release.first_wave_readiness.v1",
        wave_name: "career_first_wave_10",
        counts: {
          total: 10,
          publish_ready: 6,
          blocked_override_eligible: 2,
          blocked_not_safely_remediable: 2,
          blocked_total: 4,
          partial_raw: 0,
        },
        occupations: [
          {
            canonical_slug: "data-scientists",
            status: "publish_ready",
            reason_codes: ["publish_ready"],
          },
        ],
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

    const { default: CareerCenterPage } = await import("@/app/(localized)/[locale]/career/page");
    const page = await CareerCenterPage({
      params: Promise.resolve({ locale: "en" }),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain("career-explorer-pathways");
    expect(html).toContain("career-pathway-jobs");
    expect(html).toContain("career-pathway-recommendation");
    expect(html).toContain("career-pathway-tests");
    expect(html).toContain("career-quiet-library");

    expect(html).toContain("action=\"/en/career/jobs\"");
    expect(html).toContain("/en/career/jobs");
    expect(html).toContain("/en/career/resolve");
    expect(html).toContain("/en/career/recommendations");
    expect(html).toContain("/en/career/tests");
    expect(html).not.toContain("/en/career/family/data-science");
  });
});
