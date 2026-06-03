import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const SCRIPT = "scripts/seo/generate-seo-issue-queue.mjs";
const ARTIFACT_PATH = path.join(ROOT, "docs/seo/generated/seo-issue-queue.v1.json");
const CSV_PATH = path.join(ROOT, "docs/seo/generated/seo-issue-queue.v1.csv");

type IssueQueueArtifact = {
  version: string;
  scope: string;
  status: string;
  generated_queue: {
    version: string;
    scope: string;
    run_mode: string;
    read_only: boolean;
    live_data_collected: boolean;
    network_access_enabled: boolean;
    sources: Record<string, string>;
    summary: {
      total_issues: number;
      issues_by_source_signal: Record<string, number>;
      issues_by_type: Record<string, number>;
      sample_only_issues: number;
    };
    risk_boundary: Record<string, boolean>;
    deferred_integrations: string[];
  };
  sample_issues: Array<Record<string, unknown>>;
  fields: { forbidden: string[]; csv_export_fields: string[] };
};

function runGenerator(args: string[] = []): IssueQueueArtifact {
  return JSON.parse(execFileSync("node", [SCRIPT, ...args], { cwd: ROOT, encoding: "utf8" })) as IssueQueueArtifact;
}

function readArtifact(): IssueQueueArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as IssueQueueArtifact;
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
      // CI and local checkout shapes differ; use whichever scoped diff source is available.
    }
  }
  return [...files].sort();
}

function isAllowedFile(file: string): boolean {
  return (
    [
      "docs/codex/pr-train.yaml",
      "docs/codex/pr-train-state.json",
      "docs/seo/seo-issue-queue-read-model.md",
      "docs/seo/generated/seo-issue-queue.v1.json",
      "docs/seo/generated/seo-issue-queue.v1.csv",
      "scripts/seo/generate-seo-issue-queue.mjs",
      "tests/contracts/seo-issue-queue.contract.test.ts",
      "tests/contracts/seo-issue-queue-generator.contract.test.ts",
      "tests/contracts/helpers/currentPrScope.ts",
    ].includes(file) || isCurrentRiasecPack12AllowedFile(file)
  );
}

describe("SEO issue queue read-only generator", () => {
  it("emits an offline sample queue from URL truth, competitor inventory, and mock signals", () => {
    const artifact = runGenerator();

    expect(artifact.version).toBe("seo_issue_queue.v1");
    expect(artifact.scope).toBe("SEO-ISSUE-QUEUE-00");
    expect(artifact.status).toBe("contract_design");
    expect(artifact.generated_queue).toMatchObject({
      version: "seo_issue_queue_generator.v1",
      scope: "SEO-ISSUE-QUEUE-01",
      run_mode: "offline_sample",
      read_only: true,
      live_data_collected: false,
      network_access_enabled: false,
    });
    expect(artifact.generated_queue.sources).toMatchObject({
      url_inventory: "docs/seo/generated/url-inventory.v1.json",
      competitor_url_inventory: "docs/seo/generated/competitor-url-inventory-generator.v1.json",
      cms_release: "mock_sample",
      cms_draft: "mock_sample",
      gsc: "mock_sample",
      baidu: "mock_sample",
      ga4: "mock_sample",
    });
    expect(artifact.generated_queue.summary.issues_by_source_signal).toEqual(
      expect.objectContaining({
        url_truth: expect.any(Number),
        competitor_url_inventory: expect.any(Number),
        cms_draft: 1,
        cms_release: 1,
        gsc: 1,
        baidu: 1,
        ga4: 1,
      })
    );
  });

  it("keeps all issues sanitized, sample-only, and non-mutating", () => {
    const artifact = runGenerator();
    const forbidden = new Set(artifact.fields.forbidden);

    expect(artifact.sample_issues.length).toBeGreaterThanOrEqual(8);
    expect(artifact.generated_queue.summary.total_issues).toBe(artifact.sample_issues.length);
    expect(artifact.generated_queue.summary.sample_only_issues).toBe(artifact.sample_issues.length);
    expect(artifact.sample_issues.every((issue) => issue.sample_only === true)).toBe(true);
    expect(artifact.sample_issues.every((issue) => (issue.risk_boundary as Record<string, boolean>).cms_write_allowed === false)).toBe(true);
    expect(artifact.sample_issues.every((issue) => (issue.risk_boundary as Record<string, boolean>).search_submission_allowed === false)).toBe(true);
    expect(artifact.sample_issues.some((issue) => issue.issue_type === "competitor_gap_candidate")).toBe(true);
    expect(artifact.sample_issues.some((issue) => issue.issue_type === "draft_public_leak")).toBe(true);

    for (const issue of artifact.sample_issues) {
      for (const key of Object.keys(issue)) {
        expect(forbidden.has(key), key).toBe(false);
      }
      expect(String(issue.canonical_url)).not.toMatch(/\/(account|orders|payment|result|share|token)(\/|$)/);
      expect(String(issue.evidence_summary)).not.toMatch(/@|raw cookie|bearer|checkout_url/i);
    }
  });

  it("writes JSON and CSV artifacts locally without mutating runtime surfaces", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "seo-issue-queue-generator-"));
    const jsonPath = path.join(dir, "queue.json");
    const csvPath = path.join(dir, "queue.csv");

    const generated = runGenerator(["--output", jsonPath, "--csv", csvPath, "--pretty"]);
    const written = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as IssueQueueArtifact;
    const csv = fs.readFileSync(csvPath, "utf8");

    expect(written.generated_queue.summary.total_issues).toBe(generated.generated_queue.summary.total_issues);
    expect(csv.split("\n")[0]).toBe(generated.fields.csv_export_fields.join(","));
    expect(csv).toContain("competitor_gap_candidate");
    expect(csv).toContain("draft_public_leak");
  });

  it("keeps the checked-in JSON and CSV aligned with the generator output", () => {
    const generated = runGenerator();
    const checkedIn = readArtifact();
    const checkedInCsv = fs.readFileSync(CSV_PATH, "utf8");

    expect(checkedIn.generated_queue).toEqual(generated.generated_queue);
    expect(checkedIn.sample_issues).toEqual(generated.sample_issues);
    expect(checkedInCsv.split("\n")[0]).toBe(checkedIn.fields.csv_export_fields.join(","));
    expect(checkedInCsv).toContain(checkedIn.sample_issues[0].issue_id as string);
  });

  it("keeps current PR scope limited to the read-only issue queue generator and contract metadata", () => {
    const files = changedFiles();

    if (files.length === 0) {
      expect(files).toEqual([]);
      return;
    }

    if (files.every(isCurrentRiasecPack12AllowedFile)) {
      return;
    }

    expect(files).toEqual(expect.arrayContaining(["docs/codex/pr-train.yaml", "docs/codex/pr-train-state.json"]));
    expect(files.every(isAllowedFile), files.join("\n")).toBe(true);
  });
});
