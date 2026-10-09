import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { NextRequest } from "next/server";
import { IncrementalCache } from "next/dist/server/lib/incremental-cache";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { TestLookup } from "@/lib/content";

const mocks = vi.hoisted(() => ({
  authenticate: vi.fn(async () => ({ ok: true, nonceHash: "test-nonce-hash" })),
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath, revalidateTag: mocks.revalidateTag }));
vi.mock("@/lib/security/contentReleaseRevalidationAuth", () => ({ authenticateContentReleaseRevalidation: mocks.authenticate }));

import { POST } from "@/lib/contentRelease/revalidateRoute";
import { IQ_PUBLIC_ENTRY_PATHS, IQ_PUBLIC_ENTRY_SLUG, readIqEntryLkgGeneration } from "@/lib/tests/iqEntryLastKnownGoodGeneration";

let directory: string;
const loadCms = async () => ({ value: null, source: "unavailable" as const });
const unavailable = async () => { throw new TypeError("fetch failed"); };
function fixture(locale: "zh" | "en", body: string): TestLookup {
  return {
    ok: true, primary_slug: IQ_PUBLIC_ENTRY_SLUG, slug: IQ_PUBLIC_ENTRY_SLUG,
    requested_slug: IQ_PUBLIC_ENTRY_SLUG, resolved_from_alias: false, scale_code: "IQ_RAVEN",
    locale: locale === "zh" ? "zh-CN" : "en", is_public: true, is_indexable: locale === "zh",
    seo_title: "IQ entry", seo_description: "IQ reasoning entry", og_image_url: null,
    forms: [{ form_code: "iq_30", question_count: 30 }], capabilities: { default_form_code: "iq_30" },
    commercial: {}, content_i18n_json: { [locale]: { title: "IQ entry", description: "IQ reasoning entry", landing_copy: body, catalog: { questions_count: 30, time_minutes: 15 } } },
    landing_surface_v1: { version: "landing.surface.v1", entry_surface: "test_detail", start_test_target: `/${locale}/tests/${IQ_PUBLIC_ENTRY_SLUG}/take`, cta_bundle: [] },
  };
}
function invalidate(paths = IQ_PUBLIC_ENTRY_PATHS) {
  return POST(new NextRequest("https://fermatmind.com/api/content-release/revalidate", {
    method: "POST", body: JSON.stringify({ content: { type: "scale", slug: IQ_PUBLIC_ENTRY_SLUG, locale: "zh-CN" }, cache_signal: { paths } }),
  }));
}

beforeEach(async () => {
  directory = await mkdtemp(path.join(tmpdir(), "iq-entry-lkg-rollback-test-"));
  vi.stubEnv("FERMATMIND_TEST_LANDING_LKG_DIR", directory);
  vi.stubEnv("FERMATMIND_TEST_LANDING_ENABLE_SHARED_LKG", "true");
  mocks.revalidatePath.mockClear(); mocks.revalidateTag.mockClear();
});
afterEach(async () => { await rm(directory, { recursive: true, force: true }); vi.unstubAllEnvs(); });

describe("IQ exact publication and rollback cache closure", () => {
  it("a worker's stale API data cache cannot repopulate the restored LKG generation", async () => {
    vi.resetModules();
    const { apiClient } = await import("@/lib/api-client");
    let authority = "candidate";
    const nextCache = new IncrementalCache({
      dev: false, requestHeaders: {},
      getPrerenderManifest: () => ({ version: 4, routes: {}, dynamicRoutes: {}, notFoundRoutes: [], preview: { previewModeId: "test", previewModeSigningKey: "test", previewModeEncryptionKey: "test" } }),
    });
    const apiDataCache = new Map<string, TestLookup>();
    const read = vi.spyOn(apiClient, "getPublic").mockImplementation(async <T>(url: string): Promise<T> => {
      // Use the installed, lock-matched Next implementation, not a fake URL hash.
      const key = await nextCache.generateCacheKey(`https://api.fermatmind.test${url}`, { method: "GET" });
      if (!apiDataCache.has(key)) apiDataCache.set(key, fixture("en", authority));
      return apiDataCache.get(key) as T;
    });
    const { loadTestLandingDataUncached } = await import("@/lib/tests/testLandingData");
    const candidate = await loadTestLandingDataUncached("en", IQ_PUBLIC_ENTRY_SLUG, { loadCms });
    expect(candidate?.lookup.content_i18n_json).toMatchObject({ en: { landing_copy: "candidate" } });
    authority = "restored";
    await invalidate();
    const restored = await loadTestLandingDataUncached("en", IQ_PUBLIC_ENTRY_SLUG, { loadCms });
    expect(restored?.lookup.content_i18n_json).toMatchObject({ en: { landing_copy: "restored" } });
    expect(apiDataCache.size).toBe(2);
    expect(read.mock.calls.every(call => call[1]?.next?.revalidate === 300)).toBe(true);
    read.mockRestore();
  });
  it("rejects withdrawn candidate fallback in both workers and reads the restored authority", async () => {
    vi.resetModules();
    const workerA = await import("@/lib/tests/testLandingData");
    for (const locale of ["zh", "en"] as const) {
      await workerA.loadTestLandingDataUncached(locale, IQ_PUBLIC_ENTRY_SLUG, { lookup: async () => fixture(locale, "candidate"), loadCms });
    }
    vi.resetModules();
    const workerB = await import("@/lib/tests/testLandingData");
    for (const locale of ["zh", "en"] as const) {
      await expect(workerB.loadTestLandingDataUncached(locale, IQ_PUBLIC_ENTRY_SLUG, { lookup: unavailable, loadCms })).resolves.toMatchObject({ source: "last-known-good" });
    }
    const response = await invalidate();
    expect(await response.json()).toEqual({ ok: true, revalidated_paths: IQ_PUBLIC_ENTRY_PATHS, rejected_paths: [], invalidated_tags: [] });
    expect(mocks.revalidatePath.mock.calls.map(call => call[0])).toEqual(IQ_PUBLIC_ENTRY_PATHS);
    for (const worker of [workerA, workerB]) {
      for (const locale of ["zh", "en"] as const) {
        await expect(worker.loadTestLandingDataUncached(locale, IQ_PUBLIC_ENTRY_SLUG, { lookup: unavailable, loadCms })).rejects.toThrow("fetch failed");
      }
    }
    await workerB.loadTestLandingDataUncached("en", IQ_PUBLIC_ENTRY_SLUG, { lookup: async () => fixture("en", "restored"), loadCms });
    const restored = await workerA.loadTestLandingDataUncached("en", IQ_PUBLIC_ENTRY_SLUG, { lookup: unavailable, loadCms });
    expect(restored?.lookup.content_i18n_json).toMatchObject({ en: { landing_copy: "restored" } });
  });

  it("a delayed pre-rollback lookup cannot fill or return the new generation", async () => {
    const { loadTestLandingDataUncached } = await import("@/lib/tests/testLandingData");
    let resolveLookup!: (value: TestLookup) => void;
    const lookup = vi.fn(() => new Promise<TestLookup>(resolve => { resolveLookup = resolve; }));
    const pending = loadTestLandingDataUncached("zh", IQ_PUBLIC_ENTRY_SLUG, { lookup, loadCms });
    await vi.waitFor(() => expect(lookup).toHaveBeenCalledOnce());
    await invalidate();
    resolveLookup(fixture("zh", "withdrawn late candidate"));
    await expect(pending).rejects.toMatchObject({ errorCode: "IQ_ENTRY_AUTHORITY_CHANGED" });
    await expect(loadTestLandingDataUncached("zh", IQ_PUBLIC_ENTRY_SLUG, { lookup: unavailable, loadCms })).rejects.toThrow("fetch failed");
  });

  it("expanded requests cannot rotate IQ or invalidate discoverability", async () => {
    expect(await readIqEntryLkgGeneration("en")).toBe("baseline");
    expect((await invalidate([...IQ_PUBLIC_ENTRY_PATHS, "/sitemap.xml"])).status).toBe(400);
    expect(await readIqEntryLkgGeneration("en")).toBe("baseline");
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
    expect(mocks.revalidateTag).not.toHaveBeenCalled();
  });

  it("a generation storage failure cannot emit a successful invalidation receipt", async () => {
    const file = path.join(directory, "not-a-directory");
    await writeFile(file, "fixture"); vi.stubEnv("FERMATMIND_TEST_LANDING_LKG_DIR", file);
    await expect(invalidate()).rejects.toThrow();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});
