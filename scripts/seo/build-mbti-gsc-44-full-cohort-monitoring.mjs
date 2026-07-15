#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { csvEscape } from "./artifactSafety.mjs";

const ROOT = process.cwd();
const INVENTORY_PATH = "docs/seo/personality/mbti-full-audit-30-inventory-runtime-baseline-2026-07-13.json";
const INDEX_GATE_PATH = "docs/seo/personality/mbti-index-43-full-52-release-gate-2026-07-14.json";
const GSC25_PATH = "docs/seo/personality/mbti-gsc-25-live-evidence-2026-07-12.json";
const EVIDENCE_PATH = "docs/seo/personality/mbti-gsc-44-live-evidence-2026-07-15.json";
const OUTPUT_BASE = "docs/seo/personality/mbti-gsc-44-full-cohort-monitoring-2026-07-15";
const MONITORING_WINDOWS = [
  { label: "7d", date: "2026-07-22" },
  { label: "14d", date: "2026-07-29" },
  { label: "28d", date: "2026-08-12" },
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
  const inventory = readJson(INVENTORY_PATH).records;
  const gate = readJson(INDEX_GATE_PATH);
  const priorEvidence = readJson(GSC25_PATH);
  const evidence = readJson(EVIDENCE_PATH);
  const inventoryUrls = inventory.map((record) => record.canonical).sort();
  const gateUrls = gate.records.map((record) => `https://fermatmind.com${record.path}`).sort();
  const pageRows = new Map(evidence.page_rows.map((row) => [row.url, row]));
  const submittedUrls = new Set(priorEvidence.records.map((record) => record.url));
  const queryRowsBySlug = new Map();

  for (const query of evidence.top_queries) {
    if (!query.matched_slug) continue;
    const rows = queryRowsBySlug.get(query.matched_slug) ?? [];
    rows.push(query);
    queryRowsBySlug.set(query.matched_slug, rows);
  }

  assert(inventory.length === 52, "Expected exactly 52 inventory records");
  assert(gate.final_decision === "ALLOW_MBTI_52_COMPLETE", "INDEX-43 must allow the full MBTI cohort");
  assert(Object.entries(gate.metrics).every(([key, value]) => key === "API_TIMEOUTS" ? value === 0 : value === 52), "INDEX-43 metrics must remain complete");
  assert(gate.completed_consecutive_runs === 2, "INDEX-43 must contain two consecutive runs");
  assert(gate.private_url_leak_count === 0, "INDEX-43 must report zero private URL leaks");
  assert(JSON.stringify(inventoryUrls) === JSON.stringify(gateUrls), "Inventory and INDEX-43 cohorts must match");
  assert(evidence.property === "sc-domain:fermatmind.com", "Unexpected GSC property");
  assert(evidence.cohort_filter.expected_url_count === 52, "GSC evidence must target 52 URLs");
  assert(Object.values(evidence.external_action_boundary).every((value) => value === false), "GSC-44 must remain read-only");
  assert(priorEvidence.records.length === 9, "Expected nine historical GSC-25 records");

  const records = inventory.map((record) => {
    const pageRow = pageRows.get(record.canonical);
    const matchedQueries = queryRowsBySlug.get(record.slug) ?? [];
    return {
      group: record.group,
      kind: record.kind,
      slug: record.slug,
      route: record.route,
      canonical: record.canonical,
      page_baseline_status: pageRow ? "observed_page_row" : "pending_page_scoped_export",
      clicks: pageRow?.clicks ?? null,
      impressions: pageRow?.impressions ?? null,
      ctr: pageRow?.ctr ?? null,
      average_position: pageRow?.average_position ?? null,
      top_queries: matchedQueries,
      query_page_match: matchedQueries.length > 0 ? "explicit_query_slug_match" : "pending_page_scoped_query_export",
      historical_request_indexing_status: submittedUrls.has(record.canonical) ? "submitted_in_mbti_gsc_25" : "not_requested_in_read_only_gsc_44",
      inspection_status: submittedUrls.has(record.canonical) ? "available_in_mbti_gsc_25_evidence" : "pending_separate_read_only_inspection",
      monitoring_action: "read_only_7_14_28_day_follow_up",
    };
  });

  return {
    id: "MBTI-GSC-44",
    artifact: "MBTI-GSC-44-FULL-COHORT-MONITORING",
    generated_at: evidence.captured_at,
    final_decision: "PASS_MBTI_GSC_44_BASELINE_MONITORING_READY_NO_MUTATION",
    property: evidence.property,
    source_artifacts: [INVENTORY_PATH, INDEX_GATE_PATH, GSC25_PATH, EVIDENCE_PATH],
    summary: {
      cohort_url_count: records.length,
      profile_url_count: records.filter((record) => record.kind === "profile").length,
      at_comparison_url_count: records.filter((record) => record.kind === "at_comparison").length,
      cross_type_comparison_url_count: records.filter((record) => record.kind === "cross_type_comparison").length,
      page_rows_observed_count: records.filter((record) => record.page_baseline_status === "observed_page_row").length,
      page_rows_pending_count: records.filter((record) => record.page_baseline_status !== "observed_page_row").length,
      explicit_query_match_url_count: records.filter((record) => record.top_queries.length > 0).length,
      historical_request_indexing_count: records.filter((record) => record.historical_request_indexing_status === "submitted_in_mbti_gsc_25").length,
      request_indexing_executed_count: 0,
    },
    baseline: { ...evidence.window, ...evidence.aggregate },
    top_queries: evidence.top_queries,
    monitoring: {
      windows: MONITORING_WINDOWS,
      metrics: ["clicks", "impressions", "ctr", "average_position", "top_query", "query_page_match", "index_coverage", "declared_canonical", "google_canonical", "last_crawl"],
      cohort_rule: "Read the same 52 URLs only. Missing page rows remain pending; query-level evidence is never imputed as page-level evidence.",
      content_change_rule: "Any title, FAQ, answer-block or internal-link adjustment requires a separate backend/CMS-authority content task.",
      external_action_rule: "No sitemap submission, URL Inspection, Request Indexing or Indexing API operation is authorized by MBTI-GSC-44.",
    },
    mutation_authorization_required_if_requested: {
      property: evidence.property,
      already_submitted_url_count: submittedUrls.size,
      remaining_url_count: records.length - submittedUrls.size,
      action: "read_only_baseline_complete; stop before any GSC mutation",
      exact_authorization_phrase: "I explicitly authorize a separately scoped MBTI GSC mutation for the exact property and URL list shown in its approval package.",
    },
    records,
    safety_boundary: {
      authenticated_gsc_ui_used_read_only: true,
      sitemap_submission_attempted: false,
      url_inspection_attempted: false,
      request_indexing_attempted: false,
      indexing_api_used: false,
      cms_or_runtime_mutation_attempted: false,
      deploy_attempted: false,
      account_or_credential_data_recorded: false,
      private_url_leak_count: 0,
    },
  };
}

function markdown(report) {
  const lines = [
    "# MBTI-GSC-44 Full Cohort Monitoring",
    "",
    `- Final decision: \`${report.final_decision}\``,
    `- Property: \`${report.property}\``,
    `- Cohort: ${report.summary.cohort_url_count}/52`,
    `- Window: ${report.baseline.start_date} to ${report.baseline.end_date}`,
    `- Clicks: ${report.baseline.clicks}`,
    `- Impressions: ${report.baseline.impressions}`,
    `- CTR: ${(report.baseline.ctr * 100).toFixed(1)}%`,
    `- Average position: ${report.baseline.average_position}`,
    "",
    "## Evidence Boundary",
    "",
    `- Page rows observed: ${report.summary.page_rows_observed_count}/52`,
    `- Page-scoped export pending: ${report.summary.page_rows_pending_count}/52`,
    `- URLs with explicit query-to-slug evidence: ${report.summary.explicit_query_match_url_count}/52`,
    `- Historical Request Indexing evidence reused: ${report.summary.historical_request_indexing_count}/52`,
    "",
    "Query-level metrics are not assigned to page rows. Missing page and inspection evidence remains explicitly pending.",
    "",
    "## Monitoring Windows",
    "",
    ...report.monitoring.windows.map((window) => `- ${window.label}: ${window.date}`),
    "",
    "## 52-URL Ledger",
    "",
    "| URL | Kind | Page baseline | Query evidence | Inspection | Request indexing |",
    "| --- | --- | --- | --- | --- | --- |",
    ...report.records.map((record) => `| ${record.canonical} | ${record.kind} | ${record.page_baseline_status} | ${record.query_page_match} | ${record.inspection_status} | ${record.historical_request_indexing_status} |`),
    "",
    "## Safety Boundary",
    "",
    "This task performed no sitemap submission, URL Inspection, Request Indexing, Indexing API call, CMS/runtime mutation or deploy. Search Console evidence does not guarantee indexing, traffic or ranking.",
    "",
  ];
  return lines.join("\n");
}

function csv(report) {
  const header = ["canonical", "group", "kind", "slug", "page_baseline_status", "clicks", "impressions", "ctr", "average_position", "query_page_match", "inspection_status", "historical_request_indexing_status"];
  const rows = report.records.map((record) => header.map((key) => record[key] ?? ""));
  return [header, ...rows].map((row) => row.map((value) => csvEscape(value, { quoteAlways: false })).join(",")).join("\n") + "\n";
}

const report = buildReport();
write(`${OUTPUT_BASE}.json`, `${JSON.stringify(report, null, 2)}\n`);
write(`${OUTPUT_BASE}.md`, markdown(report));
write(`${OUTPUT_BASE}.csv`, csv(report));
console.log(report.final_decision);
console.log(`COHORT=${report.summary.cohort_url_count}/52`);
console.log(`CLICKS=${report.baseline.clicks}`);
console.log(`IMPRESSIONS=${report.baseline.impressions}`);
console.log(`GSC_MUTATIONS=${report.summary.request_indexing_executed_count}`);
