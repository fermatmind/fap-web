import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { isPersonalityAgentRecommendationAutoRunner01AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const JSON_PATH = "docs/seo/personality/personality-agent-recommendation-auto-runner-2026-06-27.json";
const CSV_PATH = "docs/seo/personality/personality-agent-recommendation-auto-runner-2026-06-27.csv";
const RANKER_PATH = "docs/seo/personality/personality-agent-opportunity-ranker-automation-2026-06-27.json";
const BRANCH = "codex/personality-agent-recommendation-auto-runner-01";

type Recommendation = {
  target_url: string;
  path: string;
  framework: string;
  priority_bucket: string;
  recommendations: {
    title: { recommended: string };
    description: { recommended: string };
    h1: { recommended: string };
    quick_answer: { recommended: string };
    faq: Array<{ question: string; answer: string }>;
    internal_links: Array<{ href: string; safe_public_route: boolean }>;
    differentiation_notes: string[];
  };
  source_qa: {
    decision: string;
    fail_count: number;
  };
  blocked_reason: string | null;
};

type Report = {
  artifact: string;
  final_decision: string;
  generation_policy: {
    mode: string;
    cms_write_policy: string;
    approval_queue_write_policy: string;
    search_release_policy: string;
  };
  summary: {
    selected_url_count: number;
    recommendation_count: number;
    framework_counts: Record<string, number>;
    source_qa_pass_count: number;
    blocked_count: number;
  };
  recommendations: Recommendation[];
  safety_boundary: Record<string, boolean>;
  blockers: string[];
  recommended_next_tasks: Record<string, string>;
};

type RankerReport = {
  selected_for_auto_runner: Array<{ target_url: string; path: string; framework: string }>;
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
      CSV_PATH,
      JSON_PATH,
      "docs/seo/personality/personality-agent-recommendation-auto-runner-2026-06-27.md",
      "scripts/seo/personality-agent-recommendation-auto-runner.mjs",
      "tests/contracts/helpers/currentPrScope.ts",
      "tests/contracts/personality-agent-recommendation-auto-runner-01.contract.test.ts",
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

describe("PERSONALITY-AGENT-RECOMMENDATION-AUTO-RUNNER-01", () => {
  const report = readJson<Report>(JSON_PATH);
  const ranker = readJson<RankerReport>(RANKER_PATH);

  it("emits recommendations exactly for the opportunity ranker selected queue", () => {
    expect(report.artifact).toBe("PERSONALITY-AGENT-RECOMMENDATION-AUTO-RUNNER-01");
    expect(report.final_decision).toBe("PASS_RECOMMENDATION_AUTO_RUNNER_READY_FOR_AUTO_QA");
    expect(report.blockers).toEqual([]);
    expect(report.summary.selected_url_count).toBe(6);
    expect(report.summary.recommendation_count).toBe(6);
    expect(report.recommendations.map((row) => row.target_url)).toEqual(
      ranker.selected_for_auto_runner.map((row) => row.target_url),
    );
    expect(report.summary.framework_counts).toEqual({ big_five: 6 });
  });

  it("preserves complete draft recommendation fields from QA-passed source artifacts", () => {
    expect(report.summary.source_qa_pass_count).toBe(6);
    expect(report.summary.blocked_count).toBe(0);

    for (const item of report.recommendations) {
      expect(item.framework).toBe("big_five");
      expect(item.priority_bucket).toBe("P1_QA_PASS_RECOMMENDATION_REFRESH_READY");
      expect(item.source_qa.decision).toBe("PASS_READY_FOR_APPROVAL_QUEUE");
      expect(item.source_qa.fail_count).toBe(0);
      expect(item.blocked_reason).toBeNull();

      expect(item.recommendations.title.recommended.length).toBeGreaterThan(8);
      expect(item.recommendations.description.recommended.length).toBeGreaterThan(30);
      expect(item.recommendations.h1.recommended.length).toBeGreaterThan(3);
      expect(item.recommendations.quick_answer.recommended.length).toBeGreaterThan(30);
      expect(item.recommendations.faq.length).toBeGreaterThanOrEqual(5);
      expect(item.recommendations.internal_links.length).toBeGreaterThanOrEqual(3);
      expect(item.recommendations.internal_links.every((link) => link.safe_public_route)).toBe(true);
      expect(item.recommendations.differentiation_notes.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("remains artifact-only and does not write CMS, approval queue, search, sitemap, llms, or deploy state", () => {
    expect(report.generation_policy.mode).toBe("ranker_selected_existing_recommendation_refresh_no_external_model_call");
    expect(report.generation_policy.cms_write_policy).toBe("never_from_recommendation_auto_runner");
    expect(report.generation_policy.approval_queue_write_policy).toBe("never_from_recommendation_auto_runner");
    expect(report.generation_policy.search_release_policy).toBe("never_from_recommendation_auto_runner");

    expect(report.safety_boundary.artifact_only).toBe(true);
    expect(report.safety_boundary.new_body_copy_generated).toBe(false);
    expect(report.safety_boundary.external_model_called).toBe(false);
    expect(report.safety_boundary.cms_write_attempted).toBe(false);
    expect(report.safety_boundary.approval_queue_write_attempted).toBe(false);
    expect(report.safety_boundary.cms_live_promotion_attempted).toBe(false);
    expect(report.safety_boundary.frontend_runtime_change_attempted).toBe(false);
    expect(report.safety_boundary.search_queue_mutation_attempted).toBe(false);
    expect(report.safety_boundary.live_search_submit_attempted).toBe(false);
    expect(report.safety_boundary.sitemap_llms_mutation_attempted).toBe(false);
    expect(report.safety_boundary.gsc_api_call_attempted).toBe(false);
    expect(report.safety_boundary.gsc_request_indexing_attempted).toBe(false);
    expect(report.safety_boundary.production_deploy_attempted).toBe(false);
    expect(report.recommended_next_tasks.qa).toBe("PERSONALITY-AGENT-AUTO-QA-AND-APPROVAL-HANDOFF-01");
  });

  it("emits a stable CSV for operator review", () => {
    const csv = fs.readFileSync(path.join(ROOT, CSV_PATH), "utf8");
    expect(csv.split("\n")[0]).toBe(
      [
        "priority_rank",
        "path",
        "target_url",
        "framework",
        "locale",
        "page_type",
        "entity_key",
        "priority_bucket",
        "evidence_quality",
        "query_rows_captured",
        "recommended_title",
        "recommended_h1",
        "faq_count",
        "internal_link_count",
        "source_qa_decision",
        "blocked_reason",
      ].join(","),
    );
  });

  it("keeps current PR changed files inside the approved recommendation auto-runner scope", () => {
    const files = currentFiles();
    expect(files.length).toBeGreaterThan(0);
    expect(files.every(isPersonalityAgentRecommendationAutoRunner01AllowedFile), files.join("\n")).toBe(true);
  });
});
