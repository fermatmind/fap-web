import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const packageRoot = join(root, "generated/en-content-parity/W3-editorial-cms/articles");
const evidenceRoot = join(root, "generated/en-content-parity/W9-independent-qa/articles/w3-articles-2c228eae");
const packageSha = "2c228eae88ce6fc3edb32c1dda9aabf1e2d51d6a885ef7b90d4a7c1864c0e33e";
const files = ["qa_scope_manifest.json", "qa_row_matrix.json", "qa_report.json", "source_equivalence_report.json", "language_naturalness_report.json", "claim_boundary_report.json", "chinese_leakage_report.json", "markdown_integrity_report.json", "asset_integrity_report.json", "repair_batch_plan.json", "master_manifest_patch.candidate.json", "handoff.md"];
const sha = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");
const json = (name) => JSON.parse(readFileSync(join(evidenceRoot, name), "utf8"));
const fail = (message) => { throw new Error(message); };
const assert = (condition, message) => { if (!condition) fail(message); };

export function validateW3ArticlesW9Qa() {
  const ledger = JSON.parse(readFileSync(join(packageRoot, "source_ledger.json"), "utf8"));
  const packageManifest = JSON.parse(readFileSync(join(packageRoot, "sha256_manifest.json"), "utf8"));
  const report = json("qa_report.json");
  const matrix = json("qa_row_matrix.json");
  const repair = json("repair_batch_plan.json");
  const candidate = json("master_manifest_patch.candidate.json");
  const qaManifest = json("qa_sha256_manifest.json");
  assert(packageManifest.package_sha256 === packageSha, "frozen package SHA drifted");
  assert(packageManifest.files.length === 8 && packageManifest.files.every((file) => sha(join(packageRoot, file.path)) === file.sha256), "immutable payload SHA mismatch");
  assert(matrix.row_reviews.length === 17 && matrix.reviewed_row_count === 17, "QA matrix must cover exactly 17 rows");
  const blocked = matrix.row_reviews.filter((row) => row.verdict === "BLOCKED");
  assert(blocked.length === 1 && blocked[0].stable_asset_identity === "Article:53", "Article:53 must be the sole BLOCKED row");
  assert(matrix.row_reviews.filter((row) => row.verdict === "PASS").length === 16, "exactly 16 rows must PASS");
  assert(blocked[0].checks.claim_boundary === "BLOCKED", "Article:53 blocker must be claim-boundary evidence");
  assert(matrix.row_reviews.every((row) => row.page_api_alignment_status === "NOT_APPLICABLE"), "page/API must be NOT_APPLICABLE");
  assert(report.verdict === "BLOCKED" && report.checks.page_api_alignment === "NOT_APPLICABLE", "report verdict/page API status drifted");
  assert(repair.repairs.length === 1 && repair.repairs[0].stable_asset_identity === "Article:53", "repair batch must contain only Article:53");
  assert(candidate.package_sha256 === packageSha && candidate.proposed_status === "blocked", "candidate package/verdict drifted");
  assert(candidate.gate_evidence.report_sha256 === sha(join(evidenceRoot, "qa_report.json")), "candidate QA report SHA mismatch");
  assert(candidate.gate_evidence.row_evidence.sha256 === sha(join(evidenceRoot, "qa_row_matrix.json")), "candidate matrix SHA mismatch");
  assert(!candidate.permissions.master_manifest_write_authorized, "candidate must not authorize master writes");
  assert(JSON.stringify(ledger.rows.map((row) => row.row_id)) === JSON.stringify(matrix.row_reviews.map((row) => row.row_id)), "QA rows must preserve frozen ledger order");
  assert(files.length === 12 && qaManifest.files.length === 12, "QA SHA manifest file coverage drifted");
  assert(qaManifest.files.every((file) => sha(join(evidenceRoot, file.path)) === file.sha256), "QA evidence file SHA mismatch");
  const aggregate = createHash("sha256").update(qaManifest.files.map((file) => `${file.path}:${file.sha256}`).join("\n")).digest("hex");
  assert(qaManifest.qa_package_sha256 === aggregate, "QA package SHA mismatch");
  assert(matrix.package_integrity.producer_package_modified === false && matrix.package_integrity.control_master_modified === false && matrix.package_integrity.career_guides_modified === false, "scope boundary drifted");
  assert(Object.values(report.permissions).every((value) => value === false) && Object.values(candidate.permissions).every((value) => value === false), "permissions must remain false");
  return { ok: true, package_sha256: packageSha, qa_package_sha256: aggregate, rows: 17, pass_rows: 16, blocked_asset: "Article:53" };
}

try {
  process.stdout.write(`${JSON.stringify(validateW3ArticlesW9Qa(), null, 2)}\n`);
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
