import { afterEach, describe, expect, it, vi } from "vitest";
import { clearLastKnownGoodForTests } from "@/lib/cms/last-known-good";
import { listDiscoverableTopicsWithLastKnownGood } from "@/lib/cms/topics";

function topicResponse(items: Array<Record<string, unknown>>): Response {
  return new Response(JSON.stringify({ ok: true, items, pagination: { current_page: 1, per_page: 100 } }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

const publishedTopic = {
  id: 1,
  org_id: 0,
  topic_code: "MBTI",
  slug: "mbti",
  locale: "en",
  title: "MBTI",
  status: "published",
  is_public: true,
  is_indexable: true,
};

describe("AUDIT-PRR2-WEB-03 topic backend authority", () => {
  afterEach(() => {
    clearLastKnownGoodForTests();
    vi.unstubAllGlobals();
  });

  it("serves validated stale backend authority during a transient outage", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(topicResponse([publishedTopic]))
      .mockResolvedValueOnce(new Response("unavailable", { status: 503 }));
    vi.stubGlobal("fetch", fetchMock);

    const fresh = await listDiscoverableTopicsWithLastKnownGood({ locale: "en" });
    const stale = await listDiscoverableTopicsWithLastKnownGood({ locale: "en" });

    expect(fresh).toMatchObject({ source: "fresh", stale: false });
    expect(stale).toMatchObject({ source: "last-known-good", stale: true });
    expect(stale.value.items.map((item) => item.slug)).toEqual(["mbti"]);
  });

  it("fails closed without LKG and replaces stale exposure after unpublish/delete", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("unavailable", { status: 503 })));
    await expect(listDiscoverableTopicsWithLastKnownGood({ locale: "en" })).rejects.toThrow();

    clearLastKnownGoodForTests();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(topicResponse([publishedTopic]))
      .mockResolvedValueOnce(topicResponse([]))
      .mockResolvedValueOnce(new Response("unavailable", { status: 503 }));
    vi.stubGlobal("fetch", fetchMock);

    await listDiscoverableTopicsWithLastKnownGood({ locale: "en" });
    const removed = await listDiscoverableTopicsWithLastKnownGood({ locale: "en" });
    const staleAfterRemoval = await listDiscoverableTopicsWithLastKnownGood({ locale: "en" });

    expect(removed.value.items).toEqual([]);
    expect(staleAfterRemoval.value.items).toEqual([]);
  });

  it("filters non-public and noindex topics before they reach discoverability", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(topicResponse([
      publishedTopic,
      { ...publishedTopic, id: 2, slug: "private", is_public: false },
      { ...publishedTopic, id: 3, slug: "noindex", is_indexable: false },
    ])));

    const result = await listDiscoverableTopicsWithLastKnownGood({ locale: "en" });
    expect(result.value.items.map((item) => item.slug)).toEqual(["mbti"]);
  });
});
