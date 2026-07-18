import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
import { BIG_FIVE_LEGACY_TO_CANONICAL_SLUG } from "@/lib/personality/bigFivePublicRoutes";

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

describe("BIG5 LEGACY EXACT 301 contract", () => {
  it.each(["zh", "en"] as const)("maps exactly the ten backend-authorized %s aliases with HTTP 301", async (locale) => {
    const redirects = await loadRedirects();
    const localeRedirects = redirects.filter((rule) =>
      rule.source.startsWith(`/${locale}/personality/big-five/`)
    );
    const expectedRedirects = Object.entries(BIG_FIVE_LEGACY_TO_CANONICAL_SLUG).map(
      ([legacySlug, canonicalSlug]) => ({
        source: `/${locale}/personality/big-five/${legacySlug}`,
        destination: `/${locale}/personality/big-five/${canonicalSlug}`,
        statusCode: 301,
      })
    );

    expect(localeRedirects).toEqual(expectedRedirects);
    expect(localeRedirects).toHaveLength(10);
    expect(localeRedirects.every((rule) => rule.permanent === undefined)).toBe(true);
  });
});
