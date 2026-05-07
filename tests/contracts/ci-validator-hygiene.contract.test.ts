import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";

const ROOT = process.cwd();
const liveUrlCheckModule = pathToFileURL(path.join(ROOT, "scripts/seo/lib/live-url-check.mjs")).href;

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

async function loadLiveUrlCheck(): Promise<{
  checkLiveUrl: (url: string, options?: Record<string, unknown>) => Promise<unknown>;
  fetchNoRedirect: (url: string, options?: Record<string, unknown>) => Promise<unknown>;
  getUnsafeLiveFetchIssue: (url: string, options?: Record<string, unknown>) => unknown;
  LIVE_CHECK_DEFAULTS: { concurrency: number; timeoutMs: number; sourceTimeoutMs: number };
}> {
  return import(liveUrlCheckModule);
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("CI validator hygiene", () => {
  it("does not use mutable third-party package-manager actions in CI", () => {
    const workflow = read(".github/workflows/ci.yml");

    expect(workflow).not.toContain("pnpm/action-setup@");
    expect(workflow).toContain("actions/setup-node@v4");
    expect(workflow.match(/corepack enable/g)).toHaveLength(4);
    expect(workflow.match(/pnpm install --frozen-lockfile/g)).toHaveLength(4);
  });

  it("rejects off-domain live validator URLs before fetching", async () => {
    const { checkLiveUrl, fetchNoRedirect, getUnsafeLiveFetchIssue } = await loadLiveUrlCheck();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    expect(getUnsafeLiveFetchIssue("https://example.invalid/seo")).toEqual({
      url: "https://example.invalid/seo",
      reasons: [{ reason: "non-apex-host", detail: "example.invalid" }],
    });

    await expect(checkLiveUrl("https://example.invalid/seo")).resolves.toEqual({
      url: "https://example.invalid/seo",
      reasons: [{ reason: "non-apex-host", detail: "example.invalid" }],
    });
    expect(fetchMock).not.toHaveBeenCalled();

    await expect(fetchNoRedirect("https://example.invalid/seo")).rejects.toThrow("unsafe-live-fetch");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps first-party live validator fetches available", async () => {
    const { checkLiveUrl, getUnsafeLiveFetchIssue } = await loadLiveUrlCheck();
    const fetchMock = vi.fn(async () => {
      return new Response(
        '<!doctype html><html><head><link rel="canonical" href="https://fermatmind.com/en" /></head><body>ok</body></html>',
        {
          status: 200,
          headers: {
            "content-type": "text/html; charset=utf-8",
          },
        }
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    expect(getUnsafeLiveFetchIssue("https://fermatmind.com/en")).toBeNull();
    await expect(checkLiveUrl("https://fermatmind.com/en")).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("uses production-safe live validator defaults without disabling checks", async () => {
    const { LIVE_CHECK_DEFAULTS } = await loadLiveUrlCheck();

    expect(LIVE_CHECK_DEFAULTS.concurrency).toBe(2);
    expect(LIVE_CHECK_DEFAULTS.timeoutMs).toBe(30_000);
    expect(LIVE_CHECK_DEFAULTS.sourceTimeoutMs).toBe(60_000);
  });

  it("still fails bad live URLs after timeout policy tuning", async () => {
    const { checkLiveUrl } = await loadLiveUrlCheck();

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("not found", { status: 404, headers: { "content-type": "text/plain" } }))
    );
    await expect(checkLiveUrl("https://fermatmind.com/missing")).resolves.toEqual({
      url: "https://fermatmind.com/missing",
      reasons: [{ reason: "bad-status", detail: "status=404" }],
    });

    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          '<!doctype html><html><head><link rel="canonical" href="https://fermatmind.com/noindex" /></head><body>noindex</body></html>',
          {
            status: 200,
            headers: {
              "content-type": "text/html; charset=utf-8",
              "x-robots-tag": "noindex, nofollow",
            },
          }
        )
      )
    );
    await expect(checkLiveUrl("https://fermatmind.com/noindex")).resolves.toEqual({
      url: "https://fermatmind.com/noindex",
      reasons: [{ reason: "x-robots-noindex", detail: "noindex, nofollow" }],
    });

    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          '<!doctype html><html><head><link rel="canonical" href="https://fermatmind.com/canonical-target" /></head><body>wrong canonical</body></html>',
          {
            status: 200,
            headers: {
              "content-type": "text/html; charset=utf-8",
            },
          }
        )
      )
    );
    await expect(checkLiveUrl("https://fermatmind.com/canonical-source")).resolves.toEqual({
      url: "https://fermatmind.com/canonical-source",
      reasons: [{ reason: "non-canonical", detail: "https://fermatmind.com/canonical-target" }],
    });
  });

  it("preflights live validator source URLs before downloading documents", () => {
    expect(read("scripts/seo/assert-live-sitemap-clean.mjs")).toContain("getUnsafeLiveFetchIssue(sourceUrl)");
    expect(read("scripts/seo/assert-live-llms-clean.mjs")).toContain("getUnsafeLiveFetchIssue(sourceUrl)");
    expect(read("scripts/seo/assert-live-sitemap-clean.mjs")).toContain("LIVE_CHECK_DEFAULTS.sourceTimeoutMs");
    expect(read("scripts/seo/assert-live-llms-clean.mjs")).toContain("LIVE_CHECK_DEFAULTS.sourceTimeoutMs");
  });

  it("keeps AI-assisted PR train guardrails explicit", () => {
    const agents = read("AGENTS.md");

    expect(agents).toContain(
      "If the requested PR id is missing from `docs/codex/pr-train.yaml`, stop and report the gap"
    );
    expect(agents).toContain("Never invent a PR id or scope");
    expect(agents).toContain("already present in the manifest");
    expect(agents).toContain("explicitly provided by the user");
    expect(agents).toContain("The PR title must match the PR id and scope from the manifest.");
  });
});
