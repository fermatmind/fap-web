import { afterEach, describe, expect, it, vi } from "vitest";
import CareerCrosswalkOpsDetailPage from "@/app/(localized)/[locale]/ops/career/crosswalk/[slug]/page";
import CareerCrosswalkOpsQueuePage from "@/app/(localized)/[locale]/ops/career/crosswalk/page";

const mocks = vi.hoisted(() => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  fetchCareerCrosswalkOverrideSummary: vi.fn(),
  fetchCareerCrosswalkPatchHistory: vi.fn(),
  fetchCareerCrosswalkReviewQueue: vi.fn(),
  fetchCareerCrosswalkReviewQueueItem: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: mocks.notFound,
}));

vi.mock("@/lib/career/api/fetchCareerCrosswalkOps", () => ({
  fetchCareerCrosswalkOverrideSummary: mocks.fetchCareerCrosswalkOverrideSummary,
  fetchCareerCrosswalkPatchHistory: mocks.fetchCareerCrosswalkPatchHistory,
  fetchCareerCrosswalkReviewQueue: mocks.fetchCareerCrosswalkReviewQueue,
  fetchCareerCrosswalkReviewQueueItem: mocks.fetchCareerCrosswalkReviewQueueItem,
}));

describe("career crosswalk ops route gate contract", () => {
  const original = process.env.FAP_ENABLE_CAREER_CROSSWALK_OPS;

  afterEach(() => {
    vi.clearAllMocks();
    if (typeof original === "undefined") {
      delete process.env.FAP_ENABLE_CAREER_CROSSWALK_OPS;
      return;
    }
    process.env.FAP_ENABLE_CAREER_CROSSWALK_OPS = original;
  });

  it("denies public queue access before calling internal crosswalk APIs", async () => {
    delete process.env.FAP_ENABLE_CAREER_CROSSWALK_OPS;

    await expect(
      CareerCrosswalkOpsQueuePage({
        params: Promise.resolve({ locale: "en" }),
        searchParams: Promise.resolve({}),
      })
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(mocks.fetchCareerCrosswalkReviewQueue).not.toHaveBeenCalled();
  });

  it("denies public detail access before calling internal crosswalk APIs", async () => {
    delete process.env.FAP_ENABLE_CAREER_CROSSWALK_OPS;

    await expect(
      CareerCrosswalkOpsDetailPage({
        params: Promise.resolve({ locale: "en", slug: "sample-role" }),
      })
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(mocks.fetchCareerCrosswalkReviewQueueItem).not.toHaveBeenCalled();
    expect(mocks.fetchCareerCrosswalkPatchHistory).not.toHaveBeenCalled();
    expect(mocks.fetchCareerCrosswalkOverrideSummary).not.toHaveBeenCalled();
  });

  it("preserves the queue fetch path when explicitly enabled for an internal deployment", async () => {
    process.env.FAP_ENABLE_CAREER_CROSSWALK_OPS = "true";
    mocks.fetchCareerCrosswalkReviewQueue.mockResolvedValue({
      counts: { total: 0 },
      items: [],
    });

    await CareerCrosswalkOpsQueuePage({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({}),
    });

    expect(mocks.notFound).not.toHaveBeenCalled();
    expect(mocks.fetchCareerCrosswalkReviewQueue).toHaveBeenCalledWith({
      locale: "en",
      filters: {
        crosswalk_mode: undefined,
        requires_editorial_patch: undefined,
        publish_track: undefined,
        batch_origin: undefined,
        queue_reason: undefined,
        sort: "risk",
      },
    });
  });
});
