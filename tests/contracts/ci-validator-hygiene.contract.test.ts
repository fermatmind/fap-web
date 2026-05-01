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

  it("preflights live validator source URLs before downloading documents", () => {
    expect(read("scripts/seo/assert-live-sitemap-clean.mjs")).toContain("getUnsafeLiveFetchIssue(sourceUrl)");
    expect(read("scripts/seo/assert-live-llms-clean.mjs")).toContain("getUnsafeLiveFetchIssue(sourceUrl)");
  });
});
