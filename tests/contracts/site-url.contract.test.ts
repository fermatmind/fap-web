import { afterEach, describe, expect, it, vi } from "vitest";
import { CANONICAL_SITE_URL, getSiteUrlOrThrow, isConfiguredStagingSiteUrl, isStagingSiteUrl } from "@/lib/site";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("site url hard gate contract", () => {
  it("throws in production when site url is missing", () => {
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(() => getSiteUrlOrThrow()).toThrow();
  });

  it("throws in production when site url points to localhost", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
    expect(() => getSiteUrlOrThrow()).toThrow();
  });

  it("accepts a production absolute domain url", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", CANONICAL_SITE_URL);
    expect(getSiteUrlOrThrow()).toBe(CANONICAL_SITE_URL);
  });

  it("converges FermatMind www and http origins to the apex canonical url", () => {
    vi.stubEnv("NODE_ENV", "production");

    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.fermatmind.com");
    expect(getSiteUrlOrThrow()).toBe(CANONICAL_SITE_URL);

    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://fermatmind.com");
    expect(getSiteUrlOrThrow()).toBe(CANONICAL_SITE_URL);
  });

  it("classifies staging as non-production and converges canonical generation to apex", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://staging.fermatmind.com");
    expect(isStagingSiteUrl("https://staging.fermatmind.com")).toBe(true);
    expect(isConfiguredStagingSiteUrl()).toBe(true);
    expect(getSiteUrlOrThrow()).toBe(CANONICAL_SITE_URL);
  });
});
