import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const PACKAGE_DIRECTORY = path.join(ROOT, "generated/en-content-parity/W3-editorial-cms/career-guides/batches/batch-b-12");
const CANDIDATE_PATH = path.join(PACKAGE_DIRECTORY, "master_manifest_patch.candidate.json");
const CONTROL_VALIDATOR = path.join(ROOT, "scripts/seo/validate-en-content-parity-control.mjs");
const BATCH_VALIDATOR = path.join(ROOT, "scripts/seo/validate-w3-career-guides-batch-b.mjs");
const EXPECTED_CODES = ["annual-career-review-system", "build-five-year-career-roadmap", "career-risk-management", "career-transition-playbook", "cross-industry-move-strategy", "how-to-choose-college-major", "how-to-find-right-career-direction", "improve-workplace-competitiveness", "interview-strategy-by-role", "leader-track-vs-expert-track", "prevent-burnout-while-growing", "salary-negotiation-framework"];

function readJson(file: string) {
  return JSON.parse(fs.readFileSync(path.join(PACKAGE_DIRECTORY, file), "utf8"));
}

function expectControlFailure() {
  try {
    execFileSync(process.execPath, [CONTROL_VALIDATOR, "--artifact", path.relative(ROOT, CANDIDATE_PATH)], { cwd: ROOT, encoding: "utf8" });
  } catch (error) {
    return String((error as { stdout?: string }).stdout ?? "");
  }
  throw new Error("expected control validator failure");
}

describe("W3 Career Guide Batch B partial producer package", () => {
  it("binds exactly the registered twelve guides to a non-transitioning 12/20 witness", () => {
    const scope = readJson("scope_manifest.json");
    const candidate = readJson("master_manifest_patch.candidate.json");
    const ledger = readJson("source_ledger.json");
    expect(scope.partial_batch).toEqual({ batch_id: "batch-b-12", guide_codes: EXPECTED_CODES, registered_row_count: 20, batch_row_count: 12, aggregate_ready: false, master_transition_allowed: false });
    expect(candidate.proposed_status).toBe("package_in_progress");
    expect(ledger.rows.map((row: { guide_code: string }) => row.guide_code)).toEqual(EXPECTED_CODES);
    expect(Object.values(candidate.permissions)).toEqual(Array(7).fill(false));
    expect(execFileSync(process.execPath, [BATCH_VALIDATOR], { cwd: ROOT, encoding: "utf8" })).toContain('"ok":true');
  });

  it("rejects a status transition, a thirteenth guide, and any enabled permission", () => {
    const original = fs.readFileSync(CANDIDATE_PATH, "utf8");
    const candidate = JSON.parse(original);
    try {
      candidate.proposed_status = "package_frozen";
      fs.writeFileSync(CANDIDATE_PATH, `${JSON.stringify(candidate, null, 2)}\n`);
      expect(expectControlFailure()).toContain("partial batch candidate must preserve package_in_progress");

      candidate.proposed_status = "package_in_progress";
      candidate.partial_batch.guide_codes.push("unregistered-thirteenth-guide");
      fs.writeFileSync(CANDIDATE_PATH, `${JSON.stringify(candidate, null, 2)}\n`);
      expect(expectControlFailure()).toContain("partial batch witness guide codes must be the exact Batch B cohort in order");

      candidate.partial_batch.guide_codes.pop();
      candidate.permissions.cms_write_authorized = true;
      fs.writeFileSync(CANDIDATE_PATH, `${JSON.stringify(candidate, null, 2)}\n`);
      expect(expectControlFailure()).toContain("permissions");
    } finally {
      fs.writeFileSync(CANDIDATE_PATH, original);
    }
  });
});
