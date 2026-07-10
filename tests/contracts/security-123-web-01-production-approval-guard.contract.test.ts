import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isSecurity123Web01AllowedFile } from "./helpers/currentPrScope";

const WORKFLOW_PATH = ".github/workflows/deploy-production.yml";

function read(path: string): string {
  return readFileSync(path, "utf8");
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
      const output = execFileSync("git", args, { encoding: "utf8" });
      for (const line of output.split("\n")) {
        if (line.trim()) files.add(line.trim());
      }
    } catch {
      // Shallow CI merge refs may not expose every local diff base.
    }
  }
  return [...files].sort();
}

describe("SECURITY-123-WEB-01 production approval guard", () => {
  const workflow = read(WORKFLOW_PATH);

  it("does not expose a workflow input that can waive risky revision policy", () => {
    expect(workflow).not.toContain("manual_risk_approval");
    expect(workflow).not.toContain("APPROVE_RISKY_FAP_WEB_PRODUCTION_DEPLOY");
    expect(workflow).not.toContain("risky-path guard waived");
    expect(workflow).not.toContain("Production manual deploy allowed via risk approval");
  });

  it("keeps manual dispatches subject to the same risky label and path checks", () => {
    expect(workflow).toContain("const isManualDispatch = process.env.GITHUB_EVENT_NAME === 'workflow_dispatch';");
    expect(workflow).toContain("if (riskyLabels.length > 0 || riskyFiles.length > 0)");
    expect(workflow).toContain("Risky production revisions cannot be waived by workflow input.");
    expect(workflow).toContain("core.setOutput('auto_deploy_allowed', 'false');");
  });

  it("retains the protected production environment boundary", () => {
    expect(workflow).toContain("environment:\n      name: production");
    expect(workflow).toContain("if: ${{ needs.policy-guard.outputs.auto_deploy_allowed == 'true' }}");
  });

  it("keeps the current PR diff inside the declared WEB-01 scope", () => {
    const changed = changedFiles();
    if (changed.length === 0 && process.env.GITHUB_ACTIONS === "true") {
      expect(changed).toEqual([]);
      return;
    }

    expect(changed.length).toBeGreaterThan(0);
    expect(changed.every(isSecurity123Web01AllowedFile), changed.join("\n")).toBe(true);
  });
});
