import { afterEach, describe, expect, it, vi } from "vitest";
import { getTopicBySlug, getTopicSeoBySlug } from "@/lib/cms/topics";

const json = (payload: unknown, status = 200) => new Response(JSON.stringify(payload), {
  status, headers: { "Content-Type": "application/json" },
});
const detail = (slug: string, locale: string, version = 1) => ({
  ok: true,
  profile: { org_id: 0, topic_code: slug, slug, locale, title: `Current topic ${version}`, status: "published", is_public: true },
  sections: [{ section_key: "overview", render_variant: "rich_text", body_md: `Current body ${version}`, is_enabled: true }],
  entry_groups: {},
});
const seo = (version = 1) => ({ meta: { title: `Current metadata ${version}`, description: "Current description", robots: "noindex,follow" } });
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("IQ/EQ topic current authority", () => {
  it.each(["en", "zh", "zh-CN"])("reads detail and SEO without data cache for %s", async locale => {
    const fetcher = vi.fn(async (input: RequestInfo | URL, options?: RequestInit) => {
      void options;
      return json(String(input).includes("/seo?") ? seo() : detail("iq-eq", locale));
    });
    vi.stubGlobal("fetch", fetcher);
    expect((await getTopicBySlug(" IQ-EQ ", locale))?.title).toBe("Current topic 1");
    expect((await getTopicSeoBySlug(" IQ-EQ ", locale))?.meta.title).toBe("Current metadata 1");
    expect(fetcher).toHaveBeenCalledTimes(2);
    for (const [input, options] of fetcher.mock.calls) {
      expect(String(input)).toContain("org_id=0");
      expect(options?.cache).toBe("no-store");
      expect((options as RequestInit & { next?: unknown }).next).toBeUndefined();
    }
  });
  it("preserves unrelated topic caching", async () => {
    const fetcher = vi.fn(async (input: RequestInfo | URL, options?: RequestInit) => {
      void options;
      return json(String(input).includes("/seo?") ? seo() : detail("mbti", "en"));
    });
    vi.stubGlobal("fetch", fetcher);
    await getTopicBySlug("mbti", "en"); await getTopicSeoBySlug("mbti", "en");
    for (const [, options] of fetcher.mock.calls) expect(options).toMatchObject({ next: { revalidate: 300 } });
  });
  it("publication replaces copy and withdrawal or failure cannot reuse it", async () => {
    let version = 1; let status = 200;
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => json(
      status === 200 ? (String(input).includes("/seo?") ? seo(version) : detail("iq-eq", "en", version)) : { error: "unavailable" }, status,
    )));
    expect((await getTopicBySlug("iq-eq", "en"))?.title).toBe("Current topic 1");
    expect((await getTopicSeoBySlug("iq-eq", "en"))?.meta.title).toBe("Current metadata 1");
    version = 2;
    expect((await getTopicBySlug("iq-eq", "en"))?.title).toBe("Current topic 2");
    expect((await getTopicSeoBySlug("iq-eq", "en"))?.meta.title).toBe("Current metadata 2");
    status = 404;
    expect(await getTopicBySlug("iq-eq", "en")).toBeNull();
    expect(await getTopicSeoBySlug("iq-eq", "en")).toBeNull();
    status = 500;
    await expect(getTopicBySlug("iq-eq", "en")).rejects.toThrow();
    await expect(getTopicSeoBySlug("iq-eq", "en")).rejects.toThrow();
  });
  it("a late response cannot replace subsequent authority", async () => {
    let finish!: (value: Response) => void;
    const pendingResponse = new Promise<Response>(resolve => { finish = resolve; });
    vi.stubGlobal("fetch", vi.fn().mockImplementationOnce(() => pendingResponse)
      .mockImplementation(async () => json(detail("iq-eq", "en", 2))));
    const old = getTopicBySlug("iq-eq", "en");
    expect((await getTopicBySlug("iq-eq", "en"))?.title).toBe("Current topic 2");
    finish(json(detail("iq-eq", "en", 1)));
    expect((await old)?.title).toBe("Current topic 1");
    expect((await getTopicBySlug("iq-eq", "en"))?.title).toBe("Current topic 2");
  });
});
