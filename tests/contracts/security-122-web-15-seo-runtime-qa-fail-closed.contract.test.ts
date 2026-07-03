import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

import { isSecurity122Web15AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const tempRoots: string[] = [];

function makeTempDir(label: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `${label}-`));
  tempRoots.push(dir);
  return dir;
}

function makeRepoTempDir(label: string): string {
  const parent = path.join(ROOT, "generated", "contract-tmp");
  fs.mkdirSync(parent, { recursive: true });
  const dir = fs.mkdtempSync(path.join(parent, `${label}-`));
  tempRoots.push(dir);
  return dir;
}

function readJson<T = any>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function runNode(args: string[]) {
  return spawnSync("node", args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function changedFiles(): string[] {
  const files = new Set<string>();
  for (const args of [
    ["diff", "--name-only", "--cached"],
    ["diff", "--name-only"],
    ["diff", "--name-only", "origin/main...HEAD"],
    ["ls-files", "--others", "--exclude-standard"],
  ]) {
    try {
      const output = execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
      for (const line of output.split("\n")) {
        if (line.trim()) files.add(line.trim());
      }
    } catch {
      // CI checkouts can omit origin/main; use every available diff source.
    }
  }

  return Array.from(files).sort();
}

afterEach(() => {
  for (const dir of tempRoots.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("SECURITY-122-WEB-15 SEO runner/runtime QA fail-closed parsing and link checks", () => {
  it("rejects malformed SEO PR writer requests without crashing or omitting boundary flags", () => {
    const dir = makeTempDir("security-122-web-15-pr-writer");
    const requestPath = path.join(dir, "request.json");
    const artifactDir = path.join(dir, "artifacts");
    fs.writeFileSync(requestPath, '{"schema_version":');

    const result = runNode([
      "scripts/seo/generate-seo-agent-fapweb-code-pr-writer.mjs",
      `--request=${requestPath}`,
      `--artifact-dir=${artifactDir}`,
    ]);

    expect(result.status).toBe(1);
    expect(result.stderr).not.toMatch(/SyntaxError|at JSON\.parse/);
    const output = JSON.parse(result.stdout);
    expect(output.ok).toBe(false);
    expect(output.issues.join("\n")).toContain("invalid_request_json");

    const artifact = readJson(path.join(artifactDir, fs.readdirSync(artifactDir)[0]));
    expect(artifact.mode).toBe("rejected");
    expect(artifact.boundaries).toMatchObject({
      git_push_attempted: false,
      github_pr_created_by_runner: false,
      direct_main_push_allowed: false,
      auto_deploy_allowed: false,
      cms_write_allowed: false,
      search_channel_submit_allowed: false,
      indexing_request_allowed: false,
      scheduler_activation_allowed: false,
      production_env_change_allowed: false,
    });
  });

  it("turns malformed runtime sample JSON and URLs into structured failed reports", () => {
    const dir = makeTempDir("security-122-web-15-runtime-json");
    const malformedSamples = path.join(dir, "malformed-samples.json");
    const malformedOutput = path.join(dir, "malformed-report.json");
    fs.writeFileSync(malformedSamples, '{"public_samples":');

    const malformedResult = runNode([
      "scripts/seo/check-public-runtime-seo-qa.mjs",
      "--samples",
      malformedSamples,
      "--output",
      malformedOutput,
      "--no-network",
    ]);

    expect(malformedResult.status).toBe(1);
    expect(malformedResult.stderr).not.toMatch(/SyntaxError|at JSON\.parse/);
    const malformedReport = readJson(malformedOutput);
    expect(malformedReport.summary.passed).toBe(false);
    expect(malformedReport.public_results[0].issues[0].reason).toBe("invalid_samples_json");

    const badUrlSamples = path.join(dir, "bad-url-samples.json");
    const badUrlOutput = path.join(dir, "bad-url-report.json");
    fs.writeFileSync(
      badUrlSamples,
      JSON.stringify({
        seed: "security-122-web-15",
        public_samples: [{ url: "http://[malformed" }],
        deny_policy_samples: [],
      }),
    );

    const badUrlResult = runNode([
      "scripts/seo/check-public-runtime-seo-qa.mjs",
      "--samples",
      badUrlSamples,
      "--output",
      badUrlOutput,
      "--no-network",
    ]);

    expect(badUrlResult.status).toBe(1);
    const badUrlReport = readJson(badUrlOutput);
    expect(badUrlReport.public_results[0].issues[0].reason).toBe("invalid_sample_url");
  });

  it("fails runtime QA on malformed hreflang links and HTTP error statuses", async () => {
    const moduleUrl = pathToFileURL(path.join(ROOT, "scripts/seo/check-public-runtime-seo-qa.mjs")).href;
    const { inspectFetchedPublicSample } = await import(moduleUrl);
    const htmlHeaders = new Headers({ "content-type": "text/html" });

    const badHreflang = inspectFetchedPublicSample(
      { path: "/bad-hreflang" },
      { siteUrl: "https://fermatmind.com" },
      "https://fermatmind.com/bad-hreflang",
      {
        response: { status: 200, headers: htmlHeaders },
        body: '<html><head><link rel="canonical" href="/bad-hreflang"><link rel="alternate" hreflang="en" href="http://[bad"></head></html>',
      },
    );
    expect(badHreflang.passed).toBe(false);
    expect(badHreflang.issues.map((issue: any) => issue.reason)).toContain("invalid_hreflang_url");

    const serverError = inspectFetchedPublicSample(
      { path: "/server-error" },
      { siteUrl: "https://fermatmind.com" },
      "https://fermatmind.com/server-error",
      {
        response: { status: 500, headers: htmlHeaders },
        body: '<html><head><link rel="canonical" href="/server-error"></head><body>error</body></html>',
      },
    );
    expect(serverError.passed).toBe(false);
    expect(serverError.status).toBe(500);
    expect(serverError.issues.map((issue: any) => issue.reason)).toContain("http_error_status");
  });

  it("blocks recommendation runner and handoff on malformed input JSON without CMS/search/deploy side effects", () => {
    const dir = makeRepoTempDir("security-122-web-15-runners");
    const badInput = path.join(dir, "bad-input.json");
    fs.writeFileSync(badInput, '{"selected_for_auto_runner":');

    const runnerJson = path.join(dir, "runner.json");
    const runnerMd = path.join(dir, "runner.md");
    const runnerCsv = path.join(dir, "runner.csv");
    const runnerResult = runNode([
      "scripts/seo/personality-agent-recommendation-auto-runner.mjs",
      `--opportunity-ranker=${badInput}`,
      `--output-json=${runnerJson}`,
      `--output-md=${runnerMd}`,
      `--output-csv=${runnerCsv}`,
    ]);

    expect(runnerResult.status).toBe(1);
    expect(runnerResult.stderr).not.toMatch(/SyntaxError|at JSON\.parse/);
    const runnerReport = readJson(runnerJson);
    expect(runnerReport.final_decision).toBe("NO_GO_RECOMMENDATION_AUTO_RUNNER_BLOCKED");
    expect(runnerReport.blockers.join("\n")).toContain("invalid_input_json");
    expect(runnerReport.safety_boundary).toMatchObject({
      cms_write_attempted: false,
      approval_queue_write_attempted: false,
      search_queue_mutation_attempted: false,
      sitemap_llms_mutation_attempted: false,
      production_deploy_attempted: false,
    });

    const handoffJson = path.join(dir, "handoff-report.json");
    const handoffMd = path.join(dir, "handoff.md");
    const handoffPackage = path.join(dir, "handoff-package.json");
    const handoffResult = runNode([
      "scripts/seo/personality-agent-auto-qa-and-approval-handoff.mjs",
      `--input=${badInput}`,
      `--output-json=${handoffJson}`,
      `--output-md=${handoffMd}`,
      `--output-handoff=${handoffPackage}`,
    ]);

    expect(handoffResult.status).toBe(1);
    expect(handoffResult.stderr).not.toMatch(/SyntaxError|at JSON\.parse/);
    const handoffReport = readJson(handoffJson);
    expect(handoffReport.final_decision).toBe("NO_GO_AUTO_QA_OR_HANDOFF_BLOCKED");
    expect(handoffReport.blockers.join("\n")).toContain("invalid_input_json");
    expect(handoffReport.safety_boundary).toMatchObject({
      approval_queue_write_attempted: false,
      cms_write_attempted: false,
      search_queue_mutation_attempted: false,
      sitemap_llms_mutation_attempted: false,
      production_deploy_attempted: false,
    });
  });

  it("keeps tracked diff scope inside SECURITY-122-WEB-15", () => {
    for (const file of changedFiles()) {
      expect(isSecurity122Web15AllowedFile(file), file).toBe(true);
    }
  });
});
