import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
import { BIG_FIVE_ZH_LEGACY_TO_V2_SLUG } from "@/lib/personality/bigFivePublicRoutes";

type RedirectRule = {
  source: string;
  destination: string;
  permanent?: boolean;
  statusCode?: number;
};

async function loadRedirects(): Promise<RedirectRule[]> {
  const configUrl = pathToFileURL(path.join(process.cwd(), "next.config.mjs")).href;
  const { default: nextConfig } = (await import(`${configUrl}?big5-exact-301=${Date.now()}`)) as {
    default: { redirects: () => Promise<RedirectRule[]> };
  };

  return nextConfig.redirects();
}

describe("BIG5-ZH-LEGACY-EXACT-301-REPAIR-01 contract", () => {
  it("maps exactly the ten backend-authorized Chinese aliases to their V2 canonicals with HTTP 301", async () => {
    const redirects = await loadRedirects();
    const bigFiveZhRedirects = redirects.filter((rule) =>
      rule.source.startsWith("/zh/personality/big-five/")
    );
    const expectedRedirects = Object.entries(BIG_FIVE_ZH_LEGACY_TO_V2_SLUG).map(
      ([legacySlug, canonicalSlug]) => ({
        source: `/zh/personality/big-five/${legacySlug}`,
        destination: `/zh/personality/big-five/${canonicalSlug}`,
        statusCode: 301,
      })
    );

    expect(bigFiveZhRedirects).toEqual(expectedRedirects);
    expect(bigFiveZhRedirects).toHaveLength(10);
    expect(bigFiveZhRedirects.every((rule) => rule.permanent === undefined)).toBe(true);
  });

  it("does not add or change any English Big Five Legacy redirect", async () => {
    const redirects = await loadRedirects();

    expect(
      redirects.filter((rule) => rule.source.startsWith("/en/personality/big-five/"))
    ).toEqual([]);
  });
});
