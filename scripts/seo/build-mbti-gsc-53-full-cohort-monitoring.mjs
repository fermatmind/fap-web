#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { csvEscape } from "./artifactSafety.mjs";

const ROOT = process.cwd();
const INDEX52_PATH = "docs/seo/personality/mbti-index-52-full-55-release-gate-2026-07-26.json";
const GSC44_PATH = "docs/seo/personality/mbti-gsc-44-full-cohort-monitoring-2026-07-15.json";
const OUTPUT_BASE = "docs/seo/personality/mbti-gsc-53-full-cohort-monitoring-2026-07-27";
const SITE_ORIGIN = "https://fermatmind.com";
const CAPTURED_AT = "2026-07-27T16:55:06Z";
const RELEASE_SOURCES = Object.freeze({
  cross_publish_51: {
    repo: "fap-api",
    pr: 3309,
    merge_commit: "7c770c8741da48f666ea925c65dceb76f7a182a9",
    completed_at: "2026-07-26T14:24:59Z",
  },
  index_52: {
    repo: "fap-web",
    pr: 1816,
    merge_commit: "0239753b3df65f920a1ea0b9fc50401def893b95",
    completed_at: "2026-07-27T16:51:43Z",
  },
});
const RELEASE_AT = RELEASE_SOURCES.index_52.completed_at;
const WINDOWS = Object.freeze([
  { key: "day_7", days: 7 },
  { key: "day_14", days: 14 },
  { key: "day_28", days: 28 },
]);
const EXPECTED_ADDITIONS = Object.freeze([
  "https://fermatmind.com/zh/personality/enfp-vs-entp",
  "https://fermatmind.com/zh/personality/estj-vs-entj",
  "https://fermatmind.com/zh/personality/isfp-vs-infp",
]);
const CONTRACT_PROBE = process.argv.find((argument) => argument.startsWith("--contract-probe="))
  ?.split("=")[1] ?? null;
const asOfArgument = process.argv.find((argument) => argument.startsWith("--as-of="))
  ?.slice("--as-of=".length);
const AS_OF = asOfArgument ?? CAPTURED_AT;

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function write(relativePath, value) {
  fs.writeFileSync(path.join(ROOT, relativePath), value);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function parseInstant(value, label) {
  const timestamp = Date.parse(value);
  assert(Number.isFinite(timestamp), `${label} must be a valid ISO instant`);
  return timestamp;
}

function addDays(instant, days) {
  return new Date(parseInstant(instant, "release_at") + days * 86_400_000).toISOString();
}

function observationStatus(asOf, dueAt, observedAt = null, evidence = null) {
  assert((observedAt === null) === (evidence === null), "Observed time and bounded evidence must be supplied together");
  if (observedAt !== null && evidence !== null) return "observed";
  return parseInstant(asOf, "as_of") < parseInstant(dueAt, "due_at")
    ? "not_due"
    : "pending";
}

function runContractProbe(name) {
  const dueAt = addDays(RELEASE_AT, 7);
  if (name === "observation-status") {
    assert(observationStatus("2026-08-03T16:51:42Z", dueAt) === "not_due", "Pre-due window must be not_due");
    assert(observationStatus(dueAt, dueAt) === "pending", "Due unobserved window must be pending");
    assert(observationStatus(
      dueAt,
      dueAt,
      "2026-08-03T17:00:00Z",
      { source: "bounded_read_only_gsc_export" },
    ) === "observed", "Observed window must be observed");
    console.log("PASS_OBSERVATION_STATUS_PROBE");
    return;
  }
  if (name === "observation-summary") {
    assert(
      observationSummary({ not_due: 110, pending: 55, observed: 0 })
        === "Window states at the captured time: 110 not_due, 55 pending, 0 observed. No GSC evidence is imputed; observed states require bounded read-only evidence.",
      "Observation summary must reflect computed status counts",
    );
    console.log("PASS_OBSERVATION_SUMMARY_PROBE");
    return;
  }
  throw new Error(`Unsupported contract probe: ${name}`);
}

if (CONTRACT_PROBE !== null) {
  runContractProbe(CONTRACT_PROBE);
  process.exit(0);
}

function buildWindow(asOf, window) {
  const dueAt = addDays(RELEASE_AT, window.days);
  const status = observationStatus(asOf, dueAt);
  return {
    label: window.key,
    due_at: dueAt,
    observation_status: status,
    observed_at: null,
    coverage_status: "not_observed",
    indexing_status: "not_observed",
    notes: status === "not_due"
      ? "Observation window has not reached its release-bound due time."
      : "Observation is due but no read-only GSC evidence has been attached.",
    evidence: null,
  };
}

function buildReport() {
  const indexGate = readJson(INDEX52_PATH);
  const priorMonitor = readJson(GSC44_PATH);
  const records = indexGate.records.map((record) => {
    const canonical = new URL(record.path, SITE_ORIGIN).href;
    const slug = new URL(canonical).pathname.split("/").filter(Boolean).at(-1);
    const windows = Object.fromEntries(WINDOWS.map((window) => [
      window.key,
      buildWindow(AS_OF, window),
    ]));
    const windowRows = Object.values(windows);
    const recordStatus = windowRows.some((window) => window.observation_status === "observed")
      ? "observed"
      : (windowRows.some((window) => window.observation_status === "pending") ? "pending" : "not_due");
    return {
      group: record.group,
      kind: record.kind,
      slug,
      route: record.path,
      canonical,
      release_at: RELEASE_AT,
      day_7_due_at: windows.day_7.due_at,
      day_14_due_at: windows.day_14.due_at,
      day_28_due_at: windows.day_28.due_at,
      observation_status: recordStatus,
      observed_at: null,
      coverage_status: "not_observed",
      indexing_status: "not_observed",
      notes: recordStatus === "not_due"
        ? "All release-bound observation windows are not due at the captured time."
        : "At least one release-bound observation window is due and remains pending read-only evidence.",
      evidence: {
        index_release_gate: INDEX52_PATH,
        authority_fingerprint_sha256: record.authority_fingerprint_sha256,
        source_revision_sha256: record.source_revision_sha256,
        gsc_read_evidence: null,
      },
      windows,
    };
  });
  const urls = records.map((record) => record.canonical);
  const priorUrls = new Set(priorMonitor.records.map((record) => record.canonical));
  const additions = urls.filter((url) => !priorUrls.has(url)).sort();

  assert(RELEASE_SOURCES.cross_publish_51.completed_at < RELEASE_SOURCES.index_52.completed_at, "Release sources must remain chronological");
  assert(RELEASE_AT === RELEASE_SOURCES.index_52.completed_at, "release_at must use the later actual completion time");
  assert(indexGate.final_decision === "ALLOW_MBTI_55_COMPLETE", "INDEX-52 must allow the full cohort");
  assert(indexGate.completed_consecutive_runs === 2, "INDEX-52 must contain two consecutive runs");
  assert(indexGate.gsc_dependency_unblocked === true, "INDEX-52 must explicitly unblock GSC monitoring");
  assert(records.length === 55 && new Set(urls).size === 55, "Expected exactly 55 unique monitoring URLs");
  assert(priorUrls.size === 52, "Prior GSC-44 monitor must contain exactly 52 URLs");
  assert(JSON.stringify(additions) === JSON.stringify([...EXPECTED_ADDITIONS].sort()), "GSC-53 must add only the exact three approved cross-type URLs");
  assert(records.every((record) => record.canonical.startsWith(`${SITE_ORIGIN}/zh/personality/`)), "Monitoring cohort must remain on public zh personality routes");

  const windowRows = records.flatMap((record) => Object.values(record.windows));
  const countsByStatus = Object.fromEntries(["not_due", "pending", "observed"].map((status) => [
    status,
    windowRows.filter((window) => window.observation_status === status).length,
  ]));
  const allNotDue = windowRows.every((window) => window.observation_status === "not_due");

  return {
    id: "MBTI-GSC-53",
    artifact: "MBTI-GSC-53-FULL-COHORT-READ-ONLY-MONITORING",
    generated_at: AS_OF,
    final_decision: allNotDue
      ? "PASS_MBTI_GSC_53_MONITORING_READY_WINDOWS_NOT_DUE"
      : "PASS_MBTI_GSC_53_MONITORING_READY_OBSERVATIONS_PENDING",
    property: "sc-domain:fermatmind.com",
    release_at: RELEASE_AT,
    release_sources: RELEASE_SOURCES,
    source_artifacts: [INDEX52_PATH, GSC44_PATH],
    exact_additions: EXPECTED_ADDITIONS,
    summary: {
      cohort_url_count: records.length,
      profile_url_count: records.filter((record) => record.kind === "profile").length,
      at_comparison_url_count: records.filter((record) => record.kind === "at_comparison").length,
      cross_type_comparison_url_count: records.filter((record) => record.kind === "cross_type_comparison").length,
      prior_url_count: priorUrls.size,
      added_url_count: additions.length,
      observation_window_count: windowRows.length,
      observation_status_counts: countsByStatus,
      gsc_reads_executed_count: 0,
      search_mutations_executed_count: 0,
    },
    monitoring_contract: {
      windows: WINDOWS.map((window) => ({
        label: window.key,
        due_at: addDays(RELEASE_AT, window.days),
      })),
      status_rule: "Before due_at use not_due; at or after due_at without evidence use pending; use observed only with bounded read-only evidence and observed_at.",
      evidence_rule: "Never infer coverage or indexing from INDEX-52, query-level rows, sitemap membership, or a future observation.",
      action_rule: "No Request Indexing, URL Inspection write, sitemap submission, Indexing API call, or other search mutation is authorized.",
    },
    records,
    safety_boundary: {
      read_only_monitoring_contract: true,
      authenticated_gsc_read_attempted: false,
      credentials_or_property_tokens_recorded: false,
      sitemap_submission_attempted: false,
      url_inspection_write_attempted: false,
      request_indexing_attempted: false,
      indexing_api_used: false,
      search_console_mutation_attempted: false,
      cms_or_database_mutation_attempted: false,
      publication_or_indexability_mutation_attempted: false,
      deploy_attempted: false,
      private_url_leak_count: 0,
    },
  };
}

function markdown(report) {
  return [
    "# MBTI-GSC-53 Full Cohort Read-Only Monitoring",
    "",
    `- Final decision: \`${report.final_decision}\``,
    `- Property: \`${report.property}\``,
    `- Release at: \`${report.release_at}\``,
    `- Cohort: ${report.summary.cohort_url_count}/55`,
    `- Added URLs: ${report.summary.added_url_count}/3`,
    "",
    "## Observation Windows",
    "",
    ...report.monitoring_contract.windows.map((window) => (
      `- ${window.label}: \`${window.due_at}\` — ${report.records[0].windows[window.label].observation_status}`
    )),
    "",
    observationSummary(report.summary.observation_status_counts),
    "",
    "## 55-URL Ledger",
    "",
    "| URL | Kind | 7d | 14d | 28d | Coverage | Indexing |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...report.records.map((record) => `| ${record.canonical} | ${record.kind} | ${record.windows.day_7.observation_status} | ${record.windows.day_14.observation_status} | ${record.windows.day_28.observation_status} | ${record.coverage_status} | ${record.indexing_status} |`),
    "",
    "## Safety Boundary",
    "",
    "This artifact performs no Request Indexing, URL Inspection write, sitemap submission, Indexing API call, CMS/database/publication/indexability mutation, deploy, or other search mutation. Search Console observations do not guarantee indexing, traffic, citation, or ranking.",
    "",
  ].join("\n");
}

function observationSummary(counts) {
  return `Window states at the captured time: ${counts.not_due} not_due, ${counts.pending} pending, ${counts.observed} observed. No GSC evidence is imputed; observed states require bounded read-only evidence.`;
}

function csv(report) {
  const header = [
    "canonical",
    "group",
    "kind",
    "slug",
    "release_at",
    "day_7_due_at",
    "day_7_status",
    "day_14_due_at",
    "day_14_status",
    "day_28_due_at",
    "day_28_status",
    "observed_at",
    "coverage_status",
    "indexing_status",
    "notes",
  ];
  const rows = report.records.map((record) => [
    record.canonical,
    record.group,
    record.kind,
    record.slug,
    record.release_at,
    record.day_7_due_at,
    record.windows.day_7.observation_status,
    record.day_14_due_at,
    record.windows.day_14.observation_status,
    record.day_28_due_at,
    record.windows.day_28.observation_status,
    record.observed_at,
    record.coverage_status,
    record.indexing_status,
    record.notes,
  ]);
  return [header, ...rows]
    .map((row) => row.map((value) => csvEscape(value ?? "", { quoteAlways: false })).join(","))
    .join("\n") + "\n";
}

const report = buildReport();
write(`${OUTPUT_BASE}.json`, `${JSON.stringify(report, null, 2)}\n`);
write(`${OUTPUT_BASE}.md`, markdown(report));
write(`${OUTPUT_BASE}.csv`, csv(report));
console.log(report.final_decision);
console.log(`COHORT=${report.summary.cohort_url_count}/55`);
console.log(`ADDITIONS=${report.summary.added_url_count}/3`);
console.log(`WINDOWS_NOT_DUE=${report.summary.observation_status_counts.not_due}/165`);
console.log(`GSC_READS=${report.summary.gsc_reads_executed_count}`);
console.log(`SEARCH_MUTATIONS=${report.summary.search_mutations_executed_count}`);
