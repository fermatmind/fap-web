import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

type RecordedEvent = {
  eventName: string;
  properties: Record<string, unknown> | undefined;
};

function installTrackingRecorder() {
  const pageViewEvents: RecordedEvent[] = [];

  vi.doMock("@/hooks/useAnalytics", () => ({
    AnalyticsPageViewTracker: ({
      eventName,
      properties,
    }: {
      eventName: string;
      properties?: Record<string, unknown>;
    }) => {
      pageViewEvents.push({ eventName, properties });
      return null;
    },
  }));

  return { pageViewEvents };
}

function mockCommonFrontendShell(pathname: string) {
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
      usePathname: vi.fn(() => pathname),
    };
  });
  vi.doMock("@/lib/i18n/getDict", () => ({
    resolveLocale: vi.fn(() => "en"),
  }));
  vi.doMock("@/lib/i18n/locales", async () => {
    const actual = await vi.importActual<typeof import("@/lib/i18n/locales")>("@/lib/i18n/locales");
    return {
      ...actual,
      localizedPath: vi.fn((inputPath: string, locale: string) => `/${locale}${inputPath}`),
    };
  });
}

function collectClaimBlockedEvents(events: RecordedEvent[]) {
  return events.filter((event) => event.eventName === "career_claim_blocked_surface_exposed");
}

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
  vi.unmock("next/link");
  vi.unmock("next/navigation");
});

describe("career claim-blocked attribution contract", () => {
  it("emits job-detail claim-blocked events only for salary and strong-claim gated branches", async () => {
    const { pageViewEvents } = installTrackingRecorder();
    mockCommonFrontendShell("/en/career/jobs/data-scientists");

    vi.doMock("@/lib/career/api/fetchCareerJobBundle", () => ({
      fetchCareerJobBundle: vi.fn(async () => ({
        identity: { canonical_slug: "data-scientists" },
        titles: { canonical_en: "Data Scientists" },
        truth_layer: {
          median_pay_usd_annual: 150000,
          outlook_pct_2024_2034: 12,
          ai_exposure: 0.38,
          entry_education: "Bachelor's degree",
          work_experience: "None",
          on_the_job_training: "Moderate-term",
        },
        score_bundle: {
          fit_score: { value: 81, integrity_state: "full", degradation_factor: 1 },
          strain_score: { value: 45, integrity_state: "full", degradation_factor: 1 },
          ai_survival_score: { value: 69, integrity_state: "full", degradation_factor: 1 },
          mobility_score: { value: 71, integrity_state: "full", degradation_factor: 1 },
          confidence_score: { value: 76, integrity_state: "full", degradation_factor: 1 },
        },
        claim_permissions: {
          allow_strong_claim: false,
          allow_salary_comparison: false,
          allow_ai_strategy: false,
          allow_transition_recommendation: false,
          allow_cross_market_pay_copy: false,
          reason_codes: ["claim_blocked"],
        },
        trust_manifest: {
          reviewer_status: "reviewed",
          reviewed: true,
          quality: { complete: true, reviewed: true, stale: false, blocked_reasons: [] },
        },
        seo_contract: {
          canonical_path: "/career/jobs/data-scientists",
          index_state: "index",
          index_eligible: true,
        },
      })),
    }));
    vi.doMock("@/lib/career/api/fetchCareerJobExplainability", () => ({
      fetchCareerJobExplainability: vi.fn(async () => null),
    }));
    vi.doMock("@/lib/career/api/fetchCareerFirstWaveNextStepLinks", () => ({
      fetchCareerFirstWaveNextStepLinks: vi.fn(async () => null),
    }));

    const { default: CareerJobDetailPage } = await import("@/app/(localized)/[locale]/career/jobs/[slug]/page");
    const page = await CareerJobDetailPage({
      params: Promise.resolve({ locale: "en", slug: "data-scientists" }),
    });
    renderToStaticMarkup(page as ReactNode);

    const claimBlockedEvents = collectClaimBlockedEvents(pageViewEvents);
    expect(claimBlockedEvents).toHaveLength(2);
    expect(claimBlockedEvents.map((event) => event.properties?.blocked_claim_kind).sort()).toEqual([
      "salary",
      "strong_claim",
    ]);

    claimBlockedEvents.forEach((event) => {
      expect(event.properties?.entry_surface).toBe("career_job_detail");
      expect(event.properties?.source_page_type).toBe("career_job_detail");
      expect(event.properties?.route_family).toBe("job_detail");
      expect(event.properties?.subject_kind).toBe("job_slug");
      expect(event.properties?.subject_key).toBe("data-scientists");
      expect(event.properties?.target_action).toBe("expose_claim_blocked_surface");
    });
  });

  it("emits recommendation-detail claim-blocked events for salary, strong-claim, and transition gates", async () => {
    const { pageViewEvents } = installTrackingRecorder();
    mockCommonFrontendShell("/en/career/recommendations/mbti/intj-a");

    vi.doMock("@/lib/career/api/fetchCareerRecommendationBundle", () => ({
      fetchCareerRecommendationBundle: vi.fn(async () => ({
        identity: { mbti_type: "INTJ-A" },
        recommendation_subject_meta: { canonical_type: "INTJ" },
        score_bundle: {
          fit_score: { value: 83, integrity_state: "full", degradation_factor: 1 },
          strain_score: { value: 47, integrity_state: "full", degradation_factor: 1 },
          ai_survival_score: { value: 66, integrity_state: "full", degradation_factor: 1 },
          mobility_score: { value: 72, integrity_state: "full", degradation_factor: 1 },
          confidence_score: { value: 79, integrity_state: "full", degradation_factor: 1 },
        },
        supporting_truth_summary: {
          summary: "Strong recommendation summary",
          median_pay_usd_annual: 148000,
          outlook_pct_2024_2034: 10,
          ai_exposure: 0.4,
        },
        matched_jobs: [
          {
            canonical_slug: "data-scientists",
            title: "Data Scientists",
            summary: "Build models",
          },
        ],
        claim_permissions: {
          allow_strong_claim: false,
          allow_salary_comparison: false,
          allow_ai_strategy: false,
          allow_transition_recommendation: false,
          allow_cross_market_pay_copy: false,
          reason_codes: ["claim_blocked"],
        },
        trust_manifest: {
          reviewer_status: "reviewed",
          reviewed: true,
          quality: { complete: true, reviewed: true, stale: false, blocked_reasons: [] },
        },
        seo_contract: {
          canonical_path: "/career/recommendations/mbti/intj-a",
          canonical_target: "/career/jobs/data-scientists",
          index_state: "index",
          index_eligible: true,
        },
      })),
    }));
    vi.doMock("@/lib/career/api/fetchCareerRecommendationExplainability", () => ({
      fetchCareerRecommendationExplainability: vi.fn(async () => null),
    }));
    vi.doMock("@/lib/career/api/fetchCareerTransitionPreview", () => ({
      fetchCareerTransitionPreview: vi.fn(async () => null),
    }));
    vi.doMock("@/lib/career/api/fetchCareerFirstWaveRecommendationCompanionLinks", () => ({
      fetchCareerFirstWaveRecommendationCompanionLinks: vi.fn(async () => null),
    }));

    const { default: CareerRecommendationPage } = await import(
      "@/app/(localized)/[locale]/career/recommendations/mbti/[type]/page"
    );
    const page = await CareerRecommendationPage({
      params: Promise.resolve({ locale: "en", type: "intj-a" }),
      searchParams: Promise.resolve({}),
    });
    renderToStaticMarkup(page as ReactNode);

    const claimBlockedEvents = collectClaimBlockedEvents(pageViewEvents);
    expect(claimBlockedEvents).toHaveLength(3);
    expect(claimBlockedEvents.map((event) => event.properties?.blocked_claim_kind).sort()).toEqual([
      "salary",
      "strong_claim",
      "transition_recommendation",
    ]);

    claimBlockedEvents.forEach((event) => {
      expect(event.properties?.entry_surface).toBe("career_recommendation_detail");
      expect(event.properties?.source_page_type).toBe("career_recommendation_detail");
      expect(event.properties?.route_family).toBe("recommendation_detail");
      expect(event.properties?.subject_kind).toBe("job_slug");
      expect(event.properties?.subject_key).toBe("data-scientists");
      expect(event.properties?.target_action).toBe("expose_claim_blocked_surface");
    });
  });

  it("falls back to subject_kind=none when recommendation claim-blocked branches have no stable job identity", async () => {
    const { pageViewEvents } = installTrackingRecorder();
    mockCommonFrontendShell("/en/career/recommendations/mbti/intj-a");

    vi.doMock("@/lib/career/api/fetchCareerRecommendationBundle", () => ({
      fetchCareerRecommendationBundle: vi.fn(async () => ({
        identity: { mbti_type: "INTJ-A" },
        recommendation_subject_meta: { canonical_type: "INTJ" },
        score_bundle: {
          fit_score: { value: 83, integrity_state: "full", degradation_factor: 1 },
          strain_score: { value: 47, integrity_state: "full", degradation_factor: 1 },
          ai_survival_score: { value: 66, integrity_state: "full", degradation_factor: 1 },
          mobility_score: { value: 72, integrity_state: "full", degradation_factor: 1 },
          confidence_score: { value: 79, integrity_state: "full", degradation_factor: 1 },
        },
        supporting_truth_summary: {
          summary: "Strong recommendation summary",
          median_pay_usd_annual: null,
          outlook_pct_2024_2034: null,
          ai_exposure: null,
        },
        matched_jobs: [],
        claim_permissions: {
          allow_strong_claim: false,
          allow_salary_comparison: true,
          allow_ai_strategy: true,
          allow_transition_recommendation: true,
          allow_cross_market_pay_copy: false,
          reason_codes: ["claim_blocked"],
        },
        trust_manifest: {
          reviewer_status: "reviewed",
          reviewed: true,
          quality: { complete: true, reviewed: true, stale: false, blocked_reasons: [] },
        },
        seo_contract: {
          canonical_path: "/career/recommendations/mbti/intj-a",
          canonical_target: "/career/recommendations/mbti/intj-a",
          index_state: "index",
          index_eligible: true,
        },
      })),
    }));
    vi.doMock("@/lib/career/api/fetchCareerRecommendationExplainability", () => ({
      fetchCareerRecommendationExplainability: vi.fn(async () => null),
    }));
    vi.doMock("@/lib/career/api/fetchCareerTransitionPreview", () => ({
      fetchCareerTransitionPreview: vi.fn(async () => null),
    }));
    vi.doMock("@/lib/career/api/fetchCareerFirstWaveRecommendationCompanionLinks", () => ({
      fetchCareerFirstWaveRecommendationCompanionLinks: vi.fn(async () => null),
    }));

    const { default: CareerRecommendationPage } = await import(
      "@/app/(localized)/[locale]/career/recommendations/mbti/[type]/page"
    );
    const page = await CareerRecommendationPage({
      params: Promise.resolve({ locale: "en", type: "intj-a" }),
      searchParams: Promise.resolve({}),
    });
    renderToStaticMarkup(page as ReactNode);

    const claimBlockedEvents = collectClaimBlockedEvents(pageViewEvents);
    expect(claimBlockedEvents).toHaveLength(1);
    expect(claimBlockedEvents[0]?.properties?.blocked_claim_kind).toBe("strong_claim");
    expect(claimBlockedEvents[0]?.properties?.subject_kind).toBe("none");
    expect(claimBlockedEvents[0]?.properties?.subject_key).toBeUndefined();
  });
});
