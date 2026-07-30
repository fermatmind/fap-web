import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

const ROOT = process.cwd();

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("PARITY-06 llms-full non-Trust orchestration", () => {
  it("keeps runtime budgets unchanged and bounds artifact-only source work", async () => {
    const {
      llmsFullContentPageTimeoutMs,
      llmsFullSourceConcurrency,
      llmsFullSourceTimeoutMs,
    } = await import("@/app/llms-full.txt/route");

    expect(llmsFullContentPageTimeoutMs("runtime")).toBe(5_000);
    expect(llmsFullSourceTimeoutMs("runtime", "hard", 8_000)).toBe(8_000);
    expect(llmsFullSourceTimeoutMs("runtime", "optional", 1_500)).toBe(1_500);
    expect(llmsFullSourceTimeoutMs("runtime", "enrichment", 350)).toBe(350);
    expect(llmsFullSourceConcurrency("runtime")).toBe(Number.MAX_SAFE_INTEGER);

    expect(llmsFullContentPageTimeoutMs("artifact")).toBe(60_000);
    expect(llmsFullSourceTimeoutMs("artifact", "hard", 8_000)).toBe(60_000);
    expect(llmsFullSourceTimeoutMs("artifact", "optional", 1_500)).toBe(30_000);
    expect(llmsFullSourceTimeoutMs("artifact", "enrichment", 350)).toBe(5_000);
    expect(llmsFullSourceConcurrency("artifact")).toBe(3);
  });

  it("uses a five-minute fail-closed operator deadline without changing the public response deadline", () => {
    const route = fs.readFileSync(path.join(ROOT, "app/llms-full.txt/route.ts"), "utf8");
    const budgets = fs.readFileSync(path.join(ROOT, "lib/seo/llmsRouteBudget.ts"), "utf8");

    expect(budgets).toContain("LLMS_FULL_ARTIFACT_BUILD_TIMEOUT_MS = 5 * 60_000");
    expect(budgets).toContain("LLMS_FULL_ARTIFACT_HARD_SOURCE_ATTEMPTS = 2");
    expect(budgets).toContain("LLMS_FULL_RESPONSE_DEADLINE_MS = 12_000");
    expect(route).toContain("LLMS_FULL_ARTIFACT_BUILD_TIMEOUT");
    expect(route).toContain("createSourceScheduler(llmsFullSourceConcurrency(buildProfile))");
    expect(route).toContain("scheduleSource(() => withLlmsRouteBudget(");
    expect(route).toContain("scheduleSource(() => loadHardSource(");
  });

  it("shares one backend sitemap request across concurrent cohort consumers", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ items: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
    vi.stubGlobal("fetch", fetchMock);

    const source = await import("@/lib/seo/backendSitemapSource");
    const results = await Promise.allSettled([
      source.listBackendSitemapCareerJobPaths({ limit: 2200 }),
      source.listBackendSitemapBigFiveCanonicalPaths({ limit: 104 }),
      source.listBackendSitemapEnneagramPublicAssetPaths({ limit: 116 }),
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(results[0]).toMatchObject({ status: "fulfilled", value: [] });
    expect(results[1].status).toBe("rejected");
    expect(results[2]).toMatchObject({ status: "fulfilled", value: [] });
  });

  it("does not turn artifact stability into local content or a cache-write shortcut", () => {
    const route = fs.readFileSync(path.join(ROOT, "app/llms-full.txt/route.ts"), "utf8");
    const generator = fs.readFileSync(path.join(ROOT, "scripts/seo/generate-llms-full.mjs"), "utf8");

    expect(generator).toContain('buildLlmsFullText(siteUrl, { buildProfile: "artifact" })');
    expect(generator).toContain("buildAndCacheLlmsFullText");
    expect(route).toContain("isCompleteLlmsFullText");
    expect(route).toContain("writeLlmsFullResponseCache");
    expect(route).not.toContain("artifactFallbackContent");
    expect(route).not.toContain("acceptPartialArtifact");
  });
});
