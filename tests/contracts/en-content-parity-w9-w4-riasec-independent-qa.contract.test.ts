import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const VALIDATOR_PATH = path.join(ROOT, "scripts/seo/validate-w4-riasec-w9-qa.mjs");
const PACKAGE_SHA = "944ddac51957b38aa6232335f07269cd904c2513348fad652acb5acb0de59e33";
const REPAIRED_PACKAGE_SHA = "f3f2463fadd827e586d39d42ecd9e6418b7cb7f36a0697eb06dcead8292f54eb";
const RESET_ARTIFACT = "generated/en-content-parity/CONTROL-approvals/W4-RIASEC/package-rework-reset-944ddac.json";
const REPORT = "generated/en-content-parity/W9-independent-qa/riasec/w4-riasec-944ddac/independent_qa_report.json";

function readJson<T>(root: string, relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8")) as T;
}

function writeJson(root: string, relativePath: string, value: unknown): void {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function sha256(root: string, relativePath: string): string {
  return createHash("sha256").update(fs.readFileSync(path.join(root, relativePath))).digest("hex");
}

function createResetFixture(): string {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "en-parity-w4-riasec-reset-"));
  for (const relativePath of [
    "docs/seo/generated/en-content-parity-control-master.v1.json",
    "generated/en-content-parity/W4-riasec",
    "generated/en-content-parity/W9-independent-qa/riasec/w4-riasec-944ddac",
    "generated/en-content-parity/CONTROL-approvals/W4-RIASEC/package-rework-reset-944ddac.json",
  ]) {
    const source = path.join(ROOT, relativePath);
    const target = path.join(fixtureRoot, relativePath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.cpSync(source, target, { recursive: true });
  }
  const master = readJson<{
    lanes: Array<{
      lane_id: string;
      status: string;
      package_sha256: string | null;
      qa_report_ref: string | null;
      blocked_from_status: string | null;
      gate_lineage: unknown[];
      blockers: unknown[];
    }>;
  }>(fixtureRoot, "docs/seo/generated/en-content-parity-control-master.v1.json");
  const w4 = master.lanes.find((lane) => lane.lane_id === "W4");
  if (!w4) throw new Error("missing W4 fixture lane");
  w4.status = "package_in_progress";
  w4.package_sha256 = null;
  w4.qa_report_ref = null;
  w4.blocked_from_status = null;
  w4.gate_lineage = [];
  w4.blockers = [];
  writeJson(fixtureRoot, "docs/seo/generated/en-content-parity-control-master.v1.json", master);
  return fixtureRoot;
}

function validatorFailure(fixtureRoot: string): string {
  try {
    execFileSync("node", [VALIDATOR_PATH], { cwd: fixtureRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (error) {
    return (error as { stderr?: string }).stderr ?? "";
  }
  return "";
}

describe("EN-PARITY-W9-W4-RIASEC-INDEPENDENT-QA-01", () => {
  it("keeps the historical BLOCKED W9 evidence immutable after a repaired W4 package re-freeze", () => {
    const result = JSON.parse(execFileSync("node", ["scripts/seo/validate-w4-riasec-w9-qa.mjs"], { encoding: "utf8" }));
    expect(result).toMatchObject({
      ok: true,
      package_sha256: PACKAGE_SHA,
      rows: 1550,
      blocked_rows: 130,
      language_blocked_rows: 126,
      duplicate_blocked_rows: 4,
      verdict: "BLOCKED",
      control_reset: false,
      historical_evidence_only: true,
    });
    const master = readJson<{ lanes: Array<{ lane_id: string; package_sha256: string | null }> }>(ROOT, "docs/seo/generated/en-content-parity-control-master.v1.json");
    expect(master.lanes.find((lane) => lane.lane_id === "W4")?.package_sha256).toBe(REPAIRED_PACKAGE_SHA);
  });

  it("validates all 1550 W4 RIASEC rows after an exact CONTROL-only failed-package reset", () => {
    const fixtureRoot = createResetFixture();
    try {
      const result = JSON.parse(execFileSync("node", [VALIDATOR_PATH], { cwd: fixtureRoot, encoding: "utf8" }));
      expect(result).toMatchObject({
        ok: true,
        package_sha256: PACKAGE_SHA,
        rows: 1550,
        blocked_rows: 130,
        language_blocked_rows: 126,
        duplicate_blocked_rows: 4,
        verdict: "BLOCKED",
        control_reset: true,
        historical_evidence_only: false,
      });
    } finally {
      fs.rmSync(fixtureRoot, { recursive: true, force: true });
    }
  });

  it("rejects incomplete or tampered W4 CONTROL reset evidence", () => {
    const cases: Array<{ name: string; mutate: (fixtureRoot: string) => void; message: string }> = [
      {
        name: "missing reset artifact",
        mutate: (fixtureRoot) => fs.rmSync(path.join(fixtureRoot, RESET_ARTIFACT)),
        message: "W4 reset mode requires CONTROL artifact",
      },
      {
        name: "reset SHA mismatch",
        mutate: (fixtureRoot) => {
          const reset = readJson<{ w9_report_sha256: string }>(fixtureRoot, RESET_ARTIFACT);
          reset.w9_report_sha256 = "0".repeat(64);
          writeJson(fixtureRoot, RESET_ARTIFACT, reset);
        },
        message: "W4 reset CONTROL artifact binding or permissions drifted",
      },
      {
        name: "W9 report no longer blocked",
        mutate: (fixtureRoot) => {
          const report = readJson<{ verdict: string }>(fixtureRoot, REPORT);
          report.verdict = "PASS";
          writeJson(fixtureRoot, REPORT, report);
          const reset = readJson<{ w9_report_sha256: string }>(fixtureRoot, RESET_ARTIFACT);
          reset.w9_report_sha256 = sha256(fixtureRoot, REPORT);
          writeJson(fixtureRoot, RESET_ARTIFACT, reset);
        },
        message: "W4 reset CONTROL artifact binding or permissions drifted",
      },
      {
        name: "reset permission is true",
        mutate: (fixtureRoot) => {
          const reset = readJson<{ permissions: Record<string, boolean> }>(fixtureRoot, RESET_ARTIFACT);
          reset.permissions.public_release_authorized = true;
          writeJson(fixtureRoot, RESET_ARTIFACT, reset);
        },
        message: "W4 reset CONTROL artifact binding or permissions drifted",
      },
      {
        name: "failed package SHA remains in master",
        mutate: (fixtureRoot) => {
          const master = readJson<{ lanes: Array<{ lane_id: string; package_sha256: string | null }> }>(fixtureRoot, "docs/seo/generated/en-content-parity-control-master.v1.json");
          const w4 = master.lanes.find((lane) => lane.lane_id === "W4");
          if (!w4) throw new Error("missing W4 fixture lane");
          w4.package_sha256 = PACKAGE_SHA;
          writeJson(fixtureRoot, "docs/seo/generated/en-content-parity-control-master.v1.json", master);
        },
        message: "W4 reset master must clear the failed package SHA, lineage, and blockers",
      },
      {
        name: "failed lineage remains in master",
        mutate: (fixtureRoot) => {
          const master = readJson<{ lanes: Array<{ lane_id: string; gate_lineage: unknown[] }> }>(fixtureRoot, "docs/seo/generated/en-content-parity-control-master.v1.json");
          const w4 = master.lanes.find((lane) => lane.lane_id === "W4");
          if (!w4) throw new Error("missing W4 fixture lane");
          w4.gate_lineage = [{ status: "package_frozen", package_sha256: PACKAGE_SHA }];
          writeJson(fixtureRoot, "docs/seo/generated/en-content-parity-control-master.v1.json", master);
        },
        message: "W4 reset master must clear the failed package SHA, lineage, and blockers",
      },
    ];

    for (const testCase of cases) {
      const fixtureRoot = createResetFixture();
      try {
        testCase.mutate(fixtureRoot);
        expect(validatorFailure(fixtureRoot), testCase.name).toContain(testCase.message);
      } finally {
        fs.rmSync(fixtureRoot, { recursive: true, force: true });
      }
    }
  });
});
