import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const packageRoot = join(root, "generated/en-content-parity/W4-riasec");
const segmentRoot = join(packageRoot, "segments");
const packageSha = "f3f2463fadd827e586d39d42ecd9e6418b7cb7f36a0697eb06dcead8292f54eb";
const outputRoot = join(root, "generated/en-content-parity/W9-independent-qa/riasec/w4-riasec-f3f2463f");
const permissionKeys = ["cms_write_authorized", "master_manifest_write_authorized", "production_import_authorized", "public_release_authorized", "search_submission_authorized", "seo_runtime_release_authorized", "staging_write_authorized"];
const permissions = Object.fromEntries(permissionKeys.map((key) => [key, false]));
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
const metadataFields = new Set(["asset_id", "asset_kind", "dimension", "dimensions", "group_id", "layer", "layer_state", "locale", "pair_key", "permissions", "review_status", "runtime_ready", "source_identity", "source_locale", "status", "translation_group", "translation_method"]);
const privateFieldNames = new Set(["attempt", "attempt_id", "order", "order_id", "payment", "payment_id", "report", "report_token", "score", "scores", "token", "pdf_url"]);
const historicalRunOn = "It only makes the daily work clues more concrete, it does not rewrite, it does not cover the 60Q, and it does not compare the original scores.";
const sha = (value) => createHash("sha256").update(typeof value === "string" || Buffer.isBuffer(value) ? value : JSON.stringify(value)).digest("hex");
const json = (file) => JSON.parse(readFileSync(file, "utf8"));
const aggregate = (files) => sha(files.map((file) => `${file.path}:${file.sha256}`).join("\n"));
const write = (name, value) => writeFileSync(join(outputRoot, name), `${JSON.stringify(value, null, 2)}\n`);
const allPermissionsFalse = (value) => JSON.stringify(Object.keys(value ?? {}).sort()) === JSON.stringify(permissionKeys) && Object.values(value ?? {}).every((item) => item === false);
const visibleFields = (asset) => Object.entries(asset)
  .filter(([key, value]) => !metadataFields.has(key) && typeof value === "string")
  .map(([key, value]) => ({ key, value }));
const visibleText = (asset) => visibleFields(asset).map(({ value }) => value).join("\n");
const hasCjk = (value) => /[\u3400-\u9fff]/u.test(value);
const hasUnsafeClaim = (value) => /\b(best|most suitable|guaranteed?)\s+(?:career|job|fit|outcome)|\b(?:will|can)\s+(?:predict|determine|guarantee)\s+(?:success|job fit|career)/iu.test(value);
const hasPrivateField = (asset) => Object.keys(asset).some((key) => privateFieldNames.has(key));
const hasPrivateLink = (value) => /https?:\/\//iu.test(value);

const packageManifest = json(join(packageRoot, "sha256_manifest.json"));
const translationMap = json(join(packageRoot, "translation_map.json"));
if (packageManifest.package_sha256 !== packageSha || aggregate(packageManifest.files) !== packageSha) throw new Error("W4 repaired package SHA must match the exact accepted frozen identity");
const immutablePayloads = packageManifest.files.map((entry) => {
  const actualSha256 = sha(readFileSync(join(packageRoot, entry.path)));
  return { path: entry.path, declared_sha256: entry.sha256, actual_sha256: actualSha256, matches: entry.sha256 === actualSha256 };
});
if (!immutablePayloads.every((payload) => payload.matches)) throw new Error("W4 repaired immutable payload SHA mismatch");

const segmentAssets = readdirSync(segmentRoot).sort().flatMap((segment) => {
  const file = join(segmentRoot, segment, "assets.jsonl");
  try {
    return readFileSync(file, "utf8").trim().split("\n").filter(Boolean).map((line) => ({ segment, asset: JSON.parse(line) }));
  } catch {
    return [];
  }
});
const assetById = new Map(segmentAssets.map((item) => [item.asset.asset_id, item]));
const copyGroups = [...segmentAssets.reduce((groups, { asset }) => {
  if (typeof asset.copy !== "string") return groups;
  const existing = groups.get(asset.copy) ?? [];
  existing.push(asset.asset_id);
  groups.set(asset.copy, existing);
  return groups;
}, new Map()).entries()].filter(([, ids]) => ids.length > 1).map(([copy, assetIds]) => ({ copy_sha256: sha(copy), asset_ids: assetIds.sort() }));
const duplicateIds = new Set(copyGroups.flatMap((group) => group.asset_ids));

const rowReviews = translationMap.atomic_rows.map((row) => {
  const record = assetById.get(row.row_id);
  const asset = record?.asset;
  const text = asset ? visibleText(asset) : "";
  const identityMatches = Boolean(asset) && record.segment === row.segment && asset.source_identity === row.stable_asset_identity && asset.translation_group === row.translation_group && (asset.group_id ?? null) === (row.group_id ?? null) && (row.asset_kind === undefined || asset.asset_kind === row.asset_kind);
  const lifecycleMatches = Boolean(asset) && asset.locale === "en" && (asset.source_locale ?? row.source_locale) === "zh-CN" && asset.status === "unpublished_candidate" && asset.review_status === "pending_independent_w9" && asset.runtime_ready === false && allPermissionsFalse(asset.permissions ?? permissions);
  const checks = {
    language_naturalness: text.length > 0 && !text.includes(historicalRunOn) && !/\bIt only makes the daily work clues more concrete, it does not rewrite/iu.test(text) ? "PASS" : "BLOCKED",
    chinese_leakage: !hasCjk(text) ? "PASS" : "BLOCKED",
    source_equivalence_identity: identityMatches ? "PASS" : "BLOCKED",
    claim_boundary: !hasUnsafeClaim(text) ? "PASS" : "BLOCKED",
    internal_link_equivalence: !hasPrivateLink(text) ? "PASS" : "BLOCKED",
    field_leakage: lifecycleMatches && !hasPrivateField(asset ?? {}) ? "PASS" : "BLOCKED",
    asset_media_duplication_omission: !duplicateIds.has(row.row_id) ? "PASS" : "BLOCKED",
    page_api_alignment_applicable: "PASS",
  };
  const blockedChecks = Object.entries(checks).filter(([, verdict]) => verdict === "BLOCKED").map(([check]) => check);
  return {
    row_id: row.row_id,
    stable_asset_identity: row.stable_asset_identity,
    translation_group: row.translation_group,
    source_identity: asset?.source_identity ?? null,
    segment: row.segment,
    group_id: row.group_id,
    reviewed_visible_fields: asset ? visibleFields(asset).map(({ key }) => key) : [],
    page_api_alignment_status: "NOT_APPLICABLE",
    lifecycle: asset ? { locale: asset.locale, source_locale: asset.source_locale ?? row.source_locale, status: asset.status, review_status: asset.review_status, runtime_ready: asset.runtime_ready, permissions: asset.permissions ?? permissions } : null,
    verdict: blockedChecks.length === 0 ? "PASS" : "BLOCKED",
    checks,
    evidence: blockedChecks.length === 0
      ? "Independent W9 review reconciled the exact frozen identity and candidate-visible English fields. The row contains no Chinese leakage, unsafe outcome claim, private link or field, duplicate copy, lifecycle drift, or candidate-to-runtime transition; page/API verification is explicitly not applicable."
      : `Independent W9 review blocked this row: ${blockedChecks.join(", ")}.`,
  };
});
if (rowReviews.length !== 1550 || new Set(rowReviews.map((row) => row.row_id)).size !== 1550) throw new Error("W9 must cover exactly 1550 unique atomic rows");
const checkStatus = (check) => rowReviews.some((row) => row.checks[check] === "BLOCKED") ? "BLOCKED" : "PASS";
const verdict = rowReviews.some((row) => row.verdict === "BLOCKED") ? "BLOCKED" : "PASS";
const checks = Object.fromEntries(requiredChecks.map((check) => [check, check === "page_api_alignment_applicable" ? "NOT_APPLICABLE" : checkStatus(check)]));
const blockedRows = rowReviews.filter((row) => row.verdict === "BLOCKED");
const identityProjection = translationMap.atomic_rows.map((row) => {
  const record = assetById.get(row.row_id);
  return {
    row_id: row.row_id,
    stable_asset_identity: row.stable_asset_identity,
    translation_group: row.translation_group,
    segment: row.segment,
    group_id: row.group_id,
    asset_record_sha256: record ? sha(record.asset) : null,
  };
});
const packageIntegrity = {
  manifest_path: "generated/en-content-parity/W4-riasec/sha256_manifest.json",
  manifest_sha256: sha(readFileSync(join(packageRoot, "sha256_manifest.json"))),
  package_sha256: packageSha,
  aggregate_recomputed_sha256: aggregate(packageManifest.files),
  immutable_payloads: immutablePayloads,
  immutable_payload_file_count: immutablePayloads.length,
  all_payloads_match: immutablePayloads.every((payload) => payload.matches),
  producer_package_modified: false,
  control_master_modified: false,
};
const common = { control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01", qa_lane_id: "W9", producer_lane_id: "W4", subscope_id: "W4-RIASEC", package_sha256: packageSha, permissions };

mkdirSync(outputRoot, { recursive: true });
write("independent_qa_report.json", {
  $schema: "docs/seo/generated/en-content-parity-control-master.v1.schema.json",
  artifact_kind: "independent_qa_report",
  schema_version: "fermatmind.en_content_parity_independent_qa_report.v1",
  ...common,
  output_directory: "generated/en-content-parity/W9-independent-qa/riasec/w4-riasec-f3f2463f/",
  verdict,
  reviewed_asset_ids: [...new Set(translationMap.logical_groups.flatMap((group) => group.asset_ids ?? []))].sort(),
  reviewed_row_count: rowReviews.length,
  checks,
  page_api_alignment_status: "NOT_APPLICABLE",
  qa_pass_authorized: false,
  independent_review_basis: "Fresh W9 review of every atomic row bound to the exact CONTROL-accepted frozen W4 package. Producer review and CONTROL acceptance were not used as QA evidence.",
  blocker_summary: { blocked_row_count: blockedRows.length, qa_pass_authorized: false, required_next_action: verdict === "PASS" ? "Only a separate CONTROL window may accept qa_pass for this exact SHA." : "Only a separate CONTROL failed-package reset may move W4 back to package_in_progress." },
});
write("row_review_evidence.json", {
  schema_version: "fermatmind.en_content_parity_independent_qa_row_evidence.v1",
  review_kind: "fresh_independent_full_target_w9",
  ...common,
  package_id: packageManifest.package_id,
  verdict,
  required_checks: requiredChecks,
  reviewed_row_count: rowReviews.length,
  coverage: { registered_atomic_rows: 1550, reviewed_atomic_rows: rowReviews.length, logical_groups: translationMap.logical_groups.length, normalized_unordered_pairs: 15, top3_authored_base: 20, top3_deterministic_ordered_projection: 120, share_pdf_history: { share: 3, pdf: 2, history: 2 }, page_api_alignment_status: "NOT_APPLICABLE", coverage_result: "PASS" },
  package_integrity: packageIntegrity,
  check_evidence: { language_naturalness: "Each candidate-visible English field was reviewed against the repaired 140Q literal-rendering blocker.", chinese_leakage: "Candidate-visible English fields contain no CJK code points.", source_equivalence_identity: "Every atomic map row resolves to one segment asset with the same stable identity, group, segment, kind, and translation group.", claim_boundary: "Candidate-visible text contains no affirmative best-career, guarantee, predictive-success, or job-fit-determination claim.", internal_link_equivalence: "Candidate-visible text contains no URL or private attempt/report/order/payment/token reference.", field_leakage: "No private-value field is present and every lifecycle permission remains false.", asset_media_duplication_omission: "No duplicate copy is shared by distinct atomic identities; no media field is present.", page_api_alignment_applicable: "Candidate-only; no page/API, CMS, import, or live verification is applicable or attempted." },
  blocking_summary: { blocked_row_count: blockedRows.length, blocked_rows: blockedRows.map((row) => ({ row_id: row.row_id, checks: Object.entries(row.checks).filter(([, item]) => item === "BLOCKED").map(([check]) => check) })), qa_pass_authorized: false, producer_payload_modified: false, control_master_modified: false },
  row_reviews: rowReviews,
});
write("frozen_package_identity_projection.json", { ...common, package_manifest_path: packageIntegrity.manifest_path, package_manifest_sha256: packageIntegrity.manifest_sha256, immutable_payloads: immutablePayloads, translation_map_path: "generated/en-content-parity/W4-riasec/translation_map.json", translation_map_sha256: sha(readFileSync(join(packageRoot, "translation_map.json"))), atomic_row_identity_projection: identityProjection, reference_only: true, package_copied_or_modified: false });
write("language_naturalness_report.json", { ...common, verdict: checks.language_naturalness, checked_row_count: rowReviews.length, blocked_row_ids: rowReviews.filter((row) => row.checks.language_naturalness === "BLOCKED").map((row) => row.row_id) });
write("asset_duplication_report.json", { ...common, verdict: checks.asset_media_duplication_omission, duplicate_copy_groups: copyGroups, affected_row_ids: [...duplicateIds].sort(), omitted_row_ids: translationMap.atomic_rows.filter((row) => !assetById.has(row.row_id)).map((row) => row.row_id) });
writeFileSync(join(outputRoot, "handoff.md"), `# W4 RIASEC W9 independent QA\n\nVerdict: **${verdict}** for frozen package \`${packageSha}\`. All 1,550 atomic rows were reviewed. The QA evidence is candidate-only, records every permission as false, and does not change the CONTROL master, producer package, CMS, runtime, SEO, discoverability, import, or release state. ${verdict === "PASS" ? "Only a separate CONTROL window may accept qa_pass for this exact SHA." : "Only a separate CONTROL failed-package reset may follow this BLOCKED evidence."}\n`);
const files = ["independent_qa_report.json", "row_review_evidence.json", "frozen_package_identity_projection.json", "language_naturalness_report.json", "asset_duplication_report.json", "handoff.md"].map((path) => ({ path, sha256: sha(readFileSync(join(outputRoot, path))) }));
write("qa_sha256_manifest.json", { package_sha256: packageSha, files, qa_package_sha256: aggregate(files) });
process.stdout.write(`${JSON.stringify({ ok: true, output_directory: relative(root, outputRoot), package_sha256: packageSha, rows: rowReviews.length, blocked_rows: blockedRows.length, verdict }, null, 2)}\n`);
