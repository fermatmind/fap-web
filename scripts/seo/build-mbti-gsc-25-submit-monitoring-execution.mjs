#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { csvEscape } from "./artifactSafety.mjs";

const ROOT = process.cwd();
const INDEX24R_PATH = "docs/seo/personality/mbti-index-24r-release-gate-revalidation-2026-07-12.json";
const EVIDENCE_PATH = "docs/seo/personality/mbti-gsc-25-live-evidence-2026-07-12.json";
const OUTPUT_BASE = "docs/seo/personality/mbti-gsc-25-submission-monitoring-execution-2026-07-12";
const MONITORING_WINDOWS = [
  { label: "7d", date: "2026-07-19" },
  { label: "14d", date: "2026-07-26" },
  { label: "28d", date: "2026-08-09" },
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function write(relativePath, value) {
  fs.writeFileSync(path.join(ROOT, relativePath), value);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function buildReport() {
  const gate = readJson(INDEX24R_PATH);
  const evidence = readJson(EVIDENCE_PATH);
  const gateUrls = gate.records.map((record) => record.canonical).sort();
  const evidenceUrls = evidence.records.map((record) => record.url).sort();

  assert(gate.decision === "ALLOW_URL_EXPANSION", "INDEX-24R must allow URL expansion");
  assert(Object.values(gate.metrics).every((value) => value === 9), "INDEX-24R metrics must remain 9/9");
  assert(gate.private_url_leak_count === 0, "INDEX-24R must report zero private URL leaks");
  assert(evidence.property === "sc-domain:fermatmind.com", "Unexpected GSC property");
  assert(evidence.sitemap.url === "https://fermatmind.com/sitemap.xml", "Unexpected sitemap URL");
  assert(evidence.sitemap.status === "success", "Sitemap must be successful");
  assert(evidence.sitemap.resubmitted === false, "Successful sitemap must not be resubmitted");
  assert(JSON.stringify(gateUrls) === JSON.stringify(evidenceUrls), "GSC cohort must equal INDEX-24R cohort");
  assert(evidence.records.length === 9, "Expected exactly nine GSC records");
  assert(evidence.records.every((record) => record.request_indexing_status === "submitted"), "All indexing requests must be submitted");
  assert(evidence.quota_or_permission_blocker === null, "GSC quota or permission blocker present");
  assert(Object.values(evidence.privacy_boundary).every((value) => value === false), "Private authentication data must not be recorded");

  const repeatabilityRuns = evidence.post_submission_index24r_recheck?.repeatability_runs;
  assert(Array.isArray(repeatabilityRuns) && repeatabilityRuns.length === 2, "Expected exactly two INDEX-24R repeatability runs");
  assert(repeatabilityRuns.every((run) => (
    run.decision === "ALLOW_URL_EXPANSION"
    && run.cms_api === "9/9"
    && run.canonical === "9/9"
    && run.robots === "9/9"
    && run.jsonld === "9/9"
    && run.faq_parity === "9/9"
    && run.sitemap === "9/9"
    && run.llms === "9/9"
    && run.llms_full === "9/9"
    && run.private_url_leaks === 0
  )), "Both INDEX-24R repeatability runs must pass every release gate");

  const indexedCount = evidence.records.filter((record) => record.inspection_status === "indexed").length;
  const postSubmissionGatePassed = evidence.post_submission_index24r_recheck.decision === "ALLOW_URL_EXPANSION"
    && evidence.post_submission_index24r_recheck.llms === "9/9";
  const report = {
    id: "MBTI-GSC-25",
    artifact: "MBTI-GSC-25-SUBMISSION-MONITORING-EXECUTION",
    generated_at: evidence.captured_at,
    final_decision: postSubmissionGatePassed
      ? "PASS_MBTI_GSC_25_SUBMITTED_MONITORING_READY"
      : "HOLD_MBTI_GSC_25_POST_SUBMISSION_DISCOVERABILITY_REGRESSION",
    property: evidence.property,
    source_artifacts: [INDEX24R_PATH, EVIDENCE_PATH],
    summary: {
      cohort_url_count: evidence.records.length,
      profile_url_count: evidence.records.filter((record) => record.kind === "profile").length,
      comparison_url_count: evidence.records.filter((record) => record.kind === "comparison").length,
      sitemap_success_count: 1,
      sitemap_resubmission_count: 0,
      inspection_record_count: evidence.records.length,
      indexed_at_inspection_count: indexedCount,
      request_indexing_submitted_count: evidence.records.filter((record) => record.request_indexing_status === "submitted").length,
      request_indexing_remaining_count: evidence.records.filter((record) => record.request_indexing_status !== "submitted").length,
      quota_or_permission_blocker_count: evidence.quota_or_permission_blocker ? 1 : 0,
    },
    sitemap: evidence.sitemap,
    baseline: evidence.baseline,
    top_queries: evidence.top_queries,
    post_submission_index24r_recheck: evidence.post_submission_index24r_recheck,
    monitoring: {
      windows: MONITORING_WINDOWS,
      metrics: ["clicks", "impressions", "ctr", "average_position", "top_query", "query_page_match", "index_coverage"],
      cohort_rule: "Read the same nine URLs only. Any title, FAQ or answer-block adjustment requires a separate scoped content PR.",
      automation_state: postSubmissionGatePassed ? "ready_to_schedule_after_pr_merge" : "blocked_until_index24r_returns_9_of_9",
    },
    records: evidence.records.map((record) => ({
      ...record,
      query_page_match: record.baseline_impressions > 0 ? "observed_page_row" : "no_page_row_in_baseline_window",
      monitoring_action: "read_only_7_14_28_day_follow_up",
    })),
    safety_boundary: {
      authenticated_gsc_ui_used: true,
      sitemap_duplicate_submission_avoided: true,
      indexing_api_used: false,
      cms_write_attempted: false,
      deploy_attempted: false,
      sitemap_runtime_mutation_attempted: false,
      llms_runtime_mutation_attempted: false,
      account_or_credential_data_recorded: false,
    },
  };
  return report;
}

function markdown(report) {
  const lines = [
    "# MBTI-GSC-25 Submission And Monitoring Execution",
    "",
    `- Final decision: \`${report.final_decision}\``,
    `- Property: \`${report.property}\``,
    `- Sitemap: \`${report.sitemap.status}\` (existing successful submission reused; no duplicate submit)`,
    `- URL inspections: ${report.summary.inspection_record_count}/9`,
    `- Request Indexing accepted: ${report.summary.request_indexing_submitted_count}/9`,
    `- Indexed at inspection time: ${report.summary.indexed_at_inspection_count}/9`,
    "",
    "## 28-Day Baseline",
    "",
    `- Window: ${report.baseline.start_date} to ${report.baseline.end_date}`,
    `- Clicks: ${report.baseline.clicks}`,
    `- Impressions: ${report.baseline.impressions}`,
    `- CTR: ${(report.baseline.ctr * 100).toFixed(1)}%`,
    `- Average position: ${report.baseline.average_position}`,
    "",
    "## Cohort",
    "",
    "| URL | Inspection | Last crawl | Request Indexing | Clicks | Impressions | CTR | Position |",
    "| --- | --- | --- | --- | ---: | ---: | ---: | ---: |",
    ...report.records.map((record) => `| ${record.url} | ${record.inspection_status} | ${record.last_crawl ?? "pending"} | ${record.request_indexing_status} | ${record.baseline_clicks} | ${record.baseline_impressions} | ${record.baseline_ctr == null ? "pending" : `${(record.baseline_ctr * 100).toFixed(1)}%`} | ${record.baseline_position ?? "pending"} |`),
    "",
    "## Monitoring",
    "",
    ...report.monitoring.windows.map((window) => `- ${window.label}: ${window.date}`),
    "",
    "Read the same nine URL cohort only. Search Console submission does not guarantee indexing, traffic or ranking. Content changes require a separate scoped PR.",
    "",
    "## Safety Boundary",
    "",
    "No CMS write, deploy, sitemap/llms runtime mutation, Google Indexing API call, credential capture or duplicate sitemap submission occurred.",
    "",
  ];
  return lines.join("\n");
}

function csv(report) {
  const header = ["url", "kind", "inspection_status", "last_crawl", "declared_canonical", "google_canonical", "request_indexing_status", "baseline_clicks", "baseline_impressions", "baseline_ctr", "baseline_position", "query_page_match"];
  const rows = report.records.map((record) => header.map((key) => record[key] ?? ""));
  return [header, ...rows].map((row) => row.map((value) => csvEscape(value, { quoteAlways: false })).join(",")).join("\n") + "\n";
}

const report = buildReport();
write(`${OUTPUT_BASE}.json`, JSON.stringify(report, null, 2) + "\n");
write(`${OUTPUT_BASE}.md`, markdown(report));
write(`${OUTPUT_BASE}.csv`, csv(report));
console.log(report.final_decision);
console.log(`SITEMAP=${report.summary.sitemap_success_count}/1`);
console.log(`INSPECTION=${report.summary.inspection_record_count}/9`);
console.log(`REQUEST_INDEXING=${report.summary.request_indexing_submitted_count}/9`);
