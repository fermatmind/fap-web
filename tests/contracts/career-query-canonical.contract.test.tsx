import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("career jobs query canonical contract", () => {
  it("keeps real search queries noindex and canonicalized back to the base jobs page", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
    vi.doMock("@/lib/i18n/getDict", () => ({
      resolveLocale: vi.fn(() => "en"),
    }));

    const { generateMetadata } = await import("@/app/(localized)/[locale]/career/jobs/page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({ q: "backend" }),
    });

    expect(String(metadata.alternates?.canonical ?? "")).toBe("https://fermatmind.com/en/career/jobs");
    expect(metadata.robots).toMatchObject({
      index: false,
      follow: false,
    });
  });

  it("treats whitespace-only query like the base jobs page for canonical and robots", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
    vi.doMock("@/lib/i18n/getDict", () => ({
      resolveLocale: vi.fn(() => "en"),
    }));

    const { generateMetadata } = await import("@/app/(localized)/[locale]/career/jobs/page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({ q: "   " }),
    });

    expect(String(metadata.alternates?.canonical ?? "")).toBe("https://fermatmind.com/en/career/jobs");
    expect(metadata.robots).toMatchObject({
      index: true,
      follow: true,
    });
  });

  it("keeps no-result style queries noindex and canonicalized to the base jobs page", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
    vi.doMock("@/lib/i18n/getDict", () => ({
      resolveLocale: vi.fn(() => "en"),
    }));

    const { generateMetadata } = await import("@/app/(localized)/[locale]/career/jobs/page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({ q: "zzzz" }),
    });

    expect(String(metadata.alternates?.canonical ?? "")).toBe("https://fermatmind.com/en/career/jobs");
    expect(metadata.robots).toMatchObject({
      index: false,
      follow: false,
    });
  });
});
