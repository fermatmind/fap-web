import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const PACKAGE_DIRECTORY = path.join(
  ROOT,
  "generated/en-content-parity/W3-editorial-cms/career-guides/batches/batch-a-8",
);
const CANDIDATE_PATH = path.join(PACKAGE_DIRECTORY, "master_manifest_patch.candidate.json");
const CONTROL_VALIDATOR = path.join(ROOT, "scripts/seo/validate-en-content-parity-control.mjs");
const BATCH_VALIDATOR = path.join(ROOT, "scripts/seo/validate-w3-career-guides-batch-a.mjs");
const EXPECTED_CODES = [
  "big5-for-career-decisions",
  "build-portfolio-for-career-switch",
  "career-growth-with-manager",
  "first-90-days-in-new-role",
  "from-mbti-to-job-fit",
  "iq-eq-balance-at-work",
  "networking-that-actually-works",
  "personal-brand-for-professionals",
];
const PERMISSION_KEYS = [
  "cms_write_authorized",
  "staging_write_authorized",
  "production_import_authorized",
  "public_release_authorized",
  "seo_runtime_release_authorized",
  "search_submission_authorized",
  "master_manifest_write_authorized",
];

function readJson(file: string) {
  return JSON.parse(fs.readFileSync(path.join(PACKAGE_DIRECTORY, file), "utf8"));
}

function runControlValidator() {
  return execFileSync(
    process.execPath,
    [CONTROL_VALIDATOR, "--artifact", path.relative(ROOT, CANDIDATE_PATH)],
    { cwd: ROOT, encoding: "utf8" },
  );
}

function runControlValidatorExpectFailure() {
  try {
    runControlValidator();
  } catch (error) {
    return String((error as { stdout?: string }).stdout ?? "");
  }
  throw new Error("expected control validator to fail");
}

describe("W3 Career Guide Batch A partial producer package", () => {
  it("contains exactly the registered eight codes with a non-transitioning partial witness", () => {
    const scope = readJson("scope_manifest.json");
    const candidate = readJson("master_manifest_patch.candidate.json");
    const ledger = readJson("source_ledger.json");
    const expectedPartial = {
      batch_id: "batch-a-8",
      guide_codes: EXPECTED_CODES,
      registered_row_count: 20,
      batch_row_count: 8,
      aggregate_ready: false,
      master_transition_allowed: false,
    };

    expect(scope.partial_batch).toEqual(expectedPartial);
    expect(candidate.partial_batch).toEqual(expectedPartial);
    expect(candidate.proposed_status).toBe("package_in_progress");
    expect(ledger.rows.map((row: { guide_code: string }) => row.guide_code)).toEqual(EXPECTED_CODES);
    expect(Object.keys(candidate.permissions).sort()).toEqual([...PERMISSION_KEYS].sort());
    expect(Object.values(candidate.permissions)).toEqual(Array(PERMISSION_KEYS.length).fill(false));
  });

  it("keeps the partial SHA outside the master package fields and verifies every immutable payload", () => {
    const candidate = readJson("master_manifest_patch.candidate.json");
    const manifest = readJson("sha256_manifest.json");
    const immutableFiles = [
      "scope_manifest.json",
      "assets.jsonl",
      "translation_map.json",
      "source_ledger.json",
      "claim_boundary_report.json",
      "editorial_review.json",
      "dry_run_readiness.json",
      "handoff.md",
    ];
    const files = immutableFiles.map((file) => ({
      path: file,
      sha256: crypto.createHash("sha256").update(fs.readFileSync(path.join(PACKAGE_DIRECTORY, file))).digest("hex"),
    }));

    expect(candidate).not.toHaveProperty("qa_report_ref");
    expect(candidate).not.toHaveProperty("gate_lineage");
    expect(manifest.files).toEqual(files);
    expect(manifest.package_sha256).toBe(
      crypto.createHash("sha256").update(files.map((file) => `${file.path}:${file.sha256}`).join("\n")).digest("hex"),
    );
    expect(execFileSync(process.execPath, [BATCH_VALIDATOR], { cwd: ROOT, encoding: "utf8" })).toContain('"ok":true');
  });

  it("rejects a partial witness that attempts a state transition, a ninth code, or a permission", () => {
    const original = fs.readFileSync(CANDIDATE_PATH, "utf8");
    const candidate = JSON.parse(original);
    try {
      candidate.proposed_status = "package_frozen";
      fs.writeFileSync(CANDIDATE_PATH, `${JSON.stringify(candidate, null, 2)}\n`);
      expect(runControlValidatorExpectFailure()).toContain("partial batch candidate must preserve package_in_progress");

      candidate.proposed_status = "package_in_progress";
      candidate.partial_batch.guide_codes.push("a-ninth-guide");
      fs.writeFileSync(CANDIDATE_PATH, `${JSON.stringify(candidate, null, 2)}\n`);
      expect(runControlValidatorExpectFailure()).toContain("partial batch witness guide codes must be the exact Batch A cohort in order");

      candidate.partial_batch.guide_codes.pop();
      candidate.permissions.cms_write_authorized = true;
      fs.writeFileSync(CANDIDATE_PATH, `${JSON.stringify(candidate, null, 2)}\n`);
      expect(runControlValidatorExpectFailure()).toContain("permissions");
    } finally {
      fs.writeFileSync(CANDIDATE_PATH, original);
    }
  });
});
