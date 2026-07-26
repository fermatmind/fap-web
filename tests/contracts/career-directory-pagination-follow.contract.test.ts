import { afterEach, describe, expect, it, vi } from "vitest";
import { extractBackendSitemapCareerJobPaths } from "@/lib/seo/backendSitemapSource";

type Locale = "en" | "zh";

const SITE_URL = "https://fermatmind.com";

async function metadataFor(
  locale: Locale,
  searchParams: Record<string, string | string[] | undefined>
) {
  const { generateMetadata } = await import("@/app/(localized)/[locale]/career/jobs/page");

  return generateMetadata({
    params: Promise.resolve({ locale }),
    searchParams: Promise.resolve(searchParams),
  });
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("CAREER-DIRECTORY-PAGINATION-FOLLOW-01", () => {
  it.each([
    ["search", { q: "nurse" }],
    ["filter", { family: "healthcare" }],
    ["pagination", { page: "2" }],
    ["combined state", { q: "nurse", family: "healthcare", page: "2" }],
  ])("keeps every %s state noindex,follow with the locale directory root canonical", async (_label, searchParams) => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", SITE_URL);

    for (const locale of ["en", "zh"] as const) {
      const metadata = await metadataFor(locale, searchParams);
      const root = `${SITE_URL}/${locale}/career/jobs`;

      expect(metadata.alternates?.canonical).toBe(root);
      expect(String(metadata.alternates?.canonical)).not.toContain("?");
      expect(metadata.robots).toMatchObject({
        index: false,
        follow: true,
        googleBot: {
          index: false,
          follow: true,
        },
      });
    }
  });

  it("keeps both unfiltered directory roots indexable and self-canonical", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", SITE_URL);

    for (const locale of ["en", "zh"] as const) {
      const metadata = await metadataFor(locale, {});

      expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/${locale}/career/jobs`);
      expect(metadata.robots).toMatchObject({
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
        },
      });
    }
  });

  it("keeps directory roots, filters, pagination, and search URLs out of backend-authoritative career detail enumeration", () => {
    expect(
      extractBackendSitemapCareerJobPaths({
        items: [
          { loc: `${SITE_URL}/en/career/jobs` },
          { loc: `${SITE_URL}/zh/career/jobs` },
          { loc: `${SITE_URL}/en/career/jobs?page=2` },
          { loc: `${SITE_URL}/zh/career/jobs?family=healthcare` },
          { loc: `${SITE_URL}/en/career/jobs?q=nurse` },
          { loc: `${SITE_URL}/en/career/jobs/registered-nurses` },
          { loc: `${SITE_URL}/zh/career/jobs/registered-nurses` },
        ],
      })
    ).toEqual([
      "/en/career/jobs/registered-nurses",
      "/zh/career/jobs/registered-nurses",
    ]);
  });
});
