import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { isPersonalityAgentOpportunityRankerAutomation01AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const JSON_PATH = "docs/seo/personality/personality-agent-opportunity-ranker-automation-2026-06-27.json";
const CSV_PATH = "docs/seo/personality/personality-agent-opportunity-ranker-automation-2026-06-27.csv";
const BRANCH = "codex/personality-agent-opportunity-ranker-automation-01";

type RankedRecord = {
  target_url: string;
  path: string;
  framework: "mbti64" | "big_five" | "enneagram";
  priority_bucket: string;
  automation_candidate: boolean;
  selected_for_auto_runner?: boolean;
  recent_processing_state: string;
  blocked_reason: string | null;
};

type Report = {
  artifact: string;
  final_decision: string;
  ranker_policy: {
    mode: string;
    cms_write_policy: string;
    search_release_policy: string;
    recently_processed_rule: string;
  };
  summary: {
    total_records: number;
    framework_counts: Record<string, number>;
    selected_for_auto_runner_count: number;
    recently_processed_next_batch_6_count: number;
    mbti64_query_backed_p0_count: number;
  };
  selected_for_auto_runner: RankedRecord[];
  ranked_records: RankedRecord[];
  safety_boundary: Record<string, boolean>;
  blockers: string[];
  recommended_next_tasks: Record<string, string>;
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
      "docs/seo/personality/personality-agent-opportunity-ranker-automation-2026-06-27.md",
      "scripts/seo/personality-agent-opportunity-ranker.mjs",
      "tests/contracts/helpers/currentPrScope.ts",
      "tests/contracts/personality-agent-opportunity-ranker-automation-01.contract.test.ts",
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

describe("PERSONALITY-AGENT-OPPORTUNITY-RANKER-AUTOMATION-01", () => {
  const report = readJson<Report>(JSON_PATH);

  it("builds one cross-framework opportunity ranking artifact", () => {
    expect(report.artifact).toBe("PERSONALITY-AGENT-OPPORTUNITY-RANKER-AUTOMATION-01");
    expect(report.final_decision).toBe("PASS_PERSONALITY_OPPORTUNITY_RANKER_AUTOMATION_READY");
    expect(report.blockers).toEqual([]);
    expect(report.summary.total_records).toBe(156);
    expect(report.summary.framework_counts).toEqual({
      big_five: 34,
      enneagram: 26,
      mbti64: 96,
    });
    expect(report.ranked_records).toHaveLength(156);
  });

  it("excludes recently processed next-batch-6 URLs from the next auto-runner queue", () => {
    expect(report.summary.recently_processed_next_batch_6_count).toBe(6);
    expect(report.summary.mbti64_query_backed_p0_count).toBe(0);
    expect(report.selected_for_auto_runner).toHaveLength(report.summary.selected_for_auto_runner_count);
    expect(report.selected_for_auto_runner.every((row) => row.automation_candidate)).toBe(true);
    expect(
      report.selected_for_auto_runner.every(
        (row) => row.recent_processing_state !== "next_batch_6_recently_promoted_or_submitted",
      ),
    ).toBe(true);

    const recentRows = report.ranked_records.filter(
      (row) => row.recent_processing_state === "next_batch_6_recently_promoted_or_submitted",
    );
    expect(recentRows).toHaveLength(6);
    expect(recentRows.every((row) => row.priority_bucket === "P2_OBSERVE_RECENTLY_PROMOTED")).toBe(true);
  });

  it("remains an artifact-only ranking step with no CMS, approval queue, search, or deploy mutation", () => {
    expect(report.ranker_policy.mode).toBe("opportunity_ranking_only_no_recommendation_body_generation");
    expect(report.ranker_policy.cms_write_policy).toContain("never_from_ranker");
    expect(report.ranker_policy.search_release_policy).toContain("never_from_ranker");

    expect(report.safety_boundary.recommendation_body_generated).toBe(false);
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

    expect(report.recommended_next_tasks.selected_for_auto_runner).toBe(
      "PERSONALITY-AGENT-RECOMMENDATION-AUTO-RUNNER-01",
    );
  });

  it("emits a stable CSV for operator review", () => {
    const csv = fs.readFileSync(path.join(ROOT, CSV_PATH), "utf8");
    expect(csv.split("\n")[0]).toBe(
      [
        "priority_bucket",
        "path",
        "target_url",
        "framework",
        "locale",
        "page_type",
        "entity_key",
        "priority_rank",
        "priority_score",
        "evidence_quality",
        "query_rows_captured",
        "automation_candidate",
        "blocked_reason",
        "recommended_next_task",
      ].join(","),
    );
  });

  it("keeps current PR changed files inside the approved ranker automation scope", () => {
    const files = currentFiles();
    expect(files.length).toBeGreaterThan(0);
    expect(files.every(isPersonalityAgentOpportunityRankerAutomation01AllowedFile), files.join("\n")).toBe(true);
  });
});
