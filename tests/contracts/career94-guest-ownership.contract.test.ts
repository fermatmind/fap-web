import { beforeEach, describe, expect, it } from "vitest";
import { careerGuestHeaders } from "@/lib/commerce/guestOwnership";

describe("Private guest purchase credential", () => {
  beforeEach(() => window.localStorage.clear());
  it("does not create credentials while reading a private link", () => {
    expect(careerGuestHeaders()).toEqual({});
    expect(window.localStorage.length).toBe(0);
  });
  it("persists an unpredictable browser credential independently from the public visitor ID", () => {
    const first = careerGuestHeaders(true)["X-Career-Guest-Token"];
    expect(first).toMatch(/^[a-f0-9]{64}$/);
    window.localStorage.setItem("fm_auth_token", "fm_renewed-session");
    expect(careerGuestHeaders()["X-Career-Guest-Token"]).toBe(first);
    window.localStorage.clear();
    expect(careerGuestHeaders(true)["X-Career-Guest-Token"]).not.toBe(first);
  });
});
