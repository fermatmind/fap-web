import { afterEach, describe, expect, it, vi } from "vitest";
import { extractBackendSitemapCareerJobPaths } from "@/lib/seo/backendSitemapSource";

type Locale = "en" | "zh";

const SITE_URL = "https://fermatmind.com";
const directoryState = vi.hoisted(() => ({ unavailable: false }));
vi.mock("@/lib/career/api/fetchCareerDirectory", () => ({
  fetchCareerDirectory: vi.fn(async ({ page, locale }: { page: number; locale: string }) => directoryState.unavailable
    ? { state: "unavailable", payload: null, error: null }
    : { state: "success", error: null, payload: {
      pagination: { page, per_page: 50, total: 1043, total_pages: 21 },
      items: page <= 21 ? [{ slug: "editors", title: "Editors", canonical_path: `/${locale}/career/jobs/editors`, detail_ready: true, indexable: true }] : [],
    } }),
}));

async function metadataFor(
  locale: Locale,
  searchParams: Record<string, string | string[] | undefined>
) {
  const { generateMetadata } = await import("@/app/(localized)/[locale]/career/page");

  return generateMetadata({
    params: Promise.resolve({ locale }),
    searchParams: Promise.resolve(searchParams),
  });
}

afterEach(() => {
  directoryState.unavailable = false;
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("CAREER-DIRECTORY-PAGINATION-FOLLOW-01", () => {
  it.each([
    ["search", { q: "nurse" }],
    ["filter", { family: "healthcare" }],
    ["combined state", { q: "nurse", family: "healthcare", page: "2" }],
  ])("keeps every %s state noindex,follow with the locale directory root canonical", async (_label, searchParams) => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", SITE_URL);

    for (const locale of ["en", "zh"] as const) {
      const metadata = await metadataFor(locale, searchParams);
      const root = `${SITE_URL}/${locale}/career`;

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

  it.each([2, 21, 22])("binds pure page %i canonical to current directory bounds", async (page) => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", SITE_URL);
    for (const locale of ["en", "zh"] as const) {
      const metadata = await metadataFor(locale, { page: String(page) });
      expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/${locale}/career${page <= 21 ? `?page=${page}` : ""}`);
      expect(metadata.robots).toMatchObject({ index: false, follow: true });
    }
  });

  it("does not claim a valid pagination canonical when the directory is unavailable", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", SITE_URL);
    directoryState.unavailable = true;
    const metadata = await metadataFor("zh", { page: "2" });
    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/zh/career`);
    expect(metadata.robots).toMatchObject({ index: false, follow: true });
  });

  it("keeps both unfiltered directory roots indexable and self-canonical", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", SITE_URL);

    for (const locale of ["en", "zh"] as const) {
      const metadata = await metadataFor(locale, { page: "1" });

      expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/${locale}/career`);
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
