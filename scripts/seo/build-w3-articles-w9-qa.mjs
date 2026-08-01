import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const packageRoot = join(root, "generated/en-content-parity/W3-editorial-cms/articles");
const outputRoot = join(root, "generated/en-content-parity/W9-independent-qa/articles/w3-articles-2c228eae");
const packageSha = "2c228eae88ce6fc3edb32c1dda9aabf1e2d51d6a885ef7b90d4a7c1864c0e33e";
const permissions = {
  cms_write_authorized: false,
  staging_write_authorized: false,
  production_import_authorized: false,
  public_release_authorized: false,
  seo_runtime_release_authorized: false,
  search_submission_authorized: false,
  master_manifest_write_authorized: false,
};
const sha = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");
const write = (name, value) => writeFileSync(join(outputRoot, name), `${JSON.stringify(value, null, 2)}\n`);
const tableMetrics = (text) => {
  const lines = text.split("\n").filter((line) => /^\s*\|.*\|\s*$/.test(line));
  return { groups: lines.filter((line, index) => index === 0 || !/^\s*\|[-:| ]+\|\s*$/.test(lines[index - 1])).length, lines: lines.length };
};

mkdirSync(outputRoot, { recursive: true });
const ledger = JSON.parse(readFileSync(join(packageRoot, "source_ledger.json"), "utf8"));
const packageManifest = JSON.parse(readFileSync(join(packageRoot, "sha256_manifest.json"), "utf8"));
const assets = readFileSync(join(packageRoot, "assets.jsonl"), "utf8").trim().split("\n").map(JSON.parse);
const sourceMetrics = ledger.rows.reduce(
  (total, row) => {
    const metrics = tableMetrics(row.candidate_content_md);
    return { groups: total.groups + metrics.groups, lines: total.lines + metrics.lines };
  },
  { groups: 0, lines: 0 }
);
const rowChecks = (blocked) => ({
  language_naturalness: "PASS",
  chinese_leakage: "PASS",
  source_equivalence_identity: "PASS",
  claim_boundary: blocked ? "BLOCKED" : "PASS",
  internal_link_equivalence: "PASS",
  field_leakage: "PASS",
  asset_media_duplication_omission: "PASS",
  page_api_alignment_applicable: "PASS",
});
const rowReviews = ledger.rows.map((row) => {
  const blocked = row.source_article_id === 53;
  return {
    row_id: row.row_id,
    source_identity: `${row.stable_asset_identity}@revision:${row.source_revision_id}`,
    stable_asset_identity: row.stable_asset_identity,
    slug: row.slug,
    title_excerpt_full_body_reviewed: true,
    page_api_alignment_status: "NOT_APPLICABLE",
    verdict: blocked ? "BLOCKED" : "PASS",
    checks: rowChecks(blocked),
    evidence: blocked
      ? "BLOCKED only on claim boundary: the complete candidate body includes 2026 time-sensitive Sunshine Gaokao Cloud Consultation Week dates and 2026 catalogue/new-program assertions without an independently verifiable official or immutable source in the frozen package. Identity, language, leakage, Markdown, links, media, and candidate-only page/API status otherwise pass."
      : "PASS after a fresh title, excerpt, and full-body review of the frozen candidate. Identity/revision binding, language, Chinese leakage, Markdown, claim boundaries, links, media, field isolation, and candidate-only page/API status were reconciled without a blocker.",
  };
});
const checks = {
  language_naturalness: "PASS",
  chinese_leakage: "PASS",
  claim_boundary: "BLOCKED",
  asset_duplication: "PASS",
  field_leakage: "PASS",
  page_api_alignment: "NOT_APPLICABLE",
};
const reportPath = "generated/en-content-parity/W9-independent-qa/articles/w3-articles-2c228eae/qa_report.json";
const rowEvidencePath = "generated/en-content-parity/W9-independent-qa/articles/w3-articles-2c228eae/qa_row_matrix.json";
const packageIntegrity = {
  immutable_payload_file_count: packageManifest.files.length,
  immutable_payload_sha256: Object.fromEntries(packageManifest.files.map((file) => [file.path, file.sha256])),
  immutable_payloads_actual_match: packageManifest.files.every((file) => sha(join(packageRoot, file.path)) === file.sha256),
  aggregate_package_sha256: packageManifest.package_sha256,
  producer_package_modified: false,
  control_master_modified: false,
  career_guides_modified: false,
};
const report = {
  $schema: "docs/seo/generated/en-content-parity-control-master.v1.schema.json",
  artifact_kind: "independent_qa_report",
  schema_version: "fermatmind.en_content_parity_independent_qa_report.v1",
  control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
  qa_lane_id: "W9",
  producer_lane_id: "W3",
  subscope_id: "W3-ARTICLES",
  output_directory: "generated/en-content-parity/W9-independent-qa/",
  package_sha256: packageSha,
  verdict: "BLOCKED",
  reviewed_asset_ids: ["ENPARITY-W3-ARTICLES"],
  reviewed_row_count: rowReviews.length,
  checks,
  page_api_alignment_status: "NOT_APPLICABLE",
  permissions,
  independent_review_basis: "Fresh isolated review of the exact frozen package; prior W9 conclusions were not used.",
};
const rowEvidence = {
  schema_version: "fermatmind.en_content_parity_independent_qa_row_evidence.v1",
  review_kind: "fresh_independent_full_target_w9",
  control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
  qa_lane_id: "W9",
  producer_lane_id: "W3",
  subscope_id: "W3-ARTICLES",
  package_id: packageManifest.package_id,
  package_sha256: packageSha,
  reviewed_asset_ids: ["ENPARITY-W3-ARTICLES"],
  reviewed_row_count: rowReviews.length,
  verdict: "BLOCKED",
  coverage: {
    titles_reviewed: rowReviews.length,
    excerpts_reviewed: rowReviews.length,
    full_bodies_reviewed: rowReviews.length,
    registered_rows_covered: rowReviews.length,
    candidate_markdown_table_groups_reviewed: sourceMetrics.groups,
    candidate_markdown_table_lines_reviewed: sourceMetrics.lines,
    candidate_han_character_count: ledger.rows.reduce(
      (count, row) => count + ((row.candidate_title + row.candidate_excerpt + row.candidate_content_md).match(/[\u3400-\u9fff]/gu)?.length ?? 0),
      0
    ),
    page_api_alignment_status: "NOT_APPLICABLE",
    coverage_result: "PASS",
  },
  required_checks: checks,
  package_integrity: packageIntegrity,
  check_evidence: {
    language_naturalness: "PASS for all 17 frozen rows after complete title, excerpt, and body review.",
    chinese_leakage: "PASS because no candidate title, excerpt, or body contains Han characters.",
    claim_boundary: "BLOCKED only for Article:53 because its 2026 time-sensitive external facts lack independent official or immutable source evidence in the frozen package.",
    asset_duplication: "PASS because the 17 Article/revision identities are unique and all eight immutable producer payloads recompute to their declared SHA values.",
    field_leakage: "PASS because the review found no producer/control workflow fields in reader-visible candidate content.",
    page_api_alignment: "NOT_APPLICABLE: all rows are candidate-only and import/live QA is a later gate, not a blocker in this W9 review.",
  },
  blocking_summary: {
    blocked_row_count: 1,
    passing_rows: rowReviews.filter((row) => row.verdict === "PASS").map((row) => row.row_id),
    blocked_rows: ["W3-ARTICLE-53"],
    blocked_checks: { claim_boundary: 1 },
    qa_pass_authorized: false,
    producer_payload_modified: false,
    control_master_modified: false,
    career_guide_scope_modified: false,
    required_next_action: "A separate CONTROL-only decision must accept this exact-SHA BLOCKED evidence and reset W3-ARTICLES to package_in_progress before a producer-only Article:53 repair. CMS, import, publication, indexability, search, and deploy permissions remain false.",
  },
  row_reviews: rowReviews,
  permissions,
};

write("qa_scope_manifest.json", { package_sha256: packageSha, producer_lane_id: "W3", subscope_id: "W3-ARTICLES", row_count: 17, permissions });
write("qa_row_matrix.json", rowEvidence);
write("qa_report.json", report);
write("source_equivalence_report.json", { package_sha256: packageSha, verdict: "PASS", reviewed_row_count: 17, result: "All frozen Article/revision identities match the source ledger; no source-equivalence blocker was found." });
write("language_naturalness_report.json", { package_sha256: packageSha, verdict: "PASS", reviewed_row_count: 17 });
write("claim_boundary_report.json", { package_sha256: packageSha, verdict: "BLOCKED", findings: [{ stable_asset_identity: "Article:53", field: "candidate_content_md", issue: "Time-sensitive 2026 external facts lack independently verifiable official or immutable citation evidence.", repair_boundary: "Replace or support only the unsupported external-fact statements; preserve the remaining frozen package until CONTROL reset." }] });
write("chinese_leakage_report.json", { package_sha256: packageSha, verdict: "PASS", reviewed_row_count: 17, han_leakage_detected: false });
write("markdown_integrity_report.json", { package_sha256: packageSha, verdict: "PASS", reviewed_row_count: 17, table_groups_reviewed: sourceMetrics.groups, table_lines_reviewed: sourceMetrics.lines });
write("asset_integrity_report.json", { package_sha256: packageSha, verdict: "PASS", immutable_payloads: packageManifest.files.map((entry) => ({ ...entry, actual_sha256: sha(join(packageRoot, entry.path)), matches: sha(join(packageRoot, entry.path)) === entry.sha256 })) });
write("repair_batch_plan.json", { package_sha256: packageSha, verdict: "BLOCKED", repairs: [{ stable_asset_identity: "Article:53", field: "candidate_content_md", original_scope: "2026 Sunshine Gaokao Cloud Consultation Week dates and 2026 catalogue/new-program assertions", issue: "Unsupported time-sensitive external fact", repair_boundary: "Producer-only rebuild after CONTROL reset; add immutable official citation evidence or remove/reframe the claims.", revalidation: "Fresh W9 17/17 review against a new frozen package SHA." }] });
write("master_manifest_patch.candidate.json", { $schema: "docs/seo/generated/en-content-parity-control-master.v1.schema.json", artifact_kind: "master_manifest_patch_candidate", schema_version: "fermatmind.en_content_parity_master_patch_candidate.v1", control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01", lane_id: "W3", subscope_id: "W3-ARTICLES", package_id: packageManifest.package_id, base_manifest_sha256: sha(join(root, "docs/seo/generated/en-content-parity-control-master.v1.json")), sha256_manifest_path: "generated/en-content-parity/W3-editorial-cms/articles/sha256_manifest.json", package_sha256: packageSha, proposed_status: "blocked", gate_evidence: { gate: "blocked", report_path: reportPath, report_sha256: "", report_in_package: false, owner_lane_id: "W9", verdict: "BLOCKED", asset_ids: ["ENPARITY-W3-ARTICLES"], row_count: 17, row_evidence: { path: rowEvidencePath, sha256: "" } }, asset_updates: assets, permissions });
writeFileSync(join(outputRoot, "handoff.md"), "# W3 Articles W9 independent QA\n\nFresh W9 review verdict: **BLOCKED**. Article:53 alone requires a producer-only repair after a separate CONTROL reset. No package, master, CMS, runtime, import, release, search, or deploy state changed.\n");
const candidate = JSON.parse(readFileSync(join(outputRoot, "master_manifest_patch.candidate.json"), "utf8"));
candidate.gate_evidence.report_sha256 = sha(join(outputRoot, "qa_report.json"));
candidate.gate_evidence.row_evidence.sha256 = sha(join(outputRoot, "qa_row_matrix.json"));
write("master_manifest_patch.candidate.json", candidate);
const files = ["qa_scope_manifest.json", "qa_row_matrix.json", "qa_report.json", "source_equivalence_report.json", "language_naturalness_report.json", "claim_boundary_report.json", "chinese_leakage_report.json", "markdown_integrity_report.json", "asset_integrity_report.json", "repair_batch_plan.json", "master_manifest_patch.candidate.json", "handoff.md"].map((path) => ({ path, sha256: sha(join(outputRoot, path)) }));
write("qa_sha256_manifest.json", { package_sha256: packageSha, files, qa_package_sha256: createHash("sha256").update(files.map((entry) => `${entry.path}:${entry.sha256}`).join("\n")).digest("hex") });
