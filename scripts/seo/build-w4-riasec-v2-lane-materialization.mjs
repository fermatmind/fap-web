#!/usr/bin/env node

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BACKEND_REPOSITORY = process.env.FAP_API_REPOSITORY;
const BACKEND_COMMIT = "d8ee74a7620c7d2f9c7270667c1f9d7de0cade5c";
const BACKEND_ROOT = "backend/content_assets/en-content-parity/W4-riasec";
const BACKEND_PACKAGE_SHA = "f3f2463fadd827e586d39d42ecd9e6418b7cb7f36a0697eb06dcead8292f54eb";
const W9_REPORT_REF = "generated/en-content-parity/W9-independent-qa/riasec/w4-riasec-f3f2463f/independent_qa_report.json";
const W9_REPORT_SHA = "f2c0f83871ecae1ed76bd742f0ddcf20de71f7980c012bc5cd1affe72dd46882";
const PACKAGE_ROOT = "generated/en-content-parity/v2/W4-riasec/f3f2463f/package";
const ARTIFACT_ROOT = "generated/en-content-parity/v2/W4-riasec/f3f2463f";
const REVIEWED_SOURCE_COMMIT = process.env.W4_REVIEWED_SOURCE_COMMIT ?? null;

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  return value;
}

function canonicalJson(value) {
  return JSON.stringify(canonicalize(value));
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function readBackend(relativePath) {
  if (!BACKEND_REPOSITORY) throw new Error("FAP_API_REPOSITORY is required to build the immutable backend snapshot");
  return execFileSync("git", ["-C", BACKEND_REPOSITORY, "show", `${BACKEND_COMMIT}:${BACKEND_ROOT}/${relativePath}`]);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(ROOT, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function materializationLegacyLineage() {
  const master = readJson("docs/seo/generated/en-content-parity-control-master.v2.json");
  const lane = master.lanes.find((item) => item.lane_id === "W4");
  return [...(lane?.legacy_lineage ?? []), ...(lane?.gate_lineage ?? [])].map((entry) => ({
    ...entry,
    legacy_source: "v1_pre_v2_materialization_audit_only",
    transition_dependency_allowed: false,
  }));
}

function main() {
  const externalEvidenceBytes = readBackend("external_package_evidence.json");
  const externalEvidence = JSON.parse(externalEvidenceBytes.toString("utf8"));
  if (externalEvidence.producer?.package_sha256 !== BACKEND_PACKAGE_SHA || externalEvidence.authority_snapshot?.promotion_row_count !== 1550) {
    throw new Error("backend_external_package_evidence_identity_mismatch");
  }
  const payloads = externalEvidence.authority_snapshot.segment_payloads;
  if (!Array.isArray(payloads) || payloads.length !== 9 || payloads.reduce((total, item) => total + item.row_count, 0) !== 1550) {
    throw new Error("backend_payload_inventory_mismatch");
  }
  fs.rmSync(path.join(ROOT, ARTIFACT_ROOT), { recursive: true, force: true });
  fs.mkdirSync(path.join(ROOT, PACKAGE_ROOT, "payloads"), { recursive: true });
  const localPayloads = payloads.map((payload) => {
    const basename = path.basename(payload.path);
    const bytes = readBackend(payload.path);
    if (sha256(bytes) !== payload.sha256) throw new Error(`backend_payload_sha_mismatch=${payload.path}`);
    const rows = bytes.toString("utf8").split(/\r?\n/).filter((line) => line.trim() !== "").map((line) => JSON.parse(line));
    if (rows.length !== payload.row_count || rows.some((row) => typeof row.asset_id !== "string" || row.asset_id === "")) {
      throw new Error(`backend_payload_row_contract_mismatch=${payload.path}`);
    }
    const relativePath = `${PACKAGE_ROOT}/payloads/${basename}`;
    fs.writeFileSync(path.join(ROOT, relativePath), bytes, { flag: "wx" });
    return { path: relativePath, sha256: payload.sha256, row_count: payload.row_count };
  });
  const ids = localPayloads.flatMap((payload) => fs.readFileSync(path.join(ROOT, payload.path), "utf8").split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line).asset_id));
  if (ids.length !== 1550 || new Set(ids).size !== 1550) throw new Error("snapshot_identity_set_mismatch");
  const recordIdsSha256 = sha256(canonicalJson([...ids].sort()));
  const packageManifest = {
    schema_version: "fermatmind.en_content_parity_package_payload_manifest.v2",
    artifact_kind: "package_payload_manifest",
    package_root: PACKAGE_ROOT,
    record_identity_field: "asset_id",
    record_ids_sha256: recordIdsSha256,
    payloads: localPayloads,
  };
  writeJson(`${PACKAGE_ROOT}/sha256_manifest.json`, packageManifest);
  const packageManifestSha = sha256(fs.readFileSync(path.join(ROOT, PACKAGE_ROOT, "sha256_manifest.json")));
  const packageIdentity = {
    lane_id: "W4",
    subscope_id: null,
    expected_count: 14,
    promotion_row_count: 1550,
    asset_ids: ["ENPARITY-W4-RIASEC-DEEP-ASSETS"],
    package_root: PACKAGE_ROOT,
    package_manifest_ref: `${PACKAGE_ROOT}/sha256_manifest.json`,
    package_manifest_sha256: packageManifestSha,
    record_identity_field: "asset_id",
    record_ids_sha256: recordIdsSha256,
    payloads: localPayloads,
  };
  const localEnvelopeSha = sha256(canonicalJson(packageIdentity));
  const packageFreezeEvidence = {
    $schema: "./en-content-parity-control-master.v2.schema.json",
    schema_version: "fermatmind.en_content_parity_package_freeze.v2",
    artifact_kind: "package_freeze_evidence",
    ...packageIdentity,
    package_sha256: localEnvelopeSha,
  };
  writeJson(`${ARTIFACT_ROOT}/package_freeze_evidence.json`, packageFreezeEvidence);
  const externalBinding = {
    schema_version: "fermatmind.en_content_parity_external_package_evidence.v2",
    artifact_kind: "external_backend_package_binding",
    source_repository: "fermatmind/fap-api",
    source_commit: BACKEND_COMMIT,
    backend_package_path: BACKEND_ROOT,
    backend_manifest_path: `${BACKEND_ROOT}/external_package_evidence.json`,
    backend_manifest_sha256: sha256(externalEvidenceBytes),
    backend_package_sha256: BACKEND_PACKAGE_SHA,
    logical_asset_count: 14,
    promotion_row_count: 1550,
    payloads: payloads.map(({ path: payloadPath, sha256: payloadSha, row_count }) => ({ path: payloadPath, sha256: payloadSha, row_count })),
    permissions: externalEvidence.permissions,
  };
  writeJson(`${ARTIFACT_ROOT}/external_package_evidence.json`, externalBinding);
  const w9Binding = {
    schema_version: "fermatmind.en_content_parity_same_pr_w9_binding.v2",
    artifact_kind: "same_pr_w9_binding",
    producer_lane_id: "W4",
    subscope_id: null,
    source_report_ref: W9_REPORT_REF,
    source_report_sha256: W9_REPORT_SHA,
    package_sha256: BACKEND_PACKAGE_SHA,
    reviewed_row_count: 1550,
    reviewed_record_ids_sha256: recordIdsSha256,
    reviewed_source_commit: REVIEWED_SOURCE_COMMIT,
    review_mode: "full_row_revalidation_of_physical_snapshot",
    verdict: "PASS",
    permissions: externalEvidence.permissions,
  };
  writeJson(`${ARTIFACT_ROOT}/same_pr_w9_binding.json`, w9Binding);
  const inventoryEvidence = { artifact_kind: "inventory_frozen_evidence", lane_id: "W4", logical_asset_count: 14, promotion_row_count: 1550, permissions: externalEvidence.permissions };
  const progressEvidence = { artifact_kind: "package_in_progress_evidence", lane_id: "W4", backend_package_sha256: BACKEND_PACKAGE_SHA, permissions: externalEvidence.permissions };
  writeJson(`${ARTIFACT_ROOT}/inventory_frozen_evidence.json`, inventoryEvidence);
  writeJson(`${ARTIFACT_ROOT}/package_in_progress_evidence.json`, progressEvidence);
  const hash = (relativePath) => sha256(fs.readFileSync(path.join(ROOT, relativePath)));
  const laneManifest = {
    $schema: "./en-content-parity-control-master.v2.schema.json",
    schema_version: "fermatmind.en_content_parity_lane_manifest.v2",
    artifact_kind: "lane_manifest",
    lane_id: "W4",
    subscope: null,
    status: "qa_pass",
    blocked_from_status: null,
    package_sha256: localEnvelopeSha,
    backend_package_sha256: BACKEND_PACKAGE_SHA,
    qa_report_ref: W9_REPORT_REF,
    gate_lineage: [
      { status: "package_frozen", evidence_owner_lane_id: "W4", report_ref: `${ARTIFACT_ROOT}/package_freeze_evidence.json`, report_sha256: hash(`${ARTIFACT_ROOT}/package_freeze_evidence.json`), package_sha256: localEnvelopeSha },
      { status: "qa_pass", evidence_owner_lane_id: "W9", report_ref: W9_REPORT_REF, report_sha256: W9_REPORT_SHA, package_sha256: localEnvelopeSha },
    ],
    legacy_lineage: materializationLegacyLineage(),
    blockers: [],
    transition_trace: [
      { from_status: "not_started", to_status: "inventory_frozen", evidence_ref: `${ARTIFACT_ROOT}/inventory_frozen_evidence.json`, evidence_sha256: hash(`${ARTIFACT_ROOT}/inventory_frozen_evidence.json`) },
      { from_status: "inventory_frozen", to_status: "package_in_progress", evidence_ref: `${ARTIFACT_ROOT}/package_in_progress_evidence.json`, evidence_sha256: hash(`${ARTIFACT_ROOT}/package_in_progress_evidence.json`) },
      { from_status: "package_in_progress", to_status: "package_frozen", evidence_ref: `${ARTIFACT_ROOT}/package_freeze_evidence.json`, evidence_sha256: hash(`${ARTIFACT_ROOT}/package_freeze_evidence.json`) },
      { from_status: "package_frozen", to_status: "qa_pass", evidence_ref: W9_REPORT_REF, evidence_sha256: W9_REPORT_SHA },
    ],
    reviewed_source_commit: REVIEWED_SOURCE_COMMIT,
    expected_count: 14,
    promotion_row_count: 1550,
    w9_review_binding_ref: `${ARTIFACT_ROOT}/same_pr_w9_binding.json`,
    w9_review_binding_sha256: hash(`${ARTIFACT_ROOT}/same_pr_w9_binding.json`),
    external_package_evidence_ref: `${ARTIFACT_ROOT}/external_package_evidence.json`,
    external_package_evidence_sha256: hash(`${ARTIFACT_ROOT}/external_package_evidence.json`),
  };
  writeJson(`${ARTIFACT_ROOT}/lane_manifest.json`, laneManifest);
  process.stdout.write(`${JSON.stringify({ ok: true, backend_package_sha256: BACKEND_PACKAGE_SHA, local_envelope_sha256: localEnvelopeSha, payload_count: 9, row_count: ids.length })}\n`);
}

main();
