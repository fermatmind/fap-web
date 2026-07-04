#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const GENERATED_AT = getArgValue("--generated-at") ?? "2026-07-04T20:20:00.000Z";
const OPS08_PATH = resolveRepoPath(
  getArgValue("--ops08") ?? "docs/seo/personality/mbti-ops-08-gsc-priority-monitoring-2026-07-04.json",
);
const QUERY_EXPORT_PATH = resolveRepoPath(
  getArgValue("--query-export") ??
    "docs/seo/personality/mbti64-seo-measurement-cohort-gsc-query-export-2026-06-22.json",
);
const QUERY_PACKET_PATH = resolveRepoPath(
  getArgValue("--query-packet") ??
    "docs/seo/personality/mbti64-gsc-query-api-or-manual-csv-export-10-2026-06-24.json",
);
const OUTPUT_JSON = resolveRepoPath(
  getArgValue("--output-json") ??
    "docs/seo/personality/mbti-gsc-11-query-evidence-export-2026-07-04.json",
);
const OUTPUT_CSV = resolveRepoPath(
  getArgValue("--output-csv") ??
    "docs/seo/personality/mbti-gsc-11-query-evidence-export-2026-07-04.csv",
);
const OUTPUT_MD = resolveRepoPath(
  getArgValue("--output-md") ??
    "docs/seo/personality/mbti-gsc-11-query-evidence-export-2026-07-04.md",
);

const CSV_COLUMNS = [
  "path",
  "target_url",
  "locale",
  "page_type",
  "query",
  "query_status",
  "clicks",
  "impressions",
  "ctr",
  "position",
  "source",
  "next_action",
];

function getArgValue(name) {
  const prefix = `${name}=`;
  const found = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : null;
}

function resolveRepoPath(filePath) {
  return path.isAbsolute(filePath) ? filePath : path.join(ROOT, filePath);
}

function rel(filePath) {
  return path.relative(ROOT, filePath);
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

function normalizeLocale(locale) {
  if (locale === "zh-CN") return "zh";
  return locale ?? null;
}

function pathLocale(pagePath) {
  if (pagePath.startsWith("/zh/")) return "zh";
  if (pagePath.startsWith("/en/")) return "en";
  return null;
}

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  return `"${String(value).replaceAll('"', '""')}"`;
}

function toCsv(rows) {
  const lines = [CSV_COLUMNS.join(",")];
  for (const row of rows) {
    lines.push(CSV_COLUMNS.map((column) => csvEscape(row[column])).join(","));
  }
  return `${lines.join("\n")}\n`;
}

function slugTargetUrl(pagePath) {
  return `https://fermatmind.com${pagePath}`;
}

function targetByPath(targets) {
  return new Map(targets.map((target) => [target.path, target]));
}

function buildCapturedRows(queryExport) {
  return (queryExport.per_url ?? [])
    .filter((row) => row.query_rows_captured > 0)
    .flatMap((row) =>
      row.query_rows.map((queryRow) => ({
        path: row.path,
        target_url: row.target_url,
        locale: normalizeLocale(row.locale),
        page_type: row.page_type,
        query: queryRow.query,
        query_status: "captured_query_row",
        clicks: queryRow.clicks,
        impressions: queryRow.impressions,
        ctr: queryRow.ctr,
        position: queryRow.position,
        source: "mbti64-seo-measurement-cohort-gsc-query-export-2026-06-22",
        next_action: "eligible_for_title_faq_answer_block_review",
      })),
    );
}

function buildPendingRows(ops08, queryPacket) {
  const packetTargets = targetByPath(queryPacket.targets ?? []);
  return (ops08.top_queries ?? [])
    .filter((row) => row.evidence_status === "pending_manual_or_api_query_export")
    .map((row) => {
      const target = packetTargets.get(row.path);
      return {
        path: row.path,
        target_url: target?.target_url ?? slugTargetUrl(row.path),
        locale: normalizeLocale(target?.locale) ?? pathLocale(row.path),
        page_type: row.page_type,
        query: null,
        query_status: "pending_manual_or_api_query_export",
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position,
        source: "mbti64-gsc-query-api-or-manual-csv-export-10-2026-06-24",
        next_action: "export_filtered_page_query_rows_before_serp_copy_rewrite",
        gsc_api_request_template: target?.gsc_api_request_template ?? null,
      };
    });
}

function buildOperatorSeedRows(ops08) {
  return (ops08.top_queries ?? [])
    .filter((row) => row.evidence_status === "operator_28d_summary_seed_requires_export")
    .map((row) => ({
      path: row.path,
      target_url: slugTargetUrl(row.path),
      locale: pathLocale(row.path),
      page_type: row.page_type,
      query: row.query,
      query_status: "operator_seed_requires_gsc_confirmation",
      clicks: null,
      impressions: null,
      ctr: null,
      position: null,
      source: "operator_gsc_28d_summary_seed",
      next_action: "confirm_query_metrics_in_next_manual_csv_or_api_export",
    }));
}

function buildImportTemplateRows(pendingRows, operatorSeedRows) {
  return [...pendingRows, ...operatorSeedRows].map((row) => ({
    target_url: row.target_url,
    path: row.path,
    query: row.query ?? "",
    clicks: "",
    impressions: "",
    ctr: "",
    position: "",
    date_range: "YYYY-MM-DD..YYYY-MM-DD",
    source: "gsc_manual_csv_or_api",
    exported_at: "YYYY-MM-DDTHH:mm:ssZ",
    expected_status_after_import: "gsc_query_verified",
  }));
}

function toImportCsv(rows) {
  const headers = [
    "target_url",
    "path",
    "query",
    "clicks",
    "impressions",
    "ctr",
    "position",
    "date_range",
    "source",
    "exported_at",
    "expected_status_after_import",
  ];
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape(row[header])).join(","));
  }
  return `${lines.join("\n")}\n`;
}

async function main() {
  const [ops08, queryExport, queryPacket] = await Promise.all([
    readJson(OPS08_PATH),
    readJson(QUERY_EXPORT_PATH),
    readJson(QUERY_PACKET_PATH),
  ]);

  const blockers = [];
  if (ops08.final_decision !== "PASS_MBTI_OPS_08_GSC_PRIORITY_MONITORING_READY") {
    blockers.push(`ops08_not_ready:${ops08.final_decision}`);
  }
  if (queryExport.final_decision !== "CONDITIONAL_PARTIAL_QUERY_EXPORT_CAPTURED") {
    blockers.push(`query_export_unexpected:${queryExport.final_decision}`);
  }
  if (queryPacket.final_decision !== "READY_FOR_MANUAL_CSV_OR_GSC_API_QUERY_EXPORT_10") {
    blockers.push(`query_packet_unexpected:${queryPacket.final_decision}`);
  }

  const capturedRows = buildCapturedRows(queryExport);
  const pendingRows = buildPendingRows(ops08, queryPacket);
  const operatorSeedRows = buildOperatorSeedRows(ops08);
  const normalizedRows = [...capturedRows, ...pendingRows, ...operatorSeedRows];
  const importTemplateRows = buildImportTemplateRows(pendingRows, operatorSeedRows);

  if (capturedRows.length !== 3) blockers.push(`expected_3_captured_rows_found_${capturedRows.length}`);
  if (pendingRows.length !== 10) blockers.push(`expected_10_pending_rows_found_${pendingRows.length}`);
  if (operatorSeedRows.length !== 6) blockers.push(`expected_6_operator_seed_rows_found_${operatorSeedRows.length}`);

  const output = {
    artifact: "MBTI-GSC-11-QUERY-EVIDENCE-EXPORT",
    generated_at: GENERATED_AT,
    status: blockers.length === 0 ? "ready" : "blocked",
    final_decision:
      blockers.length === 0
        ? "PASS_MBTI_GSC_11_QUERY_EVIDENCE_EXPORT_READY"
        : "NO_GO_MBTI_GSC_11_QUERY_EVIDENCE_EXPORT_BLOCKED",
    input_artifacts: {
      ops08: rel(OPS08_PATH),
      query_export: rel(QUERY_EXPORT_PATH),
      query_packet: rel(QUERY_PACKET_PATH),
    },
    summary: {
      normalized_query_tracking_rows: normalizedRows.length,
      captured_query_rows: capturedRows.length,
      pending_manual_or_api_query_export_rows: pendingRows.length,
      operator_seed_requires_confirmation_rows: operatorSeedRows.length,
      import_template_rows: importTemplateRows.length,
      profile_queue_size: ops08.execution_queue?.next_profile_content_queue?.length ?? 0,
      comparison_queue_size: ops08.execution_queue?.next_comparison_content_queue?.length ?? 0,
    },
    evidence_policy: {
      captured_query_rows_can_inform_title_faq_answer_block: true,
      pending_rows_cannot_inform_serp_copy_until_imported: true,
      operator_seed_queries_require_gsc_metric_confirmation: true,
      missing_query_rows_are_not_zero_demand: true,
      frontend_editorial_fallback_allowed: false,
    },
    normalized_rows: normalizedRows,
    import_template: {
      columns: [
        "target_url",
        "path",
        "query",
        "clicks",
        "impressions",
        "ctr",
        "position",
        "date_range",
        "source",
        "exported_at",
        "expected_status_after_import",
      ],
      rows: importTemplateRows,
    },
    safety_boundary: {
      gsc_api_call_attempted: false,
      gsc_request_indexing_attempted: false,
      search_submit_attempted: false,
      search_queue_mutation_attempted: false,
      cms_write_attempted: false,
      production_import_attempted: false,
      production_deploy_attempted: false,
      frontend_runtime_change_attempted: false,
      sitemap_llms_mutation_attempted: false,
    },
    next_gates: {
      MBTI_CMS_12:
        "Use only captured or imported query-verified rows for profile title, FAQ, and answer-block revisions.",
      MBTI_CMS_13:
        "Use only captured or imported query-verified rows for comparison max-difference, FAQ, and snippet revisions.",
      MBTI_QA_14:
        "Fail duplicate-looking pages when query evidence is pending but copy changes claim query fit.",
    },
    blockers,
  };

  const md = [
    "# MBTI-GSC-11 Query Evidence Export",
    "",
    `Generated at: ${output.generated_at}`,
    "",
    "## Decision",
    "",
    `- Final decision: ${output.final_decision}`,
    `- Captured query rows: ${output.summary.captured_query_rows}`,
    `- Pending manual/API export rows: ${output.summary.pending_manual_or_api_query_export_rows}`,
    `- Operator seed rows requiring confirmation: ${output.summary.operator_seed_requires_confirmation_rows}`,
    "",
    "## Rules",
    "",
    "- Captured query rows may inform later title, FAQ, and answer-block review.",
    "- Pending rows must not drive SERP copy rewrites until imported from a filtered GSC page/query export.",
    "- Operator seed queries are tracking hints until confirmed with metrics.",
    "- Missing query rows are not treated as zero demand.",
    "- No GSC API call, Search Console mutation, CMS write, frontend runtime change, sitemap change, llms change, or deploy was attempted.",
    "",
    "## Rows",
    "",
    "| Path | Query | Status | Impressions | Position | Next action |",
    "| --- | --- | --- | ---: | ---: | --- |",
    ...normalizedRows.map(
      (row) =>
        `| \`${row.path}\` | ${row.query ? `\`${row.query}\`` : "_pending_"} | ${row.query_status} | ${row.impressions ?? ""} | ${row.position ?? ""} | ${row.next_action} |`,
    ),
    "",
    "## Import Template",
    "",
    "- Use the JSON `import_template.rows` or CSV rows as the handoff shape for a future manual/API GSC query import.",
    "- Leave pending rows untouched until the operator provides query/click/impression/CTR/position metrics.",
  ].join("\n");

  await fs.mkdir(path.dirname(OUTPUT_JSON), { recursive: true });
  await fs.writeFile(OUTPUT_JSON, `${JSON.stringify(output, null, 2)}\n`);
  await fs.writeFile(OUTPUT_CSV, toCsv(normalizedRows));
  await fs.writeFile(OUTPUT_MD, `${md}\n`);
  await fs.writeFile(
    resolveRepoPath("docs/seo/personality/mbti-gsc-11-query-evidence-import-template-2026-07-04.csv"),
    toImportCsv(importTemplateRows),
  );

  if (blockers.length > 0) {
    console.error(blockers.join("\n"));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
