import { afterEach, describe, expect, it, vi } from "vitest";
import {
  LAST_KNOWN_GOOD_CACHE_LIMITS,
  clearLastKnownGoodForTests,
  readLastKnownGoodForTests,
  withLastKnownGood,
} from "@/lib/cms/last-known-good";

afterEach(() => {
  clearLastKnownGoodForTests();
  vi.useRealTimers();
});

describe("last-known-good cache helper", () => {
  it("shares the worker budget across separately loaded module copies", async () => {
    await withLastKnownGood({ key: "page:original", load: async () => "original" });
    vi.resetModules();
    const otherCopy = await import("@/lib/cms/last-known-good");
    expect(otherCopy.withLastKnownGood).not.toBe(withLastKnownGood);
    expect(otherCopy.readLastKnownGoodForTests("page:original")?.value).toBe("original");
    for (let i = 0; i < LAST_KNOWN_GOOD_CACHE_LIMITS.maxEntries; i++) {
      await otherCopy.withLastKnownGood({ key: `page:other:${i}`, load: async () => i });
    }
    expect(readLastKnownGoodForTests("page:original")).toBeNull();
    expect(readLastKnownGoodForTests("page:other:0")?.value).toBe(0);
  });

  it("does not retain high-cardinality reads when both stale fallback paths are disabled", async () => {
    for (let i = 0; i < 1000; i++) {
      const result = await withLastKnownGood({
        key: `articles:list:en:${i}`,
        load: async () => ({ page: i }),
        useStaleOnError: false,
        useStaleOnUnusable: false,
      });
      expect(result).toMatchObject({ source: "fresh", stale: false, value: { page: i } });
      expect(readLastKnownGoodForTests(`articles:list:en:${i}`)).toBeNull();
    }
    const error = new Error("authority unavailable");
    await expect(withLastKnownGood({
      key: "articles:list:en:0",
      load: async () => { throw error; },
      useStaleOnError: false,
    })).rejects.toBe(error);
  });

  it("retains fallback on unusable data even when fallback on errors is disabled", async () => {
    await withLastKnownGood({
      key: "public:en", load: async () => "public", useStaleOnError: false, useStaleOnUnusable: true,
    });
    expect(await withLastKnownGood<string | null>({
      key: "public:en", load: async () => null, useStaleOnError: false, useStaleOnUnusable: true,
    })).toMatchObject({ source: "last-known-good", value: "public" });
  });

  it("evicts least recently used entries while preserving locale-specific fallback", async () => {
    const load = async (key: string) => withLastKnownGood({ key, load: async () => key });
    await load("page:en");
    await load("page:zh");
    for (let i = 2; i < LAST_KNOWN_GOOD_CACHE_LIMITS.maxEntries; i++) await load(`page:${i}`);
    const fallback = await withLastKnownGood({ key: "page:en", load: async () => { throw new Error("timeout"); } });
    expect(fallback.value).toBe("page:en");
    await load("page:new");
    expect(readLastKnownGoodForTests("page:zh")).toBeNull();
    expect(readLastKnownGoodForTests("page:en")?.value).toBe("page:en");
    await expect(withLastKnownGood({ key: "page:zh", load: async () => { throw new Error("no fallback"); } }))
      .rejects.toThrow("no fallback");
  });

  it("bounds serialized bytes as well as entry count, including multibyte content", async () => {
    const body = "测".repeat(Math.floor(LAST_KNOWN_GOOD_CACHE_LIMITS.maxBytes / 6));
    await withLastKnownGood({ key: "large:en", load: async () => body });
    await withLastKnownGood({ key: "large:zh", load: async () => body });
    expect(readLastKnownGoodForTests("large:en")).toBeNull();
    expect(readLastKnownGoodForTests("large:zh")?.value).toBe(body);
  });

  it("returns oversized fresh values without retaining an older revision", async () => {
    await withLastKnownGood({ key: "page:large", load: async () => "old" });
    const body = "x".repeat(LAST_KNOWN_GOOD_CACHE_LIMITS.maxBytes);
    const fresh = await withLastKnownGood({ key: "page:large", load: async () => body });
    expect(fresh).toMatchObject({ source: "fresh", stale: false, value: body });
    expect(readLastKnownGoodForTests("page:large")).toBeNull();
  });

  it("does not extend the seven-day expiry when a stale value is read", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-01T00:00:00Z"));
    await withLastKnownGood({ key: "page:expires", load: async () => "public" });
    vi.advanceTimersByTime(LAST_KNOWN_GOOD_CACHE_LIMITS.maxAgeMs - 1);
    expect(readLastKnownGoodForTests("page:expires")?.value).toBe("public");
    vi.advanceTimersByTime(1);
    const error = new Error("expired authority unavailable");
    await expect(withLastKnownGood({ key: "page:expires", load: async () => { throw error; } })).rejects.toBe(error);
    expect(readLastKnownGoodForTests("page:expires")).toBeNull();
  });

  it("refreshes expiry and releases the old byte budget on replacement and revocation", async () => {
    vi.useFakeTimers();
    const body = "x".repeat(LAST_KNOWN_GOOD_CACHE_LIMITS.maxBytes - 100);
    await withLastKnownGood({ key: "page:large", load: async () => body });
    vi.advanceTimersByTime(LAST_KNOWN_GOOD_CACHE_LIMITS.maxAgeMs - 1);
    await withLastKnownGood({ key: "page:large", load: async () => "new" });
    vi.advanceTimersByTime(1);
    await withLastKnownGood({ key: "page:second", load: async () => body });
    expect(readLastKnownGoodForTests("page:large")?.value).toBe("new");
    await withLastKnownGood<string | null>({
      key: "page:second", load: async () => null, clearStaleOnUnusable: true,
    });
    await withLastKnownGood({ key: "page:third", load: async () => body });
    expect(readLastKnownGoodForTests("page:large")?.value).toBe("new");
    expect(readLastKnownGoodForTests("page:second")).toBeNull();
    expect(readLastKnownGoodForTests("page:third")?.value).toBe(body);
  });

  it("keeps successful nonserializable reads fresh without admitting them to the cache", async () => {
    const value: { self?: unknown } = {};
    value.self = value;
    const result = await withLastKnownGood({ key: "nonserializable", load: async () => value });
    expect(result.value).toBe(value);
    expect(result.source).toBe("fresh");
    expect(readLastKnownGoodForTests("nonserializable")).toBeNull();
  });

  it("returns fresh data and stores usable values", async () => {
    const result = await withLastKnownGood({
      key: "landing-surface:home:en",
      load: async () => ({ hero: "cms" }),
    });

    expect(result.source).toBe("fresh");
    expect(result.stale).toBe(false);
    expect(result.value).toEqual({ hero: "cms" });
    expect(readLastKnownGoodForTests<{ hero: string }>("landing-surface:home:en")?.value).toEqual({
      hero: "cms",
    });
  });

  it("returns stale last-known-good data when a later load fails", async () => {
    await withLastKnownGood({
      key: "landing-surface:tests:zh",
      load: async () => ({ hero: "tests cms" }),
    });

    const result = await withLastKnownGood({
      key: "landing-surface:tests:zh",
      load: async () => {
        throw new Error("cms unavailable");
      },
    });

    expect(result.source).toBe("last-known-good");
    expect(result.stale).toBe(true);
    expect(result.value).toEqual({ hero: "tests cms" });
    expect(result.error).toBeInstanceOf(Error);
  });

  it("throws the original error when no last-known-good value exists", async () => {
    await expect(
      withLastKnownGood({
        key: "landing-surface:career_home:en",
        load: async () => {
          throw new Error("missing first response");
        },
      })
    ).rejects.toThrow("missing first response");
  });

  it("can restrict stale fallback to transient load failures", async () => {
    await withLastKnownGood({
      key: "landing-surface:home:en",
      load: async () => ({ hero: "cms" }),
    });

    await expect(
      withLastKnownGood({
        key: "landing-surface:home:en",
        load: async () => {
          throw Object.assign(new Error("withdrawn"), { status: 404 });
        },
        useStaleOnError: (error) =>
          typeof (error as { status?: unknown }).status !== "number" ||
          Number((error as { status?: unknown }).status) >= 500,
      })
    ).rejects.toThrow("withdrawn");

    await expect(
      withLastKnownGood({
        key: "landing-surface:home:en",
        load: async () => {
          throw Object.assign(new Error("cms unavailable"), { status: 503 });
        },
        useStaleOnError: (error) =>
          typeof (error as { status?: unknown }).status !== "number" ||
          Number((error as { status?: unknown }).status) >= 500,
      })
    ).resolves.toMatchObject({
      source: "last-known-good",
      stale: true,
      value: { hero: "cms" },
    });
  });

  it("does not replace the cached value with unusable fresh data", async () => {
    await withLastKnownGood({
      key: "landing-surface:home:zh",
      load: async () => ({ hero: "previous" }),
    });

    const fresh = await withLastKnownGood<{ hero: string } | null>({
      key: "landing-surface:home:zh",
      load: async () => null,
      isUsable: (value) => value !== null,
    });

    expect(fresh.source).toBe("fresh");
    expect(fresh.value).toBeNull();
    expect(readLastKnownGoodForTests<{ hero: string }>("landing-surface:home:zh")?.value).toEqual({
      hero: "previous",
    });
  });
});
