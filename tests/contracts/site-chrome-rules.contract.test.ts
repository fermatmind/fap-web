import { describe, expect, it } from "vitest";
import { COOKIE_BANNER_ENABLED } from "@/components/layout/siteChromeRules";

describe("site chrome rules contract", () => {
  it("enables cookie banner globally so users can grant analytics consent", () => {
    expect(COOKIE_BANNER_ENABLED).toBe(true);
  });
});
