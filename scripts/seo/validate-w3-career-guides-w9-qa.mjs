#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const out = path.join(root, "generated/en-content-parity/W9-independent-qa/career-guides/w3-career-guides-0b6728c9");
const frozen = path.join(out, "frozen_package");
const sha = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const json = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const fail = (message) => { throw new Error(message); };

try {
  const manifest = json(path.join(frozen, "sha256_manifest.json"));
  const report = json(path.join(out, "independent_qa_report.json"));
  const matrix = json(path.join(out, "career_guide_20_row_review_evidence.json"));
  const candidate = json(path.join(out, "master_manifest_patch.candidate.json"));
  const qa = json(path.join(out, "qa_sha256_manifest.json"));
  if (fs.lstatSync(frozen).isSymbolicLink() || manifest.package_sha256 !== "0b6728c9a07e9404d0de57698f0f8b59616358ba91e456d1be848a1fe167ca7c" || manifest.files.length !== 8) fail("frozen package mismatch");
  if (matrix.row_reviews.length !== 20 || new Set(matrix.row_reviews.map((row) => row.row_id)).size !== 20 || matrix.row_reviews.some((row) => row.verdict !== "PASS" || row.page_api_alignment_status !== "NOT_APPLICABLE")) fail("row review coverage mismatch");
  if (report.verdict !== "PASS" || report.checks.page_api_alignment !== "NOT_APPLICABLE" || candidate.proposed_status !== "qa_pass" || candidate.package_sha256 !== manifest.package_sha256) fail("W9 verdict mismatch");
  if (candidate.gate_evidence.report_sha256 !== sha(path.join(out, "independent_qa_report.json")) || candidate.gate_evidence.row_evidence.sha256 !== sha(path.join(out, "career_guide_20_row_review_evidence.json"))) fail("candidate evidence SHA mismatch");
  if (qa.files.some((entry) => sha(path.join(out, entry.path)) !== entry.sha256) || Object.values(report.permissions).some((value) => value !== false)) fail("QA manifest or permissions mismatch");
  console.log(JSON.stringify({ ok:true, rows:20, package_sha256:manifest.package_sha256, verdict:report.verdict }));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
