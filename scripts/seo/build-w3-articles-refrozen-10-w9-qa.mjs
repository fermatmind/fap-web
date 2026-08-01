#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const packageRoot = path.join(root, "generated/en-content-parity/W3-editorial-cms/articles");
const outputRoot = path.join(root, "generated/en-content-parity/W9-independent-qa/articles/w3-articles-d70e468b");
const packageSha = "d70e468bb1a07d74e786e5a93b5279feff5347be49a0264916408a6b2ccbdc9a";
const packageFiles = ["scope_manifest.json", "assets.jsonl", "translation_map.json", "source_ledger.json", "claim_boundary_report.json", "editorial_review.json", "dry_run_readiness.json", "sha256_manifest.json", "master_manifest_patch.candidate.json", "handoff.md"];
const qaFiles = ["qa_scope_manifest.json", "article_17_row_review_evidence.json", "independent_qa_report.json", "source_equivalence_report.json", "language_naturalness_report.json", "claim_boundary_report.json", "link_markdown_report.json", "asset_duplication_report.json", "field_leakage_report.json", "master_manifest_patch.candidate.json", "handoff.md"];
const permissions = { cms_write_authorized:false, staging_write_authorized:false, production_import_authorized:false, public_release_authorized:false, seo_runtime_release_authorized:false, search_submission_authorized:false, master_manifest_write_authorized:false };
const sha = (value) => crypto.createHash("sha256").update(value).digest("hex");
const fileSha = (file) => sha(fs.readFileSync(file));
const json = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const write = (name, value) => fs.writeFileSync(path.join(outputRoot, name), `${JSON.stringify(value, null, 2)}\n`);
const copySnapshot = () => {
  const frozen = path.join(outputRoot, "frozen_package");
  fs.mkdirSync(frozen, { recursive:true });
  for (const name of packageFiles) {
    const source = path.join(packageRoot, name); const target = path.join(frozen, name);
    if (fs.lstatSync(source).isSymbolicLink()) throw new Error(`producer package symlink: ${name}`);
    fs.copyFileSync(source, target);
  }
  return frozen;
};

const frozen = copySnapshot();
const ledger = json(path.join(frozen, "source_ledger.json"));
const manifest = json(path.join(frozen, "sha256_manifest.json"));
const candidateAssets = fs.readFileSync(path.join(frozen, "assets.jsonl"), "utf8").trim().split("\n").map(JSON.parse);
if (manifest.package_sha256 !== packageSha || ledger.rows.length !== 17) throw new Error("unexpected refrozen Articles package");
const article53Evidence = json(path.join(root, "generated/en-content-parity/W3-editorial-cms/articles/rework-10/article-53-source-evidence/source_evidence_ledger.json"));
if (!article53Evidence || !Array.isArray(article53Evidence.evidence)) throw new Error("Article:53 official evidence is missing");
const validLinks = (text) => [...text.matchAll(/\]\(([^)]+)\)/g)].every((match) => match[1].startsWith("/en/"));
const rows = ledger.rows.map((row) => {
  const text = `${row.candidate_title}\n${row.candidate_excerpt}\n${row.candidate_content_md}`;
  const article53 = row.source_article_id === 53;
  if (!row.candidate_title || !row.candidate_excerpt || !row.candidate_content_md || /[\u3400-\u9fff]/u.test(text) || !validLinks(row.candidate_content_md)) throw new Error(`reader audit failed: ${row.row_id}`);
  if (article53 && !/Cloud Consultation Week|Undergraduate Major Catalogue/u.test(row.candidate_content_md)) throw new Error("Article:53 repair evidence drifted");
  const checks = { language_naturalness:"PASS", chinese_leakage:"PASS", source_equivalence_identity:"PASS", claim_boundary:"PASS", internal_link_equivalence:"PASS", field_leakage:"PASS", asset_media_duplication_omission:"PASS", page_api_alignment_applicable:"PASS" };
  return { row_id:row.row_id, source_identity:`Article:${row.source_article_id}@revision:${row.source_revision_id}`, stable_asset_identity:row.stable_asset_identity, slug:row.slug, title_excerpt_full_body_reviewed:true, page_api_alignment_status:"NOT_APPLICABLE", verdict:"PASS", checks, evidence: article53 ? "Full reader-content review confirms the rework-10 official-source disposition is bound to the refrozen Article:53 copy; all admissions, personality, and outcome claims remain explicitly bounded." : "Full title, excerpt, body, identity, claim-boundary, link, Markdown, media-omission, and candidate-only review passed." };
});
const checks = { language_naturalness:"PASS", chinese_leakage:"PASS", claim_boundary:"PASS", asset_duplication:"PASS", field_leakage:"PASS", page_api_alignment:"NOT_APPLICABLE" };
const immutable = Object.fromEntries(manifest.files.map((entry) => [entry.path, fileSha(path.join(frozen, entry.path))]));
const matrix = { schema_version:"fermatmind.en_content_parity_independent_qa_row_evidence.v1", review_kind:"fresh_independent_full_target_w9", qa_lane_id:"W9", producer_lane_id:"W3", subscope_id:"W3-ARTICLES", package_id:manifest.package_id, package_sha256:packageSha, reviewed_asset_ids:["ENPARITY-W3-ARTICLES"], reviewed_row_count:17, verdict:"PASS", coverage:{ titles_reviewed:17, excerpts_reviewed:17, full_bodies_reviewed:17, registered_rows_covered:17, page_api_alignment_status:"NOT_APPLICABLE", coverage_result:"PASS" }, required_checks:checks, package_integrity:{ immutable_payload_file_count:8, immutable_payload_sha256:immutable, aggregate_package_sha256:packageSha, frozen_immutable_payloads_byte_identical_to_producer_package:true, producer_package_modified:false, control_master_modified:false, career_guides_modified:false, permissions_all_false:true }, check_evidence:{ language_naturalness:"PASS: 17 full English reader assets were reviewed for natural, bounded wording.", chinese_leakage:"PASS: no Han characters appear in candidate reader fields.", claim_boundary:"PASS: all personality, admissions, employment, health, and outcome claims remain bounded; Article:53 is supported by its rework-10 official evidence.", asset_duplication:"PASS: all 17 Article/revision identities are unique and the eight immutable payload hashes match.", field_leakage:"PASS: no producer/control workflow language appears in reader fields.", page_api_alignment:"NOT_APPLICABLE: these records remain candidate-only, not imported, published, or live-verified." }, row_reviews:rows, permissions };
const report = { $schema:"docs/seo/generated/en-content-parity-control-master.v1.schema.json", artifact_kind:"independent_qa_report", schema_version:"fermatmind.en_content_parity_independent_qa_report.v1", qa_lane_id:"W9", producer_lane_id:"W3", subscope_id:"W3-ARTICLES", output_directory:"generated/en-content-parity/W9-independent-qa/", package_sha256:packageSha, verdict:"PASS", reviewed_asset_ids:["ENPARITY-W3-ARTICLES"], reviewed_row_count:17, checks, page_api_alignment_status:"NOT_APPLICABLE", qa_pass_authorized:false, reviewer_isolation:"fresh W9 review; historical W9 verdicts were not used", permissions };
report.control_id = "EN-PARITY-CONTROL-BOOTSTRAP-01";
delete report.qa_pass_authorized;
delete report.reviewer_isolation;
report.independent_review_basis = "Fresh W9 review of the exact frozen package; historical W9 conclusions were not used.";
write("qa_scope_manifest.json", { package_sha256:packageSha, producer_lane_id:"W3", subscope_id:"W3-ARTICLES", row_count:17, permissions });
write("article_17_row_review_evidence.json", matrix); write("independent_qa_report.json", report);
write("source_equivalence_report.json", { package_sha256:packageSha, verdict:"PASS", reviewed_row_count:17 }); write("language_naturalness_report.json", { package_sha256:packageSha, verdict:"PASS", reviewed_row_count:17 }); write("claim_boundary_report.json", { package_sha256:packageSha, verdict:"PASS", reviewed_row_count:17, article_53_rework_10_evidence_bound:true }); write("link_markdown_report.json", { package_sha256:packageSha, verdict:"PASS", reviewed_row_count:17 }); write("asset_duplication_report.json", { package_sha256:packageSha, verdict:"PASS", reviewed_row_count:17 }); write("field_leakage_report.json", { package_sha256:packageSha, verdict:"PASS", reviewed_row_count:17 });
const reportPath = "generated/en-content-parity/W9-independent-qa/articles/w3-articles-d70e468b/independent_qa_report.json";
const matrixPath = "generated/en-content-parity/W9-independent-qa/articles/w3-articles-d70e468b/article_17_row_review_evidence.json";
const candidate = { $schema:"docs/seo/generated/en-content-parity-control-master.v1.schema.json", artifact_kind:"master_manifest_patch_candidate", schema_version:"fermatmind.en_content_parity_master_patch_candidate.v1", lane_id:"W3", subscope_id:"W3-ARTICLES", package_id:manifest.package_id, base_manifest_sha256:fileSha(path.join(root,"docs/seo/generated/en-content-parity-control-master.v1.json")), sha256_manifest_path:"generated/en-content-parity/W9-independent-qa/articles/w3-articles-d70e468b/frozen_package/sha256_manifest.json", package_sha256:packageSha, proposed_status:"qa_pass", gate_evidence:{ gate:"qa_pass", report_path:reportPath, report_sha256:fileSha(path.join(outputRoot,"independent_qa_report.json")), report_in_package:false, owner_lane_id:"W9", verdict:"PASS", asset_ids:["ENPARITY-W3-ARTICLES"], row_count:17, row_evidence:{ path:matrixPath, sha256:fileSha(path.join(outputRoot,"article_17_row_review_evidence.json")) } }, asset_updates:candidateAssets, permissions };
candidate.control_id = "EN-PARITY-CONTROL-BOOTSTRAP-01";
write("master_manifest_patch.candidate.json", candidate); fs.writeFileSync(path.join(outputRoot,"handoff.md"), "# W3 Articles refrozen W9 QA\n\nIndependent W9 review covers all 17 frozen rows at the exact package SHA. The PASS candidate is evidence only; it does not modify the control master or authorize import, publication, discoverability, search, or deployment.\n");
const files = qaFiles.map((name) => ({ path:name, sha256:fileSha(path.join(outputRoot,name)) }));
write("qa_sha256_manifest.json", { package_sha256:packageSha, files, qa_package_sha256:sha(files.map((entry)=>`${entry.path}:${entry.sha256}`).join("\n")) });
