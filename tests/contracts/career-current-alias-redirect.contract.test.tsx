import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  permanentRedirect: (path: string) => { throw new Error(`308:${path}`); },
  notFound: () => { throw new Error("404"); },
}));
vi.mock("@/lib/career/api/fetchCareerJobBundle", () => ({
  fetchCareerJobBundle: vi.fn(async () => ({ identity: { canonical_slug: "librarians" } })),
}));
vi.mock("@/lib/career/adapters/adaptCareerJobBundle", () => ({
  adaptCareerJobBundle: ({ payload }: { payload: unknown }) => payload ? { slug: "librarians" } : null,
}));

import CareerJobDetailPage, { generateMetadata } from "@/app/(localized)/[locale]/career/jobs/[slug]/page";
import { fetchCareerJobBundle } from "@/lib/career/api/fetchCareerJobBundle";

describe("legacy backend-resolved career aliases", () => {
  it.each(["en", "zh"])("redirects body and metadata in the same %s locale", async (locale) => {
    const params = Promise.resolve({ locale, slug: "legacy-library-role" });
    await expect(CareerJobDetailPage({ params })).rejects.toThrow(`308:/${locale}/career/jobs/librarians`);
    await expect(generateMetadata({ params })).rejects.toThrow(`308:/${locale}/career/jobs/librarians`);
  });
  it.each([{ bundle_version: "career.detail.page.v1" }, { career_page: null }])(
    "does not infer a legacy alias from a damaged Current descriptor: %j", async descriptor => {
      vi.mocked(fetchCareerJobBundle).mockResolvedValueOnce({
        ...descriptor, identity: { canonical_slug: "librarians" },
      });
      await expect(CareerJobDetailPage({ params: Promise.resolve({ locale: "zh", slug: "legacy-library-role" }) }))
        .rejects.toThrow("CAREER_PAGE_CONTRACT_INVALID");
    },
  );
  it("fails closed when the formal target is unavailable", async () => {
    vi.mocked(fetchCareerJobBundle).mockResolvedValueOnce(null);
    await expect(CareerJobDetailPage({ params: Promise.resolve({ locale: "zh", slug: "old-career" }) })).rejects.toThrow("404");
  });
});
