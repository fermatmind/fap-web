import { afterEach, describe, expect, it } from "vitest";
import {
  clearLastKnownGoodForTests,
  readLastKnownGoodForTests,
  withLastKnownGood,
} from "@/lib/cms/last-known-good";

afterEach(() => {
  clearLastKnownGoodForTests();
});

describe("last-known-good cache helper", () => {
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
