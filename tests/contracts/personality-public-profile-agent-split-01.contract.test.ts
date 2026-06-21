import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isPersonalityPublicProfileAgentSplit01AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();

const EXPECTED_AGENT_FILES = [
  ".agents/skills/public-profile-seo-asset-factory/agents/personality-content-orchestrator.md",
  ".agents/skills/public-profile-seo-asset-factory/agents/mbti64-public-personality-agent.md",
  ".agents/skills/public-profile-seo-asset-factory/agents/big-five-public-personality-agent.md",
  ".agents/skills/public-profile-seo-asset-factory/agents/enneagram-public-personality-agent.md",
  ".agents/skills/public-profile-seo-asset-factory/agents/seo-projection-qa-agent.md",
  ".agents/skills/public-profile-seo-asset-factory/agents/editorial-claim-qa-agent.md",
  ".agents/skills/public-profile-seo-asset-factory/agents/release-guard-agent.md",
  ".agents/skills/public-profile-seo-asset-factory/orchestration/personality-agent-matrix.md",
];

const EXPECTED_CHANGED_FILES = [
  ".agents/skills/public-profile-seo-asset-factory/SKILL.md",
  ...EXPECTED_AGENT_FILES,
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/research/personality/personality-public-profile-agent-split-01/00-executive-summary.md",
  "docs/research/personality/personality-public-profile-agent-split-01/01-agent-matrix.md",
  "docs/research/personality/personality-public-profile-agent-split-01/02-next-task-handoff.md",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/personality-public-profile-agent-split-01.contract.test.ts",
];

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

describe("PERSONALITY-PUBLIC-PROFILE-AGENT-SPLIT-01", () => {
  it("documents framework-specific public profile agents and shared guards", () => {
    const skill = read(".agents/skills/public-profile-seo-asset-factory/SKILL.md");
    const matrix = read(".agents/skills/public-profile-seo-asset-factory/orchestration/personality-agent-matrix.md");

    expect(skill).toContain("Public Profile Agent Matrix");
    expect(skill).toContain("MBTI64 Public Personality Agent");
    expect(skill).toContain("Big Five Public Personality Agent");
    expect(skill).toContain("Enneagram Public Personality Agent");
    expect(skill).toContain("SEO Projection QA Agent");
    expect(skill).toContain("Editorial Claim QA Agent");
    expect(skill).toContain("Release Guard Agent");

    expect(matrix).toContain("64 A/T variant");
    expect(matrix).toContain("32 A-vs-T comparison");
    expect(matrix).toContain("Official 32 OCEAN types");
    expect(matrix).toContain("54 combinations or Tritype");
  });

  it("keeps each framework agent inside its approved public profile boundary", () => {
    const mbti = read(".agents/skills/public-profile-seo-asset-factory/agents/mbti64-public-personality-agent.md");
    const bigFive = read(".agents/skills/public-profile-seo-asset-factory/agents/big-five-public-personality-agent.md");
    const enneagram = read(".agents/skills/public-profile-seo-asset-factory/agents/enneagram-public-personality-agent.md");
    const guard = read(".agents/skills/public-profile-seo-asset-factory/agents/release-guard-agent.md");

    expect(mbti).toContain("existing public MBTI64 estate");
    expect(mbti).toContain("Do not copy private result page body");
    expect(mbti).toContain("Claim A/T is official MBTI");

    expect(bigFive).toContain("dimensional model");
    expect(bigFive).toContain("Do not create official Big Five 32 personality types");
    expect(bigFive).toContain("Do not create 32 OCEAN SEO pages");

    expect(enneagram).toContain("Hub.");
    expect(enneagram).toContain("3 centers.");
    expect(enneagram).toContain("9 core types.");
    expect(enneagram).toContain("Do not create 54 wing x instinct SEO pages");

    expect(guard).toContain("Search Queue dry-run cannot imply enqueue");
    expect(guard).toContain("Approve cannot imply live submit");
  });

  it("records that this PR is contract-only and defers the 96 URL expansion dry-run", () => {
    const summary = read("docs/research/personality/personality-public-profile-agent-split-01/00-executive-summary.md");
    const handoff = read("docs/research/personality/personality-public-profile-agent-split-01/02-next-task-handoff.md");

    expect(summary).toContain("No frontend runtime files changed.");
    expect(summary).toContain("No CMS imports, writes, promotions, or publication actions were performed.");
    expect(summary).toContain("No Search Queue enqueue, approval, or submission was performed.");
    expect(handoff).toContain("64 A/T variant URLs");
    expect(handoff).toContain("32 A-vs-T comparison URLs");
    expect(handoff).toContain("must not");
    expect(handoff).toContain("MBTI64-SEARCH-QUEUE-EXPANSION-DRY-RUN-01");
  });

  it("keeps the current PR scoped to agent contracts, docs, train metadata, and this contract", () => {
    for (const file of EXPECTED_CHANGED_FILES) {
      expect(isPersonalityPublicProfileAgentSplit01AllowedFile(file), file).toBe(true);
    }

    for (const file of changedFiles()) {
      expect(isPersonalityPublicProfileAgentSplit01AllowedFile(file), file).toBe(true);
    }
  });
});
