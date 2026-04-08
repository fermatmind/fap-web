import { describe, expect, it } from "vitest";
import { shouldIncludeInSitemap, shouldNoindex } from "@/lib/seo/indexingPolicy";

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
});
