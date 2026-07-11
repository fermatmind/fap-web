import { afterEach, describe, expect, it, vi } from "vitest";
import {
  BIG_FIVE_PUBLIC_ROUTE_ENTRIES,
  BIG_FIVE_ZH_LEGACY_TO_V2_SLUG,
} from "@/lib/personality/bigFivePublicRoutes";
import {
  hasExactBigFiveCanonicalCohort,
  isCompleteLlmsFullText,
} from "@/app/llms-full.txt/route";

const canonicalPaths = BIG_FIVE_PUBLIC_ROUTE_ENTRIES.flatMap((entry) => [
  `/en/personality/big-five${entry.pathSuffix}`,
  ...(
    Object.hasOwn(BIG_FIVE_ZH_LEGACY_TO_V2_SLUG, entry.routeSlug)
      ? []
      : [`/zh/personality/big-five${entry.pathSuffix}`]
  ),
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

describe("BIG5-114-LLMS-WORKER-CACHE-CONSISTENCY-REPAIR-01", () => {
  it("does not cache an empty or incomplete cohort and recovers on the next complete backend response", async () => {
    expect(canonicalPaths).toHaveLength(114);
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(sitemapResponse(canonicalPaths.slice(0, 113)))
      .mockResolvedValueOnce(sitemapResponse(canonicalPaths));
    vi.stubGlobal("fetch", fetchMock);
    vi.resetModules();
    const { listBackendSitemapBigFiveZhPaths } = await import("@/lib/seo/backendSitemapSource");

    await expect(listBackendSitemapBigFiveZhPaths()).rejects.toThrow(
      "Incomplete Big Five sitemap authority cohort: expected 114 canonical paths, received 113."
    );
    await expect(listBackendSitemapBigFiveZhPaths()).resolves.toHaveLength(114);
    await expect(listBackendSitemapBigFiveZhPaths()).resolves.toEqual(
      [...canonicalPaths].sort((left, right) => left.localeCompare(right))
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("keeps independently initialized workers on the same exact 114-path authority cohort", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(sitemapResponse(canonicalPaths))
      .mockResolvedValueOnce(sitemapResponse(canonicalPaths));
    vi.stubGlobal("fetch", fetchMock);

    vi.resetModules();
    const workerOne = await import("@/lib/seo/backendSitemapSource");
    await expect(workerOne.listBackendSitemapBigFiveZhPaths()).resolves.toHaveLength(114);

    vi.resetModules();
    const workerTwo = await import("@/lib/seo/backendSitemapSource");
    await expect(workerTwo.listBackendSitemapBigFiveZhPaths()).resolves.toEqual(
      [...canonicalPaths].sort((left, right) => left.localeCompare(right))
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("requires the exact 114 canonical cohort and zero Chinese aliases for a complete llms-full cache", () => {
    process.env.FERMATMIND_LLMS_FULL_REQUIRE_BIG_FIVE_COHORT = "true";
    const complete = llmsFullText(canonicalPaths);
    const alias = "/zh/personality/big-five/high-openness";

    expect(hasExactBigFiveCanonicalCohort(complete, "https://fermatmind.com")).toBe(true);
    expect(isCompleteLlmsFullText(complete, "https://fermatmind.com")).toBe(true);
    expect(hasExactBigFiveCanonicalCohort(llmsFullText(canonicalPaths.slice(1)), "https://fermatmind.com")).toBe(false);
    expect(isCompleteLlmsFullText(`${complete}\n- URL: https://fermatmind.com${alias}`, "https://fermatmind.com")).toBe(false);
  });
});
