import { describe, expect, it } from "vitest";
import { COOKIE_BANNER_ENABLED } from "@/components/layout/siteChromeRules";

describe("site chrome rules contract", () => {
  it("disables cookie banner globally", () => {
    expect(COOKIE_BANNER_ENABLED).toBe(false);
  });
});
