import { describe, expect, it } from "vitest";
import { isCookieSuppressedPath } from "@/components/layout/siteChromeRules";

describe("site chrome rules contract", () => {
  it("suppresses cookie banner on immersive and private paths", () => {
    expect(isCookieSuppressedPath("/result/abc")).toBe(true);
    expect(isCookieSuppressedPath("/share/xyz")).toBe(true);
    expect(isCookieSuppressedPath("/orders/lookup")).toBe(true);
    expect(isCookieSuppressedPath("/tests/foo/take")).toBe(true);
    expect(isCookieSuppressedPath("/test/foo/take")).toBe(true);
  });

  it("does not suppress cookie banner on regular content paths", () => {
    expect(isCookieSuppressedPath("/help")).toBe(false);
    expect(isCookieSuppressedPath("/articles")).toBe(false);
    expect(isCookieSuppressedPath("/tests")).toBe(false);
    expect(isCookieSuppressedPath("/career")).toBe(false);
  });
});
