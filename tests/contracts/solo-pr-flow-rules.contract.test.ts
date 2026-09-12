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
    expect(agents).toContain("named `codex/` task branch");
    expect(agents).toContain("pull-request fast path only when the user explicitly asks for a pull request");
    expect(agents).toContain("ignored for ordinary work");
    expect(skill).toContain("Use when the user names a PR-train item");
  });

  it("reuses an unchanged validated tree without adding a persistent delivery ledger", () => {
    expect(agents).toContain("record `git write-tree`");
    expect(agents).toContain("Reuse successful checks when the staged tree SHA is unchanged");
    expect(agents).toContain("verify `HEAD^{tree}` equals the validated tree SHA");
    expect(agents).toContain("Do not create a repository receipt, ledger, manifest");
    expect(agents).toContain("Always repeat status, scope, and `git diff --check` gates");
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

describe("delivery closeout rules", () => {
  const rules = readFileSync("AGENTS.md", "utf8");
  it("runtime acceptance before cleanup", () => {
    expect(rules).toContain("successful exact-SHA CI, staging, production, and online acceptance before closeout");
  });
  it("docs-only closeout without deployment", () => {
    expect(rules).toContain("successful exact-SHA CI and deploy-skip; do not trigger staging or production");
  });
  it("failed releases retain diagnostic context", () => {
    expect(rules).toContain("preserve the diagnostic worktree and necessary evidence");
    expect(rules).toContain("do not report completion or remove the recovery context");
  });
  it("undelivered files are saved without blanket commits or backups", () => {
    expect(rules).toContain("Inspect tracked changes, untracked files, and ignored local configuration");
    expect(rules).toContain("verify the saved bytes");
    expect(rules).toContain("Do not require every draft to be committed or every file to be backed up");
  });
  it("user work and dependent previews are preserved", () => {
    expect(rules).toContain("Never delete pre-existing user changes");
    expect(rules).toContain("Preserve user-requested previews");
    expect(rules).toContain("still needed by another task");
    expect(rules).toContain("never kill by port alone");
  });
  it("task-owned removal is verified", () => {
    expect(rules).toContain("every task commit is contained in the latest `origin/main`");
    expect(rules).toContain("remove its worktree and local branch from the main checkout");
    expect(rules).toContain("Verify the final worktree/branch inventory");
  });
  it("completion includes autonomous cleanup reporting", () => {
    expect(rules).toContain("applicable exact-SHA acceptance and the Delivery closeout requirements");
    expect(rules).toContain("Ordinary closeout needs no additional user confirmation");
    expect(rules).toContain("final report must include cleanup results and concrete reasons");
  });
  it("deployment and scope skills use the shared closeout contract", () => {
    for (const name of ["fermatmind-frontend-deploy-sre", "fermatmind-scope-guard"]) {
      const skill = readFileSync(`.agents/skills/${name}/SKILL.md`, "utf8");
      expect(skill).toContain("../../../AGENTS.md#delivery-closeout");
      expect(skill).toContain("acceptance -> closeout -> final report");
      expect(skill).not.toContain("when cleanup is requested");
    }
  });
});
