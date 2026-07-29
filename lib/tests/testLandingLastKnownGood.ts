import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rename, rm, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const LKG_SCHEMA_VERSION = 1;

type TestLandingLkgEnvelope = {
  schemaVersion: number;
  key: string;
  cachedAtMs: number;
  value: unknown;
};

const inProcessCache = new Map<string, TestLandingLkgEnvelope>();

function cacheDirectory(): string {
  return process.env.FERMATMIND_TEST_LANDING_LKG_DIR
    || path.join(tmpdir(), "fermatmind-test-landing-lkg");
}

function cacheId(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

function sharedCachePath(key: string): string {
  return path.join(cacheDirectory(), `test-landing-lkg.${cacheId(key)}.v1.json`);
}

function sharedCacheEnabled(): boolean {
  return process.env.NODE_ENV !== "test"
    || process.env.FERMATMIND_TEST_LANDING_ENABLE_SHARED_LKG === "true";
}

function isValidEnvelope<T>(
  value: Partial<TestLandingLkgEnvelope> | null,
  key: string,
  maxAgeMs: number,
  isUsable: (value: unknown) => value is T,
): value is TestLandingLkgEnvelope & { value: T } {
  return value?.schemaVersion === LKG_SCHEMA_VERSION
    && value.key === key
    && Number.isFinite(value.cachedAtMs)
    && Date.now() - Number(value.cachedAtMs) <= maxAgeMs
    && isUsable(value.value);
}

export async function readTestLandingLastKnownGood<T>({
  key,
  maxAgeMs,
  isUsable,
}: {
  key: string;
  maxAgeMs: number;
  isUsable: (value: unknown) => value is T;
}): Promise<T | null> {
  const inProcess = inProcessCache.get(key) ?? null;
  if (isValidEnvelope(inProcess, key, maxAgeMs, isUsable)) {
    return inProcess.value;
  }

  if (!sharedCacheEnabled()) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      await readFile(sharedCachePath(key), "utf8"),
    ) as Partial<TestLandingLkgEnvelope>;
    if (!isValidEnvelope(parsed, key, maxAgeMs, isUsable)) {
      return null;
    }

    inProcessCache.set(key, parsed as TestLandingLkgEnvelope);
    return parsed.value;
  } catch {
    return null;
  }
}

export async function writeTestLandingLastKnownGood<T>({
  key,
  value,
  isUsable,
}: {
  key: string;
  value: T;
  isUsable: (value: unknown) => value is T;
}): Promise<boolean> {
  if (!isUsable(value)) {
    return false;
  }

  const envelope: TestLandingLkgEnvelope = {
    schemaVersion: LKG_SCHEMA_VERSION,
    key,
    cachedAtMs: Date.now(),
    value,
  };
  inProcessCache.set(key, envelope);

  if (!sharedCacheEnabled()) {
    return true;
  }

  let temporaryDirectory: string | null = null;
  try {
    const target = sharedCachePath(key);
    await mkdir(path.dirname(target), { recursive: true });
    temporaryDirectory = await mkdtemp(
      path.join(path.dirname(target), ".test-landing-lkg-"),
    );
    const temporary = path.join(temporaryDirectory, "cache.json");
    await writeFile(temporary, `${JSON.stringify(envelope)}\n`, {
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
      await rm(temporaryDirectory, { force: true, recursive: true }).catch(() => undefined);
    }
  }
}

export async function clearTestLandingLastKnownGood(key: string): Promise<void> {
  inProcessCache.delete(key);
  if (sharedCacheEnabled()) {
    await unlink(sharedCachePath(key)).catch(() => undefined);
  }
}

export function resetTestLandingLastKnownGoodForTests(): void {
  inProcessCache.clear();
}
