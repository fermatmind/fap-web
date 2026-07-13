import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getBigFivePublicContentAsset,
  getEnneagramPublicContentAsset,
} from "@/lib/cms/personality-public-content-assets";
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
