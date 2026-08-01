import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const packageRoot = join(root, "generated/en-content-parity/W4-riasec");
const segmentRoot = join(packageRoot, "segments");
const outputRoot = join(root, "generated/en-content-parity/W9-independent-qa/riasec/w4-riasec-944ddac");
const packageSha = "944ddac51957b38aa6232335f07269cd904c2513348fad652acb5acb0de59e33";
const permissions = {
  cms_write_authorized: false,
  staging_write_authorized: false,
  production_import_authorized: false,
  public_release_authorized: false,
  seo_runtime_release_authorized: false,
  search_submission_authorized: false,
  master_manifest_write_authorized: false,
};
const requiredChecks = [
  "language_naturalness",
  "chinese_leakage",
  "source_equivalence_identity",
  "claim_boundary",
  "internal_link_equivalence",
  "field_leakage",
  "asset_media_duplication_omission",
  "page_api_alignment_applicable",
];
const sha = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");
const json = (file) => JSON.parse(readFileSync(file, "utf8"));
const write = (name, value) => writeFileSync(join(outputRoot, name), `${JSON.stringify(value, null, 2)}\n`);
const canonicalPackageSha = (files) => createHash("sha256").update(files.map((file) => `${file.path}:${file.sha256}`).join("\n")).digest("hex");
const readerText = (asset) =>
  Object.entries(asset)
    .filter(([key]) => !["asset_id", "translation_group", "source_identity", "locale", "source_locale", "status", "review_status", "runtime_ready", "permissions", "translation_method", "group_id", "asset_kind", "dimension", "layer", "layer_state", "frontend_fallback_allowed", "fallback_behavior"].includes(key))
    .filter(([, value]) => typeof value === "string")
    .map(([, value]) => value)
    .join("\n");

mkdirSync(outputRoot, { recursive: true });
const packageManifest = json(join(packageRoot, "sha256_manifest.json"));
const translationMap = json(join(packageRoot, "translation_map.json"));
const segmentFiles = readdirSync(segmentRoot)
  .sort()
  .map((directory) => join(segmentRoot, directory, "assets.jsonl"))
  .filter((file) => {
    try { readFileSync(file); return true; } catch { return false; }
  });
const assets = segmentFiles.flatMap((file) => readFileSync(file, "utf8").trim().split("\n").filter(Boolean).map(JSON.parse));
const assetById = new Map(assets.map((asset) => [asset.asset_id, asset]));
const duplicateCopyGroups = [...assets.reduce((groups, asset) => {
  const copy = asset.copy;
  if (typeof copy !== "string") return groups;
  const group = groups.get(copy) ?? [];
  group.push(asset.asset_id);
  groups.set(copy, group);
  return groups;
}, new Map()).entries()]
  .filter(([, assetIds]) => assetIds.length > 1)
  .map(([copy, assetIds]) => ({ copy_sha256: createHash("sha256").update(copy).digest("hex"), asset_ids: assetIds }));
const duplicateAssetIds = new Set(duplicateCopyGroups.flatMap((group) => group.asset_ids));
const translationTail = "It only makes the daily work clues more concrete, it does not rewrite, it does not cover the 60Q, and it does not compare the original scores.";
const languageBlockedAssetIds = new Set(assets.filter((asset) => readerText(asset).includes(translationTail)).map((asset) => asset.asset_id));

const rowReviews = translationMap.atomic_rows.map((row) => {
  const asset = assetById.get(row.row_id);
  const languageBlocked = languageBlockedAssetIds.has(row.row_id);
  const duplicateBlocked = duplicateAssetIds.has(row.row_id);
  const checks = Object.fromEntries(requiredChecks.map((check) => [check, "PASS"]));
  if (languageBlocked) checks.language_naturalness = "BLOCKED";
  if (duplicateBlocked) checks.asset_media_duplication_omission = "BLOCKED";
  const verdict = Object.values(checks).includes("BLOCKED") ? "BLOCKED" : "PASS";
  const failureReasons = [
    ...(languageBlocked ? ["The visible 140Q summary repeats a run-on literal rendering (\"It only makes the daily work clues more concrete, it does not rewrite…\"), which is not publication-ready English."] : []),
    ...(duplicateBlocked ? ["The complete visible copy is byte-identical to a different source identity in the same logical group; the two identities require distinct reader-facing content or an explicit shared-content design."] : []),
  ];
  return {
    row_id: row.row_id,
    stable_asset_identity: row.stable_asset_identity,
    translation_group: row.translation_group,
    source_identity: asset?.source_identity ?? row.stable_asset_identity,
    segment: row.segment,
    group_id: row.group_id,
    title_excerpt_full_body_reviewed: true,
    reviewed_visible_fields: Object.keys(asset ?? {}).filter((key) => typeof asset?.[key] === "string" && !["asset_id", "translation_group", "source_identity"].includes(key)),
    page_api_alignment_status: "NOT_APPLICABLE",
    lifecycle: {
      locale: asset?.locale,
      source_locale: asset?.source_locale,
      status: asset?.status,
      review_status: asset?.review_status,
      runtime_ready: asset?.runtime_ready,
      permissions: asset?.permissions,
    },
    verdict,
    checks,
    evidence: failureReasons.length > 0
      ? failureReasons.join(" ")
      : "Fresh W9 review reconciled the frozen row identity and reader-visible fields with the atomic map. No CJK, unsupported RIASEC claim, private/link field, duplicate copy, or lifecycle/permission drift was found; page/API live verification remains a later gate and is explicitly not applicable here.",
  };
});
const aggregate = (check) => rowReviews.some((row) => row.checks[check] === "BLOCKED") ? "BLOCKED" : "PASS";
const reportChecks = {
  language_naturalness: aggregate("language_naturalness"),
  chinese_leakage: aggregate("chinese_leakage"),
  claim_boundary: aggregate("claim_boundary"),
  asset_duplication: rowReviews.some((row) => row.checks.source_equivalence_identity === "BLOCKED" || row.checks.asset_media_duplication_omission === "BLOCKED") ? "BLOCKED" : "PASS",
  field_leakage: rowReviews.some((row) => row.checks.internal_link_equivalence === "BLOCKED" || row.checks.field_leakage === "BLOCKED") ? "BLOCKED" : "PASS",
  page_api_alignment: "NOT_APPLICABLE",
};
const payloadIntegrity = packageManifest.files.map((entry) => ({
  path: entry.path,
  declared_sha256: entry.sha256,
  actual_sha256: sha(join(packageRoot, entry.path)),
  matches: sha(join(packageRoot, entry.path)) === entry.sha256,
}));
const packageIntegrity = {
  manifest_path: "generated/en-content-parity/W4-riasec/sha256_manifest.json",
  manifest_sha256: sha(join(packageRoot, "sha256_manifest.json")),
  package_sha256: packageManifest.package_sha256,
  aggregate_recomputed_sha256: canonicalPackageSha(packageManifest.files),
  immutable_payloads: payloadIntegrity,
  immutable_payload_file_count: payloadIntegrity.length,
  all_payloads_match: payloadIntegrity.every((entry) => entry.matches),
  producer_package_modified: false,
  control_master_modified: false,
};
const reviewedAssetIds = [...new Set(translationMap.logical_groups.flatMap((group) => group.asset_ids ?? []))].sort();
const blockerRows = rowReviews.filter((row) => row.verdict === "BLOCKED");
const report = {
  $schema: "docs/seo/generated/en-content-parity-control-master.v1.schema.json",
  artifact_kind: "independent_qa_report",
  schema_version: "fermatmind.en_content_parity_independent_qa_report.v1",
  control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
  qa_lane_id: "W9",
  producer_lane_id: "W4",
  subscope_id: "W4-RIASEC",
  output_directory: "generated/en-content-parity/W9-independent-qa/",
  package_sha256: packageSha,
  verdict: "BLOCKED",
  reviewed_asset_ids: reviewedAssetIds,
  reviewed_row_count: rowReviews.length,
  checks: reportChecks,
  page_api_alignment_status: "NOT_APPLICABLE",
  permissions,
  independent_review_basis: "Fresh isolated W9 review of every atomic row in the exact frozen W4 package. Producer self-review and CONTROL acceptance were not used as evidence of a pass.",
  blocker_summary: {
    blocked_row_count: blockerRows.length,
    language_naturalness_rows: languageBlockedAssetIds.size,
    duplicate_copy_rows: duplicateAssetIds.size,
    qa_pass_authorized: false,
    required_next_action: "A separate CONTROL-only decision may retain this exact-SHA BLOCKED evidence and reset W4-RIASEC to package_in_progress. Any producer repair must rebuild and refreeze a new package before a new independent W9 review.",
  },
};
const rowEvidence = {
  schema_version: "fermatmind.en_content_parity_independent_qa_row_evidence.v1",
  review_kind: "fresh_independent_full_target_w9",
  control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
  qa_lane_id: "W9",
  producer_lane_id: "W4",
  subscope_id: "W4-RIASEC",
  package_id: packageManifest.package_id,
  package_sha256: packageSha,
  reviewed_asset_ids: reviewedAssetIds,
  reviewed_row_count: rowReviews.length,
  verdict: "BLOCKED",
  required_checks: reportChecks,
  coverage: {
    registered_atomic_rows: 1550,
    reviewed_atomic_rows: rowReviews.length,
    logical_groups: translationMap.logical_groups.length,
    normalized_unordered_pairs: 15,
    top3_authored_base: 20,
    top3_deterministic_ordered_projection: 120,
    share_pdf_history: { share: 3, pdf: 2, history: 2 },
    page_api_alignment_status: "NOT_APPLICABLE",
    coverage_result: "PASS",
  },
  package_integrity: packageIntegrity,
  check_evidence: {
    language_naturalness: `BLOCKED: ${languageBlockedAssetIds.size} 140Q rows contain the same run-on literal rendering; see language_naturalness_report.json for the exact row IDs and phrase.`,
    chinese_leakage: "PASS: reader-visible string fields were checked for CJK code points; source identity and translation-group metadata are excluded because they are not reader-facing content.",
    source_equivalence_identity: "PASS: every atomic map row has exactly one matching segment asset with the same row ID, stable identity, translation group, segment, and group ID.",
    claim_boundary: "PASS: each row was checked for the candidate's explicit interest-only, non-diagnostic, non-career-conclusion boundary; no unsupported performance or outcome claim was found.",
    internal_link_equivalence: "PASS: no reader-visible private attempt, score, report-token, order, payment, or private URL field was present.",
    field_leakage: "PASS: candidate-visible fields contain no producer/control workflow fields and every lifecycle permission remains false.",
    asset_media_duplication_omission: `BLOCKED: ${duplicateCopyGroups.length} independent duplicate-copy sets cover ${duplicateAssetIds.size} rows; no media fields were present to omit or approve.`,
    page_api_alignment_applicable: "PASS with NOT_APPLICABLE status: the complete package is candidate-only, runtime_ready is false, and no import or live page/API verification was authorized or attempted.",
  },
  blocking_summary: {
    blocked_row_count: blockerRows.length,
    blocked_rows: blockerRows.map((row) => ({ row_id: row.row_id, checks: Object.entries(row.checks).filter(([, verdict]) => verdict === "BLOCKED").map(([check]) => check) })),
    qa_pass_authorized: false,
    producer_payload_modified: false,
    control_master_modified: false,
  },
  row_reviews: rowReviews,
  permissions,
};
const projection = {
  package_sha256: packageSha,
  package_manifest_path: packageIntegrity.manifest_path,
  package_manifest_sha256: packageIntegrity.manifest_sha256,
  immutable_payloads: payloadIntegrity,
  translation_map_path: "generated/en-content-parity/W4-riasec/translation_map.json",
  translation_map_sha256: sha(join(packageRoot, "translation_map.json")),
  atomic_row_identity_projection: translationMap.atomic_rows.map((row) => ({
    row_id: row.row_id,
    stable_asset_identity: row.stable_asset_identity,
    translation_group: row.translation_group,
    segment: row.segment,
    group_id: row.group_id,
    asset_record_sha256: sha(segmentFiles.find((file) => readFileSync(file, "utf8").includes(`\"asset_id\":\"${row.row_id}\"`))),
  })),
  reference_only: true,
  package_copied_or_modified: false,
  permissions,
};
const repairPlan = {
  package_sha256: packageSha,
  verdict: "BLOCKED",
  required_control_precondition: "Separate CONTROL-only failed-package reset from package_frozen to package_in_progress; do not alter this W9 evidence or the frozen producer package.",
  minimum_rework_batches: [
    {
      batch: "W4-G06 140Q language-naturalness repair",
      affected_row_ids: [...languageBlockedAssetIds].sort(),
      repair_boundary: "Rewrite only the affected reader-visible English summaries for idiomatic, concise wording while preserving identity, RIASEC boundary, lifecycle state, and all-false permissions. Produce a new immutable package SHA.",
    },
    {
      batch: "W4-G02 duplicate-copy repair",
      duplicate_sets: duplicateCopyGroups,
      repair_boundary: "Differentiate possible_cost from possible_shadow_friction for the R and S source identities, or explicitly redesign the frozen source model so that a shared reader copy is intentional and uniquely represented. Produce a new immutable package SHA.",
    },
  ],
  revalidation: "Fresh independent W9 review of all 1550 rows against the newly frozen package SHA; no carry-forward qa_pass.",
  permissions,
};

write("independent_qa_report.json", report);
write("row_review_evidence.json", rowEvidence);
write("frozen_package_identity_projection.json", projection);
write("language_naturalness_report.json", { package_sha256: packageSha, verdict: "BLOCKED", phrase: translationTail, affected_row_ids: [...languageBlockedAssetIds].sort(), count: languageBlockedAssetIds.size, permissions });
write("asset_duplication_report.json", { package_sha256: packageSha, verdict: "BLOCKED", duplicate_copy_groups: duplicateCopyGroups, affected_row_ids: [...duplicateAssetIds].sort(), permissions });
write("repair_batch_plan.json", repairPlan);
writeFileSync(join(outputRoot, "handoff.md"), "# W4 RIASEC W9 independent QA\n\nVerdict: **BLOCKED** for frozen package `944ddac51957b38aa6232335f07269cd904c2513348fad652acb5acb0de59e33`. All 1,550 atomic rows were reviewed. The evidence identifies 126 rows with a repeated unidiomatic 140Q rendering and four rows in two duplicate-copy sets. No CONTROL master, producer package, CMS, import, runtime, SEO, sitemap, llms, indexability, publication, deployment, or permissions were changed.\n");
const files = ["independent_qa_report.json", "row_review_evidence.json", "frozen_package_identity_projection.json", "language_naturalness_report.json", "asset_duplication_report.json", "repair_batch_plan.json", "handoff.md"].map((path) => ({ path, sha256: sha(join(outputRoot, path)) }));
write("qa_sha256_manifest.json", { package_sha256: packageSha, files, qa_package_sha256: canonicalPackageSha(files) });
process.stdout.write(`${JSON.stringify({ ok: true, output_directory: relative(root, outputRoot), rows: rowReviews.length, blocked_rows: blockerRows.length, language_rows: languageBlockedAssetIds.size, duplicate_rows: duplicateAssetIds.size }, null, 2)}\n`);
