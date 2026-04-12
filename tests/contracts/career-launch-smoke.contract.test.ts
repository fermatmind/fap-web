import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  CAREER_LAUNCH_SMOKE_MATRIX,
  isCareerLaunchTierAuthorityRouteKey,
} from "@/lib/career/launchPolicy";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function readJson<T>(relPath: string): T {
  return JSON.parse(read(relPath)) as T;
}

describe("career launch smoke contract", () => {
  it("keeps the ops-readable smoke matrix aligned with the executable career launch policy", () => {
    const json = readJson<typeof CAREER_LAUNCH_SMOKE_MATRIX>("docs/release/career-smoke-matrix.json");

    expect(json).toEqual(CAREER_LAUNCH_SMOKE_MATRIX);
  });

  it("keeps required route classes present with the expected smoke expectations", () => {
    const byKey = new Map(
      CAREER_LAUNCH_SMOKE_MATRIX.route_classes.map((entry) => [entry.key, entry])
    );

    expect(byKey.get("career_landing")).toMatchObject({
      launchState: "stable",
      canonicalMode: "self",
      robotsMode: "index",
    });
    expect(byKey.get("career_job_detail")).toMatchObject({
      launchState: "stable",
      canonicalMode: "backend_explicit_gate",
      robotsMode: "backend_explicit_gate",
      requiresBackendExplicitGate: true,
    });
    expect(byKey.get("career_mbti_recommendation_detail")).toMatchObject({
      launchState: "stable",
      canonicalMode: "backend_explicit_gate",
      robotsMode: "backend_explicit_gate",
      requiresBackendExplicitGate: true,
    });
    expect(byKey.get("career_family_hub_detail")).toMatchObject({
      launchState: "candidate",
      canonicalMode: "self",
      robotsMode: "family_visibility_gate",
      requiresBackendExplicitGate: false,
    });
    expect(byKey.get("career_jobs_query")).toMatchObject({
      launchState: "noindex",
      canonicalMode: "base_jobs",
      robotsMode: "noindex",
    });
    expect(byKey.get("career_legacy_slug_bridge")).toMatchObject({
      launchState: "hold",
      renderMode: "redirect",
      canonicalMode: "legacy_redirect",
    });
    expect(byKey.get("career_big5_recommendation_detail")).toMatchObject({
      launchState: "hold",
      authorityOwner: "editorial_local_big5",
    });
  });

  it("matches the current authority design without rewriting page behavior", () => {
    const landingPage = read("app/(localized)/[locale]/career/page.tsx");
    const jobsPage = read("app/(localized)/[locale]/career/jobs/page.tsx");
    const recommendationsPage = read("app/(localized)/[locale]/career/recommendations/page.tsx");
    const familyHubPage = read("app/(localized)/[locale]/career/family/[slug]/page.tsx");
    const jobDetailPage = read("app/(localized)/[locale]/career/jobs/[slug]/page.tsx");
    const recommendationDetailPage = read("app/(localized)/[locale]/career/recommendations/mbti/[type]/page.tsx");
    const legacySlugPage = read("app/(localized)/[locale]/career/[slug]/page.tsx");
    const big5DetailPage = read("app/(localized)/[locale]/career/recommendations/big5/[trait]/page.tsx");

    expect(landingPage).toContain('data-authority-owner="editorial_local_wrapper"');
    expect(landingPage).toContain('data-authority-owner="backend_lightweight_jobs"');
    expect(landingPage).toContain('data-authority-owner="backend_lightweight_recommendations"');
    expect(jobsPage).toContain("fetchCareerJobIndex");
    expect(jobsPage).toContain("fetchCareerSearch");
    expect(recommendationsPage).toContain("fetchCareerRecommendationIndex");
    expect(recommendationsPage).toContain("listBig5RecommendationTraits");
    expect(familyHubPage).toContain("fetchCareerFamilyHub");
    expect(familyHubPage).toContain("generateMetadata");
    expect(jobDetailPage).toContain("job.seoContract.indexEligible");
    expect(recommendationDetailPage).toContain("detail.seoContract.indexEligible");
    expect(legacySlugPage).toContain("getCareerJobFromCmsBySlug");
    expect(big5DetailPage).toContain("listBig5RecommendationTraits");
  });

  it("keeps B34 launch-tier authority out of family and recommendation runtime route classes", () => {
    expect(isCareerLaunchTierAuthorityRouteKey("career_job_detail")).toBe(true);
    expect(isCareerLaunchTierAuthorityRouteKey("career_family_hub_detail")).toBe(false);
    expect(isCareerLaunchTierAuthorityRouteKey("career_mbti_recommendation_detail")).toBe(false);
  });
});
