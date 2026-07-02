import { mkdir, mkdtemp, readFile, rename, rm, unlink, writeFile } from "node:fs/promises";
import { readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import path from "node:path";

type LlmsFullResponseCache = {
  siteUrl: string;
  text: string;
  cachedAtMs: number;
};

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

export function clearLlmsFullResponseCache(siteUrl?: string): void {
  llmsFullResponseCache = null;
  llmsFullBuildPromise = null;
  if (isSharedLlmsFullCacheEnabled()) {
    if (siteUrl) {
      void unlink(getLlmsFullSharedCachePath(siteUrl)).catch(() => undefined);
      return;
    }

    void (async () => {
      const cacheDirectory = getLlmsFullSharedCacheDirectory();
      const entries = await readdir(cacheDirectory).catch(() => []);

      await Promise.all(
        entries
          .filter((entry) => /^fermatmind-llms-full-response-cache(?:\.[a-f0-9]{16})?\.v1\.json$/.test(entry))
          .map((entry) => unlink(path.join(cacheDirectory, entry)).catch(() => undefined))
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
    const promise = buildText(siteUrl)
      .then((text) => {
        if (text !== null && (!options.isCacheable || options.isCacheable(text))) {
          void writeLlmsFullResponseCache(siteUrl, text, options);

          return text;
        }

        return null;
      })
      .catch(() => null)
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
