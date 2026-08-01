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
];

const LINEAGE_GATE_STATES = ["package_frozen", "qa_pass", "dry_run_ready"];
const PROMOTION_STATES = ["draft_imported", "published", "live_qa_pass"];

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

function readBoundJson(relativePath, expectedSha256) {
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
  return JSON.parse(bytes.toString("utf8"));
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

function stateIndex(status) {
  return V2_ORDERED_STATES.indexOf(status);
}

function registeredTargetContract(v2, base, laneId) {
  const assetIds = Array.isArray(base.asset_ids)
    ? [...base.asset_ids]
    : v2.assets.filter((asset) => asset.lane_id === laneId).map((asset) => asset.asset_id);
  const assets = assetIds.map((assetId) => v2.assets.find((asset) => asset.asset_id === assetId));
  if (assets.some((asset) => !asset)) throw new Error(`registered_target_asset_missing=${laneId}`);
  const sumOrNull = (field) => assets.every((asset) => Number.isInteger(asset[field]))
    ? assets.reduce((total, asset) => total + asset[field], 0)
    : null;
  return {
    assetIds,
    expectedCount: sumOrNull("expected_en_count"),
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
    evidence.subscope !== manifest.subscope ||
    evidence.source_repository !== "fermatmind/fap-api" ||
    evidence.source_commit !== manifest.reviewed_source_commit ||
    !/^[a-z0-9_]{1,96}$/.test(evidence.adapter ?? "") ||
    !/^(content_assets\/en-content-parity|content_packs|content_baselines|database\/seeders\/data)\//.test(
      evidence.package_path ?? "",
    ) ||
    String(evidence.package_path ?? "").includes("..") ||
    evidence.package_sha256 !== manifest.package_sha256 ||
    evidence.release_policy_sha256 !== BACKEND_PROMOTION_CONTRACT.release_policy_sha256 ||
    evidence.expected_count !== registeredTarget.expectedCount ||
    evidence.written_count !== 0 ||
    evidence.readback_count !== registeredTarget.expectedCount ||
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

function assertLaneManifestTransition(base, manifest, key, registeredTarget) {
  if (!LANE_MANIFEST_STATES.includes(manifest.status)) {
    throw new Error(`lane_manifest_status_not_allowed=${key}:${manifest.status}`);
  }
  if (manifest.blocked_from_status !== null || manifest.blockers.length !== 0) {
    throw new Error(`lane_manifest_cannot_materialize_blocked_state=${key}`);
  }
  if (Object.hasOwn(manifest, "counts")) throw new Error(`lane_manifest_counts_forbidden=${key}`);
  if (base.counts && canonicalJson(base.counts) !== canonicalJson(registeredTarget.counts)) {
    throw new Error(`registered_target_counts_invalid=${key}`);
  }
  const baseIndex = stateIndex(base.status);
  const targetIndex = stateIndex(manifest.status);
  if (baseIndex < 0 || targetIndex < baseIndex) throw new Error(`lane_manifest_state_regression=${key}`);
  const expectedTrace = V2_ORDERED_STATES.slice(baseIndex, targetIndex).map((fromStatus, index) => ({
    from_status: fromStatus,
    to_status: V2_ORDERED_STATES[baseIndex + index + 1],
  }));
  if (
    canonicalJson(manifest.transition_trace.map(({ from_status, to_status }) => ({ from_status, to_status }))) !==
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
  if (manifestLineage.some((entry) => entry.package_sha256 !== manifest.package_sha256)) {
    throw new Error(`lane_manifest_lineage_package_mismatch=${key}`);
  }
  const qaRequired = targetIndex >= stateIndex("qa_pass");
  const qaLineage = manifestLineage.filter((entry) => entry.status === "qa_pass");
  if (qaRequired) {
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
    if (
      report.schema_version !== "fermatmind.en_content_parity_independent_qa_report.v2" ||
      report.artifact_kind !== "independent_qa_report" ||
      report.qa_lane_id !== "W9" ||
      report.producer_lane_id !== manifest.lane_id ||
      report.subscope_id !== manifest.subscope ||
      report.package_sha256 !== manifest.package_sha256 ||
      report.reviewed_source_commit !== manifest.reviewed_source_commit ||
      report.reviewed_row_count !== registeredTarget.expectedCount ||
      canonicalJson(report.reviewed_asset_ids) !== canonicalJson(registeredTarget.assetIds) ||
      report.verdict !== "PASS" ||
      !["language_naturalness", "grammar", "markdown_integrity", "source_equivalence", "claim_boundary", "chinese_leakage", "asset_integrity"]
        .every((check) => report.checks?.[check] === "PASS") ||
      Object.values(report.checks ?? {}).some((value) => value !== "PASS")
    ) {
      throw new Error(`lane_manifest_independent_w9_report_invalid=${key}`);
    }
    const currentPrHead = process.env.EN_PARITY_CURRENT_PR_HEAD ?? "";
    if (currentPrHead !== "") {
      try {
        execFileSync("git", ["merge-base", "--is-ancestor", report.reviewed_source_commit, currentPrHead], {
          stdio: "ignore",
        });
      } catch {
        throw new Error(`lane_manifest_w9_reviewed_commit_not_in_pr=${key}`);
      }
    }
  } else if (manifest.qa_report_ref !== null) {
    throw new Error(`lane_manifest_qa_reference_before_qa=${key}`);
  } else if (manifest.reviewed_source_commit !== null || manifest.expected_count !== null) {
    throw new Error(`lane_manifest_w9_binding_before_qa=${key}`);
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
    const manifest = readBoundJson(binding.path, binding.sha256);
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
    assertLaneManifestTransition(target, manifest, key, registeredTargetContract(v2, target, binding.lane_id));
    for (const field of [
      "status",
      "blocked_from_status",
      "package_sha256",
      "qa_report_ref",
      "gate_lineage",
      "legacy_lineage",
      "blockers",
    ]) {
      if (Object.hasOwn(manifest, field)) target[field] = manifest[field];
    }
    target.lane_manifest_ref = binding.path;
  }
  const occupiedReceiptTargets = new Set();
  for (const chain of inputs.receipt_chains) {
    const key = targetKey(chain.lane_id, chain.subscope);
    if (occupiedReceiptTargets.has(key)) throw new Error(`duplicate_receipt_chain_binding=${key}`);
    occupiedReceiptTargets.add(key);
    const lane = v2.lanes.find((item) => item.lane_id === chain.lane_id);
    if (chain.subscope === null && lane?.subscopes?.length > 0) {
      throw new Error(`split_lane_root_receipt_chain_forbidden=${chain.lane_id}`);
    }
    const target = targetFor(v2, chain.lane_id, chain.subscope);
    if (target.status !== "dry_run_ready") throw new Error(`receipt_chain_requires_dry_run_ready=${key}`);
    if (!PROMOTION_STATES.includes(chain.target_status)) throw new Error(`receipt_chain_target_status_invalid=${key}`);
    if (chain.release_policy_sha256 !== v2.authority.backend_promotion_contract.release_policy_sha256) {
      throw new Error(`receipt_chain_release_policy_mismatch=${key}`);
    }
    if (target.package_sha256 !== chain.package_sha256) {
      throw new Error(`receipt_chain_package_mismatch=${key}`);
    }
    if (chain.expected_count !== registeredTargetContract(v2, target, chain.lane_id).expectedCount) {
      throw new Error(`receipt_chain_registered_count_mismatch=${key}`);
    }
    target.status = chain.target_status;
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

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
