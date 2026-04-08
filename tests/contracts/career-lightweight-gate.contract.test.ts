import { describe, expect, it } from "vitest";
import { deriveCareerLightweightDataStatus } from "@/lib/career/lightweightGate";

describe("career lightweight gate contract", () => {
  it("derives availability from explicit backend index and trust signals", () => {
    expect(
      deriveCareerLightweightDataStatus({
        authoritySource: "career_backend_lightweight_index.v0.5",
        indexEligible: true,
        indexState: "index",
        reviewerStatus: "approved",
      })
    ).toBe("available");
  });

  it("keeps trust-limited state conservative when explicit backend authority exists but index is blocked", () => {
    expect(
      deriveCareerLightweightDataStatus({
        authoritySource: "career_backend_lightweight_index.v0.5",
        indexEligible: false,
        indexState: "blocked",
        reviewerStatus: "reviewed",
      })
    ).toBe("trust_limited");
  });

  it("returns unavailable when authority is absent", () => {
    expect(
      deriveCareerLightweightDataStatus({
        authoritySource: "",
        indexEligible: null,
        indexState: null,
        reviewerStatus: null,
      })
    ).toBe("unavailable");
  });
});
