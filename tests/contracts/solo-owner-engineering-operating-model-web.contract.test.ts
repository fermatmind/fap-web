import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const GUARD = ".agents/skills/career-content-asset-factory/scripts/operator_guard.py";

const V2_CAREER_FILES = [
  ".agents/skills/career-content-asset-factory/SKILL.md",
  ".agents/skills/career-content-asset-factory/references/v2_exact_package_promotion.md",
  ".agents/skills/career-content-asset-factory/references/human_approval_boundaries.md",
  ".agents/skills/career-content-asset-factory/references/staging_import_release_contract.md",
  ".agents/skills/career-content-asset-factory/templates/goal_production_import.md",
  ".agents/skills/career-content-asset-factory/templates/goal_editorial_repair_from_plan.md",
  ".agents/skills/career-content-asset-factory/templates/goal_staging_preview.md",
  ".agents/skills/career-content-asset-factory/templates/goal_editorial_review.md",
];

const V2_PROFILE_FILES = [
  ".agents/skills/public-profile-seo-asset-factory/SKILL.md",
  ".agents/skills/public-profile-seo-asset-factory/orchestration/state-machine.md",
  ".agents/skills/public-profile-seo-asset-factory/agents/release-guard-agent.md",
  ".agents/skills/public-profile-seo-asset-factory/framework-rules/enneagram.md",
  ".agents/skills/public-profile-seo-asset-factory/quality-gates/global-content-qa.md",
];

function read(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function runGuard(action: string) {
  return spawnSync("python3", [GUARD, "--action", action], { cwd: ROOT, encoding: "utf8" });
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

  it("allows only trusted V2 promotion dispatch and fails closed for direct or unknown imports", () => {
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

    for (const action of ["cms_import", "production_import", "unknown_action"]) {
      const blocked = runGuard(action);
      expect(blocked.status, action).toBe(2);
      expect(JSON.parse(blocked.stdout), action).toMatchObject({
        action,
        allowed: false,
        requires_human_approval: true,
        execution_allowed: false,
      });
    }
  });

  it("keeps V2 career templates on machine gates rather than approval artifacts", () => {
    const text = V2_CAREER_FILES.map(read).join("\n");
    expect(text).toContain("independent QA");
    expect(text).toContain("trusted backend promotion");
    expect(text).toContain("requires_human_approval");
    expect(text).toContain("must set that field to `false`");
    expect(text).toMatch(/direct `cms_import`.*`production_import`/);
    expect(text).not.toMatch(/requires explicit user approval naming/i);
    expect(text).not.toMatch(/stop for human review/i);
  });

  it("uses independent W9/QA for active public-profile V2 work without rewriting historical artifacts", () => {
    const text = V2_PROFILE_FILES.map(read).join("\n");
    expect(text).toContain("independent W9/QA");
    expect(text).toContain("same Producer PR");
    expect(text).toContain("Historical V1/legacy artifacts may retain `pending_manual_review`");
    expect(text).toContain("does not require `pending_manual_review` or a named human reviewer");
    expect(text).toContain("legacy_manual_approval_required");
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
      file === "tests/contracts/solo-owner-engineering-operating-model-web.contract.test.ts";

    expect(changedFiles().filter((file) => !allowed(file))).toEqual([]);
    expect(changedFiles()).not.toContain("docs/codex/pr-train.yaml");
    expect(changedFiles()).not.toContain("docs/codex/pr-train-state.json");
  });
});
