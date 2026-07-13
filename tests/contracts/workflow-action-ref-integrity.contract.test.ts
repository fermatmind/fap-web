import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("workflow action reference integrity", () => {
  it("keeps every workflow action on the blessed lock without a public-network dependency", () => {
    const output = execFileSync(process.execPath, ["scripts/verify-github-action-refs.mjs"], {
      encoding: "utf8",
      timeout: 10000,
    });

    expect(output).toContain("GitHub workflow action reference integrity check passed");
    expect(output).not.toContain("remote refs resolved");
  });

  it("runs remote tag resolution only from the scheduled maintenance audit", () => {
    const workflow = readFileSync(".github/workflows/action-ref-remote-audit.yml", "utf8");

    expect(workflow).toContain("schedule:");
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).toContain("node scripts/verify-github-action-refs.mjs --resolve");
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
