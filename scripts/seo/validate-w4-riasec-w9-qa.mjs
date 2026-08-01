import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const packageRoot = join(root, "generated/en-content-parity/W4-riasec");
const segmentRoot = join(packageRoot, "segments");
const evidenceRoot = join(root, "generated/en-content-parity/W9-independent-qa/riasec/w4-riasec-944ddac");
const packageSha = "944ddac51957b38aa6232335f07269cd904c2513348fad652acb5acb0de59e33";
const requiredChecks = ["language_naturalness", "chinese_leakage", "source_equivalence_identity", "claim_boundary", "internal_link_equivalence", "field_leakage", "asset_media_duplication_omission", "page_api_alignment_applicable"];
const sha = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");
const json = (file) => JSON.parse(readFileSync(file, "utf8"));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const packageAggregate = (files) => createHash("sha256").update(files.map((file) => `${file.path}:${file.sha256}`).join("\n")).digest("hex");

export function validateW4RiasecW9Qa() {
  const master = json(join(root, "docs/seo/generated/en-content-parity-control-master.v1.json"));
  const packageManifest = json(join(packageRoot, "sha256_manifest.json"));
  const map = json(join(packageRoot, "translation_map.json"));
  const report = json(join(evidenceRoot, "independent_qa_report.json"));
  const evidence = json(join(evidenceRoot, "row_review_evidence.json"));
  const projection = json(join(evidenceRoot, "frozen_package_identity_projection.json"));
  const repairPlan = json(join(evidenceRoot, "repair_batch_plan.json"));
  const qaManifest = json(join(evidenceRoot, "qa_sha256_manifest.json"));
  const w4 = master.lanes.find((lane) => lane.lane_id === "W4");
  assert(w4?.status === "package_frozen", "W4-RIASEC must remain package_frozen");
  assert(w4?.package_sha256 === packageSha && w4?.qa_report_ref === null, "W4 frozen master binding drifted");
  assert(w4?.gate_lineage?.length === 1 && w4.gate_lineage[0]?.status === "package_frozen" && w4.gate_lineage[0]?.package_sha256 === packageSha, "W4 package_frozen lineage drifted");
  assert(JSON.stringify([w4.counts.expected_en_assets, w4.counts.current_en_assets, w4.counts.remaining_en_assets]) === JSON.stringify([14, 0, 14]), "W4 logical counts drifted");
  assert(Object.values(w4.permissions).every((value) => value === false), "master permissions must remain false");
  assert(packageManifest.package_sha256 === packageSha && packageManifest.files.length === 8, "frozen package identity drifted");
  assert(packageManifest.files.every((file) => sha(join(packageRoot, file.path)) === file.sha256), "immutable payload SHA mismatch");
  assert(packageAggregate(packageManifest.files) === packageSha, "frozen aggregate SHA mismatch");
  const segmentFiles = readdirSync(segmentRoot).sort().map((directory) => join(segmentRoot, directory, "assets.jsonl")).filter((file) => { try { readFileSync(file); return true; } catch { return false; } });
  const assets = segmentFiles.flatMap((file) => readFileSync(file, "utf8").trim().split("\n").filter(Boolean).map(JSON.parse));
  const mapIds = map.atomic_rows.map((row) => row.row_id);
  assert(assets.length === 1550 && mapIds.length === 1550 && new Set(mapIds).size === 1550, "atomic row count or uniqueness drifted");
  assert(new Set(map.atomic_rows.map((row) => row.translation_group)).size === 1550, "translation groups must be unique");
  assert(JSON.stringify(assets.map((asset) => asset.asset_id).sort()) === JSON.stringify([...mapIds].sort()), "segment assets must exactly cover the atomic map");
  assert(map.atomic_rows.every((row) => row.locale === "en" && row.source_locale === "zh-CN" && row.status === "unpublished_candidate" && row.review_status === "pending_independent_w9" && row.runtime_ready === false), "atomic lifecycle drifted");
  assert(map.logical_groups.length === 14 && map.reconciliation.logical_group_count === 14 && map.reconciliation.atomic_row_count === 1550, "logical reconciliation drifted");
  assert(report.package_sha256 === packageSha && report.verdict === "BLOCKED" && report.reviewed_row_count === 1550, "W9 report identity or verdict drifted");
  assert(evidence.package_sha256 === packageSha && evidence.verdict === "BLOCKED" && evidence.row_reviews.length === 1550, "W9 evidence coverage drifted");
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
  assert(projection.package_sha256 === packageSha && projection.reference_only === true && projection.package_copied_or_modified === false, "frozen reference boundary drifted");
  assert(projection.atomic_row_identity_projection.length === 1550, "identity projection must cover every atomic row");
  assert(repairPlan.package_sha256 === packageSha && repairPlan.verdict === "BLOCKED" && repairPlan.minimum_rework_batches.length === 2, "minimal rework plan drifted");
  assert(Object.values(report.permissions).every((value) => value === false) && Object.values(evidence.permissions).every((value) => value === false) && Object.values(repairPlan.permissions).every((value) => value === false), "all W9 permissions must remain false");
  assert(!["master_manifest_patch.candidate.json", "frozen_package"].some((name) => { try { readFileSync(join(evidenceRoot, name)); return true; } catch { return false; } }), "BLOCKED W9 evidence must not create a candidate or copied frozen package");
  assert(qaManifest.files.length === 7 && qaManifest.files.every((file) => sha(join(evidenceRoot, file.path)) === file.sha256), "W9 evidence SHA manifest mismatch");
  assert(qaManifest.qa_package_sha256 === packageAggregate(qaManifest.files), "W9 evidence aggregate SHA mismatch");
  return { ok: true, package_sha256: packageSha, rows: 1550, blocked_rows: 130, language_blocked_rows: 126, duplicate_blocked_rows: 4, verdict: "BLOCKED" };
}

try {
  process.stdout.write(`${JSON.stringify(validateW4RiasecW9Qa(), null, 2)}\n`);
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
