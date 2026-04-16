import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function read(relPath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relPath), "utf8");
}

describe("career conversion attribution contract", () => {
  it("wires job-detail CTA and support-link conversion events on allowed surfaces only", () => {
    const nextStepLinks = read("components/career/CareerNextStepLinks.tsx");
    const recommendationCompanionLinks = read("components/career/CareerRecommendationCompanionLinks.tsx");
    const recommendationPage = read("app/(localized)/[locale]/career/recommendations/mbti/[type]/page.tsx");
    const jobDetailPage = read("app/(localized)/[locale]/career/jobs/[slug]/page.tsx");
    const familyHubPage = read("components/career/CareerFamilyHubPage.tsx");
    const datasetHubPage = read("app/(localized)/[locale]/datasets/occupations/page.tsx");

    expect(nextStepLinks).toContain("CAREER_TRACKING_EVENTS.jobDetailCtaClick");
    expect(nextStepLinks).toContain("targetAction: \"open_next_step_link\"");
    expect(nextStepLinks).toContain("routeFamily: \"job_detail\"");

    expect(recommendationCompanionLinks).toContain("CAREER_TRACKING_EVENTS.supportLinkClick");
    expect(recommendationCompanionLinks).toContain("targetAction: \"open_support_link\"");
    expect(recommendationCompanionLinks).toContain("routeFamily: \"recommendation_detail\"");
    expect(recommendationPage).toContain("CareerRecommendationCompanionLinks");
    expect(jobDetailPage).toContain("CareerNextStepLinks");

    expect(familyHubPage).not.toContain("career_support_link_click");
    expect(familyHubPage).not.toContain("career_job_detail_cta_click");
    expect(datasetHubPage).not.toContain("career_support_link_click");
  });

  it("keeps shortlist attribution deferred when no stable shortlist UI action exists", () => {
    const trackedSources = [
      "app/(localized)/[locale]/career/jobs/[slug]/page.tsx",
      "app/(localized)/[locale]/career/recommendations/mbti/[type]/page.tsx",
      "components/career/CareerNextStepLinks.tsx",
      "components/career/CareerRecommendationCompanionLinks.tsx",
    ]
      .map(read)
      .join("\n");

    expect(trackedSources).not.toContain("CAREER_TRACKING_EVENTS.shortlistAdd");
    expect(trackedSources).not.toContain("targetAction: \"add_shortlist\"");
  });
});

