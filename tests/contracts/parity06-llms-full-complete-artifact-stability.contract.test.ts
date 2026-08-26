import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SITE_URL = "https://fermatmind.com";
const REQUIRED_TRUST_PATHS = [
  "/en/science",
  "/en/method-boundaries",
  "/zh/method-boundaries",
  "/en/item-design-notes",
  "/en/reliability-validity",
  "/en/data-privacy",
  "/en/common-misconceptions",
] as const;

function minimalLlmsFullText(paths: readonly string[]): string {
  return [
    "# FermatMind llms-full.txt",
    "Generated-At: 2026-07-27T00:00:00.000Z",
    `Site: ${SITE_URL}`,
    "",
    ...paths.map((path) => `- URL: ${SITE_URL}${path}`),
  ].join("\n");
}

afterEach(() => {
  delete process.env.FERMATMIND_LLMS_FULL_CACHE_DIR;
  delete process.env.FERMATMIND_LLMS_FULL_ENABLE_SHARED_CACHE;
  delete process.env.FERMATMIND_LLMS_FULL_REQUIRE_TRUST_CONTENT_PAGE_COHORT;
});

describe("PARITY-06 llms-full complete artifact stability", () => {
  it("keeps the public runtime budget bounded while giving operator artifacts a fixed complete-authority budget", async () => {
    const routeSource = fs.readFileSync(path.join(ROOT, "lib/seo/llmsFullRoute.ts"), "utf8");
    const generatorSource = fs.readFileSync(path.join(ROOT, "scripts/seo/generate-llms-full.mjs"), "utf8");
    const { llmsFullContentPageTimeoutMs } = await import("@/lib/seo/llmsFullRoute");

    expect(llmsFullContentPageTimeoutMs()).toBe(5_000);
    expect(llmsFullContentPageTimeoutMs("runtime")).toBe(5_000);
    expect(llmsFullContentPageTimeoutMs("artifact")).toBe(60_000);
    expect(generatorSource).toContain('buildLlmsFullText(siteUrl, { buildProfile: "artifact" })');
    expect(routeSource).toContain('const contentPageBudget = options.buildProfile === "artifact"');
    expect(routeSource).toContain("{ timeoutMs: LLMS_FULL_ARTIFACT_CONTENT_PAGE_TIMEOUT_MS }");
    expect(routeSource).toContain("{ timeoutMs: LLMS_ROUTE_CONTENT_PAGE_TIMEOUT_MS }");
    expect(routeSource).not.toContain("LLMS_ROUTE_CONTENT_PAGE_TIMEOUT_MS = 60_000");
  });

  it("requires every approved Trust ContentPage before an artifact is cacheable", async () => {
    process.env.FERMATMIND_LLMS_FULL_REQUIRE_TRUST_CONTENT_PAGE_COHORT = "true";
    const { isCompleteLlmsFullText } = await import("@/lib/seo/llmsFullRoute");
    const complete = minimalLlmsFullText(REQUIRED_TRUST_PATHS);

    expect(isCompleteLlmsFullText(complete, SITE_URL)).toBe(true);
    for (const missingPath of REQUIRED_TRUST_PATHS) {
      const incomplete = minimalLlmsFullText(REQUIRED_TRUST_PATHS.filter((path) => path !== missingPath));
      expect(isCompleteLlmsFullText(incomplete, SITE_URL)).toBe(false);
    }

    const prefixImpostor = minimalLlmsFullText([
      ...REQUIRED_TRUST_PATHS.filter((path) => path !== "/en/science"),
      "/en/science-v2",
    ]);
    expect(isCompleteLlmsFullText(prefixImpostor, SITE_URL)).toBe(false);
  });

  it("does not replace the shared artifact with a partial Trust cohort", async () => {
    const cacheDir = fs.mkdtempSync(path.join(os.tmpdir(), "parity06-llms-full-"));
    process.env.FERMATMIND_LLMS_FULL_CACHE_DIR = cacheDir;
    process.env.FERMATMIND_LLMS_FULL_ENABLE_SHARED_CACHE = "true";
    process.env.FERMATMIND_LLMS_FULL_REQUIRE_TRUST_CONTENT_PAGE_COHORT = "true";

    const { isCompleteLlmsFullText } = await import("@/lib/seo/llmsFullRoute");
    const {
      getLlmsFullSharedCachePath,
      writeLlmsFullResponseCache,
    } = await import("@/lib/seo/llmsFullResponseCache");
    const cacheOptions = {
      isCacheable: (text: string) => isCompleteLlmsFullText(text, SITE_URL),
    };
    const incomplete = minimalLlmsFullText(REQUIRED_TRUST_PATHS.slice(0, -1));
    const rejected = await writeLlmsFullResponseCache(SITE_URL, incomplete, cacheOptions);

    expect(rejected.cached).toBe(false);
    expect(fs.existsSync(getLlmsFullSharedCachePath(SITE_URL))).toBe(false);

    const complete = minimalLlmsFullText(REQUIRED_TRUST_PATHS);
    const accepted = await writeLlmsFullResponseCache(SITE_URL, complete, cacheOptions);

    expect(accepted.cached).toBe(true);
    expect(fs.existsSync(getLlmsFullSharedCachePath(SITE_URL))).toBe(true);
  });

  it("keeps forbidden, query, and private routes outside complete artifacts", async () => {
    process.env.FERMATMIND_LLMS_FULL_REQUIRE_TRUST_CONTENT_PAGE_COHORT = "true";
    const { isCompleteLlmsFullText } = await import("@/lib/seo/llmsFullRoute");
    const forbiddenPaths = [
      "/en/result/private",
      "/en/orders/private",
      "/en/take/private",
      "/en/payment/private",
    ];

    for (const forbiddenPath of forbiddenPaths) {
      expect(
        isCompleteLlmsFullText(
          minimalLlmsFullText([...REQUIRED_TRUST_PATHS, forbiddenPath]),
          SITE_URL
        )
      ).toBe(false);
    }
    expect(
      isCompleteLlmsFullText(
        `${minimalLlmsFullText(REQUIRED_TRUST_PATHS)}\n- URL: ${SITE_URL}/en/science?preview=1`,
        SITE_URL
      )
    ).toBe(false);
  });
});
