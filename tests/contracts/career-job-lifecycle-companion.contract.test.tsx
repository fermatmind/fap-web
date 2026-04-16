import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
  vi.unmock("next/link");
  vi.unmock("next/navigation");
});

describe("career job lifecycle companion contract", () => {
  it("renders lightweight timeline/delta companion on job detail without introducing feedback submit controls", async () => {
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
        usePathname: vi.fn(() => "/en/career/jobs/backend-architect"),
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
    vi.doMock("@/lib/career/api/fetchCareerJobBundle", () => ({
      fetchCareerJobBundle: vi.fn(async () => ({
        identity: { canonical_slug: "backend-architect" },
        titles: { canonical_en: "Backend Architect" },
        claim_permissions: {
          allow_strong_claim: true,
          allow_salary_comparison: true,
          allow_ai_strategy: true,
          allow_transition_recommendation: true,
          allow_cross_market_pay_copy: false,
          reason_codes: [],
        },
        trust_manifest: {
          reviewer_status: "reviewed",
          reviewed: true,
          quality: { complete: true, reviewed: true, stale: false, blocked_reasons: [] },
        },
        score_bundle: {
          fit_score: { value: 81, integrity_state: "full", degradation_factor: 1 },
          confidence_score: { value: 70, integrity_state: "full", degradation_factor: 1 },
        },
        seo_contract: {
          canonical_path: "/career/jobs/backend-architect",
          canonical_target: "/career/jobs/backend-architect",
          index_state: "index",
          index_eligible: true,
        },
        lifecycle_companion: {
          timeline: {
            timeline_kind: "career_projection_timeline",
            timeline_version: "career.timeline.v1",
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
            ],
          },
          delta_summary: {
            delta_available: true,
            score_deltas: {
              fit_score: { previous: 79, current: 81, delta: 2 },
            },
            feedback_deltas: {},
            transition_changed: false,
            target_jobs_changed: false,
            claim_permissions_changed: {},
          },
          latest_feedback: {
            feedback_uuid: "fb_1",
            burnout_checkin: 3,
            career_satisfaction: 4,
            switch_urgency: 2,
          },
        },
      })),
    }));
    vi.doMock("@/lib/career/api/fetchCareerJobExplainability", () => ({
      fetchCareerJobExplainability: vi.fn(async () => null),
    }));
    vi.doMock("@/lib/career/api/fetchCareerFirstWaveNextStepLinks", () => ({
      fetchCareerFirstWaveNextStepLinks: vi.fn(async () => null),
    }));

    const { default: Page } = await import("@/app/(localized)/[locale]/career/jobs/[slug]/page");
    const page = await Page({
      params: Promise.resolve({ locale: "en", slug: "backend-architect" }),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain("career-job-lifecycle-companion-timeline");
    expect(html).toContain("career-job-lifecycle-companion-delta");
    expect(html).not.toContain("career-recommendation-feedback-panel");
  });
});

