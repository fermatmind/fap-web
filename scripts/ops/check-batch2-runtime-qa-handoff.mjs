#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const EXPECTED_SCHEMA_VERSION = "fap.result_page.batch2_readback_review_ledger.v0.1";
export const EXPECTED_GO_NO_GO = "GO_FOR_FA30-WEB-02_FRONTEND_RUNTIME_QA_ONLY";
export const EXPECTED_NEXT_ALLOWED_PR = "FA30-WEB-02";
export const EXPECTED_AUTHORITY_STATE = "backend_readback_review_authority_only";
export const RUNNER_SCHEMA_VERSION = "fap.web.batch2_frontend_runtime_qa_handoff.v0.1";

function printHelp() {
  console.log(`Usage: node scripts/ops/check-batch2-runtime-qa-handoff.mjs <ledger-report.json>

Validates the backend Batch 2 readback/review ledger handoff for frontend runtime QA.
The checker performs no network fetches, runtime writes, CMS writes, or deploy actions.
`);
}

function readArgs(argv) {
  const args = { reportPath: "" };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help") {
      printHelp();
      process.exit(0);
    }
    if (!args.reportPath && !arg.startsWith("--")) {
      args.reportPath = arg;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!args.reportPath) {
    throw new Error("A Batch 2 readback/review ledger report path is required.");
  }

  return args;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function asBoolean(value) {
  return value === true;
}

function collectTrueKeys(record) {
  return Object.entries(record || {})
    .filter(([, value]) => value === true)
    .map(([key]) => key);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isZero(value) {
  return Number(value) === 0;
}

function validateBigFive(report, issues) {
  const manifest = report?.bigfive?.review_manifest || {};
  const summary = report?.bigfive?.summary || {};
  const authority = report?.bigfive?.readback_authority || {};

  if (report?.bigfive?.status !== "pass") {
    issues.push("bigfive.status must be pass");
  }
  if (manifest.present !== true) {
    issues.push("bigfive.review_manifest.present must be true");
  }
  if (manifest.human_reviewed !== true) {
    issues.push("bigfive.review_manifest.human_reviewed must be true");
  }
  if (manifest.review_status !== "approved_for_staging") {
    issues.push("bigfive.review_manifest.review_status must be approved_for_staging");
  }
  if (manifest.runtime_use !== "staging_only") {
    issues.push("bigfive.review_manifest.runtime_use must be staging_only");
  }
  if (asBoolean(manifest.production_use_allowed)) {
    issues.push("bigfive.review_manifest.production_use_allowed must be false");
  }
  if (!isZero(summary.validation_error_count)) {
    issues.push("bigfive.summary.validation_error_count must be 0");
  }
  if (!isZero(summary.review_error_count)) {
    issues.push("bigfive.summary.review_error_count must be 0");
  }
  if (!isZero(summary.leak_hit_count)) {
    issues.push("bigfive.summary.leak_hit_count must be 0");
  }
  if (asBoolean(summary.staging_write_performed)) {
    issues.push("bigfive.summary.staging_write_performed must be false");
  }
  if (authority.authority_layer !== "review_manifest_and_candidate_validation") {
    issues.push("bigfive.readback_authority.authority_layer must stay review_manifest_and_candidate_validation");
  }
  if (asBoolean(authority.frontend_fallback_allowed)) {
    issues.push("bigfive.readback_authority.frontend_fallback_allowed must be false");
  }
  if (asBoolean(authority.public_runtime_allowed)) {
    issues.push("bigfive.readback_authority.public_runtime_allowed must be false");
  }
  if (asBoolean(authority.production_write_allowed)) {
    issues.push("bigfive.readback_authority.production_write_allowed must be false");
  }
}

function validateEnneagram(report, issues) {
  const sourceLedger = report?.enneagram?.source_ledger || {};
  const batchSummary = report?.enneagram?.batch_summary || {};
  const authority = report?.enneagram?.readback_authority || {};

  if (report?.enneagram?.status !== "pass") {
    issues.push("enneagram.status must be pass");
  }
  if (sourceLedger.valid !== true) {
    issues.push("enneagram.source_ledger.valid must be true");
  }
  if (asBoolean(sourceLedger.ready_for_generation)) {
    issues.push("enneagram.source_ledger.ready_for_generation must be false");
  }
  if (asBoolean(sourceLedger.ready_for_import)) {
    issues.push("enneagram.source_ledger.ready_for_import must be false");
  }
  if (asBoolean(sourceLedger.ready_for_activation)) {
    issues.push("enneagram.source_ledger.ready_for_activation must be false");
  }
  if (!(Number(batchSummary.payload_count) >= 1)) {
    issues.push("enneagram.batch_summary.payload_count must be at least 1");
  }
  if (asBoolean(batchSummary.bulk_generation_allowed)) {
    issues.push("enneagram.batch_summary.bulk_generation_allowed must be false");
  }
  if (batchSummary.source_mapping_zero_failures !== true) {
    issues.push("enneagram.batch_summary.source_mapping_zero_failures must be true");
  }
  if (batchSummary.metadata_leakage_zero !== true) {
    issues.push("enneagram.batch_summary.metadata_leakage_zero must be true");
  }
  if (batchSummary.forbidden_claim_zero !== true) {
    issues.push("enneagram.batch_summary.forbidden_claim_zero must be true");
  }
  if (batchSummary.fc144_boundary_zero !== true) {
    issues.push("enneagram.batch_summary.fc144_boundary_zero must be true");
  }
  if (asBoolean(batchSummary.production_execution_allowed_for_agent)) {
    issues.push("enneagram.batch_summary.production_execution_allowed_for_agent must be false");
  }
  if (authority.authority_layer !== "source_ledger_and_batch_reports") {
    issues.push("enneagram.readback_authority.authority_layer must stay source_ledger_and_batch_reports");
  }
  if (asBoolean(authority.frontend_fallback_allowed)) {
    issues.push("enneagram.readback_authority.frontend_fallback_allowed must be false");
  }
  if (asBoolean(authority.public_runtime_allowed)) {
    issues.push("enneagram.readback_authority.public_runtime_allowed must be false");
  }
  if (asBoolean(authority.production_write_allowed)) {
    issues.push("enneagram.readback_authority.production_write_allowed must be false");
  }
}

export function assessBatch2RuntimeQaHandoff(report) {
  const issues = [];

  if (report?.schema_version !== EXPECTED_SCHEMA_VERSION) {
    issues.push(`schema_version must be ${EXPECTED_SCHEMA_VERSION}`);
  }
  if (report?.authority_state !== EXPECTED_AUTHORITY_STATE) {
    issues.push(`authority_state must be ${EXPECTED_AUTHORITY_STATE}`);
  }
  if (report?.next_allowed_pr !== EXPECTED_NEXT_ALLOWED_PR) {
    issues.push(`next_allowed_pr must be ${EXPECTED_NEXT_ALLOWED_PR}`);
  }
  if (report?.go_no_go !== EXPECTED_GO_NO_GO) {
    issues.push(`go_no_go must be ${EXPECTED_GO_NO_GO}`);
  }
  if (report?.production_go_no_go !== "NO_GO") {
    issues.push("production_go_no_go must stay NO_GO");
  }
  if (report?.runtime_use !== "not_runtime") {
    issues.push("runtime_use must stay not_runtime");
  }
  if (asBoolean(report?.production_use_allowed)) {
    issues.push("production_use_allowed must be false");
  }
  if (asBoolean(report?.ready_for_runtime)) {
    issues.push("ready_for_runtime must be false");
  }
  if (asBoolean(report?.ready_for_production)) {
    issues.push("ready_for_production must be false");
  }

  validateBigFive(report, issues);
  validateEnneagram(report, issues);

  const forbiddenGuarantees = collectTrueKeys(report?.negative_guarantees || {});
  if (forbiddenGuarantees.length > 0) {
    issues.push(`negative_guarantees must remain false: ${forbiddenGuarantees.join(", ")}`);
  }

  const artifactPath = report?.artifacts?.batch2_result_page_readback_review_ledger_report_json?.relative_path
    || report?.artifacts?.batch2_result_page_readback_review_ledger_report_json
    || report?.artifacts?.batch2_result_page_readback_review_ledger_report?.relative_path
    || report?.artifacts?.batch2_result_page_readback_review_ledger_report;
  if (artifactPath !== undefined && !isNonEmptyString(artifactPath)) {
    issues.push("artifacts.batch2_result_page_readback_review_ledger_report must be a non-empty path when present");
  }

  return {
    schema_version: RUNNER_SCHEMA_VERSION,
    runner: "check-batch2-runtime-qa-handoff",
    passed: issues.length === 0,
    issues,
    summary: {
      next_allowed_pr: EXPECTED_NEXT_ALLOWED_PR,
      authority_state: report?.authority_state ?? null,
      go_no_go: report?.go_no_go ?? null,
      frontend_runtime_qa_allowed: issues.length === 0,
      production_runtime_allowed: false,
      allowed_scales: ["BIG5", "ENNEAGRAM"],
      blocked_operations: [
        "frontend_authority_substitution",
        "public_runtime_enablement",
        "production_runtime_enablement",
        "production_write_execution",
        "deploy",
      ],
      bigfive_ready: report?.bigfive?.status === "pass",
      enneagram_ready: report?.enneagram?.status === "pass",
    },
    boundaries: {
      network_calls_attempted: false,
      runtime_writes_attempted: false,
      cms_writes_attempted: false,
      deploy_attempted: false,
    },
  };
}

export function main() {
  const args = readArgs(process.argv.slice(2));
  const reportPath = path.resolve(args.reportPath);
  const report = readJson(reportPath);
  const result = assessBatch2RuntimeQaHandoff(report);

  console.log(JSON.stringify({
    ...result,
    input_path: path.relative(process.cwd(), reportPath),
  }, null, 2));

  if (!result.passed) {
    process.exitCode = 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main();
}
