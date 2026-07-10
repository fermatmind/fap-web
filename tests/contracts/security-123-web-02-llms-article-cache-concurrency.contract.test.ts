import { execFileSync } from "node:child_process";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearCmsArticleLlmsCacheForTests,
  listCmsArticlesForLlms,
  listCmsArticlesForLlmsWithLastKnownGood,
} from "@/lib/cms/articles";
import { clearLastKnownGoodForTests } from "@/lib/cms/last-known-good";
import { isSecurity123Web02AllowedFile } from "./helpers/currentPrScope";

function jsonResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function pageResponse(page: number, lastPage = 2, withItem = true): Response {
  return jsonResponse({
    ok: true,
    items: withItem
      ? [{
          slug: `article-${page}`,
          locale: "zh-CN",
          title: `Article ${page}`,
          status: "published",
          is_public: true,
          is_indexable: true,
          published_revision_id: page,
        }]
      : [],
    pagination: {
      current_page: page,
      per_page: 100,
      total: withItem ? lastPage : 0,
      last_page: lastPage,
    },
  });
}

function changedFiles(): string[] {
  const files = new Set<string>();
  for (const args of [
    ["diff", "--name-only", "HEAD"],
    ["diff", "--cached", "--name-only"],
    ["diff", "--name-only", "origin/main...HEAD"],
    ["ls-files", "--others", "--exclude-standard"],
  ]) {
    try {
      for (const file of execFileSync("git", args, { encoding: "utf8" }).split("\n")) {
        if (file.trim()) files.add(file.trim());
      }
    } catch {
      // CI merge refs may not expose every local diff base.
    }
  }
  return [...files].sort();
}

afterEach(() => {
  clearCmsArticleLlmsCacheForTests();
  clearLastKnownGoodForTests();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("SECURITY-123-WEB-02 LLMS article cache and concurrency", () => {
  it("normalizes fractional and invalid page concurrency to a safe positive step", async () => {
    for (const pageConcurrency of [0.5, 1.9, 2.9, 99, 0, -1, Number.NaN, Number.POSITIVE_INFINITY, undefined]) {
      clearCmsArticleLlmsCacheForTests();
      const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        expect(init).toMatchObject({ next: { revalidate: 300 } });
        expect(init).not.toHaveProperty("cache");
        const page = Number(new URL(String(input), "http://localhost:3000").searchParams.get("page"));
        return pageResponse(page, 2);
      });
      vi.stubGlobal("fetch", fetchMock);

      await expect(listCmsArticlesForLlms({
        locale: "zh",
        maxPages: 2,
        pageConcurrency,
      })).resolves.toHaveLength(2);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    }
  });

  it("shares a successful enumeration across concurrent and subsequent callers", async () => {
    let releasePageTwo: (() => void) | undefined;
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      expect(init).toMatchObject({ next: { revalidate: 300 } });
      expect(init).not.toHaveProperty("cache");
      const page = Number(new URL(String(input), "http://localhost:3000").searchParams.get("page"));
      if (page === 2) {
        return new Promise<Response>((resolve) => {
          releasePageTwo = () => resolve(pageResponse(2));
        });
      }
      return Promise.resolve(pageResponse(1));
    });
    vi.stubGlobal("fetch", fetchMock);

    const first = listCmsArticlesForLlms({ locale: "zh", maxPages: 2, pageConcurrency: 2 });
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const second = listCmsArticlesForLlms({ locale: "zh", maxPages: 2, pageConcurrency: 4 });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    releasePageTwo?.();
    await expect(Promise.all([first, second])).resolves.toHaveLength(2);
    await expect(listCmsArticlesForLlms({ locale: "zh", maxPages: 2, pageConcurrency: 1 })).resolves.toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not cache an empty authority response", async () => {
    let callCount = 0;
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(init).toMatchObject({ next: { revalidate: 300 } });
      expect(init).not.toHaveProperty("cache");
      callCount += 1;
      const page = Number(new URL(String(input), "http://localhost:3000").searchParams.get("page"));
      return pageResponse(page, 1, callCount > 1);
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(listCmsArticlesForLlms({ locale: "zh", maxPages: 1 })).resolves.toEqual([]);
    await expect(listCmsArticlesForLlms({ locale: "zh", maxPages: 1 })).resolves.toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("keeps LLMS last-known-good fail-closed for errors and fresh empty authority", async () => {
    const successFetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(init).toMatchObject({ next: { revalidate: 300 } });
      const page = Number(new URL(String(input), "http://localhost:3000").searchParams.get("page"));
      return pageResponse(page, 1);
    });
    vi.stubGlobal("fetch", successFetch);

    await expect(listCmsArticlesForLlmsWithLastKnownGood({ locale: "zh", maxPages: 1 })).resolves.toMatchObject({
      source: "fresh",
      stale: false,
    });

    clearCmsArticleLlmsCacheForTests();
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("CMS unavailable");
    }));
    await expect(listCmsArticlesForLlmsWithLastKnownGood({ locale: "zh", maxPages: 1 })).rejects.toThrow("CMS unavailable");

    clearCmsArticleLlmsCacheForTests();
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(init).toMatchObject({ next: { revalidate: 300 } });
      const page = Number(new URL(String(input), "http://localhost:3000").searchParams.get("page"));
      return pageResponse(page, 1, false);
    }));
    await expect(listCmsArticlesForLlmsWithLastKnownGood({ locale: "zh", maxPages: 1 })).resolves.toMatchObject({
      value: [],
      source: "fresh",
      stale: false,
    });
  });

  it("keeps the current PR diff inside the declared WEB-02 scope", () => {
    const changed = changedFiles();
    expect(changed.length).toBeGreaterThan(0);
    expect(changed.every(isSecurity123Web02AllowedFile), changed.join("\n")).toBe(true);
  });
});
