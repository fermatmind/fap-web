import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const evidenceRoot = join(root, "generated/en-content-parity/W9-independent-qa/riasec/w4-riasec-944ddac");
const blockedPackageSha = "944ddac51957b38aa6232335f07269cd904c2513348fad652acb5acb0de59e33";
const resetArtifactPath = join(root, "generated/en-content-parity/CONTROL-approvals/W4-RIASEC/package-rework-reset-944ddac.json");
const resetArtifactRef = "generated/en-content-parity/CONTROL-approvals/W4-RIASEC/package-rework-reset-944ddac.json";
const reportRef = "generated/en-content-parity/W9-independent-qa/riasec/w4-riasec-944ddac/independent_qa_report.json";
const rowEvidenceRef = "generated/en-content-parity/W9-independent-qa/riasec/w4-riasec-944ddac/row_review_evidence.json";
const frozenProjectionRef = "generated/en-content-parity/W9-independent-qa/riasec/w4-riasec-944ddac/frozen_package_identity_projection.json";
const reportSha = "eb722ec622b2f55734e0a0126a757b57ee0f0c63eecddb4189d1c9b28d16a694";
const rowEvidenceSha = "b0b366808c7259b7ec389824e65a1fc0328a28b3529adf05dd2fece797a97ca9";
const frozenProjectionSha = "d80a3764f5d0c20ae14814c061bbf85bbe071f5c8d3259e54a47b7d8f3f97de7";
const permissionKeys = ["cms_write_authorized", "master_manifest_write_authorized", "production_import_authorized", "public_release_authorized", "search_submission_authorized", "seo_runtime_release_authorized", "staging_write_authorized"];
const requiredChecks = ["language_naturalness", "chinese_leakage", "source_equivalence_identity", "claim_boundary", "internal_link_equivalence", "field_leakage", "asset_media_duplication_omission", "page_api_alignment_applicable"];
const sha = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");
const json = (file) => JSON.parse(readFileSync(file, "utf8"));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const packageAggregate = (files) => createHash("sha256").update(files.map((file) => `${file.path}:${file.sha256}`).join("\n")).digest("hex");
const allPermissionsFalse = (permissions) => JSON.stringify(Object.keys(permissions ?? {}).sort()) === JSON.stringify(permissionKeys) && Object.values(permissions).every((value) => value === false);

export function validateW4RiasecW9Qa() {
  const master = json(join(root, "docs/seo/generated/en-content-parity-control-master.v1.json"));
  const report = json(join(evidenceRoot, "independent_qa_report.json"));
  const evidence = json(join(evidenceRoot, "row_review_evidence.json"));
  const projection = json(join(evidenceRoot, "frozen_package_identity_projection.json"));
  const repairPlan = json(join(evidenceRoot, "repair_batch_plan.json"));
  const qaManifest = json(join(evidenceRoot, "qa_sha256_manifest.json"));
  const w4 = master.lanes.find((lane) => lane.lane_id === "W4");
  const resetMode = w4?.status === "package_in_progress";
  if (resetMode) {
    assert(existsSync(resetArtifactPath), `W4 reset mode requires CONTROL artifact: ${resetArtifactRef}`);
    const reset = json(resetArtifactPath);
    assert(
      reset.$schema === "docs/seo/generated/en-content-parity-control-master.v1.schema.json" &&
        reset.artifact_kind === "package_rework_reset" &&
        reset.schema_version === "fermatmind.en_content_parity_package_rework_reset.v1" &&
        reset.control_id === "EN-PARITY-CONTROL-BOOTSTRAP-01" &&
        reset.control_owner === "CONTROL" &&
        reset.producer_lane_id === "W4" &&
        reset.subscope_id === null &&
        reset.blocked_package_sha256 === blockedPackageSha &&
        reset.w9_report_ref === reportRef &&
        reset.w9_report_sha256 === reportSha &&
        reset.w9_row_evidence_ref === rowEvidenceRef &&
        reset.w9_row_evidence_sha256 === rowEvidenceSha &&
        reset.w9_frozen_ledger_ref === frozenProjectionRef &&
        reset.w9_frozen_ledger_sha256 === frozenProjectionSha &&
        reset.proposed_status === "package_in_progress" &&
        JSON.stringify([...reset.clear_fields ?? []].sort()) === JSON.stringify(["gate_lineage", "package_sha256", "qa_report_ref"]) &&
        allPermissionsFalse(reset.permissions),
      "W4 reset CONTROL artifact binding or permissions drifted"
    );
    assert(
      sha(join(root, reset.w9_report_ref)) === reset.w9_report_sha256 &&
        sha(join(root, reset.w9_row_evidence_ref)) === reset.w9_row_evidence_sha256 &&
        sha(join(root, reset.w9_frozen_ledger_ref)) === reset.w9_frozen_ledger_sha256,
      "W4 reset CONTROL artifact evidence SHA mismatch"
    );
    assert(
      w4?.package_sha256 === null &&
        w4?.qa_report_ref === null &&
        w4?.blocked_from_status === null &&
        w4?.gate_lineage?.length === 0 &&
        w4?.blockers?.length === 0,
      "W4 reset master must clear the failed package SHA, lineage, and blockers"
    );
  } else {
    assert(w4?.status === "package_frozen", "W4-RIASEC must remain package_frozen unless the exact CONTROL reset is valid");
    assert(w4?.qa_report_ref === null, "W4 frozen master must not bind a historical BLOCKED W9 report");
    assert(w4?.package_sha256 && w4.package_sha256 !== blockedPackageSha, "W4 frozen master must not re-accept the historical BLOCKED package");
  }
  assert(JSON.stringify([w4.counts.expected_en_assets, w4.counts.current_en_assets, w4.counts.remaining_en_assets]) === JSON.stringify([14, 0, 14]), "W4 logical counts drifted");
  assert(w4?.launch_state === "launch_ready" && allPermissionsFalse(w4?.permissions), "W4 master launch state or permissions drifted");
  const mapIds = projection.atomic_row_identity_projection.map((row) => row.row_id);
  assert(mapIds.length === 1550 && new Set(mapIds).size === 1550, "frozen atomic row identity projection drifted");
  assert(report.package_sha256 === blockedPackageSha && report.verdict === "BLOCKED" && report.reviewed_row_count === 1550, "W9 report identity or verdict drifted");
  assert(evidence.package_sha256 === blockedPackageSha && evidence.verdict === "BLOCKED" && evidence.row_reviews.length === 1550, "W9 evidence coverage drifted");
  assert(JSON.stringify(evidence.row_reviews.map((row) => row.row_id)) === JSON.stringify(mapIds), "row evidence must preserve frozen atomic order");
  assert(new Set(evidence.row_reviews.map((row) => row.row_id)).size === 1550, "row evidence IDs must be unique");
  assert(evidence.row_reviews.every((row) => JSON.stringify(Object.keys(row.checks).sort()) === JSON.stringify([...requiredChecks].sort())), "every row must contain all W9 checks");
  assert(evidence.row_reviews.every((row) => row.page_api_alignment_status === "NOT_APPLICABLE" && row.checks.page_api_alignment_applicable === "PASS"), "page/API applicability must be explicit and candidate-only");
  assert(evidence.row_reviews.every((row) => row.verdict === (Object.values(row.checks).includes("BLOCKED") ? "BLOCKED" : "PASS") && typeof row.evidence === "string" && row.evidence.length > 30), "row verdict/evidence mismatch");
  const blocked = evidence.row_reviews.filter((row) => row.verdict === "BLOCKED");
  assert(blocked.length === 130, "blocked row count must remain 130");
  assert(blocked.filter((row) => row.checks.language_naturalness === "BLOCKED").length === 126, "language blocker coverage must remain 126");
  assert(blocked.filter((row) => row.checks.asset_media_duplication_omission === "BLOCKED").length === 4, "duplicate blocker coverage must remain 4");
  assert(report.checks.language_naturalness === "BLOCKED" && report.checks.asset_duplication === "BLOCKED" && report.checks.page_api_alignment === "NOT_APPLICABLE", "aggregate report checks drifted");
  assert(projection.package_sha256 === blockedPackageSha && projection.reference_only === true && projection.package_copied_or_modified === false, "frozen reference boundary drifted");
  assert(projection.atomic_row_identity_projection.length === 1550, "identity projection must cover every atomic row");
  assert(
    repairPlan.package_sha256 === blockedPackageSha &&
      repairPlan.verdict === "BLOCKED" &&
      repairPlan.minimum_rework_batches.length === 2 &&
      repairPlan.required_control_precondition === "Separate CONTROL-only failed-package reset from package_frozen to package_in_progress; do not alter this W9 evidence or the frozen producer package.",
    "minimal rework plan or CONTROL reset precondition drifted"
  );
  assert(allPermissionsFalse(report.permissions) && allPermissionsFalse(evidence.permissions) && allPermissionsFalse(repairPlan.permissions), "all W9 permissions must remain false");
  assert(!["master_manifest_patch.candidate.json", "frozen_package"].some((name) => { try { readFileSync(join(evidenceRoot, name)); return true; } catch { return false; } }), "BLOCKED W9 evidence must not create a candidate or copied frozen package");
  assert(qaManifest.files.length === 7 && qaManifest.files.every((file) => sha(join(evidenceRoot, file.path)) === file.sha256), "W9 evidence SHA manifest mismatch");
  assert(qaManifest.qa_package_sha256 === packageAggregate(qaManifest.files), "W9 evidence aggregate SHA mismatch");
  return { ok: true, package_sha256: blockedPackageSha, rows: 1550, blocked_rows: 130, language_blocked_rows: 126, duplicate_blocked_rows: 4, verdict: "BLOCKED", control_reset: resetMode, historical_evidence_only: !resetMode };
}

try {
  process.stdout.write(`${JSON.stringify(validateW4RiasecW9Qa(), null, 2)}\n`);
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
