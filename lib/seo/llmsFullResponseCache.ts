import { mkdir, mkdtemp, readFile, rename, rm, stat, unlink, writeFile } from "node:fs/promises";
import { readdir } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { homedir } from "node:os";
import path from "node:path";

type LlmsFullResponseCache = {
  siteUrl: string;
  revision: string;
  generatorVersion: string;
  text: string;
  cachedAtMs: number;
  generation: string;
  contentSha256: string;
};

type LlmsFullBuildCooldown = {
  siteUrl: string;
  retryAfterMs: number;
};

type LlmsFullInvalidationMarker = {
  siteUrl: string;
  generation: string;
  sourceFingerprint?: string;
};

export const LLMS_FULL_BUILD_FAILURE_COOLDOWN_MS = 15 * 60 * 1000;
const LLMS_FULL_BUILD_LEASE_STALE_MS = 5 * 60 * 1000;

let llmsFullResponseCache: LlmsFullResponseCache | null = null;
let llmsFullBuildPromise:
  | {
      siteUrl: string;
      cachePolicyKey: string;
      promise: Promise<string | null>;
    }
  | null = null;

type LlmsFullCacheOptions = {
  isCacheable?: (text: string) => boolean;
  expectedGeneration?: string;
};

function getLlmsFullSharedCacheDirectory(): string {
  return process.env.FERMATMIND_LLMS_FULL_CACHE_DIR || path.join(homedir(), ".cache", "fermatmind", "llms-full");
}

function siteCacheId(siteUrl: string): string {
  return createHash("sha256").update(siteUrl).digest("hex").slice(0, 16);
}

function cachePolicyKey(options: LlmsFullCacheOptions): string {
  return options.isCacheable ? options.isCacheable.toString() : "cacheable:any";
}

function runtimeRevision(): string {
  const revision = String(process.env.NEXT_PUBLIC_RELEASE ?? "").trim();
  return /^[0-9a-f]{40}$/.test(revision) ? revision : "unversioned";
}

function generatorVersion(): string {
  const version = String(process.env.FERMATMIND_LLMS_FULL_GENERATOR_VERSION ?? "");
  // Unbundled callers without the generated identity keep the exact-revision guard.
  const code = /^[a-f0-9]{64}$/.test(version) ? version : runtimeRevision();
  const policy = [process.env.NODE_ENV, process.env.NEXT_PUBLIC_API_URL, process.env.NEXT_PUBLIC_SITE_URL,
    Object.entries(process.env).filter(([name]) => name.startsWith("FERMATMIND_LLMS_FULL_REQUIRE_"))
      .sort(([a], [b]) => a.localeCompare(b))];
  return createHash("sha256").update(JSON.stringify([code, policy])).digest("hex");
}

export function getLlmsFullSharedCachePath(siteUrl = "default"): string {
  return path.join(
    getLlmsFullSharedCacheDirectory(),
    `fermatmind-llms-full-response-cache.${siteCacheId(siteUrl)}.v1.json`
  );
}

export function getLlmsFullBuildCooldownPath(siteUrl = "default"): string {
  return path.join(
    getLlmsFullSharedCacheDirectory(),
    `fermatmind-llms-full-build-cooldown.${siteCacheId(siteUrl)}.v1.json`
  );
}

export function getLlmsFullInvalidationMarkerPath(siteUrl = "default"): string {
  return path.join(
    getLlmsFullSharedCacheDirectory(),
    `fermatmind-llms-full-invalidation.${siteCacheId(siteUrl)}.v1.json`
  );
}

function getLlmsFullBuildLeasePath(siteUrl: string): string {
  return path.join(
    getLlmsFullSharedCacheDirectory(),
    `fermatmind-llms-full-build-lease.${siteCacheId(siteUrl)}.v1.lock`
  );
}

function isSharedLlmsFullCacheEnabled(): boolean {
  return process.env.NODE_ENV !== "test" || process.env.FERMATMIND_LLMS_FULL_ENABLE_SHARED_CACHE === "true";
}

async function readSharedCache(siteUrl: string, maxAgeMs: number, options: LlmsFullCacheOptions = {}): Promise<string | null> {
  if (!isSharedLlmsFullCacheEnabled()) {
    return null;
  }

  try {
    const raw = await readFile(getLlmsFullSharedCachePath(siteUrl), "utf8");
    const payload = JSON.parse(raw) as Partial<LlmsFullResponseCache>;
    const text = typeof payload.text === "string" ? payload.text : "";
    const cachedAtMs = Number(payload.cachedAtMs);

    if (
      payload.siteUrl !== siteUrl ||
      payload.generatorVersion !== generatorVersion() ||
      payload.generation !== await readInvalidationGeneration(siteUrl) ||
      payload.contentSha256 !== createHash("sha256").update(text).digest("hex") ||
      !text ||
      !Number.isFinite(cachedAtMs)
    ) {
      return null;
    }

    if (Date.now() - cachedAtMs > maxAgeMs) {
      return null;
    }

    if (options.isCacheable && !options.isCacheable(text)) {
      return null;
    }

    llmsFullResponseCache = {
      siteUrl,
      revision: runtimeRevision(),
      generatorVersion: generatorVersion(),
      text,
      cachedAtMs,
      generation: payload.generation,
      contentSha256: payload.contentSha256,
    };

    return text;
  } catch {
    return null;
  }
}

async function writeSharedCache(cache: LlmsFullResponseCache): Promise<boolean> {
  if (!isSharedLlmsFullCacheEnabled()) {
    return true;
  }

  let temporaryDirectory: string | null = null;

  try {
    const target = getLlmsFullSharedCachePath(cache.siteUrl);
    await mkdir(path.dirname(target), { recursive: true });
    temporaryDirectory = await mkdtemp(path.join(path.dirname(target), ".fermatmind-llms-full-cache-"));
    const temporary = path.join(temporaryDirectory, "cache.json");
    await writeFile(temporary, `${JSON.stringify(cache)}\n`, {
      encoding: "utf8",
      flag: "wx",
      mode: 0o600,
    });
    await rename(temporary, target);
    return true;
  } catch {
    return false;
  } finally {
    if (temporaryDirectory) {
      void rm(temporaryDirectory, { force: true, recursive: true }).catch(() => undefined);
    }
  }
}

async function readInvalidationGeneration(siteUrl: string): Promise<string> {
  if (!isSharedLlmsFullCacheEnabled()) {
    return "process-local";
  }

  try {
    const raw = await readFile(getLlmsFullInvalidationMarkerPath(siteUrl), "utf8");
    const payload = JSON.parse(raw) as Partial<LlmsFullInvalidationMarker>;
    return payload.siteUrl === siteUrl && typeof payload.generation === "string"
      ? payload.generation
      : "invalid-marker";
  } catch {
    return "initial";
  }
}

async function advanceInvalidationGeneration(siteUrl: string, sourceFingerprint?: string): Promise<void> {
  if (!isSharedLlmsFullCacheEnabled()) {
    return;
  }

  const target = getLlmsFullInvalidationMarkerPath(siteUrl);
  await mkdir(path.dirname(target), { recursive: true });
  const temporaryDirectory = await mkdtemp(path.join(path.dirname(target), ".fermatmind-llms-full-invalidation-"));
  const temporary = path.join(temporaryDirectory, "invalidation.json");

  try {
    const payload: LlmsFullInvalidationMarker = { siteUrl, generation: randomUUID(), sourceFingerprint };
    await writeFile(temporary, `${JSON.stringify(payload)}\n`, {
      encoding: "utf8",
      flag: "wx",
      mode: 0o600,
    });
    await rename(temporary, target);
  } finally {
    await rm(temporaryDirectory, { force: true, recursive: true }).catch(() => undefined);
  }
}

export async function invalidateLlmsFullResponseCache(siteUrl: string, sourceFingerprint?: string): Promise<void> {
  llmsFullResponseCache = null;

  if (!isSharedLlmsFullCacheEnabled()) {
    return;
  }

  await advanceInvalidationGeneration(siteUrl, sourceFingerprint);
  await Promise.all([
    unlink(getLlmsFullSharedCachePath(siteUrl)).catch(() => undefined),
    unlink(getLlmsFullBuildCooldownPath(siteUrl)).catch(() => undefined),
  ]);
}

export async function synchronizeLlmsFullAuthority(siteUrl: string, sourceFingerprint: string): Promise<void> {
  if (!/^[a-f0-9]{64}$/.test(sourceFingerprint)) throw new Error("Invalid authority fingerprint");
  const marker = await readFile(getLlmsFullInvalidationMarkerPath(siteUrl), "utf8")
    .then((raw) => JSON.parse(raw) as LlmsFullInvalidationMarker).catch(() => null);
  if (marker?.siteUrl === siteUrl && marker.sourceFingerprint === sourceFingerprint) return;
  // Includes missed withdrawals: an obsolete source generation cannot be served
  // while rebuilding, even if the replacement fails.
  await invalidateLlmsFullResponseCache(siteUrl, sourceFingerprint);
}

async function hasActiveBuildCooldown(siteUrl: string): Promise<boolean> {
  if (!isSharedLlmsFullCacheEnabled()) {
    return false;
  }

  try {
    const raw = await readFile(getLlmsFullBuildCooldownPath(siteUrl), "utf8");
    const payload = JSON.parse(raw) as Partial<LlmsFullBuildCooldown>;

    return payload.siteUrl === siteUrl && Number(payload.retryAfterMs) > Date.now();
  } catch {
    return false;
  }
}

async function writeBuildCooldown(siteUrl: string): Promise<void> {
  if (!isSharedLlmsFullCacheEnabled()) {
    return;
  }

  let temporaryDirectory: string | null = null;

  try {
    const target = getLlmsFullBuildCooldownPath(siteUrl);
    await mkdir(path.dirname(target), { recursive: true });
    temporaryDirectory = await mkdtemp(path.join(path.dirname(target), ".fermatmind-llms-full-cooldown-"));
    const temporary = path.join(temporaryDirectory, "cooldown.json");
    const payload: LlmsFullBuildCooldown = {
      siteUrl,
      retryAfterMs: Date.now() + LLMS_FULL_BUILD_FAILURE_COOLDOWN_MS,
    };
    await writeFile(temporary, `${JSON.stringify(payload)}\n`, {
      encoding: "utf8",
      flag: "wx",
      mode: 0o600,
    });
    await rename(temporary, target);
  } catch {
    // A failed cooldown write must not replace the explicit degraded response.
  } finally {
    if (temporaryDirectory) {
      void rm(temporaryDirectory, { force: true, recursive: true }).catch(() => undefined);
    }
  }
}

async function clearBuildCooldown(siteUrl: string): Promise<void> {
  if (!isSharedLlmsFullCacheEnabled()) {
    return;
  }

  await unlink(getLlmsFullBuildCooldownPath(siteUrl)).catch(() => undefined);
}

async function acquireBuildLease(siteUrl: string): Promise<{
  acquired: boolean;
  release: () => Promise<void>;
}> {
  if (!isSharedLlmsFullCacheEnabled()) {
    return { acquired: true, release: async () => undefined };
  }

  const leasePath = getLlmsFullBuildLeasePath(siteUrl);
  await mkdir(path.dirname(leasePath), { recursive: true });

  const tryAcquire = async (): Promise<boolean> => {
    try {
      await mkdir(leasePath, { mode: 0o700 });
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
        throw error;
      }
      return false;
    }
  };

  try {
    if (!(await tryAcquire())) {
      const leaseStat = await stat(leasePath).catch(() => null);
      if (!leaseStat || Date.now() - leaseStat.mtimeMs <= LLMS_FULL_BUILD_LEASE_STALE_MS) {
        return { acquired: false, release: async () => undefined };
      }

      await rm(leasePath, { force: true, recursive: true });
      if (!(await tryAcquire())) {
        return { acquired: false, release: async () => undefined };
      }
    }

    return {
      acquired: true,
      release: async () => {
        await rm(leasePath, { force: true, recursive: true });
      },
    };
  } catch {
    // Keep the existing in-process single-flight behavior if the shared directory is unavailable.
    return { acquired: true, release: async () => undefined };
  }
}

export function clearLlmsFullResponseCache(siteUrl?: string): void {
  llmsFullResponseCache = null;
  llmsFullBuildPromise = null;
  if (isSharedLlmsFullCacheEnabled()) {
    if (siteUrl) {
      void Promise.all([
        unlink(getLlmsFullSharedCachePath(siteUrl)).catch(() => undefined),
        unlink(getLlmsFullBuildCooldownPath(siteUrl)).catch(() => undefined),
        rm(getLlmsFullBuildLeasePath(siteUrl), { force: true, recursive: true }).catch(() => undefined),
        unlink(getLlmsFullInvalidationMarkerPath(siteUrl)).catch(() => undefined),
      ]);
      return;
    }

    void (async () => {
      const cacheDirectory = getLlmsFullSharedCacheDirectory();
      const entries = await readdir(/* turbopackIgnore: true */ cacheDirectory).catch(() => []);

      await Promise.all(
        entries
          .filter((entry) => /^fermatmind-llms-full-(?:response-cache|build-cooldown|build-lease|invalidation)(?:\.[a-f0-9]{16})?\.v1\.(?:json|lock)$/.test(entry))
          .map((entry) => rm(path.join(cacheDirectory, entry), { force: true, recursive: true }).catch(() => undefined))
      );
    })();
  }
}

export async function writeLlmsFullResponseCache(
  siteUrl: string,
  text: string,
  options: LlmsFullCacheOptions = {}
): Promise<{ cached: boolean; cachePath: string }> {
  const cachePath = getLlmsFullSharedCachePath(siteUrl);
  if (options.isCacheable && !options.isCacheable(text)) {
    return { cached: false, cachePath };
  }

  const cache = {
    siteUrl,
    revision: runtimeRevision(),
    generatorVersion: generatorVersion(),
    text,
    cachedAtMs: Date.now(),
    generation: options.expectedGeneration ?? await readInvalidationGeneration(siteUrl),
    contentSha256: createHash("sha256").update(text).digest("hex"),
  };
  const sharedCached = await writeSharedCache(cache);
  if (!sharedCached) {
    llmsFullResponseCache = null;
    return { cached: false, cachePath };
  }

  llmsFullResponseCache = cache;

  return { cached: true, cachePath };
}

export async function getCachedLlmsFullText(
  siteUrl: string,
  maxAgeMs: number,
  options: LlmsFullCacheOptions = {}
): Promise<string | null> {
  if (isSharedLlmsFullCacheEnabled()) {
    return readSharedCache(siteUrl, maxAgeMs, options);
  }

  if (llmsFullResponseCache?.siteUrl === siteUrl) {
    const text = llmsFullResponseCache.text;
    const isFresh = Date.now() - llmsFullResponseCache.cachedAtMs <= maxAgeMs;
    const isCacheable = !options.isCacheable || options.isCacheable(text);

    if (isFresh && isCacheable) {
      return text;
    }
  }

  return null;
}

export function getOrStartLlmsFullBuild(
  siteUrl: string,
  buildText: (siteUrl: string) => Promise<string | null>,
  options: LlmsFullCacheOptions = {}
): Promise<string | null> {
  const nextCachePolicyKey = cachePolicyKey(options);
  if (!llmsFullBuildPromise || llmsFullBuildPromise.siteUrl !== siteUrl || llmsFullBuildPromise.cachePolicyKey !== nextCachePolicyKey) {
    const promise = (async () => {
      if (await hasActiveBuildCooldown(siteUrl)) {
        return null;
      }

      const lease = await acquireBuildLease(siteUrl);
      if (!lease.acquired) {
        return null;
      }

      try {
        if (await hasActiveBuildCooldown(siteUrl)) {
          return null;
        }

        const invalidationGeneration = await readInvalidationGeneration(siteUrl);
        const text = await buildText(siteUrl).catch(() => null);
        if (await readInvalidationGeneration(siteUrl) !== invalidationGeneration) {
          return null;
        }
        if (text !== null && (!options.isCacheable || options.isCacheable(text))) {
          const result = await writeLlmsFullResponseCache(siteUrl, text, { ...options, expectedGeneration: invalidationGeneration });
          if (result.cached) {
            if (await readInvalidationGeneration(siteUrl) !== invalidationGeneration) {
              await unlink(result.cachePath).catch(() => undefined);
              llmsFullResponseCache = null;
              return null;
            }
            await clearBuildCooldown(siteUrl);
            return text;
          }
        }

        await writeBuildCooldown(siteUrl);
        return null;
      } finally {
        await lease.release();
      }
    })()
      .finally(() => {
        if (llmsFullBuildPromise?.promise === promise) {
          llmsFullBuildPromise = null;
        }
      });

    llmsFullBuildPromise = {
      siteUrl,
      cachePolicyKey: nextCachePolicyKey,
      promise,
    };
  }

  return llmsFullBuildPromise.promise;
}
