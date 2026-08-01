import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const packageRoot = join(root, "generated/en-content-parity/W4-riasec");
const masterPath = join(root, "docs/seo/generated/en-content-parity-control-master.v1.json");
const historicalRoot = join(root, "generated/en-content-parity/W9-independent-qa/riasec/w4-riasec-944ddac");
const currentRoot = join(root, "generated/en-content-parity/W9-independent-qa/riasec/w4-riasec-f3f2463f");
const historicalPackageSha = "944ddac51957b38aa6232335f07269cd904c2513348fad652acb5acb0de59e33";
const currentPackageSha = "f3f2463fadd827e586d39d42ecd9e6418b7cb7f36a0697eb06dcead8292f54eb";
const historicalEvidence = {
  report: "eb722ec622b2f55734e0a0126a757b57ee0f0c63eecddb4189d1c9b28d16a694",
  rows: "b0b366808c7259b7ec389824e65a1fc0328a28b3529adf05dd2fece797a97ca9",
  projection: "d80a3764f5d0c20ae14814c061bbf85bbe071f5c8d3259e54a47b7d8f3f97de7",
};
const permissionKeys = ["cms_write_authorized", "master_manifest_write_authorized", "production_import_authorized", "public_release_authorized", "search_submission_authorized", "seo_runtime_release_authorized", "staging_write_authorized"];
const requiredChecks = ["language_naturalness", "chinese_leakage", "source_equivalence_identity", "claim_boundary", "internal_link_equivalence", "field_leakage", "asset_media_duplication_omission", "page_api_alignment_applicable"];
const expectedCurrentFiles = ["asset_duplication_report.json", "frozen_package_identity_projection.json", "handoff.md", "independent_qa_report.json", "language_naturalness_report.json", "qa_sha256_manifest.json", "row_review_evidence.json"];
const sha = (value) => createHash("sha256").update(typeof value === "string" || Buffer.isBuffer(value) ? value : JSON.stringify(value)).digest("hex");
const json = (file) => JSON.parse(readFileSync(file, "utf8"));
const aggregate = (files) => sha(files.map((file) => `${file.path}:${file.sha256}`).join("\n"));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const allPermissionsFalse = (value) => JSON.stringify(Object.keys(value ?? {}).sort()) === JSON.stringify(permissionKeys) && Object.values(value ?? {}).every((item) => item === false);

function validateHistoricalEvidence() {
  const report = json(join(historicalRoot, "independent_qa_report.json"));
  const rows = json(join(historicalRoot, "row_review_evidence.json"));
  const projection = json(join(historicalRoot, "frozen_package_identity_projection.json"));
  const manifest = json(join(historicalRoot, "qa_sha256_manifest.json"));
  assert(report.package_sha256 === historicalPackageSha && report.verdict === "BLOCKED" && report.reviewed_row_count === 1550, "historical W9 report identity or verdict drifted");
  assert(rows.package_sha256 === historicalPackageSha && rows.verdict === "BLOCKED" && rows.row_reviews.length === 1550, "historical W9 row evidence drifted");
  assert(projection.package_sha256 === historicalPackageSha && projection.reference_only === true && projection.package_copied_or_modified === false, "historical W9 frozen projection drifted");
  assert(sha(readFileSync(join(historicalRoot, "independent_qa_report.json"))) === historicalEvidence.report && sha(readFileSync(join(historicalRoot, "row_review_evidence.json"))) === historicalEvidence.rows && sha(readFileSync(join(historicalRoot, "frozen_package_identity_projection.json"))) === historicalEvidence.projection, "historical W9 evidence SHA mismatch");
  assert(manifest.package_sha256 === historicalPackageSha && manifest.files.length === 7 && manifest.files.every((file) => sha(readFileSync(join(historicalRoot, file.path))) === file.sha256) && manifest.qa_package_sha256 === aggregate(manifest.files), "historical W9 manifest drifted");
  assert(!["master_manifest_patch.candidate.json", "frozen_package"].some((name) => { try { readFileSync(join(historicalRoot, name)); return true; } catch { return false; } }), "historical W9 evidence must not contain a candidate or copied producer package");
  return { package_sha256: historicalPackageSha, verdict: report.verdict, rows: rows.row_reviews.length };
}

function validateCurrentEvidence() {
  const master = json(masterPath);
  const w4 = master.lanes.find((lane) => lane.lane_id === "W4");
  const packageManifest = json(join(packageRoot, "sha256_manifest.json"));
  const map = json(join(packageRoot, "translation_map.json"));
  const report = json(join(currentRoot, "independent_qa_report.json"));
  const rows = json(join(currentRoot, "row_review_evidence.json"));
  const projection = json(join(currentRoot, "frozen_package_identity_projection.json"));
  const language = json(join(currentRoot, "language_naturalness_report.json"));
  const duplicates = json(join(currentRoot, "asset_duplication_report.json"));
  const manifest = json(join(currentRoot, "qa_sha256_manifest.json"));
  assert(w4?.status === "package_frozen" && w4.package_sha256 === currentPackageSha && w4.qa_report_ref === null && allPermissionsFalse(w4.permissions), "W4 must remain CONTROL-frozen and unaccepted while W9 evidence is generated");
  assert(packageManifest.package_sha256 === currentPackageSha && packageManifest.files.length === 8 && aggregate(packageManifest.files) === currentPackageSha && packageManifest.files.every((file) => sha(readFileSync(join(packageRoot, file.path))) === file.sha256), "current W4 frozen package identity drifted");
  assert(JSON.stringify(readdirSync(currentRoot).filter((name) => !name.startsWith(".")).sort()) === JSON.stringify(expectedCurrentFiles), "current W9 evidence file set drifted");
  assert(report.package_sha256 === currentPackageSha && report.verdict === "PASS" && report.reviewed_row_count === 1550 && report.qa_pass_authorized === false, "current W9 report must be a full PASS without self-acceptance");
  assert(rows.package_sha256 === currentPackageSha && rows.verdict === "PASS" && rows.row_reviews.length === 1550 && rows.required_checks.length === requiredChecks.length, "current W9 row evidence identity or coverage drifted");
  assert(map.atomic_rows.length === 1550 && JSON.stringify(rows.row_reviews.map((row) => row.row_id)) === JSON.stringify(map.atomic_rows.map((row) => row.row_id)) && new Set(rows.row_reviews.map((row) => row.row_id)).size === 1550, "current W9 must preserve exact frozen row coverage and order");
  assert(rows.row_reviews.every((row) => JSON.stringify(Object.keys(row.checks).sort()) === JSON.stringify([...requiredChecks].sort()) && row.page_api_alignment_status === "NOT_APPLICABLE" && row.checks.page_api_alignment_applicable === "PASS" && row.verdict === "PASS" && Object.values(row.checks).every((value) => value === "PASS")), "current W9 row checks or candidate-only applicability drifted");
  assert(Object.entries(report.checks).every(([check, value]) => check === "page_api_alignment_applicable" ? value === "NOT_APPLICABLE" : value === "PASS"), "current W9 aggregate checks drifted");
  assert(rows.coverage.registered_atomic_rows === 1550 && rows.coverage.reviewed_atomic_rows === 1550 && rows.coverage.logical_groups === 14 && rows.coverage.normalized_unordered_pairs === 15 && JSON.stringify(rows.coverage.share_pdf_history) === JSON.stringify({ share: 3, pdf: 2, history: 2 }) && rows.coverage.page_api_alignment_status === "NOT_APPLICABLE", "current W9 coverage reconciliation drifted");
  assert(projection.package_sha256 === currentPackageSha && projection.reference_only === true && projection.package_copied_or_modified === false && projection.immutable_payloads.length === 8 && projection.immutable_payloads.every((payload) => payload.matches) && projection.atomic_row_identity_projection.length === 1550, "current W9 frozen identity projection drifted");
  assert(language.package_sha256 === currentPackageSha && language.verdict === "PASS" && language.checked_row_count === 1550 && language.blocked_row_ids.length === 0, "current W9 language report drifted");
  assert(duplicates.package_sha256 === currentPackageSha && duplicates.verdict === "PASS" && duplicates.duplicate_copy_groups.length === 0 && duplicates.affected_row_ids.length === 0 && duplicates.omitted_row_ids.length === 0, "current W9 duplicate or omission report drifted");
  assert(allPermissionsFalse(report.permissions) && allPermissionsFalse(rows.permissions) && allPermissionsFalse(projection.permissions) && allPermissionsFalse(language.permissions) && allPermissionsFalse(duplicates.permissions), "current W9 permissions must remain false");
  assert(manifest.package_sha256 === currentPackageSha && manifest.files.length === 6 && manifest.files.every((file) => sha(readFileSync(join(currentRoot, file.path))) === file.sha256) && manifest.qa_package_sha256 === aggregate(manifest.files), "current W9 evidence SHA manifest drifted");
  assert(!["master_manifest_patch.candidate.json", "frozen_package"].some((name) => { try { readFileSync(join(currentRoot, name)); return true; } catch { return false; } }), "current W9 evidence must not contain a master candidate or copied producer package");
  return { package_sha256: currentPackageSha, verdict: report.verdict, rows: rows.row_reviews.length };
}

export function validateW4RiasecW9Qa() {
  const historical = validateHistoricalEvidence();
  const current = validateCurrentEvidence();
  return { ok: true, historical, current, qa_pass_authorized: false };
}

try {
  process.stdout.write(`${JSON.stringify(validateW4RiasecW9Qa(), null, 2)}\n`);
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
