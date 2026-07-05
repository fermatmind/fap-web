import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SCRIPT_PATH = "scripts/seo/build-mbti-gsc-19-submission-monitoring.mjs";
const JSON_PATH = "docs/seo/personality/mbti-gsc-19-submission-monitoring-2026-07-05.json";
const MD_PATH = "docs/seo/personality/mbti-gsc-19-submission-monitoring-2026-07-05.md";
const CSV_PATH = "docs/seo/personality/mbti-gsc-19-submission-monitoring-2026-07-05.csv";
const MBTI_GSC_19_BRANCH = "codex/mbti-gsc-19-submission-monitoring";

function read(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(read(relativePath)) as T;
}

function committedScopeFiles(): string[] {
  const files = new Set<string>();

  try {
    const output = execFileSync("git", ["diff", "--name-only", "origin/main...HEAD"], {
      cwd: ROOT,
      encoding: "utf8",
    });
    for (const line of output.split("\n")) {
      if (line.trim()) files.add(line.trim());
    }
  } catch {
    // Local explicit scope validation is the fallback in shallow CI checkouts.
  }

  return [...files].sort();
}

function currentBranchName(): string {
  const githubHeadRef = process.env.GITHUB_HEAD_REF?.trim();
  if (githubHeadRef) return githubHeadRef;

  const githubRefName = process.env.GITHUB_REF_NAME?.trim();
  if (githubRefName && !/^\d+\/merge$/.test(githubRefName)) return githubRefName;

  try {
    return execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
      cwd: ROOT,
      encoding: "utf8",
    }).trim();
  } catch {
    return "";
  }
}

type Gsc19Report = {
  id: string;
  artifact: string;
  final_decision: string;
  summary: {
    monitored_url_count: number;
    profile_url_count: number;
    comparison_url_count: number;
    confirmed_query_url_count: number;
    pending_query_url_count: number;
    gsc_submit_now_count: number;
    sitemap_submission_now_count: number;
    url_inspection_request_now_count: number;
  };
  submission_readiness: {
    sitemap_submission_decision: string;
    url_inspection_decision: string;
    reason: string;
    required_before_live_gsc_mutation: string[];
  };
  monitoring_plan: {
    baseline_date: string;
    windows: Array<{ label: string; date: string; purpose: string }>;
    metrics: string[];
    cohort_rule: string;
  };
  safety_boundary: Record<string, boolean>;
  rows: Array<{
    target_path: string;
    target_url: string;
    asset_kind: "profile" | "comparison";
    query_evidence_status: string;
    primary_query: string;
    index18_decision: string;
    next_action: string;
  }>;
  blockers: string[];
};

describe("MBTI-GSC-19 submission and monitoring", () => {
  it("generates a deterministic no-submit monitoring artifact from INDEX18 and GSC11", () => {
    execFileSync("node", [SCRIPT_PATH], { cwd: ROOT, encoding: "utf8" });

    const report = readJson<Gsc19Report>(JSON_PATH);
    const markdown = read(MD_PATH);
    const csv = read(CSV_PATH);

    expect(report.id).toBe("MBTI-GSC-19");
    expect(report.artifact).toBe("MBTI-GSC-19-SUBMISSION-MONITORING");
    expect(report.final_decision).toBe("PASS_MBTI_GSC_19_MONITORING_READY_GSC_SUBMISSION_HELD");
    expect(report.summary).toMatchObject({
      monitored_url_count: 10,
      profile_url_count: 5,
      comparison_url_count: 5,
      gsc_submit_now_count: 0,
      sitemap_submission_now_count: 0,
      url_inspection_request_now_count: 0,
    });
    expect(markdown).toContain("This is a GSC submission-readiness and monitoring artifact");
    expect(csv.split(/\r?\n/)[0]).toBe(
      "target_path,asset_kind,query_evidence_status,primary_query,baseline_clicks,baseline_impressions,baseline_ctr,baseline_position,index18_decision,next_action",
    );
  });

  it("holds live GSC mutation until INDEX18 allows URLs and operator authorization exists", () => {
    const report = readJson<Gsc19Report>(JSON_PATH);

    expect(report.submission_readiness.sitemap_submission_decision).toBe("hold_do_not_submit_sitemap");
    expect(report.submission_readiness.url_inspection_decision).toBe("hold_do_not_request_indexing");
    expect(report.submission_readiness.reason).toContain("INDEX-18 held all sitemap/llms/GSC expansion");
    expect(report.submission_readiness.required_before_live_gsc_mutation).toEqual(
      expect.arrayContaining([
        "INDEX-18 or successor gate returns gsc_submit_now_count > 0",
        "operator gives explicit same-turn authorization for live GSC mutation",
      ]),
    );
    expect(report.blockers).toEqual(
      expect.arrayContaining([
        "index18_gsc_submit_now_count_is_zero",
        "index18_no_ready_to_submit_records",
        "sitemap_runtime_expansion_not_allowed",
        "llms_runtime_expansion_not_allowed",
      ]),
    );
    expect(report.rows.every((row) => row.next_action === "hold_until_index18_allows_gsc_submission_after_backend_promotion")).toBe(
      true,
    );
  });

  it("defines 7, 14, and 28 day monitoring windows with query metrics", () => {
    const report = readJson<Gsc19Report>(JSON_PATH);

    expect(report.monitoring_plan.baseline_date).toBe("2026-07-05");
    expect(report.monitoring_plan.windows.map((window) => window.label)).toEqual(["7d", "14d", "28d"]);
    expect(report.monitoring_plan.metrics).toEqual(
      expect.arrayContaining([
        "clicks",
        "impressions",
        "ctr",
        "average_position",
        "top_queries",
        "page_query_rows",
        "coverage_or_indexing_status",
      ]),
    );
    expect(report.monitoring_plan.cohort_rule).toContain("do not expand to new URLs");
  });

  it("keeps GSC, CMS, runtime, and deploy safety boundaries closed", () => {
    const report = readJson<Gsc19Report>(JSON_PATH);

    expect(report.safety_boundary).toMatchObject({
      artifact_only: true,
      gsc_api_call_attempted: false,
      gsc_sitemap_submission_attempted: false,
      gsc_url_inspection_attempted: false,
      gsc_request_indexing_attempted: false,
      search_console_browser_mutation_attempted: false,
      cms_write_attempted: false,
      production_import_attempted: false,
      sitemap_runtime_mutation_attempted: false,
      llms_runtime_mutation_attempted: false,
      frontend_runtime_change_attempted: false,
      frontend_local_editorial_fallback_added: false,
      staging_deploy_wait_attempted: false,
      production_deploy_attempted: false,
    });
  });

  it("keeps the PR scoped to GSC19 artifacts, contract, and train ledger", () => {
    const branch = currentBranchName();
    if (branch !== MBTI_GSC_19_BRANCH) {
      expect(branch).not.toBe(MBTI_GSC_19_BRANCH);
      return;
    }

    const allowedPatterns = [
      /^docs\/seo\/personality\/mbti-gsc-19-/,
      /^scripts\/seo\/build-mbti-gsc-19-/,
      /^tests\/contracts\/mbti-gsc-19-/,
      /^docs\/codex\/pr-train\.yaml$/,
      /^docs\/codex\/pr-train-state\.json$/,
      /^generated\/pr-train-sidecar-issues\//,
    ];
    const outsideScope = committedScopeFiles().filter(
      (file) => !allowedPatterns.some((pattern) => pattern.test(file)),
    );

    expect(outsideScope).toEqual([]);
  });
});
