import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { getBigFivePublicContentAsset } from "@/lib/cms/personality-public-content-assets";

const SOURCE = readFileSync("lib/cms/personality-public-content-assets.ts", "utf8");

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
});
