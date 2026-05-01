import { describe, expect, it } from "vitest";
import { isCareerCrosswalkOpsRouteEnabled } from "@/lib/career/crosswalkOpsAccess";

describe("career crosswalk ops access contract", () => {
  it("keeps the internal ops route disabled by default", () => {
    expect(isCareerCrosswalkOpsRouteEnabled({})).toBe(false);
  });

  it("only enables the route for explicit internal deployment values", () => {
    expect(isCareerCrosswalkOpsRouteEnabled({ FAP_ENABLE_CAREER_CROSSWALK_OPS: "1" })).toBe(true);
    expect(isCareerCrosswalkOpsRouteEnabled({ FAP_ENABLE_CAREER_CROSSWALK_OPS: "true" })).toBe(true);
    expect(isCareerCrosswalkOpsRouteEnabled({ FAP_ENABLE_CAREER_CROSSWALK_OPS: "TRUE" })).toBe(true);
    expect(isCareerCrosswalkOpsRouteEnabled({ FAP_ENABLE_CAREER_CROSSWALK_OPS: "0" })).toBe(false);
    expect(isCareerCrosswalkOpsRouteEnabled({ FAP_ENABLE_CAREER_CROSSWALK_OPS: "false" })).toBe(false);
    expect(isCareerCrosswalkOpsRouteEnabled({ FAP_ENABLE_CAREER_CROSSWALK_OPS: "public" })).toBe(false);
  });
});
