import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { isPersonalityAgentAutoQaAndApprovalHandoff01AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const QA_PATH = "docs/seo/personality/personality-agent-auto-qa-and-approval-handoff-2026-06-27.json";
const HANDOFF_PATH = "docs/seo/personality/personality-agent-auto-approval-handoff-package-2026-06-27.json";
const BRANCH = "codex/personality-agent-auto-qa-and-approval-handoff-01";

type PageResult = {
  target_url: string;
  path: string;
  framework: string;
  decision: string;
  gates: Record<string, string>;
  blockers: string[];
  recommendation_sha256: string;
};

type QaReport = {
  artifact: string;
  final_decision: string;
  scope: string;
  summary: {
    checked_recommendation_count: number;
    pass_ready_for_approval_handoff_count: number;
    blocked_count: number;
    framework_counts: Record<string, number>;
    duplicate_signature_group_count: number;
  };
  gate_rollup: Record<string, number>;
  page_results: PageResult[];
  safety_boundary: Record<string, boolean>;
  blockers: string[];
  recommended_next_task: string;
};

type HandoffPackage = {
  artifact: string;
  final_decision: string;
  handoff_policy: {
    pass_only: boolean;
    production_queue_write_policy: string;
    cms_write_policy: string;
    search_release_policy: string;
  };
  summary: {
    recommendation_count: number;
    framework_counts: Record<string, number>;
    blocked_source_count: number;
  };
  recommendations: Array<{
    target_url: string;
    path: string;
    framework: string;
    recommendation_sha256: string;
    auto_qa_decision: string;
    auto_qa_gates: Record<string, string>;
  }>;
  safety_boundary: Record<string, boolean>;
  blockers: string[];
};

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8")) as T;
}

function changedFiles(): string[] {
  const commands = [
    ["diff", "--name-only", "origin/main...HEAD"],
    ["diff", "--name-only"],
    ["diff", "--cached", "--name-only"],
  ];

  return Array.from(
    new Set(
      commands.flatMap((args) => {
        try {
          return execFileSync("git", args, {
            cwd: ROOT,
            encoding: "utf8",
            stdio: ["ignore", "pipe", "ignore"],
          })
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);
        } catch {
          return [];
        }
      }),
    ),
  ).sort();
}

function currentFiles(): string[] {
  if (process.env.GITHUB_ACTIONS === "true" && process.env.GITHUB_HEAD_REF === BRANCH) {
    return [
      "docs/codex/pr-train-state.json",
      "docs/codex/pr-train.yaml",
      QA_PATH,
      "docs/seo/personality/personality-agent-auto-qa-and-approval-handoff-2026-06-27.md",
      HANDOFF_PATH,
      "scripts/seo/personality-agent-auto-qa-and-approval-handoff.mjs",
      "tests/contracts/helpers/currentPrScope.ts",
      "tests/contracts/personality-agent-auto-qa-and-approval-handoff-01.contract.test.ts",
    ];
  }

  const files = changedFiles();
  if (files.length > 0) return files;

  return execFileSync("git", ["show", "--name-only", "--format=", "HEAD"], {
    cwd: ROOT,
    encoding: "utf8",
  })
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .sort();
}

describe("PERSONALITY-AGENT-AUTO-QA-AND-APPROVAL-HANDOFF-01", () => {
  const qa = readJson<QaReport>(QA_PATH);
  const handoff = readJson<HandoffPackage>(HANDOFF_PATH);

  it("passes all selected recommendations through auto QA for approval handoff", () => {
    expect(qa.artifact).toBe("PERSONALITY-AGENT-AUTO-QA-AND-APPROVAL-HANDOFF-01");
    expect(qa.final_decision).toBe("PASS_READY_FOR_APPROVAL_HANDOFF_DRY_RUN");
    expect(qa.blockers).toEqual([]);
    expect(qa.summary.checked_recommendation_count).toBe(6);
    expect(qa.summary.pass_ready_for_approval_handoff_count).toBe(6);
    expect(qa.summary.blocked_count).toBe(0);
    expect(qa.summary.framework_counts).toEqual({ big_five: 6 });
    expect(qa.summary.duplicate_signature_group_count).toBe(0);
    expect(qa.page_results.every((row) => row.decision === "PASS_READY_FOR_APPROVAL_HANDOFF")).toBe(true);
  });

  it("keeps framework QA gates green", () => {
    for (const count of Object.values(qa.gate_rollup)) {
      expect(count).toBe(0);
    }
    for (const result of qa.page_results) {
      expect(result.framework).toBe("big_five");
      expect(result.blockers).toEqual([]);
      expect(result.gates).toMatchObject({
        schema_validation: "pass",
        dimensional_model_gate: "pass",
        no_official_big_five_32_ocean_type_gate: "pass",
        no_high_low_good_bad_framing_gate: "pass",
        claim_risk_gate: "pass",
        duplicate_template_gate: "pass",
        private_route_gate: "pass",
        result_page_leakage_gate: "pass",
        seo_projection_gate: "pass",
        bilingual_consistency_gate: "pass",
      });
      expect(result.recommendation_sha256).toMatch(/^[a-f0-9]{64}$/);
    }
  });

  it("emits a PASS-only approval handoff package without writing production approval queue", () => {
    expect(handoff.artifact).toBe("PERSONALITY-AGENT-AUTO-APPROVAL-HANDOFF-PACKAGE-01");
    expect(handoff.final_decision).toBe("PASS_APPROVAL_HANDOFF_PACKAGE_READY_FOR_DRY_RUN");
    expect(handoff.blockers).toEqual([]);
    expect(handoff.handoff_policy.pass_only).toBe(true);
    expect(handoff.handoff_policy.production_queue_write_policy).toBe("not_allowed_from_this_pr");
    expect(handoff.summary.recommendation_count).toBe(6);
    expect(handoff.summary.framework_counts).toEqual({ big_five: 6 });
    expect(handoff.summary.blocked_source_count).toBe(0);
    expect(handoff.recommendations).toHaveLength(6);
    expect(handoff.recommendations.every((row) => row.auto_qa_decision === "PASS_READY_FOR_APPROVAL_HANDOFF")).toBe(true);
    expect(handoff.recommendations.every((row) => row.recommendation_sha256.match(/^[a-f0-9]{64}$/))).toBe(true);
  });

  it("preserves the no-write safety boundary", () => {
    expect(qa.scope).toContain("No production approval queue write");
    expect(qa.safety_boundary.artifact_only).toBe(true);
    expect(qa.safety_boundary.approval_queue_write_attempted).toBe(false);
    expect(qa.safety_boundary.cms_write_attempted).toBe(false);
    expect(qa.safety_boundary.cms_live_promotion_attempted).toBe(false);
    expect(qa.safety_boundary.frontend_runtime_change_attempted).toBe(false);
    expect(qa.safety_boundary.search_queue_mutation_attempted).toBe(false);
    expect(qa.safety_boundary.live_search_submit_attempted).toBe(false);
    expect(qa.safety_boundary.sitemap_llms_mutation_attempted).toBe(false);
    expect(qa.safety_boundary.gsc_api_call_attempted).toBe(false);
    expect(qa.safety_boundary.gsc_request_indexing_attempted).toBe(false);
    expect(qa.safety_boundary.production_deploy_attempted).toBe(false);
    expect(handoff.safety_boundary.approval_queue_write_attempted).toBe(false);
  });

  it("keeps current PR changed files inside the approved auto-QA handoff scope", () => {
    const files = currentFiles();
    expect(files.length).toBeGreaterThan(0);
    expect(files.every(isPersonalityAgentAutoQaAndApprovalHandoff01AllowedFile), files.join("\n")).toBe(true);
  });
});
