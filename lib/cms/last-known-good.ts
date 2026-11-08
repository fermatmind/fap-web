export type LastKnownGoodSource = "fresh" | "last-known-good";

export type LastKnownGoodResult<T> = {
  value: T;
  source: LastKnownGoodSource;
  stale: boolean;
  updatedAt: string;
  error: unknown | null;
};

type LastKnownGoodEntry<T> = {
  value: T;
  updatedAt: string;
  expiresAtMs: number;
  sizeBytes: number;
};

// Per worker, for public CMS fallback values only. The byte budget measures
// serialized payloads and keys, not total V8 heap or the Next.js fetch cache.
export const LAST_KNOWN_GOOD_CACHE_LIMITS = {
  maxEntries: 256,
  maxBytes: 16 * 1024 * 1024,
  maxAgeMs: 7 * 24 * 60 * 60 * 1000,
} as const;

const store = new Map<string, LastKnownGoodEntry<unknown>>();
let storedBytes = 0;

function deleteEntry(key: string): void {
  const entry = store.get(key);
  if (entry) {
    storedBytes -= entry.sizeBytes;
    store.delete(key);
  }
}

function pruneExpired(nowMs = Date.now()): void {
  for (const [key, entry] of store) {
    if (entry.expiresAtMs <= nowMs) deleteEntry(key);
  }
}

function readEntry<T>(key: string): LastKnownGoodEntry<T> | undefined {
  pruneExpired();
  const entry = store.get(key) as LastKnownGoodEntry<T> | undefined;
  if (entry) {
    store.delete(key);
    store.set(key, entry);
  }
  return entry;
}

function writeEntry<T>(key: string, value: T, updatedAt: string): void {
  pruneExpired();
  // Never retain an older revision if its replacement cannot be cached.
  deleteEntry(key);
  let sizeBytes: number;
  try {
    const serialized = JSON.stringify(value);
    if (serialized === undefined) return;
    sizeBytes = Buffer.byteLength(serialized, "utf8") + Buffer.byteLength(key, "utf8");
  } catch {
    // Cache admission must not turn a successful authority read into an error.
    return;
  }
  if (sizeBytes > LAST_KNOWN_GOOD_CACHE_LIMITS.maxBytes) return;

  while (store.size >= LAST_KNOWN_GOOD_CACHE_LIMITS.maxEntries ||
    storedBytes + sizeBytes > LAST_KNOWN_GOOD_CACHE_LIMITS.maxBytes) {
    const oldestKey = store.keys().next().value;
    if (oldestKey === undefined) break;
    deleteEntry(oldestKey);
  }
  store.set(key, {
    value, updatedAt, sizeBytes,
    expiresAtMs: Date.now() + LAST_KNOWN_GOOD_CACHE_LIMITS.maxAgeMs,
  });
  storedBytes += sizeBytes;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function clearLastKnownGoodForTests(): void {
  store.clear();
  storedBytes = 0;
}

export function readLastKnownGoodForTests<T>(key: string): LastKnownGoodResult<T> | null {
  const entry = readEntry<T>(key);
  if (!entry) {
    return null;
  }

  return {
    value: entry.value,
    source: "last-known-good",
    stale: true,
    updatedAt: entry.updatedAt,
    error: null,
  };
}

export async function withLastKnownGood<T>({
  key,
  load,
  isUsable = (value) => value !== null && value !== undefined,
  isStaleUsable,
  clearStaleOnUnusable = false,
  useStaleOnUnusable = false,
  useStaleOnError: staleOnError = true,
}: {
  key: string;
  load: () => Promise<T>;
  isUsable?: (value: T) => boolean;
  isStaleUsable?: (value: T) => boolean;
  clearStaleOnUnusable?: boolean;
  useStaleOnUnusable?: boolean;
  useStaleOnError?: boolean | ((error: unknown) => boolean);
}): Promise<LastKnownGoodResult<T>> {
  pruneExpired();
  try {
    const value = await load();
    const updatedAt = nowIso();

    if (isUsable(value)) {
      // Fail-closed callers (including article reads) never consume LKG values.
      if (staleOnError !== false || useStaleOnUnusable) writeEntry(key, value, updatedAt);
    } else if (useStaleOnUnusable) {
      const entry = readEntry<T>(key);

      if (clearStaleOnUnusable) {
        deleteEntry(key);
      } else if (entry && (!isStaleUsable || isStaleUsable(entry.value))) {
        const unusableError = new Error(`Fresh value for ${key} was not usable.`);
        return {
          value: entry.value,
          source: "last-known-good",
          stale: true,
          updatedAt: entry.updatedAt,
          error: unusableError,
        };
      }
    } else if (clearStaleOnUnusable) {
      deleteEntry(key);
    }

    return {
      value,
      source: "fresh",
      stale: false,
      updatedAt,
      error: null,
    };
  } catch (error) {
    const entry = readEntry<T>(key);
    const canUseStaleOnError =
      typeof staleOnError === "function" ? staleOnError(error) : staleOnError;

    if (!entry || !canUseStaleOnError || (isStaleUsable && !isStaleUsable(entry.value))) {
      throw error;
    }

    return {
      value: entry.value,
      source: "last-known-good",
      stale: true,
      updatedAt: entry.updatedAt,
      error,
    };
  }
}
