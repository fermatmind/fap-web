import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
  vi.unmock("next/link");
  vi.unmock("next/navigation");
});

describe("career recommendation feedback timeline contract", () => {
  it("renders recommendation lifecycle feedback, timeline, and delta panels from backend lifecycle payload", async () => {
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
        useRouter: vi.fn(() => ({
          refresh: vi.fn(),
        })),
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
        identity: { mbti_type: "INTJ-A" },
        recommendation_subject_meta: { canonical_type: "INTJ" },
        score_bundle: {
          fit_score: { value: 80, integrity_state: "full", degradation_factor: 1 },
          confidence_score: { value: 70, integrity_state: "full", degradation_factor: 1 },
        },
        claim_permissions: {
          allow_strong_claim: true,
          allow_salary_comparison: true,
          allow_ai_strategy: true,
          allow_transition_recommendation: true,
          allow_cross_market_pay_copy: false,
          reason_codes: [],
        },
        trust_manifest: {
          reviewer_status: "approved",
          content_version: "v1",
          data_version: "v1",
          logic_version: "v1",
        },
        seo_contract: {
          canonical_path: "/career/recommendations/mbti/intj",
          canonical_target: "/career/recommendations/mbti/intj",
          index_state: "index",
          index_eligible: true,
        },
        feedback_checkin: {
          feedback_uuid: "fb_1",
          burnout_checkin: 4,
          career_satisfaction: 3,
          switch_urgency: 5,
          created_at: "2026-04-16T07:00:00Z",
        },
        projection_timeline: {
          timeline_kind: "career_projection_timeline",
          timeline_version: "career.timeline.v1",
          current_projection_uuid: "proj_2",
          current_recommendation_snapshot_uuid: "rec_2",
          entries: [
            {
              projection_uuid: "proj_1",
              recommendation_snapshot_uuid: "rec_1",
              context_snapshot_uuid: "ctx_1",
              feedback_uuid: null,
              entry_kind: "initial",
              entry_label: "Initial recommendation snapshot",
              created_at: "2026-04-10T07:00:00Z",
            },
            {
              projection_uuid: "proj_2",
              recommendation_snapshot_uuid: "rec_2",
              context_snapshot_uuid: "ctx_2",
              feedback_uuid: "fb_1",
              entry_kind: "feedback_refresh",
              entry_label: "Feedback refresh snapshot",
              created_at: "2026-04-16T07:00:00Z",
            },
          ],
        },
        projection_delta_summary: {
          delta_available: true,
          previous_projection_uuid: "proj_1",
          current_projection_uuid: "proj_2",
          score_deltas: {
            fit_score: { previous: 75, current: 80, delta: 5 },
          },
          feedback_deltas: {
            burnout_checkin: 1,
            career_satisfaction: -1,
            switch_urgency: 2,
          },
          transition_changed: false,
          target_jobs_changed: false,
          claim_permissions_changed: {
            allow_ai_strategy: false,
          },
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

    const { default: Page } = await import("@/app/(localized)/[locale]/career/recommendations/mbti/[type]/page");
    const page = await Page({
      params: Promise.resolve({ locale: "en", type: "intj" }),
      searchParams: Promise.resolve({}),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain("career-recommendation-feedback-panel");
    expect(html).toContain("career-recommendation-projection-timeline");
    expect(html).toContain("career-recommendation-projection-delta");
    expect(html).toContain("Projection timeline");
    expect(html).toContain("Delta summary");
  });
});
