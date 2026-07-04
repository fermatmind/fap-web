import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isMbtiAssetSkill10AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();

const EXPECTED_FILES = [
  ".agents/skills/public-profile-seo-asset-factory/SKILL.md",
  ".agents/skills/public-profile-seo-asset-factory/orchestration/personality-agent-matrix.md",
  ".agents/skills/public-profile-seo-asset-factory/orchestration/state-machine.md",
  ".agents/skills/public-profile-seo-asset-factory/runbooks/mbti-existing-asset-enhancement.md",
  ".agents/skills/public-profile-seo-asset-factory/agents/mbti64-public-personality-agent.md",
  "tests/contracts/mbti-asset-skill-10-public-profile-seo-asset-factory.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
];

const KNOWN_CONTRACT_SIDE_EFFECT_FILES = new Set([
  "docs/seo/personality/mbti-cms-04-top-profile-content-assets-2026-07-04.json",
  "docs/seo/personality/mbti-cms-04-top-profile-content-assets-2026-07-04.md",
]);

function read(file: string): string {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
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
      // Local and CI checkout shapes differ; use whichever scoped source is available.
    }
  }
  return [...files].sort();
}

describe("MBTI-ASSET-SKILL-10", () => {
  it("adds hot cross-type comparison ownership to the MBTI public profile matrix", () => {
    const skill = read(".agents/skills/public-profile-seo-asset-factory/SKILL.md");
    const matrix = read(".agents/skills/public-profile-seo-asset-factory/orchestration/personality-agent-matrix.md");
    const mbtiAgent = read(".agents/skills/public-profile-seo-asset-factory/agents/mbti64-public-personality-agent.md");

    for (const text of [skill, matrix]) {
      expect(text).toContain("MBTI Hot Cross-Type Comparison Agent");
      expect(text).toContain("INTJ/INTP");
      expect(text).toContain("ENTJ/INTJ");
      expect(text).toContain("INFJ/INFP");
      expect(text).toContain("ISTJ/ISFJ");
    }

    expect(mbtiAgent).toContain("hot cross-type comparison");
    expect(mbtiAgent).toContain("approved slug");
  });

  it("documents the executable MBTI GSC-to-indexability pipeline without production writes", () => {
    const skill = read(".agents/skills/public-profile-seo-asset-factory/SKILL.md");
    const runbook = read(".agents/skills/public-profile-seo-asset-factory/runbooks/mbti-existing-asset-enhancement.md");
    const stateMachine = read(".agents/skills/public-profile-seo-asset-factory/orchestration/state-machine.md");

    for (const text of [skill, runbook]) {
      expect(text).toMatch(/GSC evidence/i);
      expect(text).toMatch(/Content package/i);
      expect(text).toContain("QA");
      expect(text).toMatch(/fap-api import dry-run/i);
      expect(text).toContain("Approval");
      expect(text).toContain("Promotion");
      expect(text).toMatch(/sitemap\/llms gate/i);
      expect(text).toContain("GSC_EVIDENCE_PENDING");
      expect(text).toMatch(/do not write .*CMS|must not write CMS/i);
      expect(text).toContain("frontend fallback");
      expect(text).toContain("Search Queue");
    }

    expect(stateMachine).toContain("fap_api_import_dry_run_ready");
    expect(stateMachine).toContain("approval_required");
    expect(stateMachine).toContain("sitemap_llms_gate_ready");
  });

  it("keeps the current PR scoped to the skill runbook, agent docs, train metadata, and this contract", () => {
    for (const file of EXPECTED_FILES) {
      expect(isMbtiAssetSkill10AllowedFile(file), file).toBe(true);
    }

    for (const file of changedFiles()) {
      if (KNOWN_CONTRACT_SIDE_EFFECT_FILES.has(file)) {
        continue;
      }
      expect(isMbtiAssetSkill10AllowedFile(file), file).toBe(true);
    }
  });
});
