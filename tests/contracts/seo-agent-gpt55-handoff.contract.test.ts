import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  isSeoGpt55Handoff01AllowedFile,
  isSeoWeeklyAutomationControlPacket02AllowedFile,
} from "./helpers/currentPrScope";

const ROOT = process.cwd();
const REVIEW_PATH = "docs/seo/agent/examples/gpt55-review-response.example.json";
const PACKET_PATH = "docs/seo/agent/examples/seo-agent-control-packet.weekly.example.json";

type ReviewFixture = {
  verdict: string;
  evidence_used: Array<{
    evidence_id: string;
    source_class: string;
    how_used: string;
  }>;
  ranked_actions: Array<{
    recommendation: string;
  }>;
  claim_risks: Array<{
    risk: string;
    severity: string;
    recommendation: string;
  }>;
  approvals_required: Array<{
    approval: string;
    why_required: string;
  }>;
};

function readJson(relativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function runChecker(reviewPath: string): { status: number; stdout: string } {
  try {
    const stdout = execFileSync(
      "node",
      ["scripts/seo/check-seo-agent-gpt55-handoff.mjs", reviewPath, "--packet", PACKET_PATH],
      { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
    );
    return { status: 0, stdout };
  } catch (error) {
    const execError = error as { status?: number; stdout?: Buffer | string };
    return { status: execError.status ?? 1, stdout: String(execError.stdout || "") };
  }
}

function withTempReview(mutator: (review: ReviewFixture) => void): string {
  const review = readJson(REVIEW_PATH) as ReviewFixture;
  mutator(review);
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "gpt55-review-"));
  const filePath = path.join(tempDir, "review.json");
  fs.writeFileSync(filePath, JSON.stringify(review, null, 2));
  return filePath;
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

describe("SEO Agent GPT 5.5 Pro review handoff", () => {
  it("accepts the example review as evidence-bound and non-executing", () => {
    const result = runChecker(REVIEW_PATH);
    const report = JSON.parse(result.stdout);

    expect(result.status).toBe(0);
    expect(report.passed).toBe(true);
    expect(report.boundaries).toMatchObject({
      cms_or_search_writes_attempted: false,
      provider_calls_attempted: false,
      network_calls_attempted: false,
      execution_authority_granted: false,
    });
  });

  it("rejects uncited or unknown evidence ids", () => {
    const invalidPath = withTempReview((review) => {
      review.evidence_used[0].evidence_id = "invented-gsc-clicks";
    });
    const result = runChecker(invalidPath);

    expect(result.status).not.toBe(0);
    expect(result.stdout).toContain("unknown packet evidence_id");
  });

  it("rejects inferred analytics as evidence", () => {
    const invalidPath = withTempReview((review) => {
      review.evidence_used[0].source_class = "INFERRED_ANALYTICS";
      review.evidence_used[0].how_used = "Inferred analytics from general SEO trend.";
    });
    const result = runChecker(invalidPath);

    expect(result.status).not.toBe(0);
    expect(result.stdout).toContain("inferred analytics");
  });

  it("blocks high-risk claim output from passing review", () => {
    const invalidPath = withTempReview((review) => {
      review.claim_risks.push({
        risk: "Guarantees career success from a personality type.",
        severity: "high",
        recommendation: "Do not publish this claim.",
      });
    });
    const result = runChecker(invalidPath);

    expect(result.status).not.toBe(0);
    expect(result.stdout).toContain("high claim risk");
  });

  it("does not let GPT 5.5 Pro authorize CMS or search execution", () => {
    const invalidPath = withTempReview((review) => {
      review.verdict = "GO_FOR_EXECUTION";
      review.ranked_actions[2].recommendation = "do_now";
      review.approvals_required = [];
    });
    const result = runChecker(invalidPath);

    expect(result.status).not.toBe(0);
    expect(result.stdout).toContain("must not approve execution");
    expect(result.stdout).toContain("sensitive lane cannot be recommended as do_now");
    expect(result.stdout).toContain("CMS mutations");
  });

  it("documents the paste-ready prompt and consumption boundary", () => {
    const packet = fs.readFileSync(path.join(ROOT, "docs/seo/agent/GPT55_REVIEW_PACKET.md"), "utf8");
    const schema = fs.readFileSync(path.join(ROOT, "docs/seo/agent/schemas/GPT55_REVIEW_RESPONSE.schema.json"), "utf8");

    expect(packet).toContain("Paste-ready GPT 5.5 Pro Review Prompt");
    expect(packet).toContain("You review only. You do not execute");
    expect(packet).toContain("AUTHORIZE_CMS_MUTATION");
    expect(packet).toContain("AUTHORIZE_SEARCH_PROVIDER_SUBMISSION");
    expect(schema).toContain("REVIEW_PASS_NON_EXECUTING");
    expect(schema).not.toContain("GO_FOR_EXECUTION");
  });

  it("keeps current PR changed files inside the approved GPT handoff scope", () => {
    const files = changedFiles();

    if (files.length === 0) {
      expect(files).toEqual([]);
      return;
    }

    expect(
      files.every((file) => isSeoGpt55Handoff01AllowedFile(file) || isSeoWeeklyAutomationControlPacket02AllowedFile(file)),
      files.join("\n")
    ).toBe(true);
  });
});
