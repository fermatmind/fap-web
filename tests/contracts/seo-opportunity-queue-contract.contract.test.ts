import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  isSeoCmsDraftPackageContract01AllowedFile,
  isSeoOpportunityQueueContract01AllowedFile,
  isSeoWeeklyAutomationControlPacket02AllowedFile,
} from "./helpers/currentPrScope";

const ROOT = process.cwd();
const CONTRACT_PATH = "docs/seo/agent/examples/seo-opportunity-queue-contract.example.json";

type OpportunityQueueContractFixture = {
  mode: string;
  source_gate: {
    requires_gsc_quality_gate: boolean;
    allows_fixture_or_mock_gsc: boolean;
    allows_stale_gsc: boolean;
  };
  opportunities: Array<{
    id: string;
    evidence_sources: Array<{
      source_class: string;
      evidence_label: string;
    }>;
    scoring_inputs: Record<string, number>;
    score: number;
    status: string;
    recommended_lane: string;
    blocked_actions: string[];
  }>;
  forbidden_actions: string[];
  approval_boundaries: string[];
};

function readContract(): OpportunityQueueContractFixture {
  return JSON.parse(fs.readFileSync(path.join(ROOT, CONTRACT_PATH), "utf8")) as OpportunityQueueContractFixture;
}

function writeTempContract(contract: OpportunityQueueContractFixture): string {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "seo-opportunity-queue-contract-"));
  const filePath = path.join(tempDir, "contract.json");
  fs.writeFileSync(filePath, JSON.stringify(contract, null, 2));
  return filePath;
}

function runChecker(contractPath: string): { status: number; stdout: string } {
  try {
    const stdout = execFileSync("node", ["scripts/seo/check-seo-opportunity-queue-contract.mjs", contractPath], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { status: 0, stdout };
  } catch (error) {
    const execError = error as { status?: number; stdout?: Buffer | string };
    return { status: execError.status ?? 1, stdout: String(execError.stdout || "") };
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

describe("SEO opportunity queue contract", () => {
  it("accepts the example as contract-only and non-executing", () => {
    const result = runChecker(CONTRACT_PATH);
    const report = JSON.parse(result.stdout);

    expect(result.status).toBe(0);
    expect(report.passed).toBe(true);
    expect(report.boundaries).toMatchObject({
      queue_generated: false,
      cms_or_search_writes_attempted: false,
      provider_calls_attempted: false,
      runtime_seo_changes_attempted: false,
      network_calls_attempted: false,
    });
  });

  it("requires verified GSC quality gate before review-ready opportunities", () => {
    const contract = readContract();
    contract.source_gate.allows_fixture_or_mock_gsc = true;
    contract.opportunities[0].evidence_sources[0].source_class = "GSC_MOCK";
    contract.opportunities[0].evidence_sources[0].evidence_label = "MOCK";
    contract.opportunities[0].status = "READY_FOR_REVIEW";
    const result = runChecker(writeTempContract(contract));

    expect(result.status).not.toBe(0);
    expect(result.stdout).toContain("allows_fixture_or_mock_gsc");
    expect(result.stdout).toContain("unverified evidence cannot produce review-ready opportunity");
  });

  it("requires deterministic additive score components", () => {
    const contract = readContract();
    contract.opportunities[0].scoring_inputs.implementation_risk = 8;
    contract.opportunities[0].score = 999;
    const result = runChecker(writeTempContract(contract));

    expect(result.status).not.toBe(0);
    expect(result.stdout).toContain("implementation_risk must be zero or negative");
    expect(result.stdout).toContain("score must equal sum of scoring_inputs");
  });

  it("preserves CMS, search provider, and runtime SEO forbidden actions", () => {
    const docs = fs.readFileSync(path.join(ROOT, "docs/seo/agent/OPPORTUNITY_QUEUE_CONTRACT.md"), "utf8");
    const script = fs.readFileSync(path.join(ROOT, "scripts/seo/check-seo-opportunity-queue-contract.mjs"), "utf8");
    const pkg = fs.readFileSync(path.join(ROOT, "package.json"), "utf8");

    expect(docs).toContain("does not implement queue generation");
    expect(docs).toContain("Search Channel enqueue");
    expect(script).toContain("queue_generated: false");
    expect(script).toContain("runtime_seo_changes_attempted: false");
    expect(pkg).toContain("\"seo:opportunity-queue-contract\"");
  });

  it("rejects missing exact approval boundaries", () => {
    const contract = readContract();
    contract.approval_boundaries = ["APPROVE_EVERYTHING"];
    contract.opportunities[0].blocked_actions = ["manual review later"];
    const result = runChecker(writeTempContract(contract));

    expect(result.status).not.toBe(0);
    expect(result.stdout).toContain("AUTHORIZE_CMS_MUTATION");
    expect(result.stdout).toContain("AUTHORIZE_SEARCH_PROVIDER_SUBMISSION");
  });

  it("keeps current PR changed files inside the approved opportunity contract scope", () => {
    const files = changedFiles();

    if (files.length === 0) {
      expect(files).toEqual([]);
      return;
    }

    expect(
      files.every(
        (file) =>
          isSeoOpportunityQueueContract01AllowedFile(file) ||
          isSeoWeeklyAutomationControlPacket02AllowedFile(file) ||
          isSeoCmsDraftPackageContract01AllowedFile(file),
      ),
      files.join("\n"),
    ).toBe(true);
  });
});
