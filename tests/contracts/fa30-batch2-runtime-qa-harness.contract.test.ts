import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  EXPECTED_AUTHORITY_STATE,
  EXPECTED_GO_NO_GO,
  EXPECTED_NEXT_ALLOWED_PR,
  EXPECTED_SCHEMA_VERSION,
  assessBatch2RuntimeQaHandoff,
} from "../../scripts/ops/check-batch2-runtime-qa-handoff.mjs";
import { isFa30Web02AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const FIXTURE_PATH = "tests/fixtures/result_page/batch2_readback_review_ledger.sample.json";

type Batch2LedgerFixture = {
  go_no_go: string;
  authority_state: string;
  production_use_allowed: boolean;
  ready_for_runtime: boolean;
  bigfive: {
    status: string;
    readback_authority: {
      frontend_fallback_allowed: boolean;
    };
  };
};

function readJson(relativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function runChecker(reportPath: string): { status: number; stdout: string } {
  try {
    const stdout = execFileSync(
      "node",
      ["scripts/ops/check-batch2-runtime-qa-handoff.mjs", reportPath],
      { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
    );
    return { status: 0, stdout };
  } catch (error) {
    const execError = error as { status?: number; stdout?: Buffer | string };
    return { status: execError.status ?? 1, stdout: String(execError.stdout || "") };
  }
}

function withTempReport(mutator: (fixture: Batch2LedgerFixture) => void): string {
  const fixture = readJson(FIXTURE_PATH) as Batch2LedgerFixture;
  mutator(fixture);
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "fa30-web-02-"));
  const filePath = path.join(tempDir, "ledger.json");
  fs.writeFileSync(filePath, JSON.stringify(fixture, null, 2));
  return filePath;
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
      // Local and CI refs can differ; use every available diff source.
    }
  }
  return [...files].sort();
}

describe("FA30-WEB-02 Batch 2 frontend runtime QA harness", () => {
  it("accepts the backend readback/review ledger only when the exact fail-closed handoff is present", () => {
    const fixture = readJson(FIXTURE_PATH);
    const result = assessBatch2RuntimeQaHandoff(fixture);

    expect(fixture.schema_version).toBe(EXPECTED_SCHEMA_VERSION);
    expect(fixture.authority_state).toBe(EXPECTED_AUTHORITY_STATE);
    expect(fixture.go_no_go).toBe(EXPECTED_GO_NO_GO);
    expect(fixture.next_allowed_pr).toBe(EXPECTED_NEXT_ALLOWED_PR);
    expect(result.passed).toBe(true);
    expect(result.summary).toMatchObject({
      frontend_runtime_qa_allowed: true,
      production_runtime_allowed: false,
      bigfive_ready: true,
      enneagram_ready: true,
    });
    expect(result.boundaries).toMatchObject({
      network_calls_attempted: false,
      runtime_writes_attempted: false,
      cms_writes_attempted: false,
      deploy_attempted: false,
    });
  });

  it("rejects a handoff that does not explicitly advance to FA30-WEB-02", () => {
    const invalidPath = withTempReport((fixture) => {
      fixture.go_no_go = "NO_GO_CURRENT_PR_BLOCKED";
      fixture.authority_state = "backend_readback_review_authority_only";
    });
    const result = runChecker(invalidPath);

    expect(result.status).not.toBe(0);
    expect(result.stdout).toContain(EXPECTED_GO_NO_GO);
  });

  it("rejects any runtime or production enablement drift", () => {
    const invalidPath = withTempReport((fixture) => {
      fixture.production_use_allowed = true;
      fixture.ready_for_runtime = true;
    });
    const result = runChecker(invalidPath);

    expect(result.status).not.toBe(0);
    expect(result.stdout).toContain("production_use_allowed must be false");
    expect(result.stdout).toContain("ready_for_runtime must be false");
  });

  it("rejects frontend authority fallback drift inside the Big Five readback handoff", () => {
    const invalidPath = withTempReport((fixture) => {
      fixture.bigfive.status = "pass";
      fixture.bigfive.readback_authority.frontend_fallback_allowed = true;
    });
    const result = runChecker(invalidPath);

    expect(result.status).not.toBe(0);
    expect(result.stdout).toContain("bigfive.readback_authority.frontend_fallback_allowed must be false");
  });

  it("registers the package script for operator use", () => {
    const packageJson = readJson("package.json");

    expect(packageJson.scripts["ops:batch2-runtime-qa-handoff"]).toBe(
      "node scripts/ops/check-batch2-runtime-qa-handoff.mjs tests/fixtures/result_page/batch2_readback_review_ledger.sample.json"
    );
  });

  it("keeps current PR changed files inside the approved FA30-WEB-02 scope", () => {
    const files = changedFiles();

    if (files.length === 0) {
      expect(files).toEqual([]);
      return;
    }

    expect(files.every((file) => isFa30Web02AllowedFile(file)), files.join("\n")).toBe(true);
  });
});
