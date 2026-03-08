import { afterEach, describe, expect, it, vi } from "vitest";
import robots from "@/app/robots";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("robots contract", () => {
  it("points to the env-aware authoritative sitemap url", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://staging.fermatmind.com");

    expect(robots()).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
      },
      sitemap: "https://staging.fermatmind.com/sitemap.xml",
    });
  });
});
