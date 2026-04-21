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
};

const store = new Map<string, LastKnownGoodEntry<unknown>>();

function nowIso(): string {
  return new Date().toISOString();
}

export function clearLastKnownGoodForTests(): void {
  store.clear();
}

export function readLastKnownGoodForTests<T>(key: string): LastKnownGoodResult<T> | null {
  const entry = store.get(key) as LastKnownGoodEntry<T> | undefined;
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
  useStaleOnUnusable = false,
}: {
  key: string;
  load: () => Promise<T>;
  isUsable?: (value: T) => boolean;
  useStaleOnUnusable?: boolean;
}): Promise<LastKnownGoodResult<T>> {
  try {
    const value = await load();
    const updatedAt = nowIso();

    if (isUsable(value)) {
      store.set(key, { value, updatedAt });
    } else if (useStaleOnUnusable) {
      const entry = store.get(key) as LastKnownGoodEntry<T> | undefined;

      if (entry) {
        const unusableError = new Error(`Fresh value for ${key} was not usable.`);
        return {
          value: entry.value,
          source: "last-known-good",
          stale: true,
          updatedAt: entry.updatedAt,
          error: unusableError,
        };
      }
    }

    return {
      value,
      source: "fresh",
      stale: false,
      updatedAt,
      error: null,
    };
  } catch (error) {
    const entry = store.get(key) as LastKnownGoodEntry<T> | undefined;

    if (!entry) {
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
