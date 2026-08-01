#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const packageDir = path.join(root, "generated/en-content-parity/W3-editorial-cms/career-guides/batches/batch-a-8");
const expectedCodes = [
  "big5-for-career-decisions",
  "build-portfolio-for-career-switch",
  "career-growth-with-manager",
  "first-90-days-in-new-role",
  "from-mbti-to-job-fit",
  "iq-eq-balance-at-work",
  "networking-that-actually-works",
  "personal-brand-for-professionals",
];
const immutableFiles = [
  "scope_manifest.json",
  "assets.jsonl",
  "translation_map.json",
  "source_ledger.json",
  "claim_boundary_report.json",
  "editorial_review.json",
  "dry_run_readiness.json",
  "handoff.md",
];
const artifactFiles = [...immutableFiles.slice(0, 7), "sha256_manifest.json", "master_manifest_patch.candidate.json", "handoff.md"];
const sha = (value) => crypto.createHash("sha256").update(value).digest("hex");
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(packageDir, name), "utf8"));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const equalJson = (left, right) => JSON.stringify(left) === JSON.stringify(right);

try {
  assert(fs.realpathSync(packageDir) === packageDir, "Batch A package directory must not be a symlink");
  artifactFiles.forEach((name) => assert(fs.statSync(path.join(packageDir, name)).isFile(), `Missing artifact ${name}`));
  const scope = readJson("scope_manifest.json");
  const candidate = readJson("master_manifest_patch.candidate.json");
  const ledger = readJson("source_ledger.json");
  const translation = readJson("translation_map.json");
  const review = readJson("editorial_review.json");
  const boundary = readJson("claim_boundary_report.json");
  const packageManifest = readJson("sha256_manifest.json");
  const partial = {
    batch_id: "batch-a-8",
    guide_codes: expectedCodes,
    registered_row_count: 20,
    batch_row_count: 8,
    aggregate_ready: false,
    master_transition_allowed: false,
  };
  const boundaryReference = {
    path: "generated/en-content-parity/W3-editorial-cms/career-guides/boundary/sha256_manifest.json",
    package_sha256: "1b092960030804e1846c93083977f36ce507c4de1ddc2386a5d46e3c5b21325a",
  };
  [scope.partial_batch, candidate.partial_batch, packageManifest.partial_batch].forEach((value) => assert(equalJson(value, partial), "Partial batch metadata must be exact"));
  assert(candidate.proposed_status === "package_in_progress", "Partial candidate must preserve package_in_progress");
  assert(candidate.package_sha256 === packageManifest.package_sha256, "Candidate must bind the batch package SHA");
  assert(!("qa_report_ref" in candidate) && !("gate_lineage" in candidate), "Partial candidate cannot add QA or lineage");
  const master = JSON.parse(fs.readFileSync(path.join(root, "docs/seo/generated/en-content-parity-control-master.v1.json"), "utf8"));
  const w3 = master.lanes.find((entry) => entry.lane_id === "W3");
  const careerGuides = w3?.subscopes.find((entry) => entry.id === "W3-CAREER-GUIDES");
  const articles = w3?.subscopes.find((entry) => entry.id === "W3-ARTICLES");
  const preAcceptance = careerGuides.status === "package_in_progress" && careerGuides.package_sha256 === null && careerGuides.qa_report_ref === null && careerGuides.gate_lineage.length === 0;
  const acceptedFreeze = careerGuides.status === "package_frozen" && careerGuides.package_sha256 === "0b6728c9a07e9404d0de57698f0f8b59616358ba91e456d1be848a1fe167ca7c" && careerGuides.qa_report_ref === null && careerGuides.gate_lineage.length === 1 && careerGuides.gate_lineage[0].status === "package_frozen" && careerGuides.gate_lineage[0].evidence_owner_lane_id === "W3" && careerGuides.gate_lineage[0].report_ref === "generated/en-content-parity/W3-editorial-cms/career-guides/editorial_review.json" && careerGuides.gate_lineage[0].report_sha256 === "137c719a434aa795c41332d89bdd4c10b5e6f2879b4ed5f98a5d0ebcb69fe402" && careerGuides.gate_lineage[0].package_sha256 === "0b6728c9a07e9404d0de57698f0f8b59616358ba91e456d1be848a1fe167ca7c";
  assert(preAcceptance || acceptedFreeze, "Master Career Guides must retain the pre-acceptance state or the exact separate CONTROL acceptance");
  assert(articles.status === "package_frozen" && articles.package_sha256 === "d70e468bb1a07d74e786e5a93b5279feff5347be49a0264916408a6b2ccbdc9a", "Articles frozen package must remain unchanged");
  assert(JSON.stringify(master.permissions).includes("true") === false, "Master permissions must all be false");
  assert(JSON.stringify(candidate.permissions).includes("true") === false && JSON.stringify(scope.permissions).includes("true") === false, "Package permissions must all be false");
  assert(ledger.source_snapshot.commit_sha === "f9b560e593a672e1e7c42aee810521593d88fdbf" && ledger.source_snapshot.en_sha256 === "474b3ca869e3f32033089f48967458f977f7bf3cffd4d42c29eae689362bb416" && ledger.source_snapshot.zh_sha256 === "3664183d9685dc67fd2b44d231837e5638ad64410f9e7b6b70110d9fd93d5b31", "Source snapshot must bind the exact frozen fap-api baselines");
  assert(ledger.claim_boundary_reference.path === boundaryReference.path && ledger.claim_boundary_reference.package_sha256 === boundaryReference.package_sha256 && boundary.claim_boundary_reference.package_sha256 === boundaryReference.package_sha256, "Claim boundary must bind the frozen boundary package");
  assert(ledger.rows.length === 8 && translation.rows.length === 8 && review.reviewed_row_count === 8 && boundary.reviewed_row_count === 8, "All row artifacts must contain exactly eight rows");
  const rows = ledger.rows;
  assert(equalJson(rows.map((row) => row.guide_code), expectedCodes), "Source ledger guide codes must be exact and ordered");
  assert(equalJson(translation.rows.map((row) => row.guide_code), expectedCodes), "Translation map guide codes must be exact and ordered");
  rows.forEach((row) => {
    assert(row.asset_id === "ENPARITY-W3-CAREER-GUIDES", `Unexpected asset id for ${row.guide_code}`);
    assert(row.source_authority.commit_sha === "f9b560e593a672e1e7c42aee810521593d88fdbf", `Unexpected source commit for ${row.guide_code}`);
    assert(row.candidate_content_md.length > 800 && /^## /m.test(row.candidate_content_md) && /^## Frequently asked questions/m.test(row.candidate_content_md), `Incomplete reader content for ${row.guide_code}`);
    assert(!/[\u3400-\u9fff]/.test(`${row.candidate_title} ${row.candidate_excerpt} ${row.candidate_content_md}`), `Han leakage in ${row.guide_code}`);
    assert(!/https?:\/\//i.test(row.candidate_content_md), `Unreviewed external link in ${row.guide_code}`);
    assert(row.claim_boundary.status === "producer_preflight_pass" && row.language_review.chinese_han_leakage_detected === false, `Boundary or language review failed for ${row.guide_code}`);
  });
  const actualHashes = immutableFiles.map((file) => ({ path: file, sha256: sha(fs.readFileSync(path.join(packageDir, file))) }));
  assert(equalJson(actualHashes, packageManifest.files), "Immutable payload SHA manifest does not match files");
  assert(packageManifest.package_sha256 === sha(actualHashes.map((entry) => `${entry.path}:${entry.sha256}`).join("\n")), "Package SHA does not match manifest");
  console.log(JSON.stringify({ ok: true, rows: rows.length, package_sha256: packageManifest.package_sha256 }));
} catch (error) {
  console.error(JSON.stringify({ ok: false, error: error.message }));
  process.exitCode = 1;
}
