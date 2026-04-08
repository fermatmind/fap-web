import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
  vi.unmock("next/link");
  vi.unmock("next/navigation");
});

describe("career recommendation backend page contract", () => {
  it("renders from the backend adapter path while preserving continuity and entry CTA wiring", async () => {
    vi.doMock("next/link", () => ({
      default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
        <a href={href} {...props}>
          {children}
        </a>
      ),
    }));
    vi.doMock("next/navigation", async () => {
      const actual = await vi.importActual<typeof import("next/navigation")>("next/navigation");
      return {
        ...actual,
        notFound: vi.fn(() => {
          throw new Error("not-found");
        }),
        permanentRedirect: vi.fn((href: string) => {
          throw new Error(`redirect:${href}`);
        }),
        usePathname: vi.fn(() => "/en/career/recommendations/mbti/intj-a"),
      };
    });
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
    vi.doMock("@/lib/career/api/fetchCareerRecommendationBundle", () => ({
      fetchCareerRecommendationBundle: vi.fn(async () => ({
        identity: {
          mbti_type: "INTJ-A",
        },
        recommendation_subject_meta: {
          canonical_type: "INTJ",
        },
        score_bundle: {
          fit_score: { value: 82, integrity_state: "full", degradation_factor: 1.0 },
          confidence_score: { value: 75, integrity_state: "full", degradation_factor: 1.0 },
        },
        warnings: {
          amber_flags: ["ai_role_shift_risk"],
        },
        claim_permissions: {
          allow_strong_claim: true,
          allow_salary_comparison: false,
          allow_ai_strategy: true,
          allow_transition_recommendation: false,
          allow_cross_market_pay_copy: false,
          reason_codes: [],
        },
        trust_manifest: {
          reviewer_status: "reviewed",
          content_version: "content.v1",
          data_version: "data.v1",
          logic_version: "logic.v1",
        },
        seo_contract: {
          canonical_path: "/career/recommendations/mbti/intj-a",
          index_state: "index",
          index_eligible: true,
        },
        provenance_meta: {
          compiler_version: "v2.1",
          compiled_at: "2026-04-08T10:05:00Z",
          compile_run_id: "run_789",
        },
      })),
    }));

    const { default: CareerRecommendationPage } = await import(
      "@/app/(localized)/[locale]/career/recommendations/mbti/[type]/page"
    );
    const page = await CareerRecommendationPage({
      params: Promise.resolve({ locale: "en", type: "intj-a" }),
      searchParams: Promise.resolve({
        carryover_focus_key: "career.next_step",
        carryover_reason: "from_result",
      }),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain("mbti-career-continuity-entry");
    expect(html).toContain("mbti-career-primary-cta");
    expect(html).toContain("career-recommendation-type-interpretation");
    expect(html).toContain("career-recommendation-matched-jobs-status");
    expect(html).toContain("INTJ-A");
    expect(html).not.toContain("Matched role matrix");
  });

  it("redirects to the canonical public route when backend bundle slug differs from the request", async () => {
    vi.doMock("next/link", () => ({
      default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
        <a href={href} {...props}>
          {children}
        </a>
      ),
    }));
    vi.doMock("next/navigation", async () => {
      const actual = await vi.importActual<typeof import("next/navigation")>("next/navigation");
      return {
        ...actual,
        notFound: vi.fn(() => {
          throw new Error("not-found");
        }),
        permanentRedirect: vi.fn((href: string) => {
          throw new Error(`redirect:${href}`);
        }),
        usePathname: vi.fn(() => "/en/career/recommendations/mbti/intj"),
      };
    });
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
    vi.doMock("@/lib/career/api/fetchCareerRecommendationBundle", () => ({
      fetchCareerRecommendationBundle: vi.fn(async () => ({
        identity: {
          mbti_type: "INTJ-A",
        },
        recommendation_subject_meta: {
          canonical_type: "INTJ",
        },
        claim_permissions: {
          allow_strong_claim: true,
          allow_salary_comparison: false,
          allow_ai_strategy: true,
          allow_transition_recommendation: true,
          allow_cross_market_pay_copy: false,
          reason_codes: [],
        },
        trust_manifest: {
          reviewer_status: "reviewed",
          content_version: "content.v1",
          data_version: "data.v1",
          logic_version: "logic.v1",
        },
        seo_contract: {
          canonical_path: "/career/recommendations/mbti/intj-a",
          index_state: "index",
          index_eligible: true,
        },
      })),
    }));

    const { default: CareerRecommendationPage } = await import(
      "@/app/(localized)/[locale]/career/recommendations/mbti/[type]/page"
    );

    await expect(
      CareerRecommendationPage({
        params: Promise.resolve({ locale: "en", type: "intj" }),
        searchParams: Promise.resolve({}),
      })
    ).rejects.toThrow("redirect:/en/career/recommendations/mbti/intj-a");
  });
});
