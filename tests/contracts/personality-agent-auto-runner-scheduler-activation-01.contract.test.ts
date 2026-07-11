import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const WORKFLOW_PATH = ".github/workflows/personality-agent-auto-runner.yml";
const ACTIVATION_REPORT_PATH =
  "docs/seo/personality/personality-agent-auto-runner-scheduler-activation-2026-06-24.json";
const SCRIPT_PATH = "scripts/seo/run-personality-agent-auto-runner.mjs";

function read(file: string): string {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

function readJson<T>(file: string): T {
  return JSON.parse(read(file)) as T;
}

function runScheduledArtifactMode(): Record<string, unknown> {
  const artifactDir = fs.mkdtempSync(path.join(os.tmpdir(), "personality-agent-auto-runner-"));
  const outputJson = path.join(artifactDir, "runner.json");
  const outputMd = path.join(artifactDir, "runner.md");
  const outputCsv = path.join(artifactDir, "runner.csv");

  execFileSync(
    "node",
    [
      SCRIPT_PATH,
      "--generated-date=2026-06-24",
      "--scheduler-activation=scheduled_actions_artifact_only_enabled",
      `--output-json=${outputJson}`,
      `--output-md=${outputMd}`,
      `--output-csv=${outputCsv}`,
    ],
    { cwd: ROOT, encoding: "utf8" },
  );

  const output = JSON.parse(fs.readFileSync(outputJson, "utf8")) as Record<string, unknown>;
  expect(fs.existsSync(outputMd)).toBe(true);
  expect(fs.existsSync(outputCsv)).toBe(true);

  return output;
}

describe("PERSONALITY-AGENT-AUTO-RUNNER-SCHEDULER-ACTIVATION-01", () => {
  it("activates a weekday workflow_dispatch scheduler that only uploads artifacts", () => {
    const workflow = read(WORKFLOW_PATH);

    expect(workflow).toContain("name: Personality Agent Auto Runner");
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).toContain("schedule:");
    expect(workflow).toContain('cron: "23 2 * * 1-5"');
    expect(workflow).toContain("permissions:\n  contents: read");
    expect(workflow).toMatch(/actions\/checkout@[0-9a-f]{40} # v6/);
    expect(workflow).toMatch(/actions\/setup-node@[0-9a-f]{40} # v6/);
    expect(workflow).toMatch(/actions\/upload-artifact@[0-9a-f]{40} # v4/);
    expect(workflow).toContain("scripts/seo/run-personality-agent-auto-runner.mjs");
    expect(workflow).toContain("--scheduler-activation=scheduled_actions_artifact_only_enabled");
    expect(workflow).toContain("jq empty");

    expect(workflow).not.toContain("environment:");
    expect(workflow).not.toContain("secrets.");
    expect(workflow).not.toMatch(/\bgit\s+push\b/);
    expect(workflow).not.toContain("gh pr create");
    expect(workflow).not.toMatch(/\bdeploy\b/i);
    expect(workflow).not.toMatch(/\bsubmit\b/i);
    expect(workflow).not.toMatch(/\benqueue\b/i);
    expect(workflow).not.toMatch(/\bRequest Indexing\b/i);
  });

  it("documents the activation and keeps CMS/search/deploy side effects out of scope", () => {
    const report = readJson<{
      artifact: string;
      final_decision: string;
      workflow: {
        triggers: string[];
        permissions: Record<string, string>;
        environment: null;
        secrets_required: boolean;
      };
      runner: {
        framework_v1: string;
        scheduler_activation: string;
        output_mode: string;
      };
      safety_boundary: Record<string, boolean>;
      blockers: string[];
    }>(ACTIVATION_REPORT_PATH);

    expect(report.artifact).toBe("PERSONALITY-AGENT-AUTO-RUNNER-SCHEDULER-ACTIVATION-01");
    expect(report.final_decision).toBe("PASS_SCHEDULED_ACTIONS_ARTIFACT_ONLY_ENABLED");
    expect(report.workflow.triggers).toEqual(["workflow_dispatch", "schedule_weekdays"]);
    expect(report.workflow.permissions).toEqual({ contents: "read" });
    expect(report.workflow.environment).toBeNull();
    expect(report.workflow.secrets_required).toBe(false);
    expect(report.runner.framework_v1).toBe("mbti64");
    expect(report.runner.scheduler_activation).toBe("scheduled_actions_artifact_only_enabled");
    expect(report.runner.output_mode).toBe("github_actions_artifact_only");
    expect(report.blockers).toEqual([]);

    expect(report.safety_boundary.cms_write_attempted).toBe(false);
    expect(report.safety_boundary.cms_live_promotion_attempted).toBe(false);
    expect(report.safety_boundary.search_queue_mutation_attempted).toBe(false);
    expect(report.safety_boundary.live_search_submit_attempted).toBe(false);
    expect(report.safety_boundary.sitemap_llms_mutation_attempted).toBe(false);
    expect(report.safety_boundary.gsc_request_indexing_attempted).toBe(false);
    expect(report.safety_boundary.production_deploy_attempted).toBe(false);
    expect(report.safety_boundary.git_commit_push_attempted_by_workflow).toBe(false);
    expect(report.safety_boundary.github_pr_create_attempted_by_workflow).toBe(false);
  });

  it("lets the runner emit scheduled artifact-only metadata without writing repo files", () => {
    const output = runScheduledArtifactMode() as {
      final_decision: string;
      runner_contract: { mode: string; scheduler_activation: string };
      safety_boundary: Record<string, boolean>;
    };

    expect(output.final_decision).toBe("PASS_SCHEDULED_ACTIONS_ARTIFACT_ONLY_ENABLED");
    expect(output.runner_contract.mode).toBe("scheduled_actions_artifact_only");
    expect(output.runner_contract.scheduler_activation).toBe("scheduled_actions_artifact_only_enabled");
    expect(output.safety_boundary.cms_write_attempted).toBe(false);
    expect(output.safety_boundary.search_queue_mutation_attempted).toBe(false);
    expect(output.safety_boundary.live_search_submit_attempted).toBe(false);
    expect(output.safety_boundary.sitemap_llms_mutation_attempted).toBe(false);
    expect(output.safety_boundary.production_deploy_attempted).toBe(false);
    expect(output.safety_boundary.unattended_cron_enabled).toBe(true);
  });
});
