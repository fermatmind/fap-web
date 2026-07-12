import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("workflow action reference integrity", () => {
  it("keeps every workflow action on the blessed lock and resolves pinned refs", () => {
    const output = execFileSync(process.execPath, ["scripts/verify-github-action-refs.mjs", "--resolve"], {
      encoding: "utf8",
      timeout: 90000,
    });

    expect(output).toContain("remote refs resolved");
  });

  it("locks artifact upload to the current resolvable v4 SHA instead of the invalid historical SHA", () => {
    const workflow = readFileSync(".github/workflows/llms-feed-cache-ops.yml", "utf8");
    const runnerWorkflow = readFileSync(".github/workflows/personality-agent-auto-runner.yml", "utf8");

    expect(workflow).toContain("actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02 # v4");
    expect(runnerWorkflow).toContain("actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02 # v4");
    expect(workflow).not.toContain("actions/upload-artifact@99df26d4f13ea111d4ec1a7dddef6063f76b97e9");
    expect(runnerWorkflow).not.toContain("actions/upload-artifact@99df26d4f13ea111d4ec1a7dddef6063f76b97e9");
  });
});
