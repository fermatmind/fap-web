import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";
import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const liveUrlCheckModule = pathToFileURL(path.join(ROOT, "scripts/seo/lib/live-url-check.mjs")).href;

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function executableActionUses(relPath: string): string[] {
  return read(relPath)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"))
    .map((line) => line.match(/^(?:-\s*)?uses:\s*([^#\s]+)/)?.[1])
    .filter((value): value is string => Boolean(value));
}

function countUses(uses: string[], actionRef: string): number {
  return uses.filter((value) => value === actionRef).length;
}

function currentChangedFiles(): string[] {
  const files = new Set<string>();
  for (const args of [
    ["diff", "--name-only", "HEAD"],
    ["diff", "--cached", "--name-only"],
  ]) {
    const output = execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
    for (const line of output.split("\n")) {
      if (line.trim()) {
        files.add(line.trim());
      }
    }
  }
  return [...files].sort();
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
  it("parses executable action policy without trusting comments or third-party package-manager setup", () => {
    const workflow = read(".github/workflows/ci.yml");
    const uses = executableActionUses(".github/workflows/ci.yml");

    expect(workflow).not.toContain("pnpm/action-setup@");
    expect(uses).not.toContain("pnpm/action-setup@v4");
    expect(uses).not.toContain("actions/setup-node@v4");
    expect(countUses(uses, "actions/checkout@v6")).toBe(4);
    expect(countUses(uses, "actions/setup-node@v6")).toBe(4);
    expect(workflow.match(/corepack enable/g)).toHaveLength(4);
    expect(workflow.match(/pnpm install --frozen-lockfile/g)).toHaveLength(4);
  });

  it("keeps executable workflow actions on the approved first-party allowlist", () => {
    const actionUses = [
      ...executableActionUses(".github/workflows/ci.yml"),
      ...executableActionUses(".github/workflows/codeql.yml"),
    ];

    expect(actionUses).toEqual(
      expect.arrayContaining([
        "actions/checkout@v6",
        "actions/setup-node@v6",
        "github/codeql-action/init@v4",
        "github/codeql-action/analyze@v4",
      ])
    );
    for (const actionRef of actionUses) {
      expect(actionRef).toMatch(/^(actions\/(?:checkout|setup-node)@v6|github\/codeql-action\/(?:init|analyze)@v4)$/);
      expect(actionRef).not.toMatch(/@(main|master|latest|HEAD)$/);
    }
  });

  it("documents the PR-WEB-SEC-06 scope boundary", () => {
    const changed = currentChangedFiles();

    expect(read(".github/workflows/ci.yml")).toContain("permissions:\n  contents: read");
    expect(changed.every(isCurrentRiasecPack12AllowedFile), changed.join("\n")).toBe(true);
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
