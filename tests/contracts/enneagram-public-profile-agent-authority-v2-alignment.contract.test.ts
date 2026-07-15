import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const PR03_CONTRACT_PATH = "tests/contracts/enneagram-public-profile-agent-authority-v2-alignment.contract.test.ts";

const GOVERNANCE_FILES = [
  ".agents/skills/public-profile-seo-asset-factory/SKILL.md",
  ".agents/skills/public-profile-seo-asset-factory/agents/enneagram-public-personality-agent.md",
  ".agents/skills/public-profile-seo-asset-factory/framework-rules/enneagram.md",
  ".agents/skills/public-profile-seo-asset-factory/runbooks/enneagram-v1-placeholder-upgrade.md",
  ".agents/skills/public-profile-seo-asset-factory/orchestration/personality-agent-matrix.md",
  ".agents/skills/public-profile-seo-asset-factory/quality-gates/bilingual-independence.md",
  ".agents/skills/public-profile-seo-asset-factory/quality-gates/framework-specific-no-go.md",
  ".agents/skills/public-profile-seo-asset-factory/quality-gates/global-content-qa.md",
  ".agents/skills/public-profile-seo-asset-factory/quality-gates/publish-indexability.md",
  ".agents/skills/public-profile-seo-asset-factory/quality-gates/source-evidence-qa.md",
];

const PACKET_PATHS = [
  "docs/public-personality/enneagram-public-personality-handoff-common-contract.v1.json",
  "docs/public-personality/enneagram-public-personality-source-authority-packet.v1.json",
  "docs/public-personality/enneagram-public-personality-claim-safety-packet.v1.json",
  "docs/public-personality/enneagram-public-personality-candidate-cluster-packet.v1.json",
  "docs/public-personality/enneagram-public-personality-handoff-matrix.v1.json",
];

function read(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function readJson(relativePath: string): Record<string, unknown> {
  return JSON.parse(read(relativePath)) as Record<string, unknown>;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function changedFiles(): string[] {
  for (const baseRef of ["refs/remotes/origin/main", "refs/heads/main"]) {
    try {
      execFileSync("git", ["rev-parse", "--verify", "--quiet", baseRef], {
        cwd: ROOT,
        stdio: "ignore",
      });
      const output = execFileSync("git", ["diff", "--name-only", `${baseRef}...HEAD`], {
        cwd: ROOT,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      });
      return output
        .split("\n")
        .map((file) => file.trim())
        .filter(Boolean)
        .sort();
    } catch {
      // Try the next local ref. Exact uncommitted scope remains a manifest shell gate.
    }
  }
  return [];
}

describe("Enneagram Public Personality Authority V2 skill alignment", () => {
  it("locks the current estate to 58 identities and 116 bilingual pages", () => {
    for (const packetPath of PACKET_PATHS) {
      const packet = readJson(packetPath);
      const estate = asRecord(packet.authority_v2_estate);
      expect(estate.identity_count, packetPath).toBe(58);
      expect(estate.page_count, packetPath).toBe(116);
      expect(estate.locales, packetPath).toEqual(["en", "zh-CN"]);
    }

    const governance = GOVERNANCE_FILES.map(read).join("\n");
    expect(governance).toContain("enneagram.content_package_generation");
    expect(governance).toContain("backend-authoritative 58-identity registry");
    expect(governance).toContain("Do not delegate Enneagram Authority V2 selection to `orchestration/asset-selection.md`");
    expect(governance).not.toContain("target scope `authority_v2_116_estate`");
    expect(governance).not.toContain("`enneagram.authority_v2_116_estate`");
    expect(governance).toContain("58 identities");
    expect(governance).toContain("116 pages");
    expect(governance).toContain("18 wings");
    expect(governance).toContain("27 instinctual subtypes");
  });

  it("requires independent drafting, source-ledger evidence, manual review truth, and revision isolation", () => {
    const common = readJson(PACKET_PATHS[0]);
    const workflow = asRecord(common.authority_v2_workflow_truth);

    expect(workflow.independent_bilingual_drafting).toBe(true);
    expect(workflow.source_ledger_state).toBe("required_pending_pr07");
    expect(workflow.unreviewed_state).toBe("pending_manual_review");
    expect(workflow.model_review_is_human_review).toBe(false);
    expect(workflow.working_revision_isolated).toBe(true);
    expect(workflow.published_primary_mutation_allowed).toBe(false);
    expect(workflow.public_revision_pointer_mutation_allowed).toBe(false);

    const governance = GOVERNANCE_FILES.map(read).join("\n");
    expect(governance).toContain("independently");
    expect(governance).toContain("V2 source ledger");
    expect(governance).toContain("pending_manual_review");
    expect(governance).toMatch(/model (?:or|\/) agent QA.*not human review|model review is not human review/i);
    expect(governance).toContain("isolated working revision");
  });

  it("removes obsolete cohort rules while preserving the real expansion no-go", () => {
    const currentAuthorityText = GOVERNANCE_FILES.map(read).join("\n");

    expect(currentAuthorityText).not.toMatch(/3 centers and 9 core types first/i);
    expect(currentAuthorityText).not.toMatch(/18 wings (?:are )?later/i);
    expect(currentAuthorityText).not.toMatch(/27 instinctual subtypes (?:are )?later/i);
    expect(currentAuthorityText).not.toContain("Total: 26 packages");
    expect(currentAuthorityText).toContain("54 wing × instinct matrix");
    expect(currentAuthorityText).toContain("Tritype");
  });

  it("keeps the registered PR03 and PR21 YAML checks portable across Psych versions", () => {
    const manifest = read("docs/codex/pr-train.yaml");
    for (const id of [
      "ENNEAGRAM-PUBLIC-AUTHORITY-V2-SKILL-ALIGNMENT-03",
      "ENNEAGRAM-PUBLIC-AUTHORITY-V2-FRONTEND-CONSUMER-21",
    ]) {
      const marker = `  - id: ${id}`;
      const start = manifest.indexOf(marker);
      const next = manifest.indexOf("\n  - id: ", start + marker.length);
      const entry = manifest.slice(start, next === -1 ? undefined : next);

      expect(start, id).toBeGreaterThanOrEqual(0);
      expect(entry, id).toContain("YAML.safe_load(File.read('docs/codex/pr-train.yaml'), aliases: true)");
    }
  });

  it("keeps PR03 governance-only with no runtime path changes", () => {
    const changed = changedFiles();

    if (!changed.includes(PR03_CONTRACT_PATH)) return;
    expect(changed.length).toBeGreaterThan(0);
    for (const file of changed) {
      expect(
        file.startsWith(".agents/skills/public-profile-seo-asset-factory/") ||
          file.startsWith("docs/public-personality/enneagram-") ||
          file.startsWith("tests/contracts/enneagram-public-personality-") ||
          file.startsWith("tests/contracts/enneagram-public-profile-agent-") ||
          file.startsWith("tests/contracts/personality-public-profile-agent-") ||
          file === "docs/codex/pr-train.yaml" ||
          file === "docs/codex/pr-train-state.json",
        file,
      ).toBe(true);
    }
    expect(changed.some((file) => /^(?:app|components|lib|public)\//.test(file))).toBe(false);
  });
});
