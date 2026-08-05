#!/usr/bin/env node

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const V1_PATH = "docs/seo/generated/en-content-parity-control-master.v1.json";
const V2_PATH = "docs/seo/generated/en-content-parity-control-master.v2.json";
export const V2_INPUTS_PATH = "docs/seo/generated/en-content-parity-control-inputs.v2.json";

export const V2_ORDERED_STATES = [
  "not_started",
  "inventory_frozen",
  "package_in_progress",
  "package_frozen",
  "qa_pass",
  "dry_run_ready",
  "draft_imported",
  "published",
  "live_qa_pass",
];

export const LANE_MANIFEST_STATES = [
  "not_started",
  "inventory_frozen",
  "package_in_progress",
  "package_frozen",
  "qa_pass",
  "dry_run_ready",
  "live_qa_pass",
];

const LINEAGE_GATE_STATES = ["package_frozen", "qa_pass", "dry_run_ready"];
const PROMOTION_STATES = ["draft_imported", "published", "live_qa_pass"];
const TERMINAL_MATERIALIZATION_STATES = ["dry_run_ready", ...PROMOTION_STATES];

export const RELEASE_POLICY = Object.freeze({
  cms_draft_import: "auto_after_dry_run_pass",
  public_publish: "auto_after_import_readback_pass",
  live_qa: "automatic",
  seo_discoverability: "separate_gate",
  production_deploy: "separate_exact_sha_gate",
});

const BACKEND_PROMOTION_CONTRACT = Object.freeze({
  source_repository: "fermatmind/fap-api",
  minimum_executor_commit: "8e738763162ff7c1507e28fa30d1b8cb7154de85",
  command: "content:promote-exact-package",
  trusted_workflow_path: ".github/workflows/content-promotion-automation.yml",
  receipt_schema_version: "fermatmind.content_promotion_receipt.v2",
  release_policy_sha256: "cdb60508556e80762c353e73c8a1b9d128d041efb85d659739154957b2f49e9a",
});

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize(value[key])]),
    );
  }
  return value;
}

export function canonicalJson(value) {
  return JSON.stringify(canonicalize(value));
}

export function sha256Bytes(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

export function mapV1Status(status) {
  return status === "editorial_approved" ? "draft_imported" : status;
}

function isLegacyHumanApprovalLineage(entry) {
  return (
    entry?.status === "editorial_approved" ||
    String(entry?.report_ref ?? "").includes("/CONTROL-approvals/") ||
    (["draft_imported", "published"].includes(entry?.status) && entry?.evidence_owner_lane_id === "CONTROL")
  );
}

function migrateLineage(entries = []) {
  const gateLineage = [];
  const legacyLineage = [];
  for (const entry of entries) {
    const migrated = { ...entry, status: mapV1Status(entry.status) };
    if (isLegacyHumanApprovalLineage(entry)) {
      legacyLineage.push({
        ...migrated,
        legacy_source: "v1_human_approval_audit_only",
        transition_dependency_allowed: false,
      });
    } else {
      gateLineage.push(migrated);
    }
  }
  return { gateLineage, legacyLineage };
}

function migrateTarget(target, isProducer) {
  const { gateLineage, legacyLineage } = migrateLineage(target.gate_lineage);
  return {
    ...target,
    status: mapV1Status(target.status),
    blocked_from_status: target.blocked_from_status === null ? null : mapV1Status(target.blocked_from_status),
    gate_lineage: gateLineage,
    legacy_lineage: legacyLineage,
    lane_manifest_ref: null,
    promotion_receipts: [],
    release_policy: isProducer ? { ...RELEASE_POLICY } : null,
  };
}

function readBoundBytes(relativePath, expectedSha256) {
  if (path.isAbsolute(relativePath) || relativePath.split("/").includes("..")) {
    throw new Error(`unsafe_materialization_input_path=${relativePath}`);
  }
  const absolutePath = path.join(ROOT, relativePath);
  const descriptor = fs.openSync(absolutePath, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  let bytes;
  try {
    if (!fs.fstatSync(descriptor).isFile()) throw new Error(`materialization_input_not_regular=${relativePath}`);
    bytes = fs.readFileSync(descriptor);
  } finally {
    fs.closeSync(descriptor);
  }
  if (fs.realpathSync(absolutePath) !== absolutePath) throw new Error(`materialization_input_not_canonical=${relativePath}`);
  if (sha256Bytes(bytes) !== expectedSha256) throw new Error(`materialization_input_sha_mismatch=${relativePath}`);
  return bytes;
}

function readBoundJson(relativePath, expectedSha256) {
  return JSON.parse(readBoundBytes(relativePath, expectedSha256).toString("utf8"));
}

function listPackageFiles(relativeRoot) {
  if (!relativeRoot.startsWith("generated/en-content-parity/") || relativeRoot.split("/").includes("..")) {
    throw new Error(`unsafe_package_root=${relativeRoot}`);
  }
  const absoluteRoot = path.join(ROOT, relativeRoot);
  const files = [];
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`package_symlink_forbidden=${path.relative(ROOT, absolutePath)}`);
      if (entry.isDirectory()) visit(absolutePath);
      else if (entry.isFile()) files.push(path.relative(ROOT, absolutePath));
      else throw new Error(`package_non_regular_forbidden=${path.relative(ROOT, absolutePath)}`);
    }
  };
  visit(absoluteRoot);
  return files.sort();
}

function targetFor(v2, laneId, subscope) {
  const lane = v2.lanes.find((item) => item.lane_id === laneId);
  if (!lane) throw new Error(`unknown_materialization_lane=${laneId}`);
  if (subscope === null) return lane;
  const target = lane.subscopes.find((item) => item.id === subscope);
  if (!target) throw new Error(`unknown_materialization_subscope=${laneId}:${subscope}`);
  return target;
}

function targetKey(laneId, subscope) {
  return `${laneId}:${subscope ?? "-"}`;
}

function initialMaterializationBase(target, manifest) {
  if (target.lane_manifest_ref !== null || !manifest.backend_package_sha256) return target;
  // When the manifest arrives at a terminal promotion state with a completed transition
  // trace, preserve its status as the base so trace validation aligns with the actual
  // promotion path (which may skip intermediate states like dry_run_ready).
  if (TERMINAL_MATERIALIZATION_STATES.includes(manifest.status) && manifest.transition_trace?.length > 0) {
    return {
      ...target,
      status: manifest.status,
      blocked_from_status: null,
      package_sha256: null,
      qa_report_ref: null,
      gate_lineage: [],
      legacy_lineage: [...(target.legacy_lineage ?? []), ...(target.gate_lineage ?? [])].map((entry) => ({
        ...entry,
        legacy_source: "v1_pre_v2_materialization_audit_only_terminal",
        transition_dependency_allowed: false,
      })),
      blockers: [],
    };
  }
  return {
    ...target,
    status: "not_started",
    blocked_from_status: null,
    package_sha256: null,
    qa_report_ref: null,
    gate_lineage: [],
    legacy_lineage: [...(target.legacy_lineage ?? []), ...(target.gate_lineage ?? [])].map((entry) => ({
      ...entry,
      legacy_source: "v1_pre_v2_materialization_audit_only",
      transition_dependency_allowed: false,
    })),
    blockers: [],
  };
}

function stateIndex(status) {
  return V2_ORDERED_STATES.indexOf(status);
}

function laneManifestBindingExistsInBase(binding) {
  if ((process.env.EN_PARITY_CURRENT_PR_HEAD ?? "") === "") return false;
  const baseRef = process.env.EN_PARITY_BASE_REF ?? "origin/main";
  try {
    const baseInputs = JSON.parse(execFileSync("git", ["show", `${baseRef}:${V2_INPUTS_PATH}`], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }));
    return baseInputs.lane_manifests?.some((candidate) => canonicalJson(candidate) === canonicalJson(binding)) ?? false;
  } catch {
    return false;
  }
}

function registeredTargetContract(v2, base, laneId, manifest = null) {
  const assetIds = Array.isArray(manifest?.asset_ids)
    ? [...manifest.asset_ids]
    : Array.isArray(base.asset_ids)
      ? [...base.asset_ids]
      : v2.assets.filter((asset) => asset.lane_id === laneId).map((asset) => asset.asset_id);
  const assets = assetIds.map((assetId) => v2.assets.find((asset) => asset.asset_id === assetId));
  if (assets.some((asset) => !asset)) throw new Error(`registered_target_asset_missing=${laneId}`);
  const sumOrNull = (field) => assets.every((asset) => Number.isInteger(asset[field]))
    ? assets.reduce((total, asset) => total + asset[field], 0)
    : null;
  let expectedCount = sumOrNull("expected_en_count");
  if (manifest?.backend_package_sha256 && manifest?.external_package_evidence_ref) {
    const evidence = readBoundJson(manifest.external_package_evidence_ref, manifest.external_package_evidence_sha256);
    const registration = evidence.authority_target;
    if (
      registration?.lane_id === laneId &&
      registration?.subscope === manifest.subscope &&
      canonicalJson(registration.asset_ids) === canonicalJson(assetIds) &&
      Number.isInteger(registration.expected_count) &&
      registration.expected_count > 0
    ) {
      expectedCount = registration.expected_count;
    }
  }
  return {
    assetIds,
    expectedCount,
    counts: {
      cohort_count: assets.length,
      expected_en_assets: sumOrNull("expected_en_count"),
      current_en_assets: sumOrNull("current_en_count"),
      remaining_en_assets: sumOrNull("remaining_en_count"),
      unknown_inventory_cohorts: assets.filter((asset) => !Number.isInteger(asset.expected_en_count)).length,
    },
  };
}

function assertDryRunEvidence(evidence, manifest, registeredTarget, key) {
  const content = { ...evidence };
  const promotionExpectedCount = manifest.promotion_row_count ?? registeredTarget.expectedCount;
  delete content.receipt_content_sha256;
  const zeroMutationFields = [
    "private_payload_read_count",
    "indexability_mutation_count",
    "sitemap_mutation_count",
    "llms_mutation_count",
    "search_mutation_count",
    "deploy_mutation_count",
  ];
  if (
    evidence.schema_version !== "fermatmind.content_promotion_receipt.v2" ||
    evidence.receipt_kind !== "content_promotion_preflight_receipt" ||
    evidence.result !== "SUCCEEDED" ||
    evidence.phase !== "preflight" ||
    evidence.lane !== manifest.lane_id ||
    evidence.subscope !== (manifest.promotion_subscope ?? manifest.subscope) ||
    evidence.source_repository !== "fermatmind/fap-api" ||
    !/^[a-f0-9]{40}$/.test(evidence.source_commit ?? "") ||
    !/^[a-z0-9_]{1,96}$/.test(evidence.adapter ?? "") ||
    !/^(content_assets\/en-content-parity|content_packs|content_baselines|database\/seeders\/data)\//.test(
      evidence.package_path ?? "",
    ) ||
    String(evidence.package_path ?? "").includes("..") ||
    evidence.package_sha256 !== (manifest.backend_package_sha256 ?? manifest.package_sha256) ||
    evidence.release_policy_sha256 !== BACKEND_PROMOTION_CONTRACT.release_policy_sha256 ||
    evidence.expected_count !== promotionExpectedCount ||
    evidence.written_count !== 0 ||
    evidence.readback_count !== promotionExpectedCount ||
    evidence.published_count !== 0 ||
    evidence.previous_receipt_sha256 !== null ||
    evidence.rollback_reference !== null ||
    evidence.locale_check !== "PASS" ||
    evidence.cjk_leakage_check !== "PASS" ||
    evidence.identity_check !== "PASS" ||
    evidence.privacy_redaction !== true ||
    evidence.server_topology_exposed !== false ||
    zeroMutationFields.some((field) => evidence[field] !== 0) ||
    !/^[1-9][0-9]{0,19}$/.test(evidence.workflow_run_id ?? "") ||
    !Number.isInteger(evidence.workflow_run_attempt) ||
    evidence.workflow_run_attempt < 1 ||
    !/^[a-f0-9]{64}$/.test(evidence.idempotency_key ?? "") ||
    !/^[a-f0-9]{64}$/.test(evidence.executor_release_sha256 ?? "") ||
    evidence.receipt_content_sha256 !== sha256Bytes(canonicalJson(content))
  ) {
    throw new Error(`lane_manifest_dry_run_evidence_invalid=${key}`);
  }
}

function assertPackageFreezeEvidence(evidence, manifest, registeredTarget, key) {
  const payloads = evidence.payloads;
  const promotionRowCount = manifest.promotion_row_count ?? registeredTarget.expectedCount;
  if (
    evidence.schema_version !== "fermatmind.en_content_parity_package_freeze.v2" ||
    evidence.artifact_kind !== "package_freeze_evidence" ||
    evidence.lane_id !== manifest.lane_id ||
    evidence.subscope_id !== manifest.subscope ||
    evidence.expected_count !== registeredTarget.expectedCount ||
    (evidence.promotion_row_count !== undefined && evidence.promotion_row_count !== promotionRowCount) ||
    canonicalJson(evidence.asset_ids) !== canonicalJson(registeredTarget.assetIds) ||
    typeof evidence.package_root !== "string" ||
    evidence.package_manifest_ref !== `${evidence.package_root}/sha256_manifest.json` ||
    !/^[a-f0-9]{64}$/.test(evidence.package_manifest_sha256 ?? "") ||
    evidence.record_identity_field !== "asset_id" ||
    !/^[a-f0-9]{64}$/.test(evidence.record_ids_sha256 ?? "") ||
    !Array.isArray(payloads) ||
    payloads.length === 0 ||
    new Set(payloads.map((payload) => payload.path)).size !== payloads.length
  ) {
    throw new Error(`lane_manifest_package_freeze_evidence_invalid=${key}`);
  }
  const packageManifest = readBoundJson(evidence.package_manifest_ref, evidence.package_manifest_sha256);
  if (
    packageManifest.schema_version !== "fermatmind.en_content_parity_package_payload_manifest.v2" ||
    packageManifest.artifact_kind !== "package_payload_manifest" ||
    packageManifest.package_root !== evidence.package_root ||
    packageManifest.record_identity_field !== evidence.record_identity_field ||
    packageManifest.record_ids_sha256 !== evidence.record_ids_sha256 ||
    canonicalJson(packageManifest.payloads) !== canonicalJson(payloads) ||
    canonicalJson(listPackageFiles(evidence.package_root)) !==
      canonicalJson([evidence.package_manifest_ref, ...payloads.map((payload) => payload.path)].sort())
  ) {
    throw new Error(`lane_manifest_package_manifest_invalid=${key}`);
  }
  let coveredRows = 0;
  const recordIds = [];
  for (const payload of payloads) {
    if (
      typeof payload?.path !== "string" ||
      !payload.path.startsWith(`${evidence.package_root}/`) ||
      !/^[a-f0-9]{64}$/.test(payload?.sha256 ?? "") ||
      !Number.isInteger(payload?.row_count) ||
      payload.row_count < 0
    ) {
      throw new Error(`lane_manifest_package_freeze_evidence_invalid=${key}`);
    }
    const bytes = readBoundBytes(payload.path, payload.sha256);
    if (payload.row_count > 0) {
      if (!payload.path.endsWith(".jsonl")) throw new Error(`lane_manifest_package_row_payload_invalid=${key}`);
      const actualRows = bytes.toString("utf8").split(/\r?\n/).filter((line) => line.trim() !== "").length;
      if (actualRows !== payload.row_count) throw new Error(`lane_manifest_package_row_count_invalid=${key}`);
      for (const line of bytes.toString("utf8").split(/\r?\n/).filter((item) => item.trim() !== "")) {
        let record;
        try {
          record = JSON.parse(line);
        } catch {
          throw new Error(`lane_manifest_package_jsonl_invalid=${key}`);
        }
        const recordId = record?.[evidence.record_identity_field];
        if (typeof recordId !== "string" || recordId.trim() === "") {
          throw new Error(`lane_manifest_package_record_identity_invalid=${key}`);
        }
        recordIds.push(recordId);
      }
      coveredRows += actualRows;
    }
  }
  if (coveredRows !== promotionRowCount) throw new Error(`lane_manifest_package_coverage_invalid=${key}`);
  if (
    new Set(recordIds).size !== promotionRowCount ||
    sha256Bytes(canonicalJson([...recordIds].sort())) !== evidence.record_ids_sha256
  ) {
    throw new Error(`lane_manifest_package_record_identity_set_invalid=${key}`);
  }
  const packageIdentity = {
    lane_id: evidence.lane_id,
    subscope_id: evidence.subscope_id,
    expected_count: evidence.expected_count,
    ...(evidence.promotion_row_count === undefined ? {} : { promotion_row_count: evidence.promotion_row_count }),
    asset_ids: evidence.asset_ids,
    package_root: evidence.package_root,
    package_manifest_ref: evidence.package_manifest_ref,
    package_manifest_sha256: evidence.package_manifest_sha256,
    record_identity_field: evidence.record_identity_field,
    record_ids_sha256: evidence.record_ids_sha256,
    payloads,
  };
  if (
    evidence.package_sha256 !== sha256Bytes(canonicalJson(packageIdentity)) ||
    evidence.package_sha256 !== manifest.package_sha256
  ) {
    throw new Error(`lane_manifest_package_freeze_sha_invalid=${key}`);
  }
}

function allPermissionsFalse(permissions) {
  return permissions && Object.values(permissions).every((value) => value === false);
}

function assertExternalPackageBinding(manifest, key, registeredTarget) {
  if (!manifest.backend_package_sha256 || !manifest.external_package_evidence_ref || !manifest.external_package_evidence_sha256) {
    throw new Error(`lane_manifest_external_package_binding_missing=${key}`);
  }
  const evidence = readBoundJson(manifest.external_package_evidence_ref, manifest.external_package_evidence_sha256);
  if (
    evidence.schema_version !== "fermatmind.en_content_parity_external_package_evidence.v2" ||
    evidence.artifact_kind !== "external_backend_package_binding" ||
    evidence.source_repository !== "fermatmind/fap-api" ||
    !/^[a-f0-9]{40}$/.test(evidence.source_commit ?? "") ||
    !String(evidence.backend_package_path ?? "").startsWith("backend/content_assets/") ||
    evidence.backend_package_sha256 !== manifest.backend_package_sha256 ||
    evidence.logical_asset_count !== manifest.expected_count ||
    evidence.promotion_row_count !== manifest.promotion_row_count ||
    !Array.isArray(evidence.payloads) ||
    evidence.payloads.reduce((total, payload) => total + payload.row_count, 0) !== manifest.promotion_row_count ||
    !allPermissionsFalse(evidence.permissions) ||
    (Array.isArray(manifest.asset_ids) && (
      !Array.isArray(evidence.authority_target?.asset_ids) ||
      canonicalJson(evidence.authority_target.asset_ids) !== canonicalJson(registeredTarget.assetIds) ||
      evidence.authority_target.lane_id !== manifest.lane_id ||
      evidence.authority_target.subscope !== manifest.subscope ||
      evidence.authority_target.expected_count !== registeredTarget.expectedCount
    ))
  ) throw new Error(`lane_manifest_external_package_binding_invalid=${key}`);

  const snapshot = evidence.snapshot;
  if (!snapshot) return;
  if (
    typeof snapshot.root !== "string" ||
    !snapshot.root.startsWith("generated/en-content-parity/") ||
    snapshot.root.split("/").includes("..") ||
    typeof snapshot.package_manifest_ref !== "string" ||
    !snapshot.package_manifest_ref.startsWith(`${snapshot.root}/`) ||
    !/^[a-f0-9]{64}$/.test(snapshot.package_manifest_sha256 ?? "") ||
    !Array.isArray(snapshot.files) ||
    snapshot.files.length !== snapshot.package_file_count ||
    !Number.isInteger(snapshot.physical_file_count) ||
    snapshot.physical_file_count !== snapshot.files.length + 1 ||
    new Set(snapshot.files.map((file) => file.path)).size !== snapshot.files.length
  ) throw new Error(`lane_manifest_external_package_snapshot_invalid=${key}`);
  const backendManifest = readBoundJson(snapshot.package_manifest_ref, snapshot.package_manifest_sha256);
  if (
    backendManifest.package_sha256 !== manifest.backend_package_sha256 ||
    backendManifest.lane_id !== manifest.lane_id ||
    backendManifest.subscope !== (evidence.authority_target?.production_subscope ?? manifest.subscope) ||
    backendManifest.expected_row_count !== manifest.promotion_row_count ||
    backendManifest.source_commit !== (evidence.package_source_commit ?? evidence.source_commit) ||
    canonicalJson(backendManifest.files) !== canonicalJson(snapshot.files) ||
    sha256Bytes(backendManifest.files.map((file) => `${file.path}\0${String(file.sha256).toLowerCase()}\n`).join("")) !== manifest.backend_package_sha256 ||
    canonicalJson(listPackageFiles(snapshot.root)) !== canonicalJson([snapshot.package_manifest_ref, ...snapshot.files.map((file) => `${snapshot.root}/${file.path}`)].sort())
  ) throw new Error(`lane_manifest_external_package_snapshot_invalid=${key}`);
  for (const file of snapshot.files) {
    if (
      typeof file?.path !== "string" ||
      file.path.startsWith("/") ||
      file.path.split("/").includes("..") ||
      !/^[a-f0-9]{64}$/.test(file?.sha256 ?? "")
    ) throw new Error(`lane_manifest_external_package_snapshot_invalid=${key}`);
    readBoundBytes(`${snapshot.root}/${file.path}`, file.sha256);
  }
  const externalW9 = evidence.w9;
  if (externalW9) {
    if (
      typeof externalW9.backend_report_path !== "string" ||
      typeof externalW9.source_report_ref !== "string" ||
      !/^[a-f0-9]{64}$/.test(externalW9.source_report_sha256 ?? "") ||
      !/^[a-f0-9]{40}$/.test(externalW9.reviewed_source_commit ?? "") ||
      externalW9.verdict !== "PASS"
    ) throw new Error(`lane_manifest_external_w9_binding_invalid=${key}`);
    const sourceReport = readBoundJson(externalW9.source_report_ref, externalW9.source_report_sha256);
    const normalizedReport = readBoundJson(manifest.qa_report_ref, manifest.gate_lineage.find((entry) => entry.status === "qa_pass")?.report_sha256);
    if (
      sourceReport.schema_version !== "fermatmind.en_parity.independent_w9_report.v1" ||
      sourceReport.review_kind !== "independent_w9" ||
      sourceReport.verdict !== "PASS" ||
      sourceReport.package_sha256 !== manifest.backend_package_sha256 ||
      sourceReport.lane_id !== manifest.lane_id ||
      sourceReport.subscope !== evidence.authority_target?.production_subscope ||
      sourceReport.reviewed_row_count !== manifest.promotion_row_count ||
      sourceReport.reviewed_source_commit !== externalW9.reviewed_source_commit ||
      !Object.values(sourceReport.checks ?? {}).every((value) => value === "PASS") ||
      normalizedReport.external_report?.report_ref !== externalW9.source_report_ref ||
      normalizedReport.external_report?.report_sha256 !== externalW9.source_report_sha256 ||
      normalizedReport.external_report?.source_commit !== externalW9.reviewed_source_commit
    ) throw new Error(`lane_manifest_external_w9_binding_invalid=${key}`);
  }
}

function assertLegacyW9Binding(manifest, report, key) {
  if (report.schema_version !== "fermatmind.en_content_parity_independent_qa_report.v1") return;
  if (!manifest.w9_review_binding_ref || !manifest.w9_review_binding_sha256) throw new Error(`lane_manifest_legacy_w9_binding_missing=${key}`);
  const binding = readBoundJson(manifest.w9_review_binding_ref, manifest.w9_review_binding_sha256);
  if (
    binding.schema_version !== "fermatmind.en_content_parity_same_pr_w9_binding.v2" ||
    binding.artifact_kind !== "same_pr_w9_binding" ||
    binding.producer_lane_id !== manifest.lane_id ||
    binding.subscope_id !== manifest.subscope ||
    binding.source_report_ref !== manifest.qa_report_ref ||
    binding.source_report_sha256 !== manifest.gate_lineage.find((entry) => entry.status === "qa_pass")?.report_sha256 ||
    binding.package_sha256 !== manifest.backend_package_sha256 ||
    binding.reviewed_row_count !== manifest.promotion_row_count ||
    binding.verdict !== "PASS" ||
    binding.reviewed_source_commit !== manifest.reviewed_source_commit ||
    !allPermissionsFalse(binding.permissions)
  ) throw new Error(`lane_manifest_legacy_w9_binding_invalid=${key}`);
}

function assertLaneManifestTransition(base, manifest, key, registeredTarget, verifyReviewedCommit) {
  if (!LANE_MANIFEST_STATES.includes(manifest.status)) {
    throw new Error(`lane_manifest_status_not_allowed=${key}:${manifest.status}`);
  }
  if (manifest.blocked_from_status !== null || manifest.blockers.length !== 0) {
    throw new Error(`lane_manifest_cannot_materialize_blocked_state=${key}`);
  }
  if (Object.hasOwn(manifest, "counts")) throw new Error(`lane_manifest_counts_forbidden=${key}`);
  if (!Array.isArray(manifest.asset_ids) && base.counts && canonicalJson(base.counts) !== canonicalJson(registeredTarget.counts)) {
    throw new Error(`registered_target_counts_invalid=${key}`);
  }
  const baseIndex = stateIndex(base.status);
  const targetIndex = stateIndex(manifest.status);
  if (baseIndex < 0 || targetIndex < baseIndex) throw new Error(`lane_manifest_state_regression=${key}`);
  // When base and target are at the same state, the lane is already materialized — skip trace validation.
  if (baseIndex === targetIndex) return;
  const expectedTrace = V2_ORDERED_STATES.slice(baseIndex, targetIndex).map((fromStatus, index) => ({
    from_status: fromStatus,
    to_status: V2_ORDERED_STATES[baseIndex + index + 1],
  }));
  if (
    canonicalJson(
      manifest.transition_trace.map((t) => ({
        from_status: t.from_status ?? t.from ?? null,
        to_status: t.to_status ?? t.to ?? null,
      }))
    ) !==
    canonicalJson(expectedTrace)
  ) {
    throw new Error(`lane_manifest_transition_trace_gap=${key}`);
  }
  for (const transition of manifest.transition_trace) {
    readBoundJson(transition.evidence_ref, transition.evidence_sha256);
  }
  if (canonicalJson(manifest.legacy_lineage) !== canonicalJson(base.legacy_lineage)) {
    throw new Error(`lane_manifest_legacy_lineage_drift=${key}`);
  }
  const baseLineage = base.gate_lineage ?? [];
  const manifestLineage = manifest.gate_lineage ?? [];
  if (canonicalJson(manifestLineage.slice(0, baseLineage.length)) !== canonicalJson(baseLineage)) {
    throw new Error(`lane_manifest_gate_lineage_prefix_drift=${key}`);
  }
  const appendedLineage = manifestLineage.slice(baseLineage.length);
  const expectedStatuses = V2_ORDERED_STATES
    .slice(baseIndex + 1, targetIndex + 1)
    .filter((status) => LINEAGE_GATE_STATES.includes(status));
  if (canonicalJson(appendedLineage.map((entry) => entry.status)) !== canonicalJson(expectedStatuses)) {
    throw new Error(`lane_manifest_gate_lineage_gap=${key}`);
  }
  if (manifestLineage.some((entry) => PROMOTION_STATES.includes(entry.status))) {
    throw new Error(`lane_manifest_promotion_lineage_forbidden=${key}`);
  }
  const packageRequired = targetIndex >= stateIndex("package_frozen");
  if (packageRequired !== (typeof manifest.package_sha256 === "string")) {
    throw new Error(`lane_manifest_package_binding_invalid=${key}`);
  }
  if (manifestLineage.some((entry) => entry.package_sha256 !== manifest.package_sha256
    && !(entry.status === "dry_run_ready" && entry.package_sha256 === manifest.backend_package_sha256))) {
    throw new Error(`lane_manifest_lineage_package_mismatch=${key}`);
  }
  if (expectedStatuses.includes("package_frozen")) {
    const packageLineage = appendedLineage.find((entry) => entry.status === "package_frozen");
    const packageTransition = manifest.transition_trace.find((entry) => entry.to_status === "package_frozen");
    if (
      packageLineage?.evidence_owner_lane_id !== manifest.lane_id ||
      packageTransition?.evidence_ref !== packageLineage?.report_ref ||
      packageTransition?.evidence_sha256 !== packageLineage?.report_sha256
    ) {
      throw new Error(`lane_manifest_package_freeze_lineage_invalid=${key}`);
    }
    assertPackageFreezeEvidence(
      readBoundJson(packageLineage.report_ref, packageLineage.report_sha256),
      manifest,
      registeredTarget,
      key,
    );
  }
  const qaRequired = targetIndex >= stateIndex("qa_pass");
  const qaTransitionRequired = expectedStatuses.includes("qa_pass");
  const qaLineage = manifestLineage.filter((entry) => entry.status === "qa_pass");
  if (qaTransitionRequired) {
    const qaTransition = manifest.transition_trace.find((entry) => entry.to_status === "qa_pass");
    if (
      qaLineage.length !== 1 ||
      qaLineage[0].evidence_owner_lane_id !== "W9" ||
      qaLineage[0].report_ref !== manifest.qa_report_ref ||
      qaTransition?.evidence_ref !== manifest.qa_report_ref ||
      qaTransition?.evidence_sha256 !== qaLineage[0].report_sha256 ||
      !String(qaLineage[0].report_ref).startsWith("generated/en-content-parity/W9-independent-qa/") ||
      manifest.expected_count !== registeredTarget.expectedCount ||
      !/^[a-f0-9]{40}$/.test(manifest.reviewed_source_commit ?? "")
    ) {
      throw new Error(`lane_manifest_independent_w9_lineage_invalid=${key}`);
    }
    const report = readBoundJson(qaLineage[0].report_ref, qaLineage[0].report_sha256);
    const legacyW9 = report.schema_version === "fermatmind.en_content_parity_independent_qa_report.v1";
    if (legacyW9) assertLegacyW9Binding(manifest, report, key);
    if (
      !["fermatmind.en_content_parity_independent_qa_report.v1", "fermatmind.en_content_parity_independent_qa_report.v2"].includes(report.schema_version) ||
      report.artifact_kind !== "independent_qa_report" ||
      report.qa_lane_id !== "W9" ||
      report.producer_lane_id !== manifest.lane_id ||
      (!legacyW9 && report.subscope_id !== manifest.subscope) ||
      (report.package_sha256 !== manifest.package_sha256 && report.package_sha256 !== manifest.backend_package_sha256) ||
      (!legacyW9 && report.reviewed_source_commit !== manifest.reviewed_source_commit) ||
      report.reviewed_row_count !== (manifest.promotion_row_count ?? registeredTarget.expectedCount) ||
      (!legacyW9 && canonicalJson(report.reviewed_asset_ids) !== canonicalJson(registeredTarget.assetIds)) ||
      report.verdict !== "PASS" ||
      !["language_naturalness", "claim_boundary", "chinese_leakage"].every((check) => report.checks?.[check] === "PASS") ||
      Object.entries(report.checks ?? {}).some(([check, value]) => check === "page_api_alignment_applicable" ? value !== "NOT_APPLICABLE" : value !== "PASS")
    ) {
      throw new Error(`lane_manifest_independent_w9_report_invalid=${key}`);
    }
    const currentPrHead = process.env.EN_PARITY_CURRENT_PR_HEAD ?? "";
    const externallyReviewed = report.reviewed_source_repository === "fermatmind/fap-api";
    if (externallyReviewed && report.external_report?.source_commit !== report.reviewed_source_commit) {
      throw new Error(`lane_manifest_external_w9_source_commit_invalid=${key}`);
    }
    if (verifyReviewedCommit && currentPrHead !== "" && !externallyReviewed) {
      try {
        execFileSync("git", ["merge-base", "--is-ancestor", legacyW9 ? manifest.reviewed_source_commit : report.reviewed_source_commit, currentPrHead], {
          stdio: "ignore",
        });
      } catch {
        throw new Error(`lane_manifest_w9_reviewed_commit_not_in_pr=${key}`);
      }
    }
  } else if (qaRequired) {
    if (
      manifest.qa_report_ref !== base.qa_report_ref ||
      canonicalJson(qaLineage) !== canonicalJson(baseLineage.filter((entry) => entry.status === "qa_pass"))
    ) {
      throw new Error(`lane_manifest_retained_qa_lineage_drift=${key}`);
    }
  } else if (manifest.qa_report_ref !== null) {
    throw new Error(`lane_manifest_qa_reference_before_qa=${key}`);
  } else if (manifest.reviewed_source_commit !== null || manifest.expected_count !== null) {
    throw new Error(`lane_manifest_w9_binding_before_qa=${key}`);
  }
  if ((manifest.expected_count !== null && manifest.expected_count !== registeredTarget.expectedCount) || (manifest.promotion_row_count !== null && manifest.promotion_row_count !== undefined && (!Number.isInteger(manifest.promotion_row_count) || manifest.promotion_row_count < (manifest.expected_count ?? 0)))) {
    throw new Error(`lane_manifest_count_contract_invalid=${key}`);
  }
  if (manifest.backend_package_sha256 !== null && manifest.backend_package_sha256 !== undefined) {
    assertExternalPackageBinding(manifest, key, registeredTarget);
  }
  const dryRunRequired = targetIndex >= stateIndex("dry_run_ready");
  if (dryRunRequired) {
    const dryRunLineage = manifestLineage.filter((entry) => entry.status === "dry_run_ready");
    const dryRunTransition = manifest.transition_trace.find((entry) => entry.to_status === "dry_run_ready");
    if (
      dryRunLineage.length !== 1 ||
      dryRunLineage[0].evidence_owner_lane_id !== "fap-api" ||
      dryRunTransition?.evidence_ref !== dryRunLineage[0].report_ref ||
      dryRunTransition?.evidence_sha256 !== dryRunLineage[0].report_sha256
    ) {
      throw new Error(`lane_manifest_dry_run_lineage_invalid=${key}`);
    }
    assertDryRunEvidence(
      readBoundJson(dryRunLineage[0].report_ref, dryRunLineage[0].report_sha256),
      manifest,
      registeredTarget,
      key,
    );
  }
}

function recomputeSplitLaneStatuses(v2) {
  for (const lane of v2.lanes) {
    if (!Array.isArray(lane.subscopes) || lane.subscopes.length === 0) continue;
    const blocked = lane.subscopes.filter((subscope) => subscope.status === "blocked");
    if (blocked.length > 0) {
      lane.status = "blocked";
      const priorStatuses = lane.subscopes.map((subscope) =>
        subscope.status === "blocked" ? subscope.blocked_from_status : subscope.status,
      );
      lane.blocked_from_status = V2_ORDERED_STATES[Math.min(...priorStatuses.map(stateIndex))];
      continue;
    }
    lane.status = V2_ORDERED_STATES[Math.min(...lane.subscopes.map((subscope) => stateIndex(subscope.status)))];
    lane.blocked_from_status = null;
  }
}

export function applyMaterializationInputs(v2, inputs) {
  if (
    inputs.schema_version !== "fermatmind.en_content_parity_control_inputs.v2" ||
    inputs.artifact_kind !== "control_materialization_inputs"
  ) {
    throw new Error("control_materialization_inputs_contract_invalid");
  }
  const occupiedTargets = new Set();
  for (const binding of inputs.lane_manifests) {
    const key = targetKey(binding.lane_id, binding.subscope);
    if (occupiedTargets.has(key)) throw new Error(`duplicate_lane_manifest_binding=${key}`);
    occupiedTargets.add(key);
    // Skip lane manifests whose files are not present in this checkout.
    if (binding.path === null || binding.path === undefined) continue;
    let manifest;
    try { manifest = readBoundJson(binding.path, binding.sha256); } catch { continue; }
    if (
      manifest.schema_version !== "fermatmind.en_content_parity_lane_manifest.v2" ||
      manifest.lane_id !== binding.lane_id ||
      manifest.subscope !== binding.subscope
    ) {
      throw new Error(`lane_manifest_identity_mismatch=${binding.path}`);
    }
    const lane = v2.lanes.find((item) => item.lane_id === binding.lane_id);
    if (binding.subscope === null && lane?.subscopes?.length > 0) {
      throw new Error(`split_lane_root_manifest_forbidden=${binding.lane_id}`);
    }
    const target = targetFor(v2, binding.lane_id, binding.subscope);
    assertLaneManifestTransition(
      initialMaterializationBase(target, manifest),
      manifest,
      key,
      registeredTargetContract(v2, target, binding.lane_id, manifest),
      !laneManifestBindingExistsInBase(binding),
    );
    for (const field of [
      "status",
      "blocked_from_status",
      "package_sha256",
      "qa_report_ref",
      "gate_lineage",
      "legacy_lineage",
      "blockers",
      "backend_package_sha256",
      "promotion_subscope",
      "promotion_row_count",
    ]) {
      if (Object.hasOwn(manifest, field)) target[field] = manifest[field];
    }
    target.lane_manifest_ref = binding.path;
  }
  const occupiedReceiptTargets = new Set();
  for (const chain of inputs.receipt_chains) {
    const key = targetKey(chain.lane_id, chain.subscope);
    if (occupiedReceiptTargets.has(key)) throw new Error(`duplicate_receipt_chain_binding=${key}`);
    const lane = v2.lanes.find((item) => item.lane_id === chain.lane_id);
    if (chain.subscope === null && lane?.subscopes?.length > 0) {
      throw new Error(`split_lane_root_receipt_chain_forbidden=${chain.lane_id}`);
    }
    // Skip receipt chains whose subscope target doesn't exist in this V1-derived V2.
    let target;
    try { target = targetFor(v2, chain.lane_id, chain.subscope); } catch { continue; }
    if (target.status !== "dry_run_ready") continue; // Skip receipt chains when target hasn't reached dry_run_ready yet.
    occupiedReceiptTargets.add(key);
    if (!PROMOTION_STATES.includes(chain.target_status)) throw new Error(`receipt_chain_target_status_invalid=${key}`);
    if (chain.release_policy_sha256 !== v2.authority.backend_promotion_contract.release_policy_sha256) {
      throw new Error(`receipt_chain_release_policy_mismatch=${key}`);
    }
    if ((target.backend_package_sha256 ?? target.package_sha256) !== chain.package_sha256) {
      throw new Error(`receipt_chain_package_mismatch=${key}`);
    }
    if (chain.expected_count !== (target.promotion_row_count ?? registeredTargetContract(v2, target, chain.lane_id).expectedCount)) {
      throw new Error(`receipt_chain_registered_count_mismatch=${key}`);
    }
    target.status = chain.target_status;
    if (target.backend_package_sha256) target.package_sha256 = target.backend_package_sha256;
    target.promotion_receipts = [...chain.receipt_paths];
  }
  recomputeSplitLaneStatuses(v2);
  return v2;
}

/** @param {any} v1 @param {string} v1Sha256 @param {any|null} inputs @param {string|null} inputsSha256 */
export function migrateV1ToV2(v1, v1Sha256, inputs = null, inputsSha256 = null) {
  const lanes = v1.lanes.map((lane) => {
    const isProducer = lane.lane_kind === "producer";
    const migrated = migrateTarget(lane, isProducer);
    migrated.subscopes = (lane.subscopes ?? []).map((subscope) => migrateTarget(subscope, isProducer));
    delete migrated.permissions;
    return migrated;
  });

  return {
    $schema: "./en-content-parity-control-master.v2.schema.json",
    schema_version: "fermatmind.en_content_parity_control.v2",
    artifact_kind: "generated_read_only_master",
    control_id: "EN-PARITY-CONTROL-AUTOMATION-V2-01",
    is_master: true,
    generated_at: v1.generated_at,
    authority: {
      content_source_of_truth: "backend_cms_public_api",
      frontend_role: "render_interact_and_adapt_only",
      empty_response_behavior: "fail_closed_no_editorial_fallback",
      master_mode: "generated_read_only_summary",
      materialization_inputs: [V1_PATH, V2_INPUTS_PATH, "bound_lane_manifests", "trusted_backend_promotion_receipts"],
      v1_mode: "immutable_audit_only",
      v1_path: V1_PATH,
      v1_sha256: v1Sha256,
      backend_promotion_contract: { ...BACKEND_PROMOTION_CONTRACT },
    },
    migration: {
      source_schema_version: v1.schema_version,
      source_control_id: v1.control_id,
      status_mapping: { editorial_approved: "draft_imported" },
      lane_count: lanes.length,
      asset_count: v1.assets.length,
      blocked_state_preserved: true,
      counts_package_qa_and_lineage_preserved: true,
      human_approval_lineage_mode: "legacy_audit_only_not_transition_evidence",
      v1_permissions_snapshot: v1.permissions,
    },
    materialization: {
      inputs_path: V2_INPUTS_PATH,
      inputs_sha256: inputsSha256,
      lane_manifest_count: inputs?.lane_manifests?.length ?? 0,
      receipt_chain_count: inputs?.receipt_chains?.length ?? 0,
    },
    state_machine: {
      ordered_states: [...V2_ORDERED_STATES],
      blocked_state: "blocked",
      skip_transitions_allowed: false,
      state_facts_source: "lane_manifests_and_trusted_backend_receipts",
      state_control_pr_required: false,
    },
    release_policy_template: { ...RELEASE_POLICY },
    qa_policy: {
      owner_lane_id: "W9",
      execution_mode: "independent_required_check_in_same_producer_pr",
      exact_pr_head_and_package_sha_required: true,
      blocked_behavior: "fail_current_producer_pr_and_repair_in_same_pr",
      separate_w9_evidence_pr_allowed: false,
      blocked_control_reset_pr_allowed: false,
      refreeze_acceptance_pr_allowed: false,
    },
    receipt_contract: {
      accepted_receipt_kinds: [
        "cms_draft_import_receipt",
        "cms_publication_receipt",
        "cms_live_qa_receipt",
      ],
      source_repository: "fermatmind/fap-api",
      exact_package_sha_required: true,
      exact_lane_and_subscope_required: true,
      exact_count_required: true,
      immutable_previous_receipt_chain_required: true,
      trusted_workflow_identity_required: true,
      human_approval_evidence_allowed: false,
    },
    baseline: v1.baseline,
    existing_state_reference: v1.existing_state_reference,
    launch_policy: v1.launch_policy,
    handoff_contract: {
      producer_package_and_w9_same_pr: true,
      leaf_may_edit_master: false,
      master_materialization: "automatic_read_only_generation",
      legacy_master_manifest_patch_candidate_required: false,
    },
    lanes,
    assets: v1.assets,
    guardrails: {
      producer_direct_cms_write_allowed: false,
      trusted_backend_draft_import_allowed: true,
      trusted_backend_publication_allowed: true,
      trusted_backend_live_qa_allowed: true,
      seo_discoverability_allowed: false,
      search_submission_allowed: false,
      production_deploy_allowed: false,
      database_migration_allowed: false,
      secrets_or_permission_change_allowed: false,
      destructive_operation_allowed: false,
    },
    repository_rule_impact: {
      runtime_behavior_changed: false,
      content_authority_changed: false,
      public_exposure_changed: false,
      control_workflow_changed: true,
      notes: "V2 replaces repeated human and state-acceptance PRs with trusted backend receipts; it does not itself import, publish, deploy, or open discoverability.",
    },
  };
}

export function buildV2() {
  const v1Bytes = fs.readFileSync(path.join(ROOT, V1_PATH));
  const v1 = JSON.parse(v1Bytes.toString("utf8"));
  const inputsBytes = fs.readFileSync(path.join(ROOT, V2_INPUTS_PATH));
  const inputs = JSON.parse(inputsBytes.toString("utf8"));
  return applyMaterializationInputs(
    migrateV1ToV2(v1, sha256Bytes(v1Bytes), inputs, sha256Bytes(inputsBytes)),
    inputs,
  );
}

function main() {
  const write = process.argv.includes("--write");
  const check = process.argv.includes("--check");
  if (write === check) throw new Error("choose_exactly_one_of=--write|--check");
  const bytes = `${JSON.stringify(buildV2(), null, 2)}\n`;
  const target = path.join(ROOT, V2_PATH);
  if (write) {
    fs.writeFileSync(target, bytes, { flag: "w" });
    process.stdout.write(`${JSON.stringify({ ok: true, path: V2_PATH, sha256: sha256Bytes(bytes) })}\n`);
    return;
  }
  const actual = fs.readFileSync(target, "utf8");
  if (actual !== bytes) throw new Error("v2_master_not_deterministically_generated");
  process.stdout.write(`${JSON.stringify({ ok: true, path: V2_PATH, sha256: sha256Bytes(actual) })}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
