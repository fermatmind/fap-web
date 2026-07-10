#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { csvEscape } from "./artifactSafety.mjs";

const ROOT = process.cwd();
const GENERATED_AT = "2026-07-04T10:05:00.000Z";
const GENERATED_DATE = "2026-07-04";

const INPUTS = {
  gscImport: "docs/seo/personality/mbti64-seo-measurement-cohort-gsc-import-2026-06-23.json",
  queryExport: "docs/seo/personality/mbti64-seo-measurement-cohort-gsc-query-export-2026-06-22.json",
  queryExportPacket: "docs/seo/personality/mbti64-gsc-query-api-or-manual-csv-export-10-2026-06-24.json",
  topProfileAssets: "docs/seo/personality/mbti-cms-04-top-profile-content-assets-2026-07-04.json",
  comparisonAssets: "docs/seo/personality/mbti-cms-06-comparison-content-assets-2026-07-04.json",
  discoverabilityAudit: "docs/seo/personality/mbti-seo-07-discoverability-audit-2026-07-04.json",
};

const OUT_JSON = `docs/seo/personality/mbti-ops-08-gsc-priority-monitoring-${GENERATED_DATE}.json`;
const OUT_MD = `docs/seo/personality/mbti-ops-08-gsc-priority-monitoring-${GENERATED_DATE}.md`;
const OUT_CSV = `docs/seo/personality/mbti-ops-08-gsc-priority-monitoring-${GENERATED_DATE}.csv`;

const SEED_QUERY_OPPORTUNITIES = [
  { query: "mbti测试", page_hint: "/zh/tests/mbti-personality-test-16-personality-types", source: "operator_gsc_28d_summary" },
  { query: "mbti免费测试", page_hint: "/zh/tests/mbti-personality-test-16-personality-types", source: "operator_gsc_28d_summary" },
  { query: "16型人格测试", page_hint: "/zh/tests/mbti-personality-test-16-personality-types", source: "operator_gsc_28d_summary" },
  { query: "istp-a", page_hint: "/zh/personality/istp-a", source: "operator_gsc_28d_summary" },
  { query: "intp a", page_hint: "/zh/personality/intp-a", source: "operator_gsc_28d_summary" },
  { query: "istj-a人格", page_hint: "/zh/personality/istj-a", source: "operator_gsc_28d_summary" },
];

const ACCEPTED_PROFILE_ASSET_DECISIONS = new Set([
  "PASS_MBTI_TOP_PROFILE_CONTENT_ASSET_PACKAGE_READY",
  "PASS_NON_PRODUCTION_CONTENT_ASSET_PACKAGE_READY_FOR_CMS_REVIEW",
]);

const ACCEPTED_COMPARISON_ASSET_DECISIONS = new Set([
  "PASS_MBTI_COMPARISON_CONTENT_ASSET_PACKAGE_READY",
  "PASS_NON_PRODUCTION_COMPARISON_CONTENT_ASSET_PACKAGE_READY_FOR_CMS_REVIEW",
]);

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function writeText(relativePath, value) {
  fs.mkdirSync(path.dirname(path.join(ROOT, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, relativePath), value);
}

function pageScore(record) {
  const gsc = record.gsc ?? {};
  const impressions = Number(gsc.impressions ?? 0);
  const clicks = Number(gsc.clicks ?? 0);
  const ctr = Number(gsc.ctr ?? 0);
  const position = Number(gsc.average_position ?? 100);
  const visibleBoost = gsc.status === "GSC_IMPORTED" ? 20 : 0;
  const lowCtrBoost = impressions > 0 && ctr < 0.01 ? 8 : 0;
  const positionBoost = position > 0 && position <= 20 ? 12 : position > 0 && position <= 40 ? 6 : 0;
  const zeroClickBoost = impressions > 0 && clicks === 0 ? 4 : 0;
  return Number((impressions * 1.5 + clicks * 20 + visibleBoost + lowCtrBoost + positionBoost + zeroClickBoost).toFixed(3));
}

function normalizePageType(value) {
  if (value === "at_comparison" || value === "hot_comparison") return "comparison";
  return value;
}

function buildGscRow(record, source = "gsc_import") {
  const gsc = record.gsc ?? {};
  return {
    target_url: record.url ?? record.target_url,
    path: record.path,
    locale: record.locale,
    page_type: normalizePageType(record.page_type),
    mbti_type: record.mbti_type ?? null,
    variant: record.variant ?? null,
    clicks: gsc.clicks,
    impressions: gsc.impressions,
    ctr: gsc.ctr,
    average_position: gsc.average_position,
    gsc_status: gsc.status ?? "GSC_IMPORTED_NO_ROW_FOR_URL",
    opportunity_tier: record.opportunity?.tier ?? "PENDING_CLASSIFICATION",
    priority_score: pageScore(record),
    query_rows_captured: Array.isArray(gsc.queries) ? gsc.queries.length : 0,
    source,
  };
}

function rankRows(rows) {
  return [...rows].sort((a, b) => {
    if ((b.priority_score ?? 0) !== (a.priority_score ?? 0)) return (b.priority_score ?? 0) - (a.priority_score ?? 0);
    if ((b.impressions ?? 0) !== (a.impressions ?? 0)) return (b.impressions ?? 0) - (a.impressions ?? 0);
    return String(a.path).localeCompare(String(b.path));
  });
}

function enrichFromAsset(asset, recordsByPath, rankOffset) {
  const existing = recordsByPath.get(asset.path);
  if (existing) return existing;
  return {
    target_url: asset.target_url,
    path: asset.path,
    locale: asset.locale,
    page_type: normalizePageType(asset.page_type),
    mbti_type: asset.mbti_type ?? asset.comparison_pair?.left?.replace(/-.+$/, "") ?? null,
    variant: asset.variant ?? null,
    clicks: null,
    impressions: null,
    ctr: null,
    average_position: null,
    gsc_status: "GSC_IMPORTED_NO_ROW_FOR_URL",
    opportunity_tier: "P3_NO_GSC_VISIBILITY_YET",
    priority_score: Number((rankOffset / 100).toFixed(3)),
    query_rows_captured: 0,
    source: "cms_asset_backlog_no_gsc_row",
  };
}

function buildTopPages({ gscImport, topProfileAssets, comparisonAssets }) {
  const recordsByPath = new Map(gscImport.records.map((record) => [record.path, buildGscRow(record)]));
  const profileRows = rankRows(
    topProfileAssets.assets.map((asset, index) => enrichFromAsset(asset, recordsByPath, topProfileAssets.assets.length - index)),
  ).slice(0, 10);
  const comparisonRows = rankRows(
    comparisonAssets.assets.map((asset, index) =>
      enrichFromAsset(asset, recordsByPath, comparisonAssets.assets.length - index),
    ),
  ).slice(0, 10);
  const allRows = rankRows([...recordsByPath.values()]).slice(0, 20);

  return {
    top_pages_all: allRows,
    top_10_profile_pages: profileRows,
    top_10_comparison_pages: comparisonRows,
  };
}

function buildTopQueries({ queryExport, queryExportPacket }) {
  const capturedRows = [];
  for (const page of queryExport.per_url ?? []) {
    for (const row of page.query_rows ?? []) {
      capturedRows.push({
        query: row.query,
        path: page.path,
        page_type: normalizePageType(page.page_type),
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position,
        evidence_status: "captured_query_row",
        next_action: "use_for_snippet_and_answer_block_review",
        source: "gsc_query_export_2026_06_22",
      });
    }
  }

  const pendingRows = (queryExportPacket.targets ?? []).slice(0, 10).map((target) => ({
    query: null,
    path: target.path,
    page_type: normalizePageType(target.page_type),
    clicks: null,
    impressions: target.current_waitlist_row?.impressions ?? null,
    ctr: null,
    position: target.current_waitlist_row?.average_position ?? null,
    evidence_status: "pending_manual_or_api_query_export",
    next_action: "export_filtered_gsc_query_rows_before_copy_rewrite",
    source: "gsc_query_export_packet_2026_06_24",
  }));

  const seedRows = SEED_QUERY_OPPORTUNITIES.map((seed) => ({
    query: seed.query,
    path: seed.page_hint,
    page_type: seed.page_hint.includes("-vs-") ? "comparison" : seed.page_hint.includes("/tests/") ? "test" : "variant",
    clicks: null,
    impressions: null,
    ctr: null,
    position: null,
    evidence_status: "operator_28d_summary_seed_requires_export",
    next_action: "confirm_in_next_gsc_query_export_before_final_prioritization",
    source: seed.source,
  }));

  return [...capturedRows, ...pendingRows, ...seedRows].slice(0, 25);
}

function buildExecutionQueue(topPages) {
  return {
    next_profile_content_queue: topPages.top_10_profile_pages.map((row, index) => ({
      rank: index + 1,
      path: row.path,
      reason: row.gsc_status === "GSC_IMPORTED" ? "visible_28d_gsc_row" : "top_profile_asset_backlog_no_gsc_row_yet",
      action: "refresh_or_verify_answer_block_faq_at_difference_internal_links_via_cms_asset",
    })),
    next_comparison_content_queue: topPages.top_10_comparison_pages.map((row, index) => ({
      rank: index + 1,
      path: row.path,
      reason: row.gsc_status === "GSC_IMPORTED" ? "visible_28d_gsc_row" : "comparison_asset_backlog_no_gsc_row_yet",
      action: "refresh_or_verify_max_difference_quick_table_misread_scenarios_faq_via_cms_asset",
    })),
  };
}

function buildMarkdown(output) {
  const pageTable = (rows) => [
    "| Rank | Path | Type | Clicks | Impressions | CTR | Position | Evidence | Next action |",
    "| --- | --- | --- | ---: | ---: | ---: | ---: | --- | --- |",
    ...rows.map(
      (row, index) =>
        `| ${index + 1} | \`${row.path}\` | ${row.page_type} | ${row.clicks ?? ""} | ${row.impressions ?? ""} | ${
          row.ctr ?? ""
        } | ${row.average_position ?? ""} | ${row.gsc_status} | ${
          row.gsc_status === "GSC_IMPORTED"
            ? "review CTR/query fit"
            : "wait for verified query/page export before rewriting"
        } |`,
    ),
  ].join("\n");

  const queryTable = [
    "| Query | Path | Evidence | Impressions | Position | Next action |",
    "| --- | --- | --- | ---: | ---: | --- |",
    ...output.top_queries.map(
      (row) =>
        `| ${row.query ? `\`${row.query}\`` : "_pending export_"} | \`${row.path}\` | ${row.evidence_status} | ${
          row.impressions ?? ""
        } | ${row.position ?? ""} | ${row.next_action} |`,
    ),
  ].join("\n");

  return [
    "# MBTI-OPS-08 GSC Priority Monitoring",
    "",
    `Generated at: ${output.generated_at}`,
    "",
    "## Decision",
    "",
    `- Final decision: ${output.final_decision}`,
    `- GSC source window: ${output.gsc_window}`,
    `- Profile queue size: ${output.top_pages.top_10_profile_pages.length}`,
    `- Comparison queue size: ${output.top_pages.top_10_comparison_pages.length}`,
    `- Query tracking rows: ${output.top_queries.length}`,
    "",
    "## Top 10 Personality Pages",
    "",
    pageTable(output.top_pages.top_10_profile_pages),
    "",
    "## Top 10 Comparison Pages",
    "",
    pageTable(output.top_pages.top_10_comparison_pages),
    "",
    "## Top Queries And Query Evidence Queue",
    "",
    queryTable,
    "",
    "## Safety Boundary",
    "",
    "- CMS writes/imports: no",
    "- Production deploy: no",
    "- Frontend runtime renderer changes: no",
    "- Sitemap/llms URL expansion: no",
    "- Missing query rows are treated as suppressed or pending evidence, not zero demand.",
    "",
  ].join("\n");
}

function buildCsv(output) {
  const rows = [
    ["section", "rank", "path", "page_type", "query", "clicks", "impressions", "ctr", "position", "evidence", "next_action"],
  ];

  for (const [section, pages] of [
    ["top_profile_pages", output.top_pages.top_10_profile_pages],
    ["top_comparison_pages", output.top_pages.top_10_comparison_pages],
  ]) {
    pages.forEach((row, index) => {
      rows.push([
        section,
        index + 1,
        row.path,
        row.page_type,
        "",
        row.clicks ?? "",
        row.impressions ?? "",
        row.ctr ?? "",
        row.average_position ?? "",
        row.gsc_status,
        row.gsc_status === "GSC_IMPORTED"
          ? "review_ctr_query_fit"
          : "wait_for_verified_gsc_export_before_rewrite",
      ]);
    });
  }

  output.top_queries.forEach((row, index) => {
    rows.push([
      "top_queries",
      index + 1,
      row.path,
      row.page_type,
      row.query ?? "",
      row.clicks ?? "",
      row.impressions ?? "",
      row.ctr ?? "",
      row.position ?? "",
      row.evidence_status,
      row.next_action,
    ]);
  });

  return `${rows.map((row) => row.map((value) => csvEscape(value, { quoteAlways: false })).join(",")).join("\n")}\n`;
}

function main() {
  const gscImport = readJson(INPUTS.gscImport);
  const queryExport = readJson(INPUTS.queryExport);
  const queryExportPacket = readJson(INPUTS.queryExportPacket);
  const topProfileAssets = readJson(INPUTS.topProfileAssets);
  const comparisonAssets = readJson(INPUTS.comparisonAssets);
  const discoverabilityAudit = readJson(INPUTS.discoverabilityAudit);

  const blockers = [];
  if (gscImport.final_decision !== "PASS_GSC_IMPORTED_PRIORITY_READY") {
    blockers.push(`gsc_import_not_ready:${gscImport.final_decision}`);
  }
  if (!ACCEPTED_PROFILE_ASSET_DECISIONS.has(topProfileAssets.final_decision)) {
    blockers.push(`top_profile_assets_not_ready:${topProfileAssets.final_decision}`);
  }
  if (!ACCEPTED_COMPARISON_ASSET_DECISIONS.has(comparisonAssets.final_decision)) {
    blockers.push(`comparison_assets_not_ready:${comparisonAssets.final_decision}`);
  }
  if (discoverabilityAudit.scope?.runtime_url_expansion !== false) {
    blockers.push("discoverability_audit_runtime_expansion_not_closed");
  }

  const topPages = buildTopPages({ gscImport, topProfileAssets, comparisonAssets });
  const topQueries = buildTopQueries({ queryExport, queryExportPacket });
  const executionQueue = buildExecutionQueue(topPages);

  const output = {
    id: "MBTI-OPS-08",
    title: "MBTI-OPS-08: add MBTI GSC priority monitoring",
    generated_at: GENERATED_AT,
    status: blockers.length === 0 ? "ready" : "blocked",
    final_decision: blockers.length === 0 ? "PASS_MBTI_OPS_08_GSC_PRIORITY_MONITORING_READY" : "NO_GO_BLOCKED_INPUTS",
    gsc_window: "28d repository GSC measurement cohort, imported 2026-06-23",
    input_artifacts: INPUTS,
    summary: {
      gsc_records_total: gscImport.records.length,
      gsc_visible_rows: gscImport.summary.with_gsc_rows,
      query_rows_captured: queryExport.summary.query_row_count,
      query_export_pending_urls: queryExportPacket.target_url_count,
      top_profile_pages: topPages.top_10_profile_pages.length,
      top_comparison_pages: topPages.top_10_comparison_pages.length,
      operator_seed_queries: SEED_QUERY_OPPORTUNITIES.length,
    },
    top_pages: topPages,
    top_queries: topQueries,
    execution_queue: executionQueue,
    safety_boundary: {
      gsc_api_call_attempted: false,
      gsc_request_indexing_attempted: false,
      cms_write_attempted: false,
      production_import_attempted: false,
      production_deploy_attempted: false,
      frontend_runtime_change_attempted: false,
      sitemap_llms_mutation_attempted: false,
      missing_query_rows_treated_as_zero_demand: false,
    },
    blockers,
    recommended_next_review:
      "Use this artifact as the weekly MBTI Top pages/queries queue; refresh only after a verified GSC CSV/API export is available.",
  };

  writeText(OUT_JSON, `${JSON.stringify(output, null, 2)}\n`);
  writeText(OUT_MD, buildMarkdown(output));
  writeText(OUT_CSV, buildCsv(output));

  console.log(`wrote ${OUT_JSON}`);
  console.log(`wrote ${OUT_MD}`);
  console.log(`wrote ${OUT_CSV}`);
}

main();
