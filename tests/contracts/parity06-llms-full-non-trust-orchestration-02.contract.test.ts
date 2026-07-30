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
    const sitemapSource = fs.readFileSync(path.join(ROOT, "lib/seo/backendSitemapSource.ts"), "utf8");

    expect(budgets).toContain("LLMS_FULL_ARTIFACT_BUILD_TIMEOUT_MS = 5 * 60_000");
    expect(budgets).toContain("LLMS_FULL_ARTIFACT_HARD_SOURCE_ATTEMPTS = 2");
    expect(budgets).toContain("LLMS_FULL_RESPONSE_DEADLINE_MS = 12_000");
    expect(route).toContain("LLMS_FULL_ARTIFACT_BUILD_TIMEOUT");
    expect(route).toContain("controller.abort();");
    expect(route).toContain("abortSignal: controller.signal");
    expect(route).toContain("createSourceScheduler(llmsFullSourceConcurrency(buildProfile), abortSignal)");
    expect(route).toContain("scheduleSource(() => withLlmsRouteBudget(");
    expect(route).toContain("scheduleSource(() => loadHardSource(");
    expect(sitemapSource).toContain("requestTimeoutMs?: number");
    expect(sitemapSource).toContain("backendSitemapSourceInFlight.timeoutMs < requestTimeoutMs");
  });

  it("propagates a parent deadline to active budgeted work and returns the fail-closed fallback", async () => {
    const { withLlmsRouteBudget } = await import("@/lib/seo/llmsRouteBudget");
    const parent = new AbortController();
    let childAborted = false;

    const resultPromise = withLlmsRouteBudget(
      (signal) => new Promise<string>((resolve) => {
        signal.addEventListener("abort", () => {
          childAborted = true;
          resolve("late");
        }, { once: true });
      }),
      "fallback",
      { timeoutMs: 60_000, signal: parent.signal }
    );

    parent.abort();

    await expect(resultPromise).resolves.toBe("fallback");
    expect(childAborted).toBe(true);
  });

  it("retries the hard test source when an enabled IQ cohort is incomplete", async () => {
    vi.stubEnv("FERMATMIND_LLMS_FULL_REQUIRE_TEST_COHORT", "true");
    vi.stubEnv("FERMATMIND_LLMS_FULL_REQUIRE_IQ_COHORT", "true");
    const { hasRequiredTestSource } = await import("@/app/llms-full.txt/route");
    const corePaths = [
      "/en/tests/mbti-personality-test-16-personality-types",
      "/zh/tests/mbti-personality-test-16-personality-types",
      "/en/tests/big-five-personality-test-ocean-model",
      "/zh/tests/big-five-personality-test-ocean-model",
      "/en/tests/enneagram-personality-test-nine-types",
      "/zh/tests/enneagram-personality-test-nine-types",
      "/en/tests/holland-career-interest-test-riasec",
      "/zh/tests/holland-career-interest-test-riasec",
      "/en/tests/eq-test-emotional-intelligence-assessment",
      "/zh/tests/eq-test-emotional-intelligence-assessment",
    ];
    const iqPaths = [
      "/en/tests/iq-test-intelligence-quotient-assessment",
      "/zh/tests/iq-test-intelligence-quotient-assessment",
    ];

    expect(corePaths).toHaveLength(10);
    expect(hasRequiredTestSource(corePaths.map((path) => ({ path })))).toBe(false);
    expect(hasRequiredTestSource([...corePaths, ...iqPaths].map((path) => ({ path })))).toBe(true);
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
    expect(generator).toContain("process.exit(1)");
    expect(route).toContain("isCompleteLlmsFullText");
    expect(route).toContain("writeLlmsFullResponseCache");
    expect(route).not.toContain("artifactFallbackContent");
    expect(route).not.toContain("acceptPartialArtifact");
  });
});
