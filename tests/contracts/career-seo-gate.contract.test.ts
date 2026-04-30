import { describe, expect, it } from "vitest";
import {
  isCareerJobsIndexLaunchQuarantined,
  isCareerJobsQueryPage,
  shouldIncludeInSitemap,
  shouldNoindex,
} from "@/lib/seo/indexingPolicy";

describe("career seo gate contract", () => {
  it("keeps explicit Career gates conservative when index eligibility is missing", () => {
    expect(
      shouldIncludeInSitemap("/en/career/jobs/backend-architect", {
        indexEligible: null,
        indexState: null,
      })
    ).toBe(false);

    expect(
      shouldNoindex(
        "/en/career/jobs/backend-architect",
        "en",
        undefined,
        {
          indexEligible: false,
          indexState: "blocked",
        }
      )
    ).toBe(true);
  });

  it("allows explicit Career gates when index eligibility is positively granted", () => {
    expect(
      shouldIncludeInSitemap("/en/career/jobs/backend-architect", {
        indexEligible: true,
        indexState: "promotion_candidate",
      })
    ).toBe(true);
  });

  it("keeps career jobs query pages out of indexable discoverability surfaces", () => {
    expect(isCareerJobsQueryPage("/en/career/jobs?q=backend")).toBe(true);
    expect(isCareerJobsQueryPage("/zh/career/jobs?q=%20%20%20")).toBe(false);
    expect(shouldNoindex("/en/career/jobs?q=backend", "en")).toBe(true);
    expect(shouldIncludeInSitemap("/en/career/jobs?q=backend")).toBe(false);
  });

  it("quarantines career jobs index from sitemap without hiding it from users", () => {
    expect(isCareerJobsIndexLaunchQuarantined("/en/career/jobs")).toBe(true);
    expect(isCareerJobsIndexLaunchQuarantined("/zh/career/jobs")).toBe(true);
    expect(shouldIncludeInSitemap("/en/career/jobs")).toBe(false);
    expect(shouldIncludeInSitemap("/zh/career/jobs")).toBe(false);
    expect(shouldNoindex("/en/career/jobs", "en")).toBe(false);
    expect(shouldNoindex("/zh/career/jobs", "zh")).toBe(false);
  });
});
