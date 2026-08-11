import { access, mkdtemp, readFile, rm } from "node:fs/promises";
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
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { force: true, recursive: true })));
});

describe("llms-full rebuild amplification guard", () => {
  it("keeps the public GET path artifact-only while retaining the explicit offline builder", () => {
    const route = readFileSync(path.join(process.cwd(), "app/llms-full.txt/route.ts"), "utf8");
    const publicGet = route.slice(route.indexOf("export async function GET()"));

    expect(publicGet).toContain("getCachedLlmsFullText");
    expect(publicGet).toContain("buildDegradedLlmsFullText");
    expect(publicGet).not.toContain("getOrStartLlmsFullBuild");
    expect(publicGet).not.toContain("buildLlmsFullText(");
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
});
