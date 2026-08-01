import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const VALIDATOR = path.join(ROOT, "scripts/seo/validate-w4-riasec-w9-qa.mjs");
const HISTORICAL_ROOT = "generated/en-content-parity/W9-independent-qa/riasec/w4-riasec-944ddac";
const CURRENT_ROOT = "generated/en-content-parity/W9-independent-qa/riasec/w4-riasec-f3f2463f";
const REPAIRED_PACKAGE_SHA = "f3f2463fadd827e586d39d42ecd9e6418b7cb7f36a0697eb06dcead8292f54eb";

function createFixture(): string {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "en-parity-w4-riasec-w9-"));
  for (const relativePath of [
    "docs/seo/generated/en-content-parity-control-master.v1.json",
    "generated/en-content-parity/W4-riasec",
    HISTORICAL_ROOT,
    CURRENT_ROOT,
  ]) {
    const source = path.join(ROOT, relativePath);
    const target = path.join(fixtureRoot, relativePath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.cpSync(source, target, { recursive: true });
  }
  return fixtureRoot;
}

function validatorFailure(fixtureRoot: string): string {
  try {
    execFileSync("node", [VALIDATOR], { cwd: fixtureRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (error) {
    return (error as { stderr?: string }).stderr ?? "";
  }
  return "";
}

describe("EN-PARITY-W9-W4-RIASEC-INDEPENDENT-QA-02", () => {
  it("binds a full independent PASS review to the exact repaired 1550-row frozen package", () => {
    const result = JSON.parse(execFileSync("node", ["scripts/seo/validate-w4-riasec-w9-qa.mjs"], { encoding: "utf8" }));
    expect(result).toMatchObject({
      ok: true,
      historical: { package_sha256: "944ddac51957b38aa6232335f07269cd904c2513348fad652acb5acb0de59e33", verdict: "BLOCKED", rows: 1550 },
      current: { package_sha256: REPAIRED_PACKAGE_SHA, verdict: "PASS", rows: 1550 },
      qa_pass_authorized: false,
      control_accepted: true,
    });
  });

  it("rejects tampering with retained historical W9 evidence", () => {
    const fixtureRoot = createFixture();
    try {
      const reportPath = path.join(fixtureRoot, HISTORICAL_ROOT, "independent_qa_report.json");
      const report = JSON.parse(fs.readFileSync(reportPath, "utf8")) as { verdict: string };
      report.verdict = "PASS";
      fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
      expect(validatorFailure(fixtureRoot)).toContain("historical W9 report identity or verdict drifted");
    } finally {
      fs.rmSync(fixtureRoot, { recursive: true, force: true });
    }
  });

  it("rejects a current W9 report that self-accepts qa_pass, drops a reviewed row, or loses CONTROL acceptance binding", () => {
    const fixtureRoot = createFixture();
    try {
      const reportPath = path.join(fixtureRoot, CURRENT_ROOT, "independent_qa_report.json");
      const report = JSON.parse(fs.readFileSync(reportPath, "utf8")) as { qa_pass_authorized: boolean };
      report.qa_pass_authorized = true;
      fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
      expect(validatorFailure(fixtureRoot)).toContain("current W9 report must be a full PASS without self-acceptance");
    } finally {
      fs.rmSync(fixtureRoot, { recursive: true, force: true });
    }

    const secondFixtureRoot = createFixture();
    try {
      const rowsPath = path.join(secondFixtureRoot, CURRENT_ROOT, "row_review_evidence.json");
      const rows = JSON.parse(fs.readFileSync(rowsPath, "utf8")) as { row_reviews: unknown[] };
      rows.row_reviews.pop();
      fs.writeFileSync(rowsPath, `${JSON.stringify(rows, null, 2)}\n`);
      expect(validatorFailure(secondFixtureRoot)).toContain("current W9 row evidence identity or coverage drifted");
    } finally {
      fs.rmSync(secondFixtureRoot, { recursive: true, force: true });
    }

    const thirdFixtureRoot = createFixture();
    try {
      const masterPath = path.join(thirdFixtureRoot, "docs/seo/generated/en-content-parity-control-master.v1.json");
      const master = JSON.parse(fs.readFileSync(masterPath, "utf8")) as {
        lanes: Array<{ lane_id: string; qa_report_ref: string | null }>;
      };
      const w4 = master.lanes.find((lane) => lane.lane_id === "W4");
      if (!w4) throw new Error("missing W4 fixture lane");
      w4.qa_report_ref = null;
      fs.writeFileSync(masterPath, `${JSON.stringify(master, null, 2)}\n`);
      expect(validatorFailure(thirdFixtureRoot)).toContain(
        "W4 qa_pass state requires the exact externally accepted W9 PASS report"
      );
    } finally {
      fs.rmSync(thirdFixtureRoot, { recursive: true, force: true });
    }
  });
});
