import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("solo developer PR flow rules", () => {
  const agents = readFileSync("AGENTS.md", "utf8");
  const skill = readFileSync(".agents/skills/fermatmind-pr-train/SKILL.md", "utf8");
  const ci = readFileSync(".github/workflows/ci.yml", "utf8");

  it("keeps one complete PR CI run and one main regression run", () => {
    expect(ci).toContain('push:\n    branches: ["main"]');
    expect(ci).toContain("pull_request:");
    for (const requiredJob of [
      "build:",
      "contracts:",
      "verify-big5-contract-freeze:",
      "verify-enneagram-contract-freeze:",
    ]) {
      expect(ci).toContain(requiredJob);
    }
  });

  it("defaults ordinary local work to focused checks without weakening required checks", () => {
    expect(agents).toContain("Ordinary scoped PRs default to focused local verification");
    expect(agents).toContain("Pull requests still require the complete GitHub required checks");
    expect(skill).toContain("not the default for ordinary ad-hoc PRs");
    expect(skill).toContain("complete GitHub required checks");
  });

  it("treats standing authorization as an always-on solo-development rule", () => {
    expect(agents).toContain("FermatMind is a solo-developed project. At all times");
    expect(agents).toContain("does not depend on time of day or unattended execution");
    expect(agents).toContain("A second manifest/state or PR authorization prompt is prohibited");
    expect(agents).not.toContain("execution goals often run unattended overnight");
    expect(agents).not.toContain("Unless the goal explicitly requests interactive checkpoints");
  });

  it("keeps ledger reconciliation scoped without requesting repeat authorization", () => {
    expect(agents).toContain("do not open a standalone reconciliation PR");
    expect(agents).toContain("create one minimal ledger-only ad-hoc PR under the standing authorization");
    expect(agents).not.toContain("request explicit user authorization before creating one ledger-only ad-hoc PR");
  });
});
