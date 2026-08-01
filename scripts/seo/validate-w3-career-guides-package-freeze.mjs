#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const packageDir = path.join(root, "generated/en-content-parity/W3-editorial-cms/career-guides");
const expectedCodes = ["big5-for-career-decisions", "build-portfolio-for-career-switch", "career-growth-with-manager", "first-90-days-in-new-role", "from-mbti-to-job-fit", "iq-eq-balance-at-work", "networking-that-actually-works", "personal-brand-for-professionals", "annual-career-review-system", "build-five-year-career-roadmap", "career-risk-management", "career-transition-playbook", "cross-industry-move-strategy", "how-to-choose-college-major", "how-to-find-right-career-direction", "improve-workplace-competitiveness", "interview-strategy-by-role", "leader-track-vs-expert-track", "prevent-burnout-while-growing", "salary-negotiation-framework"];
const immutableFiles = ["scope_manifest.json", "assets.jsonl", "translation_map.json", "source_ledger.json", "claim_boundary_report.json", "editorial_review.json", "dry_run_readiness.json", "handoff.md"];
const sha = (value) => crypto.createHash("sha256").update(value).digest("hex");
const read = (file) => JSON.parse(fs.readFileSync(path.join(packageDir, file), "utf8"));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);

try {
  const scope = read("scope_manifest.json"); const candidate = read("master_manifest_patch.candidate.json"); const ledger = read("source_ledger.json"); const manifest = read("sha256_manifest.json"); const review = read("editorial_review.json"); const boundary = read("claim_boundary_report.json");
  assert(fs.realpathSync(packageDir) === packageDir, "Root package directory must not be a symlink");
  assert(scope.status === "package_frozen" && candidate.proposed_status === "package_frozen", "Package must be a package_frozen candidate");
  assert(!("partial_batch" in scope) && !("partial_batch" in candidate), "Complete package cannot retain partial batch metadata");
  assert(ledger.rows.length === 20 && same(ledger.rows.map((row) => row.guide_code), expectedCodes) && new Set(expectedCodes).size === 20, "Full package must contain the exact ordered 20-row cohort");
  assert(ledger.source_batches.length === 2 && ledger.source_batches[0].package_sha256 === "5b423b9eef7877d0ee6c5c5fb74a89d236958fd4a3d5ccc1ad5d90782f1a15cd" && ledger.source_batches[1].package_sha256 === "53458328d70d3035c7f29deb1038ba3edf96295db72cae4ca0ce61aace33b9d9", "Both immutable batch witnesses must be bound");
  assert(review.reviewed_row_count === 20 && boundary.reviewed_row_count === 20 && candidate.gate_evidence.row_count === 20, "All freeze evidence must cover 20 rows");
  assert(JSON.stringify(scope.permissions).includes("true") === false && JSON.stringify(candidate.permissions).includes("true") === false, "Package permissions must all be false");
  ledger.rows.forEach((row) => { assert(!/[\u3400-\u9fff]/.test(`${row.candidate_title} ${row.candidate_excerpt} ${row.candidate_content_md}`), `Han leakage in ${row.guide_code}`); assert(row.import_ready === false, `Import readiness drift in ${row.guide_code}`); });
  const files = immutableFiles.map((file) => ({ path: file, sha256: sha(fs.readFileSync(path.join(packageDir, file))) }));
  assert(same(files, manifest.files) && manifest.package_sha256 === sha(files.map((entry) => `${entry.path}:${entry.sha256}`).join("\n")), "Full package SHA mismatch");
  const master = JSON.parse(fs.readFileSync(path.join(root, "docs/seo/generated/en-content-parity-control-master.v1.json"), "utf8")); const w3 = master.lanes.find((lane) => lane.lane_id === "W3"); const guides = w3.subscopes.find((entry) => entry.id === "W3-CAREER-GUIDES");
  assert(guides.status === "package_in_progress" && guides.package_sha256 === null && guides.qa_report_ref === null && guides.gate_lineage.length === 0, "Master must remain unchanged until separate CONTROL acceptance");
  console.log(JSON.stringify({ ok: true, rows: ledger.rows.length, package_sha256: manifest.package_sha256 }));
} catch (error) { console.error(JSON.stringify({ ok: false, error: error.message })); process.exitCode = 1; }
