import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const EXAMPLE_REQUEST = "docs/seo/agent/examples/seo-agent-fapweb-code-pr-request.example.json";

type CodePrRequest = {
  schema_version: string;
  request_id: string;
  fix_type: string;
  scope_summary: string;
  base_branch: string;
  branch_name: string;
  target_files: string[];
  evidence_refs: string[];
  direct_main_push_allowed: boolean;
  auto_deploy_allowed: boolean;
};

function readJson(relativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function writeTempRequest(mutator: (request: CodePrRequest) => void): string {
  const request = readJson(EXAMPLE_REQUEST) as CodePrRequest;
  mutator(request);
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "seo-agent-fapweb-code-pr-request-"));
  const filePath = path.join(tempDir, "request.json");
  fs.writeFileSync(filePath, JSON.stringify(request, null, 2));
  return filePath;
}

function runWriter(requestPath: string) {
  const artifactDir = fs.mkdtempSync(path.join(os.tmpdir(), "seo-agent-fapweb-code-pr-writer-"));
  try {
    const stdout = execFileSync(
      "node",
      [
        "scripts/seo/generate-seo-agent-fapweb-code-pr-writer.mjs",
        `--request=${requestPath}`,
        `--artifact-dir=${artifactDir}`,
        "--json",
      ],
      { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    );
    return { status: 0, stdout, artifactDir };
  } catch (error) {
    const execError = error as { status?: number; stdout?: Buffer | string };
    return { status: execError.status ?? 1, stdout: String(execError.stdout || ""), artifactDir };
  }
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
  "docs/seo/agent/FAPWEB_CODE_PR_WRITER.md",
  "docs/seo/agent/examples/seo-agent-fapweb-code-pr-request.example.json",
  "docs/seo/generated/seo-agent-fapweb-code-pr-writer.v1.json",
  "scripts/seo/generate-seo-agent-fapweb-code-pr-writer.mjs",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/quiz-pack-performance-hotfix.contract.test.ts",
  "tests/contracts/seo-agent-fapweb-code-pr-writer.contract.test.ts",
]);

describe("SEO Agent fap-web code PR writer", () => {
  it("emits a PR-only plan for the example request", () => {
    const result = runWriter(path.join(ROOT, EXAMPLE_REQUEST));
    const report = JSON.parse(result.stdout);
    const artifact = JSON.parse(fs.readFileSync(report.artifact_path, "utf8"));

    expect(result.status).toBe(0);
    expect(report.ok).toBe(true);
    expect(report.summary).toMatchObject({
      pr_required: true,
      direct_main_push_allowed: false,
      auto_deploy_allowed: false,
    });
    expect(artifact).toMatchObject({
      schema_version: "seo-agent-fapweb-code-pr-writer.v1",
      mode: "pr_plan_only",
      pr_policy: {
        base_branch: "main",
        branch_prefix: "codex/",
        direct_main_push_allowed: false,
        auto_deploy_allowed: false,
        pr_required: true,
        human_review_required: true,
      },
    });
    expect(artifact.boundaries).toMatchObject({
      github_pr_created_by_runner: false,
      cms_write_allowed: false,
      search_channel_submit_allowed: false,
      indexing_request_allowed: false,
    });
  });

  it("rejects non-codex branches and direct deployment permission", () => {
    const requestPath = writeTempRequest((request) => {
      request.branch_name = "main";
      request.auto_deploy_allowed = true;
    });
    const result = runWriter(requestPath);

    expect(result.status).not.toBe(0);
    expect(result.stdout).toContain("branch_name must use codex/ prefix");
    expect(result.stdout).toContain("auto_deploy_allowed must be false");
  });

  it("rejects frontend content or generated artifact hand-edit targets", () => {
    const requestPath = writeTempRequest((request) => {
      request.target_files = [
        "public/editorial-copy.md",
        "docs/seo/generated/sitemap-diff-report.v1.json",
      ];
    });
    const result = runWriter(requestPath);

    expect(result.status).not.toBe(0);
    expect(result.stdout).toContain("public/editorial-copy.md");
    expect(result.stdout).toContain("docs/seo/generated/sitemap-diff-report.v1.json");
  });

  it("rejects raw URLs and secret markers in request input", () => {
    const requestPath = writeTempRequest((request) => {
      request.evidence_refs = ["https://fermatmind.com/private-path", "client_email"];
    });
    const result = runWriter(requestPath);

    expect(result.status).not.toBe(0);
    expect(result.stdout).toContain("forbidden secret/raw URL markers");
  });

  it("documents the contract and repository rule boundary", () => {
    const docs = fs.readFileSync(path.join(ROOT, "docs/seo/agent/FAPWEB_CODE_PR_WRITER.md"), "utf8");
    const generated = readJson("docs/seo/generated/seo-agent-fapweb-code-pr-writer.v1.json");
    const pkg = fs.readFileSync(path.join(ROOT, "package.json"), "utf8");

    expect(docs).toContain("PR-only");
    expect(docs).toContain("direct_main_push_allowed=false");
    expect(docs).toContain("auto_deploy_allowed=false");
    expect(docs).toContain("does not add frontend editorial fallback content");
    expect(generated.negative_guarantees).toMatchObject({
      direct_main_push_allowed: false,
      auto_deploy_allowed: false,
      cms_write_allowed: false,
      search_channel_submit_allowed: false,
      indexing_request_allowed: false,
    });
    expect(pkg).toContain("\"seo-agent:fapweb-code-pr-writer\"");
  });

  it("keeps current PR changed files inside the approved fap-web code writer scope", () => {
    const files = changedFiles();

    if (files.length === 0) {
      expect(files).toEqual([]);
      return;
    }

    expect(
      files.every((file) => allowedFiles.has(file) || isCurrentRiasecPack12AllowedFile(file)),
      files.join("\n"),
    ).toBe(true);
  });
});
