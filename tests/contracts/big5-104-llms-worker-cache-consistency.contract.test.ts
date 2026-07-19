import { afterEach, describe, expect, it, vi } from "vitest";
import {
  BIG_FIVE_PUBLIC_ROUTE_ENTRIES,
  BIG_FIVE_LEGACY_TO_CANONICAL_SLUG,
} from "@/lib/personality/bigFivePublicRoutes";
import {
  hasExactBigFiveCanonicalCohort,
  isCompleteLlmsFullText,
} from "@/app/llms-full.txt/route";

const canonicalPaths = BIG_FIVE_PUBLIC_ROUTE_ENTRIES.flatMap((entry) => [
  `/en/personality/big-five${entry.pathSuffix}`,
  `/zh/personality/big-five${entry.pathSuffix}`,
]);

function sitemapResponse(paths: readonly string[]): Response {
  return new Response(JSON.stringify({
    items: paths.map((path) => ({ loc: `https://fermatmind.com${path}` })),
  }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

function llmsFullText(paths: readonly string[]): string {
  return [
    "# FermatMind llms-full.txt",
    ...paths.map((path) => `- URL: https://fermatmind.com${path}`),
  ].join("\n");
}

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.FERMATMIND_LLMS_FULL_REQUIRE_BIG_FIVE_COHORT;
});

describe("BIG5-EN52-104 sitemap and llms cache consistency", () => {
  it("does not cache 103, 105, or alias-bearing cohorts and recovers on the next exact backend response", async () => {
    expect(canonicalPaths).toHaveLength(104);
    const extraPath = "/en/personality/big-five/not-a-canonical";
    const aliasPath = "/en/personality/big-five/high-openness";
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(sitemapResponse(canonicalPaths.slice(0, 103)))
      .mockResolvedValueOnce(sitemapResponse([...canonicalPaths, extraPath]))
      .mockResolvedValueOnce(sitemapResponse([...canonicalPaths, aliasPath]))
      .mockResolvedValueOnce(sitemapResponse(canonicalPaths));
    vi.stubGlobal("fetch", fetchMock);
    vi.resetModules();
    const { listBackendSitemapBigFiveCanonicalPaths } = await import("@/lib/seo/backendSitemapSource");

    await expect(listBackendSitemapBigFiveCanonicalPaths()).rejects.toThrow(
      "Incomplete Big Five sitemap authority cohort: expected 104 canonical paths, received 103."
    );
    await expect(listBackendSitemapBigFiveCanonicalPaths()).rejects.toThrow(
      "Incomplete Big Five sitemap authority cohort: expected 104 canonical paths, received 105."
    );
    await expect(listBackendSitemapBigFiveCanonicalPaths()).rejects.toThrow(
      "Incomplete Big Five sitemap authority cohort: expected 104 canonical paths, received 105."
    );
    await expect(listBackendSitemapBigFiveCanonicalPaths()).resolves.toHaveLength(104);
    await expect(listBackendSitemapBigFiveCanonicalPaths()).resolves.toEqual(
      [...canonicalPaths].sort((left, right) => left.localeCompare(right))
    );
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it("keeps independently initialized workers on the same exact 104-path authority cohort", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(sitemapResponse(canonicalPaths))
      .mockResolvedValueOnce(sitemapResponse(canonicalPaths));
    vi.stubGlobal("fetch", fetchMock);

    vi.resetModules();
    const workerOne = await import("@/lib/seo/backendSitemapSource");
    await expect(workerOne.listBackendSitemapBigFiveCanonicalPaths()).resolves.toHaveLength(104);

    vi.resetModules();
    const workerTwo = await import("@/lib/seo/backendSitemapSource");
    await expect(workerTwo.listBackendSitemapBigFiveCanonicalPaths()).resolves.toEqual(
      [...canonicalPaths].sort((left, right) => left.localeCompare(right))
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("requires the exact 104 canonical cohort and zero redirect aliases for a complete llms-full cache", () => {
    process.env.FERMATMIND_LLMS_FULL_REQUIRE_BIG_FIVE_COHORT = "true";
    const complete = llmsFullText(canonicalPaths);
    const aliases = Object.keys(BIG_FIVE_LEGACY_TO_CANONICAL_SLUG).flatMap((slug) => [
      `/en/personality/big-five/${slug}`,
      `/zh/personality/big-five/${slug}`,
    ]);

    expect(hasExactBigFiveCanonicalCohort(complete, "https://fermatmind.com")).toBe(true);
    expect(isCompleteLlmsFullText(complete, "https://fermatmind.com")).toBe(true);
    expect(hasExactBigFiveCanonicalCohort(llmsFullText(canonicalPaths.slice(1)), "https://fermatmind.com")).toBe(false);
    for (const alias of aliases) {
      expect(isCompleteLlmsFullText(`${complete}\n- URL: https://fermatmind.com${alias}`, "https://fermatmind.com")).toBe(false);
    }
  });
});
