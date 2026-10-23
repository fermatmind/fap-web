import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { adaptCareerRecommendationIndex } from "@/lib/career/adapters/adaptCareerRecommendationIndex";
import { fetchCareerRecommendationIndex } from "@/lib/career/api/fetchCareerRecommendationIndex";

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("career recommendation index backend contract", () => {
  it("requests the backend lightweight recommendation index endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);

        expect(url).toContain("/api/v0.5/career/recommendations/mbti?");
        expect(url).toContain("locale=zh-CN");

        return jsonResponse({
          bundle_kind: "career_recommendation_index",
          items: [],
        });
      })
    );

    const payload = await fetchCareerRecommendationIndex({ locale: "zh" });

    expect(payload).not.toBeNull();
  });

  it("adapts the backend recommendation index without recreating cms family or variant shapes", () => {
    const items = adaptCareerRecommendationIndex({
      locale: "en",
      payload: {
        bundle_kind: "career_recommendation_index",
        items: [
          {
            recommendation_subject_meta: {
              type_code: "INTJ-A",
              canonical_type_code: "INTJ",
              display_title: "INTJ Career Match",
              public_route_slug: "intj",
            },
            score_summary: {
              fit_score: { value: 82, integrity_state: "full", degradation_factor: 1.0 },
              confidence_score: { value: 76, integrity_state: "full", degradation_factor: 1.0 },
            },
            trust_summary: {
              reviewer_status: "reviewed",
              allow_strong_claim: true,
              reason_codes: [],
            },
            seo_contract: {
              canonical_path: "/career/recommendations/mbti/intj",
              index_state: "index",
              index_eligible: true,
            },
            provenance_meta: {
              compiler_version: "v2.2",
              compile_run_id: "run_456",
            },
          },
        ],
      },
    });

    expect(items).toHaveLength(1);
    expect(items[0]?.recommendationSubjectMeta.publicRouteSlug).toBe("intj");
    expect(items[0]?.recommendationSubjectMeta.displayTitle).toBe("INTJ Career Match");
    expect(items[0]?.scoreSummary.fitScore.value).toBe(82);
    expect(items[0]?.href).toBe("/en/career/recommendations/mbti/intj");
    expect(items[0]?.dataStatus).toBe("available");
    expect("variantCode" in (items[0] as Record<string, unknown>)).toBe(false);
  });

  it("renders the recommendation index from backend lightweight cards and not as a job list", async () => {
    vi.doMock("next/link", () => ({
      default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
        <a href={href} {...props}>
          {children}
        </a>
      ),
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
    vi.doMock("@/lib/career/api/fetchCareerRecommendationIndex", () => ({
      fetchCareerRecommendationIndex: vi.fn(async () => ({
        bundle_kind: "career_recommendation_index",
        items: [
          {
            recommendation_subject_meta: {
              type_code: "INTJ-A",
              canonical_type_code: "INTJ",
              display_title: "INTJ Career Match",
              public_route_slug: "intj",
            },
            score_summary: {
              fit_score: { value: 82, integrity_state: "full", degradation_factor: 1.0 },
              confidence_score: { value: 76, integrity_state: "full", degradation_factor: 1.0 },
            },
            trust_summary: {
              reviewer_status: "reviewed",
            },
            seo_contract: {
              canonical_path: "/career/recommendations/mbti/intj",
              index_state: "index",
              index_eligible: true,
            },
            provenance_meta: {
              compiler_version: "v2.2",
            },
          },
        ],
      })),
    }));

    const { default: CareerRecommendationsPage } = await import(
      "@/app/(localized)/[locale]/career/recommendations/page"
    );
    const page = await CareerRecommendationsPage({
      params: Promise.resolve({ locale: "en" }),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain("Explore careers by MBTI-style type");
    expect(html).toContain("This index does not combine your test results");
    expect(html).not.toContain("Build your career profile");
    expect(html).not.toContain("Start career matching");
    expect(html).toContain("career-recommendation-index-card");
    expect(html).toContain("INTJ Career Match");
    expect(html).toContain('href="/en/career/recommendations/mbti/intj"');
    expect(html).not.toContain("Open recommendation direction");
    expect(html).not.toContain("career-personalized-status");
    expect(html).not.toContain("View role profile");
    expect(html).not.toContain("career-job-index-card");
  });

  it("suppresses score lines when the backend marks a recommendation card as trust-limited", async () => {
    vi.doMock("next/link", () => ({
      default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
        <a href={href} {...props}>
          {children}
        </a>
      ),
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
            trust_summary: {
              reviewer_status: "reviewed",
            },
            seo_contract: {
              canonical_path: "/career/recommendations/mbti/intj",
              index_state: "noindex",
              index_eligible: false,
            },
          },
        ],
      })),
    }));

    const { default: CareerRecommendationsPage } = await import(
      "@/app/(localized)/[locale]/career/recommendations/page"
    );
    const page = await CareerRecommendationsPage({
      params: Promise.resolve({ locale: "en" }),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain('href="/en/career/recommendations/mbti/intj"');
    expect(html).not.toContain("Open recommendation direction");
    expect(html).not.toContain("Fit score:");
    expect(html).not.toContain("Confidence score:");
  });
});

describe("public recommendation index empty states", () => {
  it.each([
    ["zh", { items: [] }, "暂无公开类型建议"],
    ["en", { items: [] }, "No public type suggestions are available yet"],
    ["zh", null, "公开职业索引暂时无法加载"],
    ["en", null, "The public career index is temporarily unavailable"],
    ["en", { items: [{}] }, "The public career index is temporarily unavailable"],
  ])("distinguishes %s published emptiness from unavailable identity", async (locale, payload, message) => {
    vi.doMock("@/lib/i18n/getDict", () => ({ resolveLocale: () => locale }));
    vi.doMock("@/lib/career/api/fetchCareerRecommendationIndex", () => ({
      fetchCareerRecommendationIndex: vi.fn(async () => payload),
    }));
    const { default: Page } = await import("@/app/(localized)/[locale]/career/recommendations/page");
    const html = renderToStaticMarkup(await Page({ params: Promise.resolve({ locale }) }));
    expect(html).toContain(message);
    expect(html).not.toContain("This is not an empty result");
    expect(html).not.toContain("career-recommendation-index-card");
    expect(html).toContain(`href="/${locale}/career"`);
  });
});
