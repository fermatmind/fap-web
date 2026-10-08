import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getBigFivePublicContentAsset,
  getEnneagramPublicContentAsset,
} from "@/lib/cms/personality-public-content-assets";

const SOURCE = readFileSync("lib/cms/personality-public-content-assets.ts", "utf8");

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("SECURITY-123-WEB-07 personality asset cache policy", () => {
  it("uses one explicit no-store policy for Big Five CMS assets", () => {
    const bigFiveFetchBlock = SOURCE.slice(
      SOURCE.indexOf("export async function getBigFivePublicContentAsset"),
      SOURCE.indexOf("export async function getEnneagramPublicContentAsset")
    );

    expect(bigFiveFetchBlock).toContain('cache: "no-store"');
    expect(bigFiveFetchBlock).not.toContain("PUBLIC_API_CACHE_OPTIONS");
  });

  it("does not send a conflicting revalidate directive to fetch", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: false }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      getBigFivePublicContentAsset("en", {
        entityType: "domain",
        code: "openness",
        routeSlug: "openness",
        pathSuffix: "/openness",
      })
    ).rejects.toMatchObject({ kind: "contract", authoritativeAbsence: false });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const calls = fetchMock.mock.calls as unknown as Array<[string, RequestInit | undefined]>;
    const init = calls[0]?.[1];
    expect(init).toMatchObject({ cache: "no-store" });
    expect(init).not.toHaveProperty("next");
  });

  it.each([
    { entityType: "hub" as const, code: "enneagram", routeSlug: "", pathSuffix: "" },
    { entityType: "wing" as const, code: "1w9", routeSlug: "wings/1w9", pathSuffix: "/wings/1w9" },
    {
      entityType: "instinctual_subtype" as const,
      code: "type-1--self-preservation",
      routeSlug: "type-1/instincts/self-preservation",
      pathSuffix: "/type-1/instincts/self-preservation",
    },
  ])("observes a newly published $entityType title on the next authority read", async (entry) => {
    let currentTitle = "Before publication";
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      // Model an existing framework data-cache entry: only an explicit uncached
      // request observes the new authority instead of its previous title.
      const title = init?.cache === "no-store" ? currentTitle : "Before publication";
      const asset = {
        contract_version: "personality_public_asset.v1",
        framework: "enneagram",
        entity_type: entry.entityType,
        code: entry.code,
        locale: "zh-CN",
        title,
        seo: { title },
        is_public: true,
        launch_state: "published",
      };
      const collection = entry.entityType === "instinctual_subtype" && !new URL(url).searchParams.has("code");
      return new Response(
        JSON.stringify(collection ? { ok: true, items: [asset] } : { ok: true, personality_public_content_asset_v1: asset }),
        { status: 200 }
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    expect((await getEnneagramPublicContentAsset("zh", entry))?.title).toBe("Before publication");
    currentTitle = "After publication";
    const published = await getEnneagramPublicContentAsset("zh", entry);
    expect(published?.title).toBe("After publication");
    expect(published?.seo.title).toBe("After publication");
    expect(fetchMock).toHaveBeenCalledTimes(entry.entityType === "instinctual_subtype" ? 4 : 2);
    for (const [, init] of fetchMock.mock.calls) {
      expect(init).toMatchObject({ cache: "no-store" });
      expect(init).not.toHaveProperty("next");
    }
  });
});
