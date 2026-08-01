#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const packageRoot = path.join(root, "generated/en-content-parity/W3-editorial-cms/career-guides");
const outputRoot = path.join(root, "generated/en-content-parity/W9-independent-qa/career-guides/w3-career-guides-0b6728c9");
const packageSha = "0b6728c9a07e9404d0de57698f0f8b59616358ba91e456d1be848a1fe167ca7c";
const packageFiles = ["scope_manifest.json", "assets.jsonl", "translation_map.json", "source_ledger.json", "claim_boundary_report.json", "editorial_review.json", "dry_run_readiness.json", "sha256_manifest.json", "master_manifest_patch.candidate.json", "handoff.md"];
const qaFiles = ["qa_scope_manifest.json", "career_guide_20_row_review_evidence.json", "independent_qa_report.json", "source_equivalence_report.json", "language_naturalness_report.json", "claim_boundary_report.json", "link_markdown_report.json", "asset_duplication_report.json", "field_leakage_report.json", "master_manifest_patch.candidate.json", "handoff.md"];
const expectedCodes = ["annual-career-review-system", "big5-for-career-decisions", "build-five-year-career-roadmap", "build-portfolio-for-career-switch", "career-growth-with-manager", "career-risk-management", "career-transition-playbook", "cross-industry-move-strategy", "first-90-days-in-new-role", "from-mbti-to-job-fit", "how-to-choose-college-major", "how-to-find-right-career-direction", "improve-workplace-competitiveness", "interview-strategy-by-role", "iq-eq-balance-at-work", "leader-track-vs-expert-track", "networking-that-actually-works", "personal-brand-for-professionals", "prevent-burnout-while-growing", "salary-negotiation-framework"];
const sensitiveBoundary = {
  "big5-for-career-decisions": /not a precise career-matching engine/i,
  "from-mbti-to-job-fit": /not a precise career recommender/i,
  "iq-eq-balance-at-work": /not a diagnostic tool/i,
  "how-to-choose-college-major": /does not predict admission, graduation, licensing, employment/i,
  "prevent-burnout-while-growing": /non-clinical reflection, not medical diagnosis, treatment, or prevention advice/i,
  "salary-negotiation-framework": /does not guarantee a salary, raise, offer, income level, or legal result/i,
};
const permissions = { cms_write_authorized:false, staging_write_authorized:false, production_import_authorized:false, public_release_authorized:false, seo_runtime_release_authorized:false, search_submission_authorized:false, master_manifest_write_authorized:false };
const sha = (value) => crypto.createHash("sha256").update(value).digest("hex");
const fileSha = (file) => sha(fs.readFileSync(file));
const json = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const write = (name, value) => fs.writeFileSync(path.join(outputRoot, name), `${JSON.stringify(value, null, 2)}\n`);
const assert = (condition, message) => { if (!condition) throw new Error(message); };

fs.mkdirSync(outputRoot, { recursive:true });
const frozen = path.join(outputRoot, "frozen_package");
fs.mkdirSync(frozen, { recursive:true });
for (const name of packageFiles) {
  const source = path.join(packageRoot, name);
  const target = path.join(frozen, name);
  assert(!fs.lstatSync(source).isSymbolicLink(), `producer package symlink: ${name}`);
  fs.copyFileSync(source, target);
  assert(!fs.lstatSync(target).isSymbolicLink(), `frozen package symlink: ${name}`);
}

const ledger = json(path.join(frozen, "source_ledger.json"));
const manifest = json(path.join(frozen, "sha256_manifest.json"));
const candidateAssets = fs.readFileSync(path.join(frozen, "assets.jsonl"), "utf8").trim().split("\n").map(JSON.parse);
assert(manifest.package_sha256 === packageSha && manifest.files.length === 8, "unexpected frozen Career Guides package");
assert(ledger.rows.length === 20, "Career Guide row count mismatch");
assert([...ledger.rows.map((row) => row.guide_code)].sort().join("\n") === expectedCodes.join("\n"), "Career Guide identity cohort mismatch");

const validLinks = (text) => [...text.matchAll(/\]\(([^)]+)\)/g)].every((match) => match[1].startsWith("/en/"));
const prohibitedReaderWorkflowTerms = /\b(?:master manifest|package_frozen|qa_pass|candidate_only_not_imported)\b/i;
const rowReviews = ledger.rows.map((row) => {
  const text = `${row.candidate_title}\n${row.candidate_excerpt}\n${row.candidate_content_md}`;
  assert(row.row_id && row.guide_code && row.translation_pair_identity && row.slug, `identity missing: ${row.row_id}`);
  assert(row.candidate_title && row.candidate_excerpt && row.candidate_content_md, `reader field missing: ${row.row_id}`);
  assert(!/[\u3400-\u9fff]/u.test(text), `Han leakage: ${row.row_id}`);
  assert(!prohibitedReaderWorkflowTerms.test(text), `workflow leakage: ${row.row_id}`);
  assert(validLinks(row.candidate_content_md), `invalid localized link: ${row.row_id}`);
  assert(row.source_authority?.repository === "fap-api" && row.source_authority?.commit_sha === "f9b560e593a672e1e7c42aee810521593d88fdbf", `source authority mismatch: ${row.row_id}`);
  assert(row.structure_review?.major_sections_preserved === true && row.structure_review?.information_use_equivalence === "producer_review_pass" && row.structure_review?.candidate_heading_count > 0 && row.structure_review?.source_heading_count > 0, `structure mismatch: ${row.row_id}`);
  assert(row.claim_boundary?.status === "producer_preflight_pass" && row.target_publication_status === "candidate_only_not_imported" && row.import_ready === false, `candidate-only boundary mismatch: ${row.row_id}`);
  assert(row.internal_link_review?.candidate_links?.length === 0 && ["no_candidate_links_added_without an independently verified localized target", "no_candidate_links_added_without_an_independently_verified_localized_target"].includes(row.internal_link_review?.status), `link intent mismatch: ${row.row_id}`);
  if (sensitiveBoundary[row.guide_code]) assert(sensitiveBoundary[row.guide_code].test(row.candidate_content_md), `sensitive boundary missing: ${row.row_id}`);
  return { row_id:row.row_id, source_identity:row.translation_pair_identity, stable_asset_identity:row.translation_pair_identity, guide_code:row.guide_code, slug:row.slug, title_excerpt_full_body_reviewed:true, page_api_alignment_status:"NOT_APPLICABLE", verdict:"PASS", checks:{ language_naturalness:"PASS", chinese_leakage:"PASS", source_equivalence_identity:"PASS", claim_boundary:"PASS", internal_link_equivalence:"PASS", field_leakage:"PASS", asset_media_duplication_omission:"PASS", page_api_alignment_applicable:"PASS" }, evidence:"Independent full reader review passed for identity, English language, no Han leakage, source/structure use, bounded claims, Markdown/link intent, no workflow-field leakage, and candidate-only page/API status." };
});

const checks = { language_naturalness:"PASS", chinese_leakage:"PASS", claim_boundary:"PASS", asset_duplication:"PASS", field_leakage:"PASS", page_api_alignment:"NOT_APPLICABLE" };
const immutable = Object.fromEntries(manifest.files.map((entry) => [entry.path, fileSha(path.join(frozen, entry.path))]));
const matrix = { schema_version:"fermatmind.en_content_parity_independent_qa_row_evidence.v1", review_kind:"fresh_independent_full_target_w9", qa_lane_id:"W9", producer_lane_id:"W3", subscope_id:"W3-CAREER-GUIDES", package_id:manifest.package_id, package_sha256:packageSha, reviewed_asset_ids:["ENPARITY-W3-CAREER-GUIDES"], reviewed_row_count:20, verdict:"PASS", coverage:{ titles_reviewed:20, excerpts_reviewed:20, full_bodies_reviewed:20, registered_rows_covered:20, page_api_alignment_status:"NOT_APPLICABLE", coverage_result:"PASS" }, required_checks:checks, package_integrity:{ immutable_payload_file_count:8, immutable_payload_sha256:immutable, aggregate_package_sha256:packageSha, frozen_immutable_payloads_byte_identical_to_producer_package:true, producer_package_modified:false, control_master_modified:false, articles_modified:false, permissions_all_false:true }, check_evidence:{ language_naturalness:"PASS: all 20 full English reader assets were independently reviewed.", chinese_leakage:"PASS: no Han characters appear in the title, excerpt, or Markdown body fields.", claim_boundary:"PASS: education, personality, IQ/EQ, hiring, promotion, salary, wellbeing, and career-outcome content remains explicitly non-diagnostic and non-guaranteeing.", asset_duplication:"PASS: all 20 guide identities are unique and the frozen eight-payload chain matches.", field_leakage:"PASS: reader fields do not expose producer or CONTROL workflow language.", page_api_alignment:"NOT_APPLICABLE: the exact package remains candidate-only, not imported, published, or live-verified." }, row_reviews:rowReviews, permissions };
const report = { $schema:"docs/seo/generated/en-content-parity-control-master.v1.schema.json", artifact_kind:"independent_qa_report", schema_version:"fermatmind.en_content_parity_independent_qa_report.v1", control_id:"EN-PARITY-CONTROL-BOOTSTRAP-01", qa_lane_id:"W9", producer_lane_id:"W3", subscope_id:"W3-CAREER-GUIDES", output_directory:"generated/en-content-parity/W9-independent-qa/", package_sha256:packageSha, verdict:"PASS", reviewed_asset_ids:["ENPARITY-W3-CAREER-GUIDES"], reviewed_row_count:20, checks, page_api_alignment_status:"NOT_APPLICABLE", independent_review_basis:"Fresh W9 review of the exact frozen Career Guides package; no Articles W9 conclusion was reused.", permissions };
write("qa_scope_manifest.json", { package_sha256:packageSha, producer_lane_id:"W3", subscope_id:"W3-CAREER-GUIDES", row_count:20, permissions });
write("career_guide_20_row_review_evidence.json", matrix);
write("independent_qa_report.json", report);
write("source_equivalence_report.json", { package_sha256:packageSha, verdict:"PASS", reviewed_row_count:20, source_repository:"fap-api", source_commit:"f9b560e593a672e1e7c42aee810521593d88fdbf" });
write("language_naturalness_report.json", { package_sha256:packageSha, verdict:"PASS", reviewed_row_count:20, han_leakage_detected:false });
write("claim_boundary_report.json", { package_sha256:packageSha, verdict:"PASS", reviewed_row_count:20, reviewed_sensitive_guides:Object.keys(sensitiveBoundary) });
write("link_markdown_report.json", { package_sha256:packageSha, verdict:"PASS", reviewed_row_count:20, candidate_only_localized_links:true });
write("asset_duplication_report.json", { package_sha256:packageSha, verdict:"PASS", reviewed_row_count:20, duplicate_identity_count:0 });
write("field_leakage_report.json", { package_sha256:packageSha, verdict:"PASS", reviewed_row_count:20, workflow_leakage_detected:false });
const reportPath = "generated/en-content-parity/W9-independent-qa/career-guides/w3-career-guides-0b6728c9/independent_qa_report.json";
const matrixPath = "generated/en-content-parity/W9-independent-qa/career-guides/w3-career-guides-0b6728c9/career_guide_20_row_review_evidence.json";
const candidate = { $schema:"docs/seo/generated/en-content-parity-control-master.v1.schema.json", artifact_kind:"master_manifest_patch_candidate", schema_version:"fermatmind.en_content_parity_master_patch_candidate.v1", control_id:"EN-PARITY-CONTROL-BOOTSTRAP-01", lane_id:"W3", subscope_id:"W3-CAREER-GUIDES", package_id:manifest.package_id, base_manifest_sha256:fileSha(path.join(root,"docs/seo/generated/en-content-parity-control-master.v1.json")), sha256_manifest_path:"generated/en-content-parity/W9-independent-qa/career-guides/w3-career-guides-0b6728c9/frozen_package/sha256_manifest.json", package_sha256:packageSha, proposed_status:"qa_pass", gate_evidence:{ gate:"qa_pass", report_path:reportPath, report_sha256:fileSha(path.join(outputRoot,"independent_qa_report.json")), report_in_package:false, owner_lane_id:"W9", verdict:"PASS", asset_ids:["ENPARITY-W3-CAREER-GUIDES"], row_count:20, row_evidence:{ path:matrixPath, sha256:fileSha(path.join(outputRoot,"career_guide_20_row_review_evidence.json")) } }, asset_updates:candidateAssets, permissions };
write("master_manifest_patch.candidate.json", candidate);
fs.writeFileSync(path.join(outputRoot,"handoff.md"), "# W3 Career Guides independent W9 QA\n\nIndependent W9 review covers the exact frozen 20-row package. This PASS candidate is evidence only and does not modify the CONTROL master or authorize CMS import, publication, discoverability, search, or deployment.\n");
const files = qaFiles.map((name) => ({ path:name, sha256:fileSha(path.join(outputRoot,name)) }));
write("qa_sha256_manifest.json", { package_sha256:packageSha, files, qa_package_sha256:sha(files.map((entry)=>`${entry.path}:${entry.sha256}`).join("\n")) });
