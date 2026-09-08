import { access, mkdtemp, readFile, readdir, rm, unlink, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

const SITE_URL = "https://fermatmind.com";
const temporaryDirectories: string[] = [];

async function createSharedCacheDirectory(): Promise<string> {
  const directory = await mkdtemp(path.join(tmpdir(), "llms-full-rebuild-guard-"));
  temporaryDirectories.push(directory);
  process.env.FERMATMIND_LLMS_FULL_CACHE_DIR = directory;
  process.env.FERMATMIND_LLMS_FULL_ENABLE_SHARED_CACHE = "true";

  return directory;
}

afterEach(async () => {
  vi.resetModules();
  vi.restoreAllMocks();
  delete process.env.FERMATMIND_LLMS_FULL_CACHE_DIR;
  delete process.env.FERMATMIND_LLMS_FULL_ENABLE_SHARED_CACHE;
  delete process.env.NEXT_PUBLIC_RELEASE;
  delete process.env.FERMATMIND_LLMS_FULL_GENERATOR_VERSION;
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { force: true, recursive: true })));
});

describe("llms-full rebuild amplification guard", () => {
  it("returns degraded immediately and schedules the artifact-profile rebuild after the response", () => {
    const route = readFileSync(path.join(process.cwd(), "lib/seo/llmsFullRoute.ts"), "utf8");
    const publicGet = route.slice(route.indexOf("export async function GET()"));

    expect(publicGet).toContain("getCachedLlmsFullText");
    expect(publicGet).toContain("scheduleLlmsFullResponseCacheRebuild(siteUrl)");
    expect(publicGet).toContain("buildDegradedLlmsFullText");
    expect(publicGet).not.toContain("buildLlmsFullText(");
    expect(route).toContain("after(async () =>");
    expect(route).toContain("getOrStartLlmsFullBuild(");
    expect(route).toContain('buildLlmsFullText(siteUrl, { buildProfile: "artifact" })');
  });

  it("single-flights builds across module instances and cools down a failed rebuild", async () => {
    await createSharedCacheDirectory();
    const firstModule = await import("@/lib/seo/llmsFullResponseCache");
    let finishFirstBuild: ((value: string | null) => void) | undefined;
    const firstBuild = vi.fn(
      () =>
        new Promise<string | null>((resolve) => {
          finishFirstBuild = resolve;
        })
    );
    const firstPromise = firstModule.getOrStartLlmsFullBuild(SITE_URL, firstBuild, {
      isCacheable: (text) => text === "complete",
    });
    await vi.waitFor(() => expect(firstBuild).toHaveBeenCalledTimes(1));

    vi.resetModules();
    const secondModule = await import("@/lib/seo/llmsFullResponseCache");
    const competingBuild = vi.fn(async () => "complete");
    await expect(
      secondModule.getOrStartLlmsFullBuild(SITE_URL, competingBuild, {
        isCacheable: (text) => text === "complete",
      })
    ).resolves.toBeNull();
    expect(competingBuild).not.toHaveBeenCalled();

    finishFirstBuild?.(null);
    await expect(firstPromise).resolves.toBeNull();

    vi.resetModules();
    const cooldownModule = await import("@/lib/seo/llmsFullResponseCache");
    const cooldownBuild = vi.fn(async () => "complete");
    await expect(
      cooldownModule.getOrStartLlmsFullBuild(SITE_URL, cooldownBuild, {
        isCacheable: (text) => text === "complete",
      })
    ).resolves.toBeNull();
    expect(cooldownBuild).not.toHaveBeenCalled();

    const cooldownPath = cooldownModule.getLlmsFullBuildCooldownPath(SITE_URL);
    const cooldown = JSON.parse(await readFile(cooldownPath, "utf8")) as {
      siteUrl: string;
      retryAfterMs: number;
    };
    expect(cooldown.siteUrl).toBe(SITE_URL);
    expect(cooldown.retryAfterMs).toBeGreaterThan(Date.now());
  });

  it("retries exactly once after the shared failure cooldown expires", async () => {
    await createSharedCacheDirectory();
    const firstModule = await import("@/lib/seo/llmsFullResponseCache");
    await expect(
      firstModule.getOrStartLlmsFullBuild(SITE_URL, async () => null, {
        isCacheable: (text) => text === "complete",
      })
    ).resolves.toBeNull();

    await writeFile(
      firstModule.getLlmsFullBuildCooldownPath(SITE_URL),
      `${JSON.stringify({ siteUrl: SITE_URL, retryAfterMs: Date.now() - 1 })}\n`,
      "utf8"
    );
    vi.resetModules();

    const retryModule = await import("@/lib/seo/llmsFullResponseCache");
    const retryBuild = vi.fn(async () => "complete");
    await expect(
      retryModule.getOrStartLlmsFullBuild(SITE_URL, retryBuild, {
        isCacheable: (text) => text === "complete",
      })
    ).resolves.toBe("complete");
    expect(retryBuild).toHaveBeenCalledTimes(1);
  });

  it("treats the shared file as authoritative instead of serving a stale process copy", async () => {
    await createSharedCacheDirectory();
    const cacheModule = await import("@/lib/seo/llmsFullResponseCache");
    await expect(cacheModule.writeLlmsFullResponseCache(SITE_URL, "complete")).resolves.toMatchObject({ cached: true });
    await expect(cacheModule.getCachedLlmsFullText(SITE_URL, 60_000)).resolves.toBe("complete");

    await unlink(cacheModule.getLlmsFullSharedCachePath(SITE_URL));
    await expect(cacheModule.getCachedLlmsFullText(SITE_URL, 60_000)).resolves.toBeNull();
  });

  it("refuses a shared artifact produced by a different exact application revision", async () => {
    await createSharedCacheDirectory();
    process.env.NEXT_PUBLIC_RELEASE = "0123456789abcdef0123456789abcdef01234567";
    const cacheModule = await import("@/lib/seo/llmsFullResponseCache");
    await expect(cacheModule.writeLlmsFullResponseCache(SITE_URL, "complete")).resolves.toMatchObject({ cached: true });

    process.env.NEXT_PUBLIC_RELEASE = "89abcdef0123456789abcdef0123456789abcdef";
    await expect(cacheModule.getCachedLlmsFullText(SITE_URL, 60_000)).resolves.toBeNull();
  });

  it("reuses a compatible artifact across UI releases but rejects generator changes and corruption", async () => {
    await createSharedCacheDirectory();
    process.env.FERMATMIND_LLMS_FULL_GENERATOR_VERSION = "a".repeat(64);
    process.env.NEXT_PUBLIC_RELEASE = "a".repeat(40);
    const cache = await import("@/lib/seo/llmsFullResponseCache");
    await cache.writeLlmsFullResponseCache(SITE_URL, "complete");
    process.env.NEXT_PUBLIC_RELEASE = "b".repeat(40);
    expect(await cache.getCachedLlmsFullText(SITE_URL, 60_000)).toBe("complete");
    process.env.FERMATMIND_LLMS_FULL_GENERATOR_VERSION = "b".repeat(64);
    expect(await cache.getCachedLlmsFullText(SITE_URL, 60_000)).toBeNull();
    process.env.FERMATMIND_LLMS_FULL_GENERATOR_VERSION = "a".repeat(64);
    const filename = cache.getLlmsFullSharedCachePath(SITE_URL);
    const payload = JSON.parse(await readFile(filename, "utf8"));
    await writeFile(filename, JSON.stringify({ ...payload, text: "corrupt" }));
    expect(await cache.getCachedLlmsFullText(SITE_URL, 60_000)).toBeNull();
  });

  it("detects missed source changes while preserving unchanged authority on failed refresh", async () => {
    await createSharedCacheDirectory();
    const cache = await import("@/lib/seo/llmsFullResponseCache");
    await cache.synchronizeLlmsFullAuthority(SITE_URL, "a".repeat(64));
    await cache.writeLlmsFullResponseCache(SITE_URL, "complete");
    await cache.synchronizeLlmsFullAuthority(SITE_URL, "a".repeat(64));
    await cache.getOrStartLlmsFullBuild(SITE_URL, async () => null);
    expect(await cache.getCachedLlmsFullText(SITE_URL, 60_000)).toBe("complete");
    await cache.synchronizeLlmsFullAuthority(SITE_URL, "b".repeat(64));
    expect(await cache.getCachedLlmsFullText(SITE_URL, 60_000)).toBeNull();
    await cache.getOrStartLlmsFullBuild(SITE_URL, async () => "replacement");
    expect(await cache.getCachedLlmsFullText(SITE_URL, 60_000)).toBe("replacement");
  });

  it("awaits invalidation of cache and cooldown without deleting another worker's active lease", async () => {
    const directory = await createSharedCacheDirectory();
    const cacheModule = await import("@/lib/seo/llmsFullResponseCache");
    await cacheModule.writeLlmsFullResponseCache(SITE_URL, "complete");
    await writeFile(
      cacheModule.getLlmsFullBuildCooldownPath(SITE_URL),
      `${JSON.stringify({ siteUrl: SITE_URL, retryAfterMs: Date.now() - 1 })}\n`,
      "utf8"
    );

    let finishBuild: ((value: string | null) => void) | undefined;
    const activeBuild = cacheModule.getOrStartLlmsFullBuild(
      SITE_URL,
      () => new Promise<string | null>((resolve) => {
        finishBuild = resolve;
      }),
      { isCacheable: (text) => text === "complete" }
    );
    await vi.waitFor(async () => {
      expect((await readdir(directory)).some((entry) => entry.includes("build-lease"))).toBe(true);
    });

    await cacheModule.invalidateLlmsFullResponseCache(SITE_URL);
    await expect(access(cacheModule.getLlmsFullSharedCachePath(SITE_URL))).rejects.toMatchObject({ code: "ENOENT" });
    await expect(access(cacheModule.getLlmsFullBuildCooldownPath(SITE_URL))).rejects.toMatchObject({ code: "ENOENT" });
    expect((await readdir(directory)).some((entry) => entry.includes("build-lease"))).toBe(true);

    finishBuild?.("complete");
    await expect(activeBuild).resolves.toBeNull();
    await expect(access(cacheModule.getLlmsFullSharedCachePath(SITE_URL))).rejects.toMatchObject({ code: "ENOENT" });
    await expect(access(cacheModule.getLlmsFullBuildCooldownPath(SITE_URL))).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("lets an explicit cache clear bypass the failure cooldown without weakening cacheability", async () => {
    await createSharedCacheDirectory();
    const firstModule = await import("@/lib/seo/llmsFullResponseCache");
    await expect(
      firstModule.getOrStartLlmsFullBuild(SITE_URL, async () => "incomplete", {
        isCacheable: (text) => text === "complete",
      })
    ).resolves.toBeNull();

    const cooldownPath = firstModule.getLlmsFullBuildCooldownPath(SITE_URL);
    await expect(access(cooldownPath)).resolves.toBeUndefined();
    firstModule.clearLlmsFullResponseCache(SITE_URL);
    await vi.waitFor(async () => {
      await expect(access(cooldownPath)).rejects.toMatchObject({ code: "ENOENT" });
    });

    vi.resetModules();
    const refreshedModule = await import("@/lib/seo/llmsFullResponseCache");
    const completeBuild = vi.fn(async () => "complete");
    await expect(
      refreshedModule.getOrStartLlmsFullBuild(SITE_URL, completeBuild, {
        isCacheable: (text) => text === "complete",
      })
    ).resolves.toBe("complete");
    expect(completeBuild).toHaveBeenCalledTimes(1);
    await expect(
      refreshedModule.getCachedLlmsFullText(SITE_URL, 60_000, {
        isCacheable: (text) => text === "complete",
      })
    ).resolves.toBe("complete");
  });

  it("clears only managed llms-full cache files when no site is specified", async () => {
    const directory = await createSharedCacheDirectory();
    const managedCachePath = path.join(directory, "fermatmind-llms-full-response-cache.0123456789abcdef.v1.json");
    const managedLeasePath = path.join(directory, "fermatmind-llms-full-build-lease.0123456789abcdef.v1.lock");
    const unrelatedPath = path.join(directory, "unrelated-runtime-cache.json");
    await Promise.all([
      writeFile(managedCachePath, "managed", "utf8"),
      writeFile(managedLeasePath, "managed", "utf8"),
      writeFile(unrelatedPath, "keep", "utf8"),
    ]);

    const cacheModule = await import("@/lib/seo/llmsFullResponseCache");
    cacheModule.clearLlmsFullResponseCache();

    await vi.waitFor(async () => {
      await expect(access(managedCachePath)).rejects.toMatchObject({ code: "ENOENT" });
      await expect(access(managedLeasePath)).rejects.toMatchObject({ code: "ENOENT" });
    });
    await expect(readFile(unrelatedPath, "utf8")).resolves.toBe("keep");
  });
});
