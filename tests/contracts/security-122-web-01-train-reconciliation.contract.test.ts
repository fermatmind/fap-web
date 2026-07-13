import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { isSecurity122Web01AllowedFile } from "./helpers/currentPrScope";

const SECURITY_122_WEB_IDS = Array.from({ length: 17 }, (_, index) => {
  return `SECURITY-122-WEB-${String(index + 1).padStart(2, "0")}`;
});

function changedFiles(): string[] {
  const files = new Set<string>();
  for (const args of [
    ["diff", "--name-only", "--cached"],
    ["diff", "--name-only"],
    ["diff", "--name-only", "origin/main...HEAD"],
    ["ls-files", "--others", "--exclude-standard"],
  ]) {
    try {
      const output = execFileSync("git", args, { encoding: "utf8" });
      for (const line of output.split("\n")) {
        if (line.trim()) {
          files.add(line.trim());
        }
      }
    } catch {
      // GitHub may check out a shallow PR merge ref without origin/main.
    }
  }

  return Array.from(files).sort();
}

describe("SECURITY-122-WEB-01 PR-train reconciliation", () => {
  it("registers the authorized SECURITY-122 fap-web train entries", () => {
    const manifest = readFileSync("docs/codex/pr-train.yaml", "utf8");
    const state = JSON.parse(readFileSync("docs/codex/pr-train-state.json", "utf8")) as {
      prs: Array<Record<string, unknown>>;
    };
    const stateEntries = new Map(state.prs.map((entry) => [entry.id, entry]));

    for (const id of SECURITY_122_WEB_IDS) {
      const number = id.slice(-2);
      const previousNumber = String(Number(number) - 1).padStart(2, "0");
      expect(manifest).toContain(`id: ${id}`);
      expect(manifest).toContain(`branch: codex/security-122-web-${number}`);
      expect(manifest).toContain(`title: "${id}:`);
      expect(stateEntries.get(id)).toMatchObject({
        branch: `codex/security-122-web-${number}`,
        base: "main",
        repo: "fap-web",
      });
      if (number !== "01") {
        expect(manifest).toContain(`depends_on: [SECURITY-122-WEB-${previousNumber}]`);
        expect(stateEntries.get(id)).toMatchObject({
          depends_on: [`SECURITY-122-WEB-${previousNumber}`],
        });
        expect(["planned", "in_progress", "local_checks_passed", "committed", "pr_opened", "ready_to_merge", "merged"]).toContain(
          stateEntries.get(id)?.status
        );
      }
    }
  });

  it("reconciles SECURITY-122-WEB-01 to the already merged deploy hardening PR", () => {
    const state = JSON.parse(readFileSync("docs/codex/pr-train-state.json", "utf8")) as {
      prs: Array<Record<string, unknown>>;
    };
    const stateEntries = new Map(state.prs.map((entry) => [entry.id, entry]));
    const security103Web01 = stateEntries.get("SECURITY-103-WEB-01");
    const security122Web01 = stateEntries.get("SECURITY-122-WEB-01");

    expect(security103Web01).toMatchObject({
      status: "merged",
      pr_url: "https://github.com/fermatmind/fap-web/pull/1494",
      commit_sha: "f9199cd7fb3879aa62c688ac25bd807983785449",
      merge_sha: "f9199cd7fb3879aa62c688ac25bd807983785449",
      merged_at: "2026-06-30T01:42:46Z",
      remote_branch_deleted: true,
      local_cleanup_executed: true,
    });
    expect(security122Web01).toMatchObject({
      depends_on: [],
      train_scope: "security_122_web_deploy_workflow_ssh_secret_dispatch_hardening",
    });
    expect([
      "in_progress",
      "local_checks_passed",
      "committed",
      "pr_opened",
      "github_checks_passed",
      "ready_to_merge",
      "merged",
    ]).toContain(security122Web01?.status);
  });

  it("keeps the WEB-01 reconciliation diff inside the declared metadata scope", () => {
    const changed = changedFiles();
    if (changed.length === 0) {
      expect(changed).toEqual([]);
      return;
    }

    expect(changed.length).toBeGreaterThan(0);
    expect(changed.every(isSecurity122Web01AllowedFile), changed.join("\n")).toBe(true);
  });
});
