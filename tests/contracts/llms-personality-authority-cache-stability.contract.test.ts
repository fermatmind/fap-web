import fs from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ROOT = process.cwd();
const AUTHORITY_PATHS = [
  "/zh/personality/entj-vs-intj",
  "/zh/personality/intp-a-vs-intp-t",
  "/zh/personality/istj-a",
];

function sitemapPayload(paths = AUTHORITY_PATHS): Response {
  return new Response(JSON.stringify({
    items: paths.map((entry) => ({ loc: `https://fermatmind.com${entry}` })),
  }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
}

let cacheDirectory = "";

beforeEach(async () => {
  cacheDirectory = await mkdtemp(path.join(os.tmpdir(), "mbti-authority-cache-test-"));
  process.env.FERMATMIND_MBTI_AUTHORITY_CACHE_DIR = cacheDirectory;
  process.env.FERMATMIND_MBTI_AUTHORITY_ENABLE_SHARED_CACHE = "true";
});

afterEach(async () => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
  delete process.env.FERMATMIND_MBTI_AUTHORITY_CACHE_DIR;
  delete process.env.FERMATMIND_MBTI_AUTHORITY_ENABLE_SHARED_CACHE;
  await rm(cacheDirectory, { force: true, recursive: true });
});

describe("llms.txt personality authority cache stability", () => {
  it("isolates MBTI and Big Five authority budgets so one timeout cannot erase the other cohort", () => {
    const route = fs.readFileSync(path.join(ROOT, "app/llms.txt/route.ts"), "utf8");
    const personalityBlock = route.slice(
      route.indexOf("async function listPersonalityPaths"),
      route.indexOf("async function listTopicPaths"),
    );

    expect(personalityBlock.match(/withLlmsRouteBudget\(/g)).toHaveLength(3);
    expect(personalityBlock).toContain("listBackendSitemapMbtiPersonalityPaths({ signal })");
    expect(personalityBlock).toContain("readMbtiAuthorityLastKnownGood()");
    expect(personalityBlock).toContain("mbtiAuthorityLastKnownGood");
    expect(personalityBlock).toContain("listBackendSitemapBigFiveZhPaths({ signal })");
    expect(personalityBlock).toContain("listEnneagramLlmsPaths({ signal })");
    expect(personalityBlock).toContain("mbtiAuthorityAvailable: mbtiPersonalityPaths.length > 0");
    expect(personalityBlock).toContain("enneagramAuthorityAvailable: enneagramPaths.length === EXPECTED_ENNEAGRAM_LLMS_PATH_COUNT");
  });

  it("does not cache a degraded response that omitted backend-authoritative MBTI or Enneagram URLs", () => {
    const route = fs.readFileSync(path.join(ROOT, "app/llms.txt/route.ts"), "utf8");

    expect(route).toContain("personalityResult.mbtiAuthorityAvailable && personalityResult.enneagramAuthorityAvailable");
    expect(route).toContain('"public, s-maxage=3600, stale-while-revalidate=86400"');
    expect(route).toContain('"private, no-store, max-age=0"');
    expect(route).not.toMatch(/(?:istj-a|intj-vs-intp|entj-vs-intj)/);
    expect(route).not.toMatch(/(?:1w9|self-preservation|one-to-one)/);
  });

  it("shares a verified backend cohort across module instances after a transient fetch failure", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => sitemapPayload()));
    const firstWorker = await import("@/lib/seo/backendSitemapSource");
    await expect(firstWorker.listBackendSitemapMbtiPersonalityPaths()).resolves.toEqual(AUTHORITY_PATHS);

    vi.resetModules();
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("transient backend failure");
    }));
    const secondWorker = await import("@/lib/seo/backendSitemapSource");
    await expect(secondWorker.listBackendSitemapMbtiPersonalityPaths()).resolves.toEqual(AUTHORITY_PATHS);
    const secondWorkerCache = await import("@/lib/seo/backendSitemapMbtiAuthorityCache");
    await expect(secondWorkerCache.readMbtiAuthorityLastKnownGood()).resolves.toEqual(AUTHORITY_PATHS);
  });

  it("revokes cached membership on an explicit empty authority response", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => sitemapPayload()));
    const source = await import("@/lib/seo/backendSitemapSource");
    await expect(source.listBackendSitemapMbtiPersonalityPaths()).resolves.toEqual(AUTHORITY_PATHS);

    vi.stubGlobal("fetch", vi.fn(async () => sitemapPayload([])));
    await expect(source.listBackendSitemapMbtiPersonalityPaths()).resolves.toEqual([]);
    const cache = await import("@/lib/seo/backendSitemapMbtiAuthorityCache");
    await expect(cache.readMbtiAuthorityLastKnownGood()).resolves.toEqual([]);

    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("failure after explicit hold");
    }));
    await expect(source.listBackendSitemapMbtiPersonalityPaths()).rejects.toThrow("failure after explicit hold");
  });

  it("honors a shared revocation across workers instead of serving process-local stale membership", async () => {
    const firstWorkerCache = await import("@/lib/seo/backendSitemapMbtiAuthorityCache");
    await firstWorkerCache.writeMbtiAuthorityLastKnownGood(AUTHORITY_PATHS);
    await expect(firstWorkerCache.readMbtiAuthorityLastKnownGood()).resolves.toEqual(AUTHORITY_PATHS);

    vi.resetModules();
    const secondWorkerCache = await import("@/lib/seo/backendSitemapMbtiAuthorityCache");
    await secondWorkerCache.clearMbtiAuthorityLastKnownGood();

    await expect(firstWorkerCache.readMbtiAuthorityLastKnownGood()).resolves.toEqual([]);
  });

  it("rejects expired, malformed, or locally invented shared cache entries", async () => {
    const cache = await import("@/lib/seo/backendSitemapMbtiAuthorityCache");
    const currentTime = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(currentTime - cache.MBTI_AUTHORITY_LKG_MAX_AGE_MS - 1);
    await cache.writeMbtiAuthorityLastKnownGood(AUTHORITY_PATHS);
    vi.mocked(Date.now).mockReturnValue(currentTime);
    await expect(cache.readMbtiAuthorityLastKnownGood()).resolves.toEqual([]);

    await cache.writeMbtiAuthorityLastKnownGood([
      "/zh/personality/intj",
      "/private/result/attempt",
    ]);
    cache.resetMbtiAuthorityInProcessCacheForTests();

    await expect(cache.readMbtiAuthorityLastKnownGood()).resolves.toEqual([]);
  });
});
