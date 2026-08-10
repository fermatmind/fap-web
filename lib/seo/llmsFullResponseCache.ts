import { mkdir, mkdtemp, readFile, rename, rm, stat, unlink, writeFile } from "node:fs/promises";
import { readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import path from "node:path";

type LlmsFullResponseCache = {
  siteUrl: string;
  text: string;
  cachedAtMs: number;
};

type LlmsFullBuildCooldown = {
  siteUrl: string;
  retryAfterMs: number;
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
};

function getLlmsFullSharedCacheDirectory(): string {
  return process.env.FERMATMIND_LLMS_FULL_CACHE_DIR || path.join(tmpdir(), "fermatmind-llms-full-cache");
}

function siteCacheId(siteUrl: string): string {
  return createHash("sha256").update(siteUrl).digest("hex").slice(0, 16);
}

function cachePolicyKey(options: LlmsFullCacheOptions): string {
  return options.isCacheable ? options.isCacheable.toString() : "cacheable:any";
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

    if (payload.siteUrl !== siteUrl || !text || !Number.isFinite(cachedAtMs)) {
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
      text,
      cachedAtMs,
    };

    return text;
  } catch {
    return null;
  }
}

async function writeSharedCache(cache: LlmsFullResponseCache): Promise<void> {
  if (!isSharedLlmsFullCacheEnabled()) {
    return;
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
  } catch {
    // The in-process cache remains valid if the shared artifact cannot be written.
  } finally {
    if (temporaryDirectory) {
      void rm(temporaryDirectory, { force: true, recursive: true }).catch(() => undefined);
    }
  }
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
      ]);
      return;
    }

    void (async () => {
      const cacheDirectory = getLlmsFullSharedCacheDirectory();
      const entries = await readdir(cacheDirectory).catch(() => []);

      await Promise.all(
        entries
          .filter((entry) => /^fermatmind-llms-full-(?:response-cache|build-cooldown|build-lease)(?:\.[a-f0-9]{16})?\.v1\.(?:json|lock)$/.test(entry))
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
    text,
    cachedAtMs: Date.now(),
  };
  llmsFullResponseCache = cache;
  await writeSharedCache(cache);

  return { cached: true, cachePath };
}

export async function getCachedLlmsFullText(
  siteUrl: string,
  maxAgeMs: number,
  options: LlmsFullCacheOptions = {}
): Promise<string | null> {
  if (llmsFullResponseCache?.siteUrl === siteUrl) {
    const text = llmsFullResponseCache.text;
    const isFresh = Date.now() - llmsFullResponseCache.cachedAtMs <= maxAgeMs;
    const isCacheable = !options.isCacheable || options.isCacheable(text);

    if (isFresh && isCacheable) {
      return text;
    }
  }

  return readSharedCache(siteUrl, maxAgeMs, options);
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

        const text = await buildText(siteUrl).catch(() => null);
        if (text !== null && (!options.isCacheable || options.isCacheable(text))) {
          await writeLlmsFullResponseCache(siteUrl, text, options);
          await clearBuildCooldown(siteUrl);

          return text;
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
