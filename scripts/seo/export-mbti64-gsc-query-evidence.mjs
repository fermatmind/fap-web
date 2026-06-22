#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const GENERATED_DATE = "2026-06-22";
const REVIEW_PATH = path.join(
  ROOT,
  "docs/seo/personality/mbti64-agent-visible-expansion-13-review-2026-06-22.json",
);
const OUTPUT_JSON = path.join(
  ROOT,
  `docs/seo/personality/mbti64-seo-measurement-cohort-gsc-query-export-${GENERATED_DATE}.json`,
);
const OUTPUT_MD = path.join(
  ROOT,
  `docs/seo/personality/mbti64-seo-measurement-cohort-gsc-query-export-${GENERATED_DATE}.md`,
);
const OUTPUT_CSV = path.join(
  ROOT,
  `docs/seo/personality/mbti64-gsc-query-export-${GENERATED_DATE}.csv`,
);

const GSC_CAPTURE = [
  {
    path: "/en/personality/enfj-a",
    query_rows: [{ query: "enfj-a", clicks: 0, impressions: 1, ctr: 0, position: 4 }],
    visible_row_count: 1,
    total_rows: 1,
  },
  { path: "/en/personality/esfj-t", query_rows: [], visible_row_count: 0, total_rows: null },
  {
    path: "/zh/personality/intp-a",
    query_rows: [{ query: "intp-a", clicks: 0, impressions: 3, ctr: 0, position: 10.3 }],
    visible_row_count: 1,
    total_rows: 1,
  },
  { path: "/en/personality/enfp-a", query_rows: [], visible_row_count: 0, total_rows: null },
  { path: "/zh/personality/istp-a", query_rows: [], visible_row_count: 0, total_rows: null },
  { path: "/zh/personality/intp-a-vs-intp-t", query_rows: [], visible_row_count: 0, total_rows: null },
  { path: "/en/personality/esfj-a", query_rows: [], visible_row_count: 0, total_rows: null },
  {
    path: "/zh/personality/esfp-a",
    query_rows: [{ query: "esfp-a", clicks: 0, impressions: 1, ctr: 0, position: 7 }],
    visible_row_count: 1,
    total_rows: 1,
  },
  { path: "/zh/personality/esfj-a", query_rows: [], visible_row_count: 0, total_rows: null },
  { path: "/en/personality/intp-a", query_rows: [], visible_row_count: 0, total_rows: null },
  { path: "/en/personality/istp-a", query_rows: [], visible_row_count: 0, total_rows: null },
  { path: "/en/personality/entj-a", query_rows: [], visible_row_count: 0, total_rows: null },
  { path: "/en/personality/estp-t", query_rows: [], visible_row_count: 0, total_rows: null },
];

function csvEscape(value) {
  const raw = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(raw)) return `"${raw.replaceAll('"', '""')}"`;
  return raw;
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

function formatCtr(value) {
  return `${(Number(value) * 100).toFixed(1).replace(/\.0$/, "")}%`;
}

function buildCsv(rows) {
  const header = [
    "target_url",
    "path",
    "locale",
    "page_type",
    "mbti_type",
    "variant",
    "query",
    "query_clicks",
    "query_impressions",
    "query_ctr",
    "query_position",
    "page_clicks",
    "page_impressions",
    "page_ctr",
    "page_average_position",
    "query_row_status",
    "capture_source",
  ];
  const lines = [header.join(",")];
  for (const row of rows) {
    lines.push(header.map((field) => csvEscape(row[field])).join(","));
  }
  return `${lines.join("\n")}\n`;
}

async function main() {
  const review = await readJson(REVIEW_PATH);
  const reviewByPath = new Map(review.reviewed_pages.map((page) => [page.path, page]));
  const blockers = [];
  const warnings = [];

  if (review.final_decision !== "PASS_VISIBLE_EXPANSION_13_REVIEW_READY") {
    blockers.push(`visible_expansion_review_not_ready:${review.final_decision}`);
  }

  const captureByPath = new Map(GSC_CAPTURE.map((item) => [item.path, item]));
  const missingCapture = review.reviewed_pages.filter((page) => !captureByPath.has(page.path));
  if (missingCapture.length > 0) {
    blockers.push(`missing_gsc_query_capture_for_${missingCapture.length}_review_pages`);
  }

  const perUrl = review.reviewed_pages.map((page) => {
    const capture = captureByPath.get(page.path);
    const queryRows = capture?.query_rows ?? [];
    const queryExportStatus =
      queryRows.length > 0
        ? "QUERY_ROWS_CAPTURED_FROM_GSC_UI"
        : "GSC_QUERY_TABLE_EMPTY_OR_SUPPRESSED_FOR_FILTERED_PAGE";
    return {
      target_url: page.target_url,
      path: page.path,
      locale: page.locale,
      page_type: page.page_type,
      mbti_type: page.mbti_type,
      variant: page.variant,
      page_level_metrics: {
        clicks: page.gsc.clicks,
        impressions: page.gsc.impressions,
        ctr: page.gsc.ctr,
        average_position: page.gsc.average_position,
        source_kind: page.gsc.source_kind,
      },
      query_export_status: queryExportStatus,
      query_rows_captured: queryRows.length,
      visible_query_row_count: capture?.visible_row_count ?? 0,
      gsc_reported_query_total_rows: capture?.total_rows ?? null,
      query_rows: queryRows,
    };
  });

  const queryRowCsvRecords = [];
  for (const item of perUrl) {
    if (item.query_rows.length === 0) {
      queryRowCsvRecords.push({
        target_url: item.target_url,
        path: item.path,
        locale: item.locale,
        page_type: item.page_type,
        mbti_type: item.mbti_type,
        variant: item.variant ?? "",
        query: "",
        query_clicks: "",
        query_impressions: "",
        query_ctr: "",
        query_position: "",
        page_clicks: item.page_level_metrics.clicks,
        page_impressions: item.page_level_metrics.impressions,
        page_ctr: formatCtr(item.page_level_metrics.ctr),
        page_average_position: item.page_level_metrics.average_position,
        query_row_status: item.query_export_status,
        capture_source: "chrome_gsc_ui_filtered_query_table",
      });
      continue;
    }
    for (const queryRow of item.query_rows) {
      queryRowCsvRecords.push({
        target_url: item.target_url,
        path: item.path,
        locale: item.locale,
        page_type: item.page_type,
        mbti_type: item.mbti_type,
        variant: item.variant ?? "",
        query: queryRow.query,
        query_clicks: queryRow.clicks,
        query_impressions: queryRow.impressions,
        query_ctr: formatCtr(queryRow.ctr),
        query_position: queryRow.position,
        page_clicks: item.page_level_metrics.clicks,
        page_impressions: item.page_level_metrics.impressions,
        page_ctr: formatCtr(item.page_level_metrics.ctr),
        page_average_position: item.page_level_metrics.average_position,
        query_row_status: item.query_export_status,
        capture_source: "chrome_gsc_ui_filtered_query_table",
      });
    }
  }

  const summary = {
    target_url_count: perUrl.length,
    page_level_metric_url_count: perUrl.filter((item) => item.page_level_metrics.impressions > 0).length,
    query_level_url_count: perUrl.filter((item) => item.query_rows_captured > 0).length,
    query_suppressed_or_empty_url_count: perUrl.filter((item) => item.query_rows_captured === 0).length,
    query_row_count: perUrl.reduce((total, item) => total + item.query_rows_captured, 0),
    csv_record_count: queryRowCsvRecords.length,
  };

  if (summary.query_suppressed_or_empty_url_count > 0) {
    warnings.push(`GSC_QUERY_TABLE_EMPTY_OR_SUPPRESSED_FOR_${summary.query_suppressed_or_empty_url_count}_URLS`);
  }

  const finalDecision =
    blockers.length > 0
      ? "NO_GO_QUERY_EXPORT_ARTIFACT_INVALID"
      : summary.query_level_url_count === summary.target_url_count
        ? "PASS_QUERY_LEVEL_EXPORT_CAPTURED"
        : "CONDITIONAL_PARTIAL_QUERY_EXPORT_CAPTURED";

  const output = {
    artifact: "MBTI64-SEO-MEASUREMENT-COHORT-GSC-QUERY-EXPORT-01",
    generated_at: new Date().toISOString(),
    status: blockers.length > 0 ? "fail" : "conditional",
    final_decision: finalDecision,
    input_artifacts: {
      visible_expansion_review:
        "docs/seo/personality/mbti64-agent-visible-expansion-13-review-2026-06-22.json",
      page_level_gsc_import: "docs/seo/personality/mbti64-seo-measurement-cohort-gsc-import-2026-06-22.json",
    },
    capture_method: {
      source: "Google Search Console browser UI",
      property: "sc-domain:fermatmind.com",
      date_window: "last_24_hours",
      table: "Performance > Search results > filtered page > Queries",
      automation_boundary: "read_only_chrome_ui_capture",
      csv_export_download_available: false,
      no_request_indexing: true,
      no_search_submit: true,
      no_queue_mutation: true,
      no_cms_or_frontend_mutation: true,
    },
    summary,
    per_url: perUrl,
    query_csv_artifact: "docs/seo/personality/mbti64-gsc-query-export-2026-06-22.csv",
    blockers,
    warnings,
    decisions: {
      can_rewrite_all_13_with_query_level_evidence: summary.query_level_url_count === summary.target_url_count,
      can_use_page_level_priority_for_observation: true,
      can_use_query_rows_for_3_query_backed_pages: summary.query_level_url_count === 3,
      should_not_treat_empty_query_table_as_zero_demand: true,
    },
    recommended_next_task:
      summary.query_level_url_count === summary.target_url_count
        ? "MBTI64-CMS-PROJECTION-DRAFT-VISIBLE-13-DRY-RUN-01"
        : "MBTI64-AGENT-VISIBLE-EXPANSION-13-QUERY-EVIDENCE-DECISION-01",
  };

  const md = `# MBTI64 GSC Query Export

Generated: ${output.generated_at}

## Decision

${output.final_decision}

This is a read-only GSC query export gate. It did not write CMS content, mutate frontend runtime, enqueue search items, submit search requests, or request indexing.

## Summary

- Target URLs: ${summary.target_url_count}
- Page-level GSC rows with impressions: ${summary.page_level_metric_url_count}
- URLs with visible query rows captured: ${summary.query_level_url_count}
- URLs where the filtered GSC query table was empty or suppressed: ${summary.query_suppressed_or_empty_url_count}
- Query rows captured: ${summary.query_row_count}
- CSV records written: ${summary.csv_record_count}

## Query-Backed URLs

${perUrl
  .filter((item) => item.query_rows_captured > 0)
  .map(
    (item) =>
      `- ${item.path}: ${item.query_rows.map((row) => `${row.query} (${row.impressions} impressions, position ${row.position})`).join("; ")}`,
  )
  .join("\n")}

## Empty Or Suppressed Query Tables

${perUrl
  .filter((item) => item.query_rows_captured === 0)
  .map(
    (item) =>
      `- ${item.path}: page impressions ${item.page_level_metrics.impressions}, average position ${item.page_level_metrics.average_position}`,
  )
  .join("\n")}

## Boundary

- No Search Console Request Indexing was run.
- No Search Queue enqueue, approve, submit, or external search API call was run.
- No CMS, frontend, sitemap, llms, or llms-full mutation was run.
- Empty query tables are treated as unavailable/suppressed evidence, not as proof of zero query demand.

## Next

${output.recommended_next_task}
`;

  await fs.writeFile(OUTPUT_JSON, `${JSON.stringify(output, null, 2)}\n`);
  await fs.writeFile(OUTPUT_MD, md);
  await fs.writeFile(OUTPUT_CSV, buildCsv(queryRowCsvRecords));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
