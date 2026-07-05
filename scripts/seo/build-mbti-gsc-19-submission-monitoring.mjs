#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const GENERATED_AT = "2026-07-05T18:00:00.000Z";
const INDEX18_JSON = "docs/seo/personality/mbti-index-18-sitemap-llms-indexability-gate-2026-07-05.json";
const GSC11_JSON = "docs/seo/personality/mbti-gsc-11-query-evidence-export-2026-07-04.json";
const OUT_JSON = "docs/seo/personality/mbti-gsc-19-submission-monitoring-2026-07-05.json";
const OUT_MD = "docs/seo/personality/mbti-gsc-19-submission-monitoring-2026-07-05.md";
const OUT_CSV = "docs/seo/personality/mbti-gsc-19-submission-monitoring-2026-07-05.csv";

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function writeFile(targetPath, body) {
  const absolute = path.isAbsolute(targetPath) ? targetPath : path.join(ROOT, targetPath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, body);
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function monitoringRows(index18, gsc11) {
  const queryByPath = new Map();
  for (const row of gsc11.normalized_rows ?? []) {
    if (!queryByPath.has(row.path)) queryByPath.set(row.path, []);
    queryByPath.get(row.path).push(row);
  }

  return index18.records.map((record) => {
    const rows = queryByPath.get(record.target_path) ?? [];
    const confirmedRows = rows.filter((row) => row.query_status === "captured_query_row");
    const pendingRows = rows.filter((row) => row.query_status !== "captured_query_row");
    const primary = confirmedRows[0] ?? pendingRows[0] ?? null;

    return {
      target_path: record.target_path,
      target_url: record.target_url,
      asset_kind: record.asset_kind,
      source_artifact: record.source_artifact,
      index18_decision: record.gsc_decision,
      index18_blockers: record.blockers,
      query_evidence_status: confirmedRows.length > 0 ? "confirmed_query_rows_present" : "pending_or_seed_only",
      primary_query: primary?.query ?? "",
      baseline_clicks: primary?.clicks ?? "",
      baseline_impressions: primary?.impressions ?? "",
      baseline_ctr: primary?.ctr ?? "",
      baseline_position: primary?.position ?? "",
      monitor_7d: "track clicks, impressions, CTR, average position, indexed coverage, and query drift after promotion",
      monitor_14d: "compare 7d vs prior period; identify pages needing title/FAQ/answer-block adjustment",
      monitor_28d: "decide next Top10 expansion queue using confirmed page-query evidence",
      next_action:
        record.gsc_decision === "ready_to_submit"
          ? "eligible_for_explicit_operator_authorized_gsc_submission"
          : "hold_until_index18_allows_gsc_submission_after_backend_promotion",
    };
  });
}

function buildReport() {
  const index18 = readJson(INDEX18_JSON);
  const gsc11 = readJson(GSC11_JSON);

  if (index18.final_decision !== "PASS_INDEXABILITY_GATE_HELD_NO_URL_EXPANSION") {
    throw new Error(`Unexpected INDEX18 decision: ${index18.final_decision}`);
  }
  if (gsc11.final_decision !== "PASS_MBTI_GSC_11_QUERY_EVIDENCE_EXPORT_READY") {
    throw new Error(`Unexpected GSC11 decision: ${gsc11.final_decision}`);
  }

  const rows = monitoringRows(index18, gsc11);
  const gscSubmitAllowed = index18.summary.gsc_submit_now_count > 0;
  const submissionCandidates = rows.filter((row) => row.index18_decision === "ready_to_submit");
  const blockers = [];

  if (!gscSubmitAllowed) blockers.push("index18_gsc_submit_now_count_is_zero");
  if (submissionCandidates.length === 0) blockers.push("index18_no_ready_to_submit_records");
  if (index18.summary.sitemap_expand_now_count === 0) blockers.push("sitemap_runtime_expansion_not_allowed");
  if (index18.summary.llms_expand_now_count === 0) blockers.push("llms_runtime_expansion_not_allowed");

  return {
    id: "MBTI-GSC-19",
    artifact: "MBTI-GSC-19-SUBMISSION-MONITORING",
    generated_at: GENERATED_AT,
    status: blockers.length === 0 ? "ready_for_explicit_authorized_submission" : "held_no_live_gsc_submission",
    final_decision:
      blockers.length === 0
        ? "PASS_MBTI_GSC_19_READY_FOR_EXPLICIT_AUTHORIZED_GSC_SUBMISSION"
        : "PASS_MBTI_GSC_19_MONITORING_READY_GSC_SUBMISSION_HELD",
    source_artifacts: [
      {
        id: "MBTI-INDEX-18",
        path: INDEX18_JSON,
        final_decision: index18.final_decision,
        gsc_submit_now_count: index18.summary.gsc_submit_now_count,
      },
      {
        id: "MBTI-GSC-11",
        path: GSC11_JSON,
        final_decision: gsc11.final_decision,
        normalized_query_tracking_rows: gsc11.summary.normalized_query_tracking_rows,
      },
    ],
    summary: {
      monitored_url_count: rows.length,
      profile_url_count: rows.filter((row) => row.asset_kind === "profile").length,
      comparison_url_count: rows.filter((row) => row.asset_kind === "comparison").length,
      confirmed_query_url_count: rows.filter((row) => row.query_evidence_status === "confirmed_query_rows_present")
        .length,
      pending_query_url_count: rows.filter((row) => row.query_evidence_status === "pending_or_seed_only").length,
      gsc_submit_now_count: gscSubmitAllowed ? submissionCandidates.length : 0,
      sitemap_submission_now_count: 0,
      url_inspection_request_now_count: 0,
    },
    submission_readiness: {
      sitemap_submission_decision: "hold_do_not_submit_sitemap",
      url_inspection_decision: "hold_do_not_request_indexing",
      reason:
        "INDEX-18 held all sitemap/llms/GSC expansion until backend approval, production promotion, robots/indexability authority, and visible evidence are complete.",
      required_before_live_gsc_mutation: [
        "INDEX-18 or successor gate returns gsc_submit_now_count > 0",
        "runtime sitemap/llms expansion has been completed by backend-authoritative implementation",
        "operator gives explicit same-turn authorization for live GSC mutation",
        "no production deploy or CMS write is bundled into the GSC task",
      ],
    },
    monitoring_plan: {
      baseline_date: "2026-07-05",
      windows: [
        { label: "7d", date: "2026-07-12", purpose: "early query and indexing movement check" },
        { label: "14d", date: "2026-07-19", purpose: "CTR and query-fit adjustment checkpoint" },
        { label: "28d", date: "2026-08-02", purpose: "next Top10 profile/comparison prioritization" },
      ],
      metrics: [
        "clicks",
        "impressions",
        "ctr",
        "average_position",
        "top_queries",
        "page_query_rows",
        "coverage_or_indexing_status",
      ],
      cohort_rule:
        "Track the same profile/comparison cohort from CONTENT-15 through CMS16/CMS17/INDEX18; do not expand to new URLs until confirmed query evidence and indexability gates are ready.",
    },
    safety_boundary: {
      artifact_only: true,
      gsc_api_call_attempted: false,
      gsc_sitemap_submission_attempted: false,
      gsc_url_inspection_attempted: false,
      gsc_request_indexing_attempted: false,
      search_console_browser_mutation_attempted: false,
      cms_write_attempted: false,
      production_import_attempted: false,
      sitemap_runtime_mutation_attempted: false,
      llms_runtime_mutation_attempted: false,
      frontend_runtime_change_attempted: false,
      frontend_local_editorial_fallback_added: false,
      staging_deploy_wait_attempted: false,
      production_deploy_attempted: false,
    },
    rows,
    blockers,
    recommended_next_task:
      "Complete backend operator approval/import promotion and rerun INDEX-18 before any live GSC submission or indexing request.",
  };
}

function markdown(report) {
  const lines = [
    "# MBTI-GSC-19 Submission And Monitoring",
    "",
    "This is a GSC submission-readiness and monitoring artifact. It does not submit a sitemap, request indexing, mutate Search Console, write CMS data, or deploy.",
    "",
    `- Final decision: \`${report.final_decision}\``,
    `- Monitored URLs: ${report.summary.monitored_url_count}`,
    `- GSC submit now: ${report.summary.gsc_submit_now_count}`,
    `- Sitemap submit now: ${report.summary.sitemap_submission_now_count}`,
    `- URL inspection request now: ${report.summary.url_inspection_request_now_count}`,
    "",
    "## Submission Readiness",
    "",
    `- Sitemap: \`${report.submission_readiness.sitemap_submission_decision}\``,
    `- URL inspection: \`${report.submission_readiness.url_inspection_decision}\``,
    `- Reason: ${report.submission_readiness.reason}`,
    "",
    "## Required Before Live GSC Mutation",
    "",
    ...report.submission_readiness.required_before_live_gsc_mutation.map((item) => `- ${item}`),
    "",
    "## Monitoring Windows",
    "",
    "| Window | Date | Purpose |",
    "| --- | --- | --- |",
    ...report.monitoring_plan.windows.map((window) => `| ${window.label} | ${window.date} | ${window.purpose} |`),
    "",
    "## Cohort",
    "",
    "| Path | Kind | Query status | Primary query | Baseline impressions | Position | Next action |",
    "| --- | --- | --- | --- | ---: | ---: | --- |",
  ];

  for (const row of report.rows) {
    lines.push(
      `| \`${row.target_path}\` | ${row.asset_kind} | ${row.query_evidence_status} | ${row.primary_query ? `\`${row.primary_query}\`` : "_pending_"} | ${row.baseline_impressions} | ${row.baseline_position} | ${row.next_action} |`,
    );
  }

  lines.push(
    "",
    "## Safety Boundary",
    "",
    "- No GSC API call, sitemap submission, URL inspection/indexing request, Search Console browser mutation, CMS write, production import, sitemap/llms runtime mutation, frontend runtime change, deploy, or staging wait was attempted.",
    "",
    "## Blockers",
    "",
    report.blockers.length === 0 ? "- None." : report.blockers.map((blocker) => `- ${blocker}`).join("\n"),
    "",
    "## Next Task",
    "",
    report.recommended_next_task,
    "",
  );

  return lines.join("\n");
}

function csv(report) {
  const header = [
    "target_path",
    "asset_kind",
    "query_evidence_status",
    "primary_query",
    "baseline_clicks",
    "baseline_impressions",
    "baseline_ctr",
    "baseline_position",
    "index18_decision",
    "next_action",
  ];
  const rows = report.rows.map((row) => [
    row.target_path,
    row.asset_kind,
    row.query_evidence_status,
    row.primary_query,
    row.baseline_clicks,
    row.baseline_impressions,
    row.baseline_ctr,
    row.baseline_position,
    row.index18_decision,
    row.next_action,
  ]);

  return [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n") + "\n";
}

const report = buildReport();
writeFile(OUT_JSON, JSON.stringify(report, null, 2) + "\n");
writeFile(OUT_MD, markdown(report));
writeFile(OUT_CSV, csv(report));
