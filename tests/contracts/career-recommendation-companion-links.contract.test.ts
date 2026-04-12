import { createElement, type ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CareerRecommendationCompanionLinks } from "@/components/career/CareerRecommendationCompanionLinks";
import { adaptCareerFirstWaveRecommendationCompanionLinks } from "@/lib/career/adapters/adaptCareerFirstWaveRecommendationCompanionLinks";
import { fetchCareerFirstWaveRecommendationCompanionLinks } from "@/lib/career/api/fetchCareerFirstWaveRecommendationCompanionLinks";

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
  vi.unmock("next/link");
});

describe("career recommendation companion links contract", () => {
  it("requests the backend B38 recommendation companion-links endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);

        expect(url).toContain("/api/v0.5/career/first-wave/recommendations/mbti/intj-a/companion-links?");
        expect(url).toContain("locale=zh-CN");

        return jsonResponse({
          summary_kind: "career_first_wave_recommendation_companion_links",
          summary_version: "career.companion.recommendation.first_wave.v1",
          scope: "career_first_wave_10",
          subject_kind: "recommendation_subject",
          companion_links: [],
        });
      })
    );

    const payload = await fetchCareerFirstWaveRecommendationCompanionLinks({ locale: "zh", type: "intj-a" });

    expect(payload).not.toBeNull();
  });

  it("adapts backend B38 rows into a narrow inventory without leaking unsupported route kinds", () => {
    const summary = adaptCareerFirstWaveRecommendationCompanionLinks({
      payload: {
        summary_kind: "career_first_wave_recommendation_companion_links",
        summary_version: "career.companion.recommendation.first_wave.v1",
        scope: "career_first_wave_10",
        subject_kind: "recommendation_subject",
        subject_identity: {
          type_code: "INTJ-A",
          canonical_type_code: "INTJ",
          public_route_slug: "intj-a",
          display_title: "INTJ-A Architect",
        },
        counts: {
          total: 6,
          job_detail: 2,
          family_hub: 1,
          test_landing: 1,
          topic_detail: 1,
        },
        companion_links: [
          {
            route_kind: "career_job_detail",
            canonical_path: "/career/jobs/data-scientist",
            canonical_slug: "data-scientist",
            link_reason_code: "target_job_detail_companion",
            occupation_uuid: "occ_data_scientist",
            canonical_title_en: "Data Scientist",
          },
          {
            route_kind: "career_search",
            canonical_path: "/career/search?q=data",
            canonical_slug: "data",
            link_reason_code: "search",
          },
          {
            route_kind: "test_landing",
            canonical_path: "/tests/mbti-personality-test-16-personality-types",
            canonical_slug: "mbti-personality-test-16-personality-types",
            link_reason_code: "recommendation_test_support",
            scale_code: "MBTI",
          },
          {
            route_kind: "topic_detail",
            canonical_path: "/topics/mbti",
            canonical_slug: "mbti",
            link_reason_code: "recommendation_topic_support",
            topic_code: "mbti",
          },
          {
            route_kind: "test_take",
            canonical_path: "/tests/mbti-personality-test-16-personality-types/take",
            canonical_slug: "mbti-personality-test-16-personality-types",
            link_reason_code: "take",
          },
          {
            route_kind: "career_family_hub",
            canonical_path: "/career/family/data-and-research",
            canonical_slug: "data-and-research",
            link_reason_code: "target_family_hub_companion",
            family_uuid: "fam_data_and_research",
            title_en: "Data and Research",
          },
        ],
      },
    });

    expect(summary).not.toBeNull();
    expect(summary?.companionLinks).toHaveLength(4);
    expect(summary?.companionLinks.map((link) => link.routeKind)).toEqual([
      "career_job_detail",
      "test_landing",
      "topic_detail",
      "career_family_hub",
    ]);
    expect(summary?.jobDetailLinks).toHaveLength(1);
    expect(summary?.familyHubLinks).toHaveLength(1);
    expect(summary?.testLandingLinks).toHaveLength(1);
    expect(summary?.topicDetailLinks).toHaveLength(1);
    expect(summary?.testLandingLinks[0]?.scaleCode).toBe("MBTI");
    expect(summary?.topicDetailLinks[0]?.topicCode).toBe("mbti");
    expect(summary?.counts.testLanding).toBe(1);
    expect(summary?.counts.topicDetail).toBe(1);
  });

  it("renders a compact non-narrative section with backend-provided family, job, test, and topic links only", async () => {
    vi.doMock("next/link", () => ({
      default: ({ href, children, ...props }: { href: string; children: ReactNode }) =>
        createElement("a", { href, ...props }, children),
    }));

    const summary = adaptCareerFirstWaveRecommendationCompanionLinks({
      payload: {
        summary_kind: "career_first_wave_recommendation_companion_links",
        summary_version: "career.companion.recommendation.first_wave.v1",
        scope: "career_first_wave_10",
        subject_kind: "recommendation_subject",
        subject_identity: {
          type_code: "INTJ-A",
          canonical_type_code: "INTJ",
          public_route_slug: "intj-a",
          display_title: "INTJ-A Architect",
        },
        counts: {
          total: 5,
          job_detail: 2,
          family_hub: 1,
          test_landing: 1,
          topic_detail: 1,
        },
        companion_links: [
          {
            route_kind: "career_family_hub",
            canonical_path: "/career/family/data-and-research",
            canonical_slug: "data-and-research",
            link_reason_code: "target_family_hub_companion",
            family_uuid: "fam_data_and_research",
            title_en: "Data and Research",
          },
          {
            route_kind: "career_job_detail",
            canonical_path: "/career/jobs/data-scientist",
            canonical_slug: "data-scientist",
            link_reason_code: "target_job_detail_companion",
            occupation_uuid: "occ_data_scientist",
            canonical_title_en: "Data Scientist",
          },
          {
            route_kind: "career_job_detail",
            canonical_path: "/career/jobs/business-analyst",
            canonical_slug: "business-analyst",
            link_reason_code: "matched_job_detail_companion",
            occupation_uuid: "occ_business_analyst",
            canonical_title_en: "Business Analyst",
          },
          {
            route_kind: "test_landing",
            canonical_path: "/tests/mbti-personality-test-16-personality-types",
            canonical_slug: "mbti-personality-test-16-personality-types",
            link_reason_code: "recommendation_test_support",
            scale_code: "MBTI",
          },
          {
            route_kind: "topic_detail",
            canonical_path: "/topics/mbti",
            canonical_slug: "mbti",
            link_reason_code: "recommendation_topic_support",
            topic_code: "mbti",
          },
        ],
      },
    });

    expect(summary).not.toBeNull();

    const { container } = render(
      createElement(CareerRecommendationCompanionLinks, {
        locale: "en",
        summary: summary!,
        testId: "career-recommendation-companion-links",
      })
    );

    const section = screen.getByTestId("career-recommendation-companion-links");

    expect(section).toHaveTextContent("Companion links");
    expect(section).toHaveTextContent("Family hub");
    expect(section).toHaveTextContent("Related job pages");
    expect(section).toHaveTextContent("Related test");
    expect(section).toHaveTextContent("Related topic");
    expect(section).toHaveTextContent("Data and Research");
    expect(section).toHaveTextContent("Data Scientist");
    expect(section).toHaveTextContent("Business Analyst");
    expect(section).toHaveTextContent("MBTI personality test");
    expect(section).toHaveTextContent("MBTI topic");
    expect(section).not.toHaveTextContent("best next move");
    expect(section).not.toHaveTextContent("recommended next step");
    expect(section).not.toHaveTextContent("strategy");
    expect(section).not.toHaveTextContent("take this test now");
    expect(section).not.toHaveTextContent("continue reading");
    expect(section).not.toHaveTextContent("content recommendation");
    expect(section).not.toHaveTextContent("target_job_detail_companion");
    expect(section).not.toHaveTextContent("target_family_hub_companion");
    expect(section).not.toHaveTextContent("matched_job_detail_companion");
    expect(section).not.toHaveTextContent("recommendation_test_support");
    expect(section).not.toHaveTextContent("recommendation_topic_support");
    expect(section).not.toHaveTextContent("topic_code");
    expect(container.querySelectorAll('[data-testid="career-recommendation-companion-family-link"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-testid="career-recommendation-companion-job-link"]')).toHaveLength(2);
    expect(container.querySelectorAll('[data-testid="career-recommendation-companion-test-link"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-testid="career-recommendation-companion-topic-link"]')).toHaveLength(1);
    expect(container.querySelector("a[href='/tests/mbti-personality-test-16-personality-types']")).not.toBeNull();
    expect(container.querySelector("a[href='/topics/mbti']")).not.toBeNull();
  });
});
