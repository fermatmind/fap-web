import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function changedFiles(): string[] {
  const files = new Set<string>();
  for (const args of [
    ["diff", "--name-only", "HEAD"],
    ["diff", "--cached", "--name-only"],
    ["diff", "--name-only", "origin/main...HEAD"],
    ["ls-files", "--others", "--exclude-standard"],
  ]) {
    try {
      const output = execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
      for (const line of output.split("\n")) {
        if (line.trim()) files.add(line.trim());
      }
    } catch {
      // Local and CI refs can differ; use every available diff source.
    }
  }
  return [...files].sort();
}

const allowedFiles = new Set([
  "package.json",
  "scripts/seo/check-public-runtime-seo-qa.mjs",
  "docs/seo/seo-runtime-qa-agent.md",
  "docs/seo/agent/runtime-qa/default-samples.v1.json",
  "tests/contracts/seo-runtime-qa-agent.contract.test.ts",
  "tests/contracts/seo-ops-readmodel-bridge.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

describe("SEO runtime QA agent", () => {
  it("keeps public samples and deny-policy samples separate", () => {
    const samples = JSON.parse(read("docs/seo/agent/runtime-qa/default-samples.v1.json"));

    expect(samples.public_samples.length).toBeGreaterThanOrEqual(10);
    expect(samples.deny_policy_samples.length).toBeGreaterThanOrEqual(4);
    expect(samples.public_samples.every((row: { expect?: { fetch?: boolean } }) => row.expect?.fetch === true)).toBe(true);
    expect(samples.deny_policy_samples.every((row: { expect?: { fetch?: boolean } }) => row.expect?.fetch === false)).toBe(true);
    expect(JSON.stringify(samples.deny_policy_samples)).toMatch(/result|orders|share|pay|take/);
  });

  it("emits bounded JSON in no-network mode without live public fetches", () => {
    const output = execFileSync(
      "node",
      ["scripts/seo/check-public-runtime-seo-qa.mjs", "--no-network"],
      { cwd: ROOT, encoding: "utf8" }
    );
    const report = JSON.parse(output);

    expect(report.schema_version).toBe(1);
    expect(report.mode).toBe("no_network_contract");
    expect(report.summary.live_fetches).toBe(0);
    expect(report.summary.deny_policy_fetches).toBe(0);
    expect(report.summary.passed).toBe(true);
    expect(report.public_results.every((row: { fetched: boolean }) => row.fetched === false)).toBe(true);
    expect(report.deny_policy_results.every((row: { fetched: boolean }) => row.fetched === false)).toBe(true);
  });

  it("does not default to generated artifact writes or live CI network dependency", () => {
    const script = read("scripts/seo/check-public-runtime-seo-qa.mjs");
    const pkg = read("package.json");
    const docs = read("docs/seo/seo-runtime-qa-agent.md");

    expect(pkg).toContain("\"seo:runtime-qa\"");
    expect(script).toContain("Default: stdout only");
    expect(script).toContain("--no-network");
    expect(docs).toContain("CI contract tests use `--no-network`");
    expect(fs.existsSync(path.join(ROOT, "docs/seo/generated/seo-runtime-qa-agent.v1.json"))).toBe(false);
  });

  it("keeps current PR changed files inside the approved runtime QA scope", () => {
    const files = changedFiles();

    if (files.length === 0) {
      expect(files).toEqual([]);
      return;
    }

    expect(files.every((file) => allowedFiles.has(file)), files.join("\n")).toBe(true);
  });
});
