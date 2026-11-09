import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getBigFivePublicContentAsset,
  getEnneagramPublicContentAsset,
  getTraditionalPersonalityPublicContentAsset,
} from "@/lib/cms/personality-public-content-assets";
import { getTraditionalPublicAssetRoute } from "@/lib/personality/traditionalPublicAssetRoutes";
import { PublicReadError } from "@/lib/public-content/readError";

const ROOT = process.cwd();

const bigFiveEntry = {
  entityType: "domain" as const,
  code: "openness",
  routeSlug: "openness",
  pathSuffix: "/openness",
};

const enneagramEntry = {
  entityType: "center" as const,
  code: "gut",
  routeSlug: "centers/gut",
  pathSuffix: "/centers/gut",
};

function read(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("public personality asset read stability", () => {
  it("returns null only for authoritative absence or an explicit unpublished asset", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ ok: false, error_code: "NOT_FOUND" }, 404)));
    await expect(getBigFivePublicContentAsset("en", bigFiveEntry)).resolves.toBeNull();

    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          ok: true,
          personality_public_content_asset_v1: {
            framework: "enneagram",
            entity_type: "center",
            code: "gut",
            locale: "en",
            is_public: true,
            launch_state: "content_stub",
          },
        })
      )
    );
    await expect(getEnneagramPublicContentAsset("en", enneagramEntry)).resolves.toBeNull();
  });

  it.each([
    [408, "timeout"],
    [429, "rate_limited"],
    [503, "transient"],
  ] as const)("preserves HTTP %i as a retryable %s error", async (status, kind) => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ ok: false }, status)));

    const error = await getBigFivePublicContentAsset("en", bigFiveEntry).catch((cause) => cause);
    expect(error).toBeInstanceOf(PublicReadError);
    expect(error).toMatchObject({ kind, retryable: true, authoritativeAbsence: false });
  });

  it("preserves network, validation, and malformed success responses instead of creating false 404s", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("network unavailable"))));
    await expect(getEnneagramPublicContentAsset("en", enneagramEntry)).rejects.toMatchObject({
      kind: "network",
      retryable: true,
      authoritativeAbsence: false,
    });

    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ ok: false, error_code: "VALIDATION_ERROR" }, 422)));
    await expect(getBigFivePublicContentAsset("en", bigFiveEntry)).rejects.toMatchObject({
      kind: "contract",
      authoritativeAbsence: false,
    });

    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ ok: false })));
    await expect(getBigFivePublicContentAsset("en", bigFiveEntry)).rejects.toMatchObject({
      kind: "contract",
      authoritativeAbsence: false,
    });
  });

  it("maps only the older asset API's Taiwan locale rejection to absence", async () => {
    const legacy = { ok: false, error_code: "VALIDATION_FAILED", errors: { locale: ["validation.in"] } };
    const fetch = vi.fn(async () => jsonResponse(legacy, 422));
    vi.stubGlobal("fetch", fetch);

    const readAsset = () => getTraditionalPersonalityPublicContentAsset("big_five", bigFiveEntry);
    await expect(readAsset()).resolves.toBeNull();
    await expect(getBigFivePublicContentAsset("en", bigFiveEntry)).rejects.toMatchObject({ kind: "contract" });

    fetch.mockImplementation(async () => jsonResponse({ ...legacy, errors: { code: ["validation.in"] } }, 422));
    await expect(readAsset()).rejects.toMatchObject({ kind: "contract" });
  });

  it("reads the exact Taiwan identity and preserves authoritative absence without language fallback", async () => {
    const canonicalPath = "/zh-TW/personality/big-five/openness";
    const asset = {
      framework: "big_five", entity_type: "domain", code: "openness",
      locale: "zh-TW", canonical_path: canonicalPath, title: "開放性",
      launch_state: "published", is_public: true,
    };
    const response = (record: typeof asset) => jsonResponse({ ok: true, personality_public_content_asset_v1: record });
    const fetch = vi.fn()
      .mockImplementationOnce(async () => response(asset))
      .mockImplementationOnce(async () => response({ ...asset, locale: "zh-CN" }))
      .mockImplementationOnce(async () => response({ ...asset, canonical_path: "/zh/personality/big-five/openness" }))
      .mockImplementationOnce(async () => jsonResponse({ ok: false, error_code: "NOT_FOUND" }, 404));
    vi.stubGlobal("fetch", fetch);

    const readAsset = () => getTraditionalPersonalityPublicContentAsset("big_five", bigFiveEntry);
    await expect(readAsset()).resolves.toMatchObject({ title: "開放性", locale: "zh-TW", canonicalPath });
    await expect(readAsset()).rejects.toMatchObject({ kind: "contract" });
    await expect(readAsset()).rejects.toMatchObject({ kind: "contract" });
    await expect(readAsset()).resolves.toBeNull();
    expect(fetch).toHaveBeenCalledTimes(4);
    const url = new URL(String(fetch.mock.calls[0]?.[0]));
    expect(url.pathname).toMatch(/\/personality-content-assets\/big_five\/domain\/openness$/);
    expect(url.searchParams.get("locale")).toBe("zh-TW");
    expect(new Headers(fetch.mock.calls[0]?.[1]?.headers).get("X-FAP-Locale")).toBe("zh-TW");
  });

  it("resolves the native subtype query and excludes aliases and unknown Taiwan routes", async () => {
    const canonicalPath = "/zh-TW/personality/enneagram/type-1/instincts/self-preservation";
    const route = getTraditionalPublicAssetRoute(canonicalPath);
    if (!route) throw new Error("Missing expected subtype route");
    expect(route).toMatchObject({ framework: "enneagram", entry: { code: "type-1/self-preservation" } });
    expect(getTraditionalPublicAssetRoute("/zh-TW/personality/big-five/high-openness")).toBeNull();
    expect(getTraditionalPublicAssetRoute("/zh-TW/personality/enneagram/centers/unknown")).toBeNull();

    const fetch = vi.fn<typeof globalThis.fetch>(async () => jsonResponse({ ok: false, error_code: "NOT_FOUND" }, 404));
    vi.stubGlobal("fetch", fetch);
    await expect(getTraditionalPersonalityPublicContentAsset(route.framework, route.entry)).resolves.toBeNull();
    const url = new URL(String(fetch.mock.calls[0]?.[0]));
    expect(url.pathname).toMatch(/\/personality-content-assets$/);
    expect(url.searchParams.get("code")).toBe("type-1/self-preservation");
    expect(url.searchParams.get("locale")).toBe("zh-TW");
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("memoizes one backend-authority read across metadata and page rendering with primitive route keys", () => {
    const loader = read("lib/cms/personalityPublicAssetLoader.ts");
    const routes = [
      "app/(localized)/[locale]/personality/big-five/page.tsx",
      "app/(localized)/[locale]/personality/big-five/[...slug]/page.tsx",
      "app/(localized)/[locale]/personality/enneagram/page.tsx",
      "app/(localized)/[locale]/personality/enneagram/[...slug]/page.tsx",
    ].map(read);

    expect(loader.match(/= cache\(/g)).toHaveLength(2);
    expect(loader).toContain("locale: Locale");
    expect(loader).toContain("entityType: BigFivePublicEntityType");
    expect(loader).toContain("entityType: EnneagramPublicEntityType");
    expect(loader).toContain("entry.routeSlug, entry.pathSuffix");

    for (const route of routes) {
      expect(route).toContain("@/lib/cms/personalityPublicAssetLoader");
      expect(route).not.toMatch(
        /get(?:BigFive|Enneagram)PublicContentAsset[^]*from "@\/lib\/cms\/personality-public-content-assets"/
      );
      expect(route).toContain("notFound()");
    }
  });
});
