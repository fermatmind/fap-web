import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearCmsArticleLlmsCacheForTests,
  listCmsArticlesForLlms,
  listCmsArticlesForLlmsWithLastKnownGood,
} from "@/lib/cms/articles";
import { clearLastKnownGoodForTests } from "@/lib/cms/last-known-good";

function publishedPage(slug: string): Response {
  return Response.json({
    ok: true,
    items: [{ slug, locale: "en", title: slug, status: "published", is_public: true,
      is_indexable: true, llms_eligible: true, published_revision_id: 725 }],
    pagination: { current_page: 1, per_page: 40, total: 1, last_page: 1 },
  });
}

afterEach(() => {
  clearCmsArticleLlmsCacheForTests();
  clearLastKnownGoodForTests();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("full artifact article source freshness", () => {
  it("reads new publication authority instead of the cached enumeration", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(publishedPage("older-article"))
      .mockResolvedValueOnce(publishedPage("newly-published-article"));
    vi.stubGlobal("fetch", fetchMock);
    const params = { locale: "en", perPage: 40, maxPages: 1 };

    await expect(listCmsArticlesForLlms(params)).resolves.toMatchObject([{ slug: "older-article" }]);
    await expect(listCmsArticlesForLlms({ ...params, usePublicCache: false }))
      .resolves.toMatchObject([{ slug: "newly-published-article" }]);
    expect(fetchMock.mock.calls[1]?.[1]).toMatchObject({ cache: "no-store" });
    expect(fetchMock.mock.calls[1]?.[1]).not.toHaveProperty("next");
  });

  it("does not join an older cached-mode request already in flight", async () => {
    let releaseOlder: (() => void) | undefined;
    const fetchMock = vi.fn()
      .mockImplementationOnce(() => new Promise<Response>((resolve) => {
        releaseOlder = () => resolve(publishedPage("older-article"));
      }))
      .mockResolvedValueOnce(publishedPage("newly-published-article"));
    vi.stubGlobal("fetch", fetchMock);
    const params = { locale: "en", perPage: 40, maxPages: 1 };
    const older = listCmsArticlesForLlms(params);
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const fresh = listCmsArticlesForLlms({ ...params, usePublicCache: false });
    try {
      await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    } finally {
      releaseOlder?.();
      await older;
    }
    await expect(fresh).resolves.toMatchObject([{ slug: "newly-published-article" }]);
  });

  it("does not reuse a fresh snapshot on a subsequent rebuild or on source failure", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(publishedPage("first-publication"))
      .mockResolvedValueOnce(publishedPage("second-publication"))
      .mockRejectedValueOnce(new Error("CMS unavailable"));
    vi.stubGlobal("fetch", fetchMock);
    const params = { locale: "en", perPage: 40, maxPages: 1, usePublicCache: false };
    await expect(listCmsArticlesForLlmsWithLastKnownGood(params))
      .resolves.toMatchObject({ value: [{ slug: "first-publication" }], stale: false });
    await expect(listCmsArticlesForLlmsWithLastKnownGood(params))
      .resolves.toMatchObject({ value: [{ slug: "second-publication" }], stale: false });
    await expect(listCmsArticlesForLlmsWithLastKnownGood(params)).rejects.toThrow("CMS unavailable");
  });
});
