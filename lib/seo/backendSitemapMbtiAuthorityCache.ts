import { mkdir, mkdtemp, readFile, rename, rm, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

type MbtiAuthorityCache = {
  cachedAtMs: number;
  paths: string[];
  version: 1;
};

const CACHE_FILENAME = "mbti-sitemap-authority.v1.json";
export const MBTI_AUTHORITY_LKG_MAX_AGE_MS = 24 * 60 * 60 * 1_000;
const MBTI_AUTHORITY_PATH_RE = /^\/(?:en|zh)\/personality\/(?:[a-z]{4}-[at]|[a-z]{4}-a-vs-[a-z]{4}-t|[a-z]{4}-vs-[a-z]{4})$/i;
const MBTI_BASE_TYPES = new Set([
  "intj", "intp", "entj", "entp", "infj", "infp", "enfj", "enfp",
  "istj", "isfj", "estj", "esfj", "istp", "isfp", "estp", "esfp",
]);

let inProcessCache: MbtiAuthorityCache | null = null;

function cacheDirectory(): string {
  return process.env.FERMATMIND_MBTI_AUTHORITY_CACHE_DIR
    || path.join(tmpdir(), "fermatmind-mbti-authority-cache");
}

export function getMbtiAuthoritySharedCachePath(): string {
  return path.join(cacheDirectory(), CACHE_FILENAME);
}

function isSharedCacheEnabled(): boolean {
  return process.env.NODE_ENV !== "test"
    || process.env.FERMATMIND_MBTI_AUTHORITY_ENABLE_SHARED_CACHE === "true";
}

function isSafeMbtiAuthorityPath(value: string): boolean {
  if (!MBTI_AUTHORITY_PATH_RE.test(value)) {
    return false;
  }

  const slug = value.split("/").at(-1)?.toLowerCase() ?? "";
  const typeCodes = slug.match(/[a-z]{4}/g) ?? [];
  return typeCodes.length > 0 && typeCodes.every((typeCode) => MBTI_BASE_TYPES.has(typeCode));
}

function validCache(value: Partial<MbtiAuthorityCache> | null, maxAgeMs: number): value is MbtiAuthorityCache {
  if (
    value?.version !== 1
    || !Number.isFinite(value.cachedAtMs)
    || Date.now() - Number(value.cachedAtMs) > maxAgeMs
    || !Array.isArray(value.paths)
    || value.paths.length === 0
  ) {
    return false;
  }

  const uniquePaths = new Set(value.paths);
  return uniquePaths.size === value.paths.length
    && value.paths.every((entry) => typeof entry === "string" && isSafeMbtiAuthorityPath(entry));
}

export async function readMbtiAuthorityLastKnownGood(
  maxAgeMs = MBTI_AUTHORITY_LKG_MAX_AGE_MS,
): Promise<string[]> {
  if (!isSharedCacheEnabled()) {
    return validCache(inProcessCache, maxAgeMs) ? [...inProcessCache.paths] : [];
  }

  try {
    const raw = await readFile(getMbtiAuthoritySharedCachePath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<MbtiAuthorityCache>;
    if (!validCache(parsed, maxAgeMs)) {
      return [];
    }

    inProcessCache = {
      cachedAtMs: parsed.cachedAtMs,
      paths: [...parsed.paths],
      version: 1,
    };
    return [...parsed.paths];
  } catch {
    // A missing shared artifact may be an explicit authority revocation from another worker.
    inProcessCache = null;
    return [];
  }
}

export async function writeMbtiAuthorityLastKnownGood(paths: readonly string[]): Promise<void> {
  if (paths.length === 0 || !paths.every(isSafeMbtiAuthorityPath)) {
    await clearMbtiAuthorityLastKnownGood();
    return;
  }

  const cache: MbtiAuthorityCache = {
    cachedAtMs: Date.now(),
    paths: [...paths],
    version: 1,
  };
  inProcessCache = cache;

  if (!isSharedCacheEnabled()) {
    return;
  }

  let temporaryDirectory: string | null = null;
  try {
    const target = getMbtiAuthoritySharedCachePath();
    await mkdir(path.dirname(target), { recursive: true });
    temporaryDirectory = await mkdtemp(path.join(path.dirname(target), ".mbti-authority-cache-"));
    const temporary = path.join(temporaryDirectory, "cache.json");
    await writeFile(temporary, `${JSON.stringify(cache)}\n`, {
      encoding: "utf8",
      flag: "wx",
      mode: 0o600,
    });
    await rename(temporary, target);
  } catch {
    // A failed shared write remains fail-closed across worker processes.
  } finally {
    if (temporaryDirectory) {
      await rm(temporaryDirectory, { force: true, recursive: true }).catch(() => undefined);
    }
  }
}

export async function clearMbtiAuthorityLastKnownGood(): Promise<void> {
  inProcessCache = null;
  if (isSharedCacheEnabled()) {
    await unlink(getMbtiAuthoritySharedCachePath()).catch(() => undefined);
  }
}

export function resetMbtiAuthorityInProcessCacheForTests(): void {
  inProcessCache = null;
}
