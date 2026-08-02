#!/usr/bin/env node

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BACKEND_REPOSITORY = process.env.FAP_API_REPOSITORY;
const BACKEND_COMMIT = "e2470dab99c21f5776f8a0e848ceb81eddfa0c51";
const BACKEND_ROOT = "backend/content_assets/en-content-parity/W5-enneagram/private-result-content-v2";
const BACKEND_PACKAGE_SHA = "8a1653b5053b7ab910957543c8bb831b8c0759aaec82a7200e5c13c08a5e98d5";
const BACKEND_W9_PATH = "backend/content_assets/en-content-parity/W9/enneagram-private-results/8a1653b5053b7ab910957543c8bb831b8c0759aaec82a7200e5c13c08a5e98d5/independent_w9_report.json";
const ARTIFACT_ROOT = "generated/en-content-parity/v2/W5-enneagram-private-results/8a1653b5";
const SNAPSHOT_ROOT = `${ARTIFACT_ROOT}/external_package`;
const PACKAGE_ROOT = `${ARTIFACT_ROOT}/package`;
const W9_REPORT_REF = "generated/en-content-parity/W9-independent-qa/enneagram/w5-enneagram-private-results-8a1653b5/independent_qa_report.json";
const ASSET_IDS = ["ENPARITY-W5-ENNEAGRAM-RESULT-CONTENT"];
const RECORDED_AT = "2026-08-03T00:00:00Z";
const PERMISSIONS = {
  cms_write_authorized: false,
  staging_write_authorized: false,
  production_import_authorized: false,
  public_release_authorized: false,
  seo_runtime_release_authorized: false,
  search_submission_authorized: false,
  master_manifest_write_authorized: false,
};

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  return value;
}

function canonicalJson(value) { return JSON.stringify(canonicalize(value)); }
function sha256(value) { return createHash("sha256").update(value).digest("hex"); }
function writeJson(relativePath, value) { fs.writeFileSync(path.join(ROOT, relativePath), `${JSON.stringify(value, null, 2)}\n`); }
function hash(relativePath) { return sha256(fs.readFileSync(path.join(ROOT, relativePath))); }

function readBackend(relativePath) {
  if (!BACKEND_REPOSITORY) throw new Error("FAP_API_REPOSITORY is required for the immutable W5 backend snapshot");
  return execFileSync("git", ["-C", BACKEND_REPOSITORY, "show", `${BACKEND_COMMIT}:${relativePath}`]);
}

function writeSnapshotFile(relativePath, bytes) {
  const target = path.join(ROOT, SNAPSHOT_ROOT, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, bytes, { flag: "wx" });
}

function main() {
  const manifestBytes = readBackend(`${BACKEND_ROOT}/package_manifest.json`);
  const backendManifest = JSON.parse(manifestBytes.toString("utf8"));
  if (
    backendManifest.schema_version !== "fermatmind.en_parity.enneagram_private_result_package.v2" ||
    backendManifest.lane_id !== "W5" ||
    backendManifest.subscope !== "enneagram-results" ||
    backendManifest.package_sha256 !== BACKEND_PACKAGE_SHA ||
    backendManifest.expected_row_count !== 630 ||
    backendManifest.source_asset_count !== 1332 ||
    !Array.isArray(backendManifest.files) || backendManifest.files.length !== 649 ||
    sha256(backendManifest.files.map((file) => `${file.path}\0${String(file.sha256).toLowerCase()}\n`).join("")) !== BACKEND_PACKAGE_SHA
  ) throw new Error("backend_package_manifest_identity_mismatch");

  const w9Bytes = readBackend(BACKEND_W9_PATH);
  const backendW9 = JSON.parse(w9Bytes.toString("utf8"));
  if (
    backendW9.schema_version !== "fermatmind.en_parity.independent_w9_report.v1" ||
    backendW9.review_kind !== "independent_w9" || backendW9.verdict !== "PASS" ||
    backendW9.lane_id !== "W5" || backendW9.subscope !== "enneagram-results" ||
    backendW9.package_sha256 !== BACKEND_PACKAGE_SHA || backendW9.reviewed_row_count !== 630 ||
    backendW9.reviewed_source_commit !== backendManifest.source_commit ||
    !Object.values(backendW9.checks ?? {}).every((value) => value === "PASS")
  ) throw new Error("backend_w9_identity_mismatch");

  fs.rmSync(path.join(ROOT, ARTIFACT_ROOT), { recursive: true, force: true });
  fs.rmSync(path.join(ROOT, path.dirname(W9_REPORT_REF)), { recursive: true, force: true });
  writeSnapshotFile("package_manifest.json", manifestBytes);
  for (const file of backendManifest.files) {
    if (typeof file?.path !== "string" || !/^[a-f0-9]{64}$/.test(file?.sha256 ?? "") || file.path.includes("..")) {
      throw new Error("backend_package_inventory_invalid");
    }
    const bytes = readBackend(`${BACKEND_ROOT}/${file.path}`);
    if (sha256(bytes) !== file.sha256) throw new Error(`backend_package_file_sha_mismatch=${file.path}`);
    writeSnapshotFile(file.path, bytes);
  }

  const candidateFiles = backendManifest.files.filter((file) => /^candidate\/candidate_payloads\/[^/]+\.json$/.test(file.path));
  if (candidateFiles.length !== 630) throw new Error("backend_candidate_payload_count_mismatch");
  const records = candidateFiles.map((file) => {
    const payload = JSON.parse(fs.readFileSync(path.join(ROOT, SNAPSHOT_ROOT, file.path), "utf8"));
    if (payload.schema_version !== "fermatmind.en_parity.enneagram_private_result_payload.v2" || typeof payload.identity !== "string" || payload.locale !== "en") {
      throw new Error(`backend_candidate_payload_contract_mismatch=${file.path}`);
    }
    return { asset_id: payload.identity, backend_path: file.path, backend_sha256: file.sha256 };
  });
  if (new Set(records.map((record) => record.asset_id)).size !== 630) throw new Error("backend_candidate_identity_set_mismatch");
  fs.mkdirSync(path.join(ROOT, PACKAGE_ROOT), { recursive: true });
  const recordsPath = `${PACKAGE_ROOT}/records.jsonl`;
  fs.writeFileSync(path.join(ROOT, recordsPath), `${records.map((record) => JSON.stringify(record)).join("\n")}\n`);
  const recordIdsSha256 = sha256(canonicalJson(records.map((record) => record.asset_id).sort()));
  const payloads = [{ path: recordsPath, sha256: hash(recordsPath), row_count: 630 }];
  const packageManifest = {
    schema_version: "fermatmind.en_content_parity_package_payload_manifest.v2",
    artifact_kind: "package_payload_manifest",
    package_root: PACKAGE_ROOT,
    record_identity_field: "asset_id",
    record_ids_sha256: recordIdsSha256,
    payloads,
  };
  const packageManifestRef = `${PACKAGE_ROOT}/sha256_manifest.json`;
  writeJson(packageManifestRef, packageManifest);
  const packageIdentity = {
    lane_id: "W5",
    subscope_id: null,
    expected_count: 630,
    promotion_row_count: 630,
    asset_ids: ASSET_IDS,
    package_root: PACKAGE_ROOT,
    package_manifest_ref: packageManifestRef,
    package_manifest_sha256: hash(packageManifestRef),
    record_identity_field: "asset_id",
    record_ids_sha256: recordIdsSha256,
    payloads,
  };
  const localEnvelopeSha = sha256(canonicalJson(packageIdentity));
  writeJson(`${ARTIFACT_ROOT}/package_freeze_evidence.json`, {
    $schema: "./en-content-parity-control-master.v2.schema.json",
    schema_version: "fermatmind.en_content_parity_package_freeze.v2",
    artifact_kind: "package_freeze_evidence",
    ...packageIdentity,
    package_sha256: localEnvelopeSha,
  });

  const w9SnapshotRef = `${ARTIFACT_ROOT}/external_w9/independent_w9_report.json`;
  fs.mkdirSync(path.dirname(path.join(ROOT, w9SnapshotRef)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, w9SnapshotRef), w9Bytes, { flag: "wx" });
  const w9SourceSha = hash(w9SnapshotRef);
  const externalEvidence = {
    schema_version: "fermatmind.en_content_parity_external_package_evidence.v2",
    artifact_kind: "external_backend_package_binding",
    source_repository: "fermatmind/fap-api",
    source_commit: BACKEND_COMMIT,
    package_source_commit: backendManifest.source_commit,
    backend_package_path: BACKEND_ROOT,
    backend_manifest_path: `${BACKEND_ROOT}/package_manifest.json`,
    backend_manifest_sha256: sha256(manifestBytes),
    backend_package_sha256: BACKEND_PACKAGE_SHA,
    logical_asset_count: 630,
    promotion_row_count: 630,
    authority_target: { lane_id: "W5", subscope: null, production_subscope: "enneagram-results", asset_ids: ASSET_IDS, expected_count: 630, source_asset_count: 1332, public_control_count: 58 },
    snapshot: { root: SNAPSHOT_ROOT, package_manifest_ref: `${SNAPSHOT_ROOT}/package_manifest.json`, package_manifest_sha256: sha256(manifestBytes), package_file_count: 649, physical_file_count: 650, files: backendManifest.files },
    payloads: candidateFiles.map((file) => ({ path: file.path, sha256: file.sha256, row_count: 1 })),
    w9: { backend_report_path: BACKEND_W9_PATH, source_report_ref: w9SnapshotRef, source_report_sha256: w9SourceSha, reviewed_source_commit: backendW9.reviewed_source_commit, verdict: "PASS" },
    permissions: PERMISSIONS,
  };
  writeJson(`${ARTIFACT_ROOT}/external_package_evidence.json`, externalEvidence);
  const normalizedW9 = {
    schema_version: "fermatmind.en_content_parity_independent_qa_report.v2",
    artifact_kind: "independent_qa_report",
    qa_lane_id: "W9",
    producer_lane_id: "W5",
    subscope_id: null,
    package_sha256: localEnvelopeSha,
    reviewed_source_repository: "fermatmind/fap-api",
    reviewed_source_commit: backendW9.reviewed_source_commit,
    reviewed_asset_ids: ASSET_IDS,
    reviewed_row_count: 630,
    verdict: "PASS",
    checks: {
      language_naturalness: backendW9.checks.language_naturalness,
      grammar: backendW9.checks.grammar_and_structure,
      markdown_integrity: backendW9.checks.markdown_and_cjk,
      chinese_leakage: backendW9.checks.markdown_and_cjk,
      source_equivalence: backendW9.checks.source_identity,
      claim_boundary: backendW9.checks.claim_boundary,
      privacy_fields: backendW9.checks.privacy_fields,
      identity_and_duplicates: backendW9.checks.identity_and_duplicates,
      surface_alignment: backendW9.checks.surface_alignment,
    },
    external_report: { source_repository: "fermatmind/fap-api", source_commit: backendW9.reviewed_source_commit, report_ref: w9SnapshotRef, report_sha256: w9SourceSha },
  };
  fs.mkdirSync(path.dirname(path.join(ROOT, W9_REPORT_REF)), { recursive: true });
  writeJson(W9_REPORT_REF, normalizedW9);
  writeJson(`${ARTIFACT_ROOT}/same_pr_w9_binding.json`, {
    schema_version: "fermatmind.en_content_parity_same_pr_w9_binding.v2",
    artifact_kind: "same_pr_w9_binding",
    producer_lane_id: "W5",
    subscope_id: null,
    source_report_ref: W9_REPORT_REF,
    source_report_sha256: hash(W9_REPORT_REF),
    package_sha256: BACKEND_PACKAGE_SHA,
    reviewed_row_count: 630,
    reviewed_record_ids_sha256: recordIdsSha256,
    reviewed_source_commit: backendW9.reviewed_source_commit,
    review_mode: "full_row_revalidation_of_external_physical_snapshot",
    verdict: "PASS",
    permissions: PERMISSIONS,
  });
  writeJson(`${ARTIFACT_ROOT}/inventory_frozen_evidence.json`, { artifact_kind: "inventory_frozen_evidence", lane_id: "W5", subscope: null, production_subscope: "enneagram-results", source_asset_count: 1332, public_control_count: 58, promotion_row_count: 630, permissions: PERMISSIONS });
  writeJson(`${ARTIFACT_ROOT}/package_in_progress_evidence.json`, { artifact_kind: "package_in_progress_evidence", lane_id: "W5", subscope: null, production_subscope: "enneagram-results", backend_package_sha256: BACKEND_PACKAGE_SHA, permissions: PERMISSIONS });
  const laneManifest = {
    $schema: "./en-content-parity-control-master.v2.schema.json",
    schema_version: "fermatmind.en_content_parity_lane_manifest.v2",
    artifact_kind: "lane_manifest",
    lane_id: "W5",
    subscope: null,
    status: "qa_pass",
    blocked_from_status: null,
    package_sha256: localEnvelopeSha,
    backend_package_sha256: BACKEND_PACKAGE_SHA,
    asset_ids: ASSET_IDS,
    qa_report_ref: W9_REPORT_REF,
    gate_lineage: [
      { status: "package_frozen", evidence_owner_lane_id: "W5", report_ref: `${ARTIFACT_ROOT}/package_freeze_evidence.json`, report_sha256: hash(`${ARTIFACT_ROOT}/package_freeze_evidence.json`), package_sha256: localEnvelopeSha, accepted_at: RECORDED_AT },
      { status: "qa_pass", evidence_owner_lane_id: "W9", report_ref: W9_REPORT_REF, report_sha256: hash(W9_REPORT_REF), package_sha256: localEnvelopeSha, accepted_at: RECORDED_AT },
    ],
    legacy_lineage: [],
    blockers: [],
    transition_trace: [
      ["not_started", "inventory_frozen", `${ARTIFACT_ROOT}/inventory_frozen_evidence.json`],
      ["inventory_frozen", "package_in_progress", `${ARTIFACT_ROOT}/package_in_progress_evidence.json`],
      ["package_in_progress", "package_frozen", `${ARTIFACT_ROOT}/package_freeze_evidence.json`],
      ["package_frozen", "qa_pass", W9_REPORT_REF],
    ].map(([from_status, to_status, evidence_ref]) => ({ from_status, to_status, evidence_ref, evidence_sha256: hash(evidence_ref), recorded_at: RECORDED_AT })),
    reviewed_source_commit: backendW9.reviewed_source_commit,
    expected_count: 630,
    promotion_row_count: 630,
    w9_review_binding_ref: `${ARTIFACT_ROOT}/same_pr_w9_binding.json`,
    w9_review_binding_sha256: hash(`${ARTIFACT_ROOT}/same_pr_w9_binding.json`),
    external_package_evidence_ref: `${ARTIFACT_ROOT}/external_package_evidence.json`,
    external_package_evidence_sha256: hash(`${ARTIFACT_ROOT}/external_package_evidence.json`),
  };
  writeJson(`${ARTIFACT_ROOT}/lane_manifest.json`, laneManifest);
  process.stdout.write(`${JSON.stringify({ ok: true, backend_package_sha256: BACKEND_PACKAGE_SHA, local_envelope_sha256: localEnvelopeSha, row_count: records.length, package_file_count: backendManifest.files.length })}\n`);
}

try { main(); } catch (error) { process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`); process.exitCode = 1; }
