import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("solo developer trunk flow rules", () => {
  const agents = readFileSync("AGENTS.md", "utf8");
  const skill = readFileSync(".agents/skills/fermatmind-pr-train/SKILL.md", "utf8");
  const ci = readFileSync(".github/workflows/ci.yml", "utf8");

  it("keeps one exact-SHA main CI without a pull request trigger", () => {
    expect(ci).toContain("push:\n    branches: [main]");
    expect(ci).not.toContain("pull_request:");
    expect(ci).toContain("classify exact SHA");
    expect(ci).toContain("exact-SHA validation receipt");
    for (const requiredJob of [
      "build:",
      "contracts:",
      "verify-big5-contract-freeze:",
      "verify-enneagram-contract-freeze:",
    ]) {
      expect(ci).toContain(requiredJob);
    }
  });

  it("defaults ordinary work to isolated direct-push delivery", () => {
    expect(agents).toContain("clean isolated worktree created from the latest `origin/main`");
    expect(agents).toContain("`git push origin HEAD:main`");
    expect(agents).toContain("Do not create an ordinary branch, pull request, approval phrase");
    expect(agents).toContain("ignored for ordinary work");
    expect(skill).toContain("Use when the user names a PR-train item");
  });

  it("treats standing authorization as an always-on solo-development rule", () => {
    expect(agents).toContain("FermatMind is a solo-developed project. At all times");
    expect(agents).toContain("does not depend on time of day or unattended execution");
    expect(agents).toContain("A second manifest/state or PR authorization prompt is prohibited");
    expect(agents).not.toContain("execution goals often run unattended overnight");
    expect(agents).not.toContain("Unless the goal explicitly requests interactive checkpoints");
  });

  it("keeps ledger work exclusive to explicit PR-train scope", () => {
    expect(agents).toContain("PR-train manifest/state and ledger rules apply only when the task explicitly identifies PR-train work");
    expect(agents).toContain("ignored for ordinary work");
  });
});
