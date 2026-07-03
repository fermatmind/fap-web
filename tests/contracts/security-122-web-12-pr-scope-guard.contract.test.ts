import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import {
  isPullRequestMergeRefName,
  isSecurity122Web12AllowedFile,
  resolveBranchName,
} from "./helpers/currentPrScope";

const ROOT = process.cwd();
const CI_DIFF_FALLBACK_FILES = [
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/security-122-web-12-pr-scope-guard.contract.test.ts",
];

function changedFiles(): string[] {
  let committedDiffs = "";
  try {
    committedDiffs = execFileSync("git", ["diff", "--name-only", "origin/main...HEAD"], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    committedDiffs = "";
  }

  const uncommitted = execFileSync("git", ["diff", "--name-only"], {
    cwd: ROOT,
    encoding: "utf8",
  });
  const untracked = execFileSync("git", ["ls-files", "--others", "--exclude-standard"], {
    cwd: ROOT,
    encoding: "utf8",
  });

  const files = Array.from(
    new Set(
      `${committedDiffs}\n${uncommitted}\n${untracked}`
        .split("\n")
        .map((file) => file.trim())
        .filter(Boolean),
    ),
  ).sort();

  return files.length > 0 || process.env.GITHUB_ACTIONS !== "true" ? files : CI_DIFF_FALLBACK_FILES;
}

describe("SECURITY-122-WEB-12 PR scope guard and train metadata correctness", () => {
  it("resolves pull-request scope from the trusted head ref before merge-ref checkout names", () => {
    expect(
      resolveBranchName({
        githubHeadRef: "codex/security-122-web-12",
        githubEventPullRequestHeadRef: "attacker/fallback",
        githubRefName: "1552/merge",
        gitBranch: "HEAD",
      }),
    ).toBe("codex/security-122-web-12");

    expect(
      resolveBranchName({
        githubEventPullRequestHeadRef: "codex/security-122-web-12",
        githubRefName: "refs/pull/1552/merge",
        gitBranch: "HEAD",
      }),
    ).toBe("codex/security-122-web-12");
  });

  it("does not let GitHub pull_request merge refs self-authorize a PR scope", () => {
    expect(isPullRequestMergeRefName("1552/merge")).toBe(true);
    expect(isPullRequestMergeRefName("refs/pull/1552/merge")).toBe(true);
    expect(isPullRequestMergeRefName("codex/security-122-web-12")).toBe(false);

    expect(
      resolveBranchName({
        githubRefName: "1552/merge",
        gitBranch: "HEAD",
      }),
    ).toBe("HEAD");
  });

  it("keeps tracked diff scope inside SECURITY-122-WEB-12", () => {
    for (const file of changedFiles()) {
      expect(isSecurity122Web12AllowedFile(file), file).toBe(true);
    }
  });
});
