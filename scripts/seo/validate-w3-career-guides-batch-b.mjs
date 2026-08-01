#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const packageDir = path.join(root, "generated/en-content-parity/W3-editorial-cms/career-guides/batches/batch-b-12");
const expectedCodes = ["annual-career-review-system", "build-five-year-career-roadmap", "career-risk-management", "career-transition-playbook", "cross-industry-move-strategy", "how-to-choose-college-major", "how-to-find-right-career-direction", "improve-workplace-competitiveness", "interview-strategy-by-role", "leader-track-vs-expert-track", "prevent-burnout-while-growing", "salary-negotiation-framework"];
const immutableFiles = ["scope_manifest.json", "assets.jsonl", "translation_map.json", "source_ledger.json", "claim_boundary_report.json", "editorial_review.json", "dry_run_readiness.json", "handoff.md"];
const artifactFiles = [...immutableFiles.slice(0, 7), "sha256_manifest.json", "master_manifest_patch.candidate.json", "handoff.md"];
const sha = (value) => crypto.createHash("sha256").update(value).digest("hex");
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(packageDir, name), "utf8"));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);

try {
  assert(fs.realpathSync(packageDir) === packageDir, "Batch B package directory must not be a symlink");
  artifactFiles.forEach((name) => assert(fs.statSync(path.join(packageDir, name)).isFile(), `Missing artifact ${name}`));
  const scope = readJson("scope_manifest.json");
  const candidate = readJson("master_manifest_patch.candidate.json");
  const ledger = readJson("source_ledger.json");
  const translation = readJson("translation_map.json");
  const review = readJson("editorial_review.json");
  const boundary = readJson("claim_boundary_report.json");
  const manifest = readJson("sha256_manifest.json");
  const partial = { batch_id: "batch-b-12", guide_codes: expectedCodes, registered_row_count: 20, batch_row_count: 12, aggregate_ready: false, master_transition_allowed: false };
  [scope.partial_batch, candidate.partial_batch, manifest.partial_batch].forEach((value) => assert(same(value, partial), "Partial batch metadata must be exact"));
  assert(candidate.proposed_status === "package_in_progress" && !("qa_report_ref" in candidate) && !("gate_lineage" in candidate), "Partial candidate may not transition or add QA/lineage");
  assert(candidate.package_sha256 === manifest.package_sha256, "Candidate must bind the Batch B package SHA");
  assert(JSON.stringify(scope.permissions).includes("true") === false && JSON.stringify(candidate.permissions).includes("true") === false, "Package permissions must all be false");
  assert(ledger.source_snapshot.commit_sha === "f9b560e593a672e1e7c42aee810521593d88fdbf" && ledger.source_snapshot.en_sha256 === "474b3ca869e3f32033089f48967458f977f7bf3cffd4d42c29eae689362bb416" && ledger.source_snapshot.zh_sha256 === "3664183d9685dc67fd2b44d231837e5638ad64410f9e7b6b70110d9fd93d5b31", "Source snapshot must match frozen baselines");
  assert(ledger.claim_boundary_reference.package_sha256 === "1b092960030804e1846c93083977f36ce507c4de1ddc2386a5d46e3c5b21325a" && boundary.claim_boundary_reference.package_sha256 === ledger.claim_boundary_reference.package_sha256, "Claim boundary package must be exact");
  assert(ledger.rows.length === 12 && translation.rows.length === 12 && review.reviewed_row_count === 12 && boundary.reviewed_row_count === 12, "Every Batch B report must cover twelve rows");
  assert(same(ledger.rows.map((row) => row.guide_code), expectedCodes) && same(translation.rows.map((row) => row.guide_code), expectedCodes), "Batch B guide codes must be exact and ordered");
  ledger.rows.forEach((row) => {
    assert(row.asset_id === "ENPARITY-W3-CAREER-GUIDES" && row.source_authority.commit_sha === ledger.source_snapshot.commit_sha, `Source identity mismatch for ${row.guide_code}`);
    assert(row.candidate_content_md.length > 900 && /^## /m.test(row.candidate_content_md) && /^## Frequently asked questions/m.test(row.candidate_content_md), `Incomplete reader content for ${row.guide_code}`);
    assert(!/[\u3400-\u9fff]/.test(`${row.candidate_title} ${row.candidate_excerpt} ${row.candidate_content_md}`), `Han leakage in ${row.guide_code}`);
    assert(!/https?:\/\//i.test(row.candidate_content_md), `Unreviewed external link in ${row.guide_code}`);
    assert(row.claim_boundary.status === "producer_preflight_pass" && row.language_review.chinese_han_leakage_detected === false && row.import_ready === false, `Boundary, language, or import drift for ${row.guide_code}`);
  });
  const files = immutableFiles.map((file) => ({ path: file, sha256: sha(fs.readFileSync(path.join(packageDir, file))) }));
  assert(same(files, manifest.files), "Immutable payload hashes do not match manifest");
  assert(manifest.package_sha256 === sha(files.map((entry) => `${entry.path}:${entry.sha256}`).join("\n")), "Package SHA does not match payload manifest");
  const master = JSON.parse(fs.readFileSync(path.join(root, "docs/seo/generated/en-content-parity-control-master.v1.json"), "utf8"));
  const w3 = master.lanes.find((lane) => lane.lane_id === "W3");
  const guides = w3?.subscopes.find((scopeEntry) => scopeEntry.id === "W3-CAREER-GUIDES");
  const articles = w3?.subscopes.find((scopeEntry) => scopeEntry.id === "W3-ARTICLES");
  const preAcceptance = guides?.status === "package_in_progress" && guides.package_sha256 === null && guides.qa_report_ref === null && guides.gate_lineage.length === 0;
  const acceptedFreeze = guides?.status === "package_frozen" && guides.package_sha256 === "0b6728c9a07e9404d0de57698f0f8b59616358ba91e456d1be848a1fe167ca7c" && guides.qa_report_ref === null && guides.gate_lineage.length === 1 && guides.gate_lineage[0].status === "package_frozen" && guides.gate_lineage[0].evidence_owner_lane_id === "W3" && guides.gate_lineage[0].report_ref === "generated/en-content-parity/W3-editorial-cms/career-guides/editorial_review.json" && guides.gate_lineage[0].report_sha256 === "137c719a434aa795c41332d89bdd4c10b5e6f2879b4ed5f98a5d0ebcb69fe402" && guides.gate_lineage[0].package_sha256 === "0b6728c9a07e9404d0de57698f0f8b59616358ba91e456d1be848a1fe167ca7c";
  const acceptedQaPass = guides?.status === "qa_pass" && guides.package_sha256 === "0b6728c9a07e9404d0de57698f0f8b59616358ba91e456d1be848a1fe167ca7c" && guides.qa_report_ref === "generated/en-content-parity/W9-independent-qa/career-guides/w3-career-guides-0b6728c9/independent_qa_report.json" && guides.gate_lineage.length === 2 && guides.gate_lineage[0].status === "package_frozen" && guides.gate_lineage[0].evidence_owner_lane_id === "W3" && guides.gate_lineage[0].report_ref === "generated/en-content-parity/W3-editorial-cms/career-guides/editorial_review.json" && guides.gate_lineage[0].report_sha256 === "137c719a434aa795c41332d89bdd4c10b5e6f2879b4ed5f98a5d0ebcb69fe402" && guides.gate_lineage[0].package_sha256 === guides.package_sha256 && guides.gate_lineage[1].status === "qa_pass" && guides.gate_lineage[1].evidence_owner_lane_id === "W9" && guides.gate_lineage[1].report_ref === guides.qa_report_ref && guides.gate_lineage[1].report_sha256 === "1846b40cc42ebfb202f8e0cd013dfdee1519fdd850d59cb5a56a3069ac1d0815" && guides.gate_lineage[1].package_sha256 === guides.package_sha256;
  assert(preAcceptance || acceptedFreeze || acceptedQaPass, "Career Guides master state must retain the pre-acceptance, exact frozen, or exact independent W9 qa_pass state");
  const articlesFrozen = articles?.status === "package_frozen" && articles.package_sha256 === "d70e468bb1a07d74e786e5a93b5279feff5347be49a0264916408a6b2ccbdc9a" && articles.qa_report_ref === null && articles.gate_lineage.length === 1 && articles.gate_lineage[0].status === "package_frozen";
  const articlesQaPass = articles?.status === "qa_pass" && articles.package_sha256 === "d70e468bb1a07d74e786e5a93b5279feff5347be49a0264916408a6b2ccbdc9a" && articles.qa_report_ref === "generated/en-content-parity/W9-independent-qa/articles/w3-articles-d70e468b/independent_qa_report.json" && articles.gate_lineage.length === 2 && articles.gate_lineage[0].status === "package_frozen" && articles.gate_lineage[1].status === "qa_pass" && articles.gate_lineage[1].evidence_owner_lane_id === "W9" && articles.gate_lineage[1].report_ref === articles.qa_report_ref && articles.gate_lineage[1].report_sha256 === "a286486e040b410a28224732e6a4cf61d42255db43e92bba3905bdf0af52caf4" && articles.gate_lineage[1].package_sha256 === articles.package_sha256;
  assert(articlesFrozen || articlesQaPass, "Articles frozen package or exact independent W9 qa_pass state must remain unchanged");
  assert(JSON.stringify(master.permissions).includes("true") === false && JSON.stringify(w3.permissions).includes("true") === false, "Master permissions must all be false");
  console.log(JSON.stringify({ ok: true, rows: ledger.rows.length, package_sha256: manifest.package_sha256 }));
} catch (error) {
  console.error(JSON.stringify({ ok: false, error: error.message }));
  process.exitCode = 1;
}
