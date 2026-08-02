import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const GUARD = ".agents/skills/career-content-asset-factory/scripts/operator_guard.py";
const OPERATOR_NEXT = ".agents/skills/career-content-asset-factory/scripts/run_operator_next.py";
const SELECT_NEXT_PHASE = ".agents/skills/career-content-asset-factory/scripts/select_next_phase.py";

const ACTIVE_V2_CAREER_FILES = [
  ".agents/skills/career-content-asset-factory/SKILL.md",
  ".agents/skills/career-content-asset-factory/references/human_approval_required_actions.md",
  ".agents/skills/career-content-asset-factory/references/v2_exact_package_promotion.md",
  ".agents/skills/career-content-asset-factory/references/human_approval_boundaries.md",
  ".agents/skills/career-content-asset-factory/references/orchestrator_state_machine.md",
  ".agents/skills/career-content-asset-factory/references/operator_state_transition_table.md",
  ".agents/skills/career-content-asset-factory/references/operator_failure_modes.md",
  ".agents/skills/career-content-asset-factory/scripts/propose_operator_self_improvement.py",
  ".agents/skills/career-content-asset-factory/references/staging_import_release_contract.md",
  ".agents/skills/career-content-asset-factory/templates/goal_production_import.md",
  ".agents/skills/career-content-asset-factory/templates/goal_editorial_repair_from_plan.md",
  ".agents/skills/career-content-asset-factory/templates/goal_staging_preview.md",
  ".agents/skills/career-content-asset-factory/templates/goal_editorial_review.md",
  ".agents/skills/career-content-asset-factory/templates/goal_run_operator_loop.md",
  ".agents/skills/career-content-asset-factory/templates/goal_continue_until_next_hard_stop.md",
];

const ACTIVE_V2_PROFILE_FILES = [
  ".agents/skills/public-profile-seo-asset-factory/SKILL.md",
  ".agents/skills/public-profile-seo-asset-factory/orchestration/state-machine.md",
  ".agents/skills/public-profile-seo-asset-factory/orchestration/personality-agent-matrix.md",
  ".agents/skills/public-profile-seo-asset-factory/orchestration/failure-recovery.md",
  ".agents/skills/public-profile-seo-asset-factory/agents/release-guard-agent.md",
  ".agents/skills/public-profile-seo-asset-factory/agents/enneagram-public-personality-agent.md",
  ".agents/skills/public-profile-seo-asset-factory/agents/mbti64-public-personality-agent.md",
  ".agents/skills/public-profile-seo-asset-factory/agents/seo-projection-qa-agent.md",
  ".agents/skills/public-profile-seo-asset-factory/framework-rules/enneagram.md",
  ".agents/skills/public-profile-seo-asset-factory/framework-rules/big-five.md",
  ".agents/skills/public-profile-seo-asset-factory/quality-gates/global-content-qa.md",
  ".agents/skills/public-profile-seo-asset-factory/quality-gates/bilingual-independence.md",
  ".agents/skills/public-profile-seo-asset-factory/quality-gates/framework-specific-no-go.md",
  ".agents/skills/public-profile-seo-asset-factory/runbooks/enneagram-v1-placeholder-upgrade.md",
  ".agents/skills/public-profile-seo-asset-factory/runbooks/mbti-existing-asset-enhancement.md",
  ".agents/skills/public-profile-seo-asset-factory/checklists/publish-gate.md",
  ".agents/skills/public-profile-seo-asset-factory/pr-train-templates/publish-indexability.md",
];

function read(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function runGuard(action: string) {
  return spawnSync("python3", [GUARD, "--action", action], { cwd: ROOT, encoding: "utf8" });
}

function runOperator(script: string, stateDir: string) {
  return spawnSync("python3", [script, "--state-dir", stateDir, "--block", "identity"], {
    cwd: ROOT,
    encoding: "utf8",
  });
}

function jsonFiles(directory: string): string[] {
  return fs
    .readdirSync(path.join(ROOT, directory), { withFileTypes: true })
    .flatMap((entry) => {
      const relative = path.join(directory, entry.name);
      return entry.isDirectory() ? jsonFiles(relative) : entry.name.endsWith(".json") ? [relative] : [];
    });
}

function changedFiles(): string[] {
  const files = new Set<string>();
  for (const args of [
    ["diff", "--name-only", "HEAD"],
    ["diff", "--cached", "--name-only"],
    ["diff", "--name-only", "origin/main...HEAD"],
    ["ls-files", "--others", "--exclude-standard"],
  ]) {
    const output = execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
    for (const file of output.split("\n")) if (file.trim()) files.add(file.trim());
  }
  return [...files].sort();
}

describe("Solo-Owner Engineering Operating Model (web)", () => {
  it("makes the cross-repository operating model discoverable from rules and architecture", () => {
    const model = read("docs/codex/fermatmind-codex-workflow-and-personalization.md");
    expect(model).toContain("# Solo-Owner Engineering Operating Model");
    expect(model).toContain("same Producer PR");
    expect(model).toContain("sidecar record");
    expect(model).toContain("not a confirmation phrase or human-approval credential");
    expect(read("AGENTS.md")).toContain("Solo-Owner Engineering Operating Model");
    expect(read("docs/architecture/fermatmind-frontend-backend-technical-map.md")).toContain("Solo-Owner Engineering Operating Model");
  });

  it("allows trusted V2 promotion dispatch and classifies forbidden direct actions without approval prompts", () => {
    const dispatch = runGuard("dispatch_exact_package_promotion");
    expect(dispatch.status).toBe(0);
    expect(JSON.parse(dispatch.stdout)).toMatchObject({
      action: "dispatch_exact_package_promotion",
      allowed: true,
      requires_human_approval: false,
      execution_allowed: true,
      trusted_backend_promotion_dispatch: true,
      reason: "trusted_backend_promotion_dispatch_allowed",
    });

    for (const action of ["cms_import", "production_import"]) {
      const blocked = runGuard(action);
      expect(blocked.status, action).toBe(2);
      expect(JSON.parse(blocked.stdout), action).toMatchObject({
        action,
        allowed: false,
        requires_human_approval: false,
        execution_allowed: false,
        reason: "direct_action_forbidden",
        blocker_kind: "direct_action_forbidden",
      });
    }

    const unknown = runGuard("unknown_action");
    expect(unknown.status).toBe(2);
    expect(JSON.parse(unknown.stdout)).toMatchObject({
      allowed: false,
      requires_human_approval: false,
      reason: "unknown_action",
      blocker_kind: "unknown_action",
    });
  });

  it("keeps V2 career templates on machine gates rather than approval artifacts", () => {
    const text = ACTIVE_V2_CAREER_FILES.map(read).join("\n");
    expect(text).toContain("independent QA");
    expect(text).toContain("trusted backend promotion");
    expect(text).toContain("requires_human_approval");
    expect(text).toContain("must set that field to `false`");
    expect(text).toMatch(/direct `cms_import`.*`production_import`/);
    expect(text).not.toMatch(/requires explicit user approval naming/i);
    expect(text).not.toMatch(/stop for human review/i);
    expect(text).not.toContain("stop_for_human_approval");
    expect(text).toContain("do not create approval-only, reset, refreeze, or status-acceptance work.");
  });

  it("uses independent W9/QA for active public-profile V2 work without rewriting historical artifacts", () => {
    const text = ACTIVE_V2_PROFILE_FILES.map(read).join("\n");
    expect(text).toContain("independent W9/QA");
    expect(text).toContain("same Producer PR");
    expect(text).toContain("Historical V1/legacy artifacts may retain `pending_manual_review`");
    expect(text).toContain("does not require `pending_manual_review` or a named human reviewer");
    expect(text).toContain("legacy_manual_approval_required");
    expect(text).not.toContain("blocked_approval_required");
    expect(text).not.toMatch(/operator approval for CMS import or promotion/i);
    expect(text).toContain("separately scoped");
  });

  it("reports missing and restorable baselines as machine-gate repair or recovery, never human approval", () => {
    const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), "fm-operator-"));
    try {
      const missing = runOperator(OPERATOR_NEXT, stateDir);
      expect(missing.status).toBe(2);
      expect(JSON.parse(missing.stdout)).toMatchObject({
        requires_human_approval: false,
        hard_stop: true,
        blocker_kind: "machine_gate_failed",
        next_action: {
          action: "machine_gate_repair_required",
          stop_classification: "missing_latest_pass_baseline",
        },
      });

      fs.writeFileSync(
        path.join(stateDir, "latest_pass_baselines.json"),
        JSON.stringify({
          baselines: [
            {
              block_name: "identity",
              baseline_directory: path.join(stateDir, "missing-baseline"),
              sha256_manifest: path.join(stateDir, "missing-manifest.sha256"),
              artifact_uri: "artifact://career/identity/latest",
              restorable: true,
            },
          ],
        }),
      );
      const recovery = runOperator(OPERATOR_NEXT, stateDir);
      expect(recovery.status).toBe(0);
      expect(JSON.parse(recovery.stdout)).toMatchObject({
        requires_human_approval: false,
        hard_stop: false,
        blocker_kind: null,
        next_action: { action: "restore_baseline" },
      });

      const phaseDir = fs.mkdtempSync(path.join(os.tmpdir(), "fm-phase-"));
      const phase = runOperator(SELECT_NEXT_PHASE, phaseDir);
      expect(phase.status).toBe(2);
      expect(JSON.parse(phase.stdout)).toMatchObject({
        action: "machine_gate_repair_required",
        requires_human_approval: false,
        hard_stop: true,
        blocker_kind: "machine_gate_failed",
      });
      fs.rmSync(phaseDir, { recursive: true, force: true });
    } finally {
      fs.rmSync(stateDir, { recursive: true, force: true });
    }
  });

  it("keeps every career and public-profile JSON schema parseable", () => {
    for (const directory of [
      ".agents/skills/career-content-asset-factory/schemas",
      ".agents/skills/public-profile-seo-asset-factory/schemas",
    ]) {
      for (const file of jsonFiles(directory)) expect(() => JSON.parse(read(file)), file).not.toThrow();
    }
  });

  it("contains this ad-hoc rules PR inside its declared documentation, skill, and contract scope", () => {
    const allowed = (file: string) =>
      file === "AGENTS.md" ||
      file === "docs/codex/fermatmind-codex-workflow-and-personalization.md" ||
      file === "docs/architecture/fermatmind-frontend-backend-technical-map.md" ||
      file.startsWith(".agents/skills/career-content-asset-factory/") ||
      file.startsWith(".agents/skills/career-page-assembly-asset-factory/") ||
      file.startsWith(".agents/skills/public-profile-seo-asset-factory/") ||
      file === "tests/contracts/solo-owner-engineering-operating-model-web.contract.test.ts" ||
      file === "tests/contracts/mbti-asset-skill-10-public-profile-seo-asset-factory.contract.test.ts";

    expect(changedFiles().filter((file) => !allowed(file))).toEqual([]);
    expect(changedFiles()).not.toContain("docs/codex/pr-train.yaml");
    expect(changedFiles()).not.toContain("docs/codex/pr-train-state.json");
  });
});
