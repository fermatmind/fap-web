#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const GENERATED_DATE = getArgValue("--generated-date") ?? process.env.MBTI64_QUERY_DECISION_DATE ?? "2026-06-22";
const REVIEW_PATH = resolveRepoPath(
  getArgValue("--review") ?? "docs/seo/personality/mbti64-agent-visible-expansion-13-review-2026-06-22.json",
);
const QUERY_EXPORT_PATH = resolveRepoPath(
  getArgValue("--query-export") ??
    "docs/seo/personality/mbti64-seo-measurement-cohort-gsc-query-export-2026-06-22.json",
);
const QUERY_CSV_PATH = resolveRepoPath(
  getArgValue("--query-csv") ?? "docs/seo/personality/mbti64-gsc-query-export-2026-06-22.csv",
);
const RECOMMENDATIONS_PATH = resolveRepoPath(
  getArgValue("--recommendations") ?? "docs/seo/personality/mbti64-agent-expansion-88-recommendations-2026-06-21.json",
);
const QA_PATH = resolveRepoPath(getArgValue("--qa") ?? "docs/seo/personality/mbti64-agent-expansion-88-qa-2026-06-21.json");
const OUTPUT_JSON = resolveRepoPath(
  getArgValue("--output-json") ??
    `docs/seo/personality/mbti64-agent-visible-expansion-13-query-evidence-decision-${GENERATED_DATE}.json`,
);
const OUTPUT_MD = resolveRepoPath(
  getArgValue("--output-md") ??
    `docs/seo/personality/mbti64-agent-visible-expansion-13-query-evidence-decision-${GENERATED_DATE}.md`,
);
const OUTPUT_CSV = resolveRepoPath(
  getArgValue("--output-csv") ??
    `docs/seo/personality/mbti64-agent-visible-expansion-13-query-evidence-decision-${GENERATED_DATE}.csv`,
);

function getArgValue(name) {
  const prefix = `${name}=`;
  const found = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : null;
}

function resolveRepoPath(filePath) {
  return path.isAbsolute(filePath) ? filePath : path.join(ROOT, filePath);
}

const READY_PATHS = new Set(["/en/personality/enfj-a", "/zh/personality/intp-a", "/zh/personality/esfp-a"]);
const READY_DECISION = "READY_QUERY_BACKED_LOW_RISK_DRAFT_REVIEW";
const HOLD_DECISION = "HOLD_QUERY_EVIDENCE_SUPPRESSED";
const READY_NEXT_TASK = "MBTI64-CMS-PROJECTION-DRAFT-VISIBLE-3-DRY-RUN-01";
const HOLD_NEXT_TASK = "MBTI64-GSC-QUERY-API-OR-MANUAL-CSV-EXPORT-10-01";

function csvEscape(value) {
  const raw = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(raw)) return `"${raw.replaceAll('"', '""')}"`;
  return raw;
}

function parseCsv(text) {
  const rows = [];
  let current = "";
  let row = [];
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
      continue;
    }
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (char === "," && !quoted) {
      row.push(current);
      current = "";
      continue;
    }
    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(current);
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
      current = "";
      continue;
    }
    current += char;
  }

  row.push(current);
  if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  if (rows.length === 0) return [];
  const headers = rows[0].map((header) => header.trim());
  return rows.slice(1).map((cells) =>
    Object.fromEntries(headers.map((header, index) => [header, cells[index]?.trim() ?? ""])),
  );
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

function buildCsv(rows) {
  const headers = [
    "target_url",
    "path",
    "locale",
    "page_type",
    "mbti_type",
    "variant",
    "page_clicks",
    "page_impressions",
    "page_ctr",
    "page_average_position",
    "query_rows_captured",
    "query_terms",
    "decision",
    "allowed_next_action",
    "blocked_reason",
    "evidence_quality",
    "recommended_next_task",
  ];
  return `${[headers.join(","), ...rows.map((row) => headers.map((field) => csvEscape(row[field])).join(","))].join(
    "\n",
  )}\n`;
}

function recommendationByUrl(recommendations) {
  return new Map(recommendations.recommendations.map((record) => [record.target_url, record]));
}

function queryExportByUrl(queryExport) {
  return new Map(queryExport.per_url.map((record) => [record.target_url, record]));
}

function queryCsvByUrl(csvRows) {
  const map = new Map();
  for (const row of csvRows) {
    const existing = map.get(row.target_url) ?? [];
    existing.push(row);
    map.set(row.target_url, existing);
  }
  return map;
}

function makeDecision(page, queryRecord, csvRows, recommendation) {
  const queryRows = queryRecord?.query_rows ?? [];
  const hasQueryEvidence = queryRows.length > 0 && READY_PATHS.has(page.path);
  const decision = hasQueryEvidence ? READY_DECISION : HOLD_DECISION;
  return {
    target_url: page.target_url,
    path: page.path,
    page_type: page.page_type,
    locale: page.locale,
    mbti_type: page.mbti_type,
    variant: page.variant ?? null,
    page_level_gsc_metrics: queryRecord?.page_level_metrics ?? {
      clicks: page.gsc.clicks,
      impressions: page.gsc.impressions,
      ctr: page.gsc.ctr,
      average_position: page.gsc.average_position,
      source_kind: page.gsc.source_kind,
    },
    query_rows: queryRows,
    query_rows_captured: queryRows.length,
    query_csv_rows: csvRows,
    recommendation_lookup: {
      found: Boolean(recommendation),
      recommendation_id: recommendation?.recommendation_id ?? null,
      status: recommendation?.status ?? null,
      blocked_reason: recommendation?.blocked_reason ?? "missing_recommendation",
    },
    decision,
    allowed_next_action: hasQueryEvidence
      ? "include_in_visible_3_cms_projection_draft_dry_run_only"
      : "hold_until_gsc_api_or_manual_query_csv_available",
    blocked_reason: hasQueryEvidence ? null : "filtered_gsc_query_table_empty_or_suppressed",
    evidence_quality: hasQueryEvidence ? "query_backed_low_volume" : "page_level_only_query_suppressed",
    recommended_next_task: hasQueryEvidence ? READY_NEXT_TASK : HOLD_NEXT_TASK,
    no_direct_publish: true,
    no_direct_promotion: true,
    no_immediate_serp_rewrite: true,
  };
}

async function main() {
  const [review, queryExport, recommendations, qa, csvText] = await Promise.all([
    readJson(REVIEW_PATH),
    readJson(QUERY_EXPORT_PATH),
    readJson(RECOMMENDATIONS_PATH),
    readJson(QA_PATH),
    fs.readFile(QUERY_CSV_PATH, "utf8"),
  ]);

  const blockers = [];
  const warnings = [];
  if (review.final_decision !== "PASS_VISIBLE_EXPANSION_13_REVIEW_READY") {
    blockers.push(`visible_expansion_review_not_ready:${review.final_decision}`);
  }
  if (queryExport.final_decision !== "CONDITIONAL_PARTIAL_QUERY_EXPORT_CAPTURED") {
    blockers.push(`unexpected_query_export_decision:${queryExport.final_decision}`);
  }
  if (qa.final_decision !== "PASS_READY_FOR_CMS_DRAFT") {
    blockers.push(`qa_not_ready:${qa.final_decision}`);
  }

  const recommendationMap = recommendationByUrl(recommendations);
  const queryExportMap = queryExportByUrl(queryExport);
  const csvRows = parseCsv(csvText);
  const csvMap = queryCsvByUrl(csvRows);
  const decisions = review.reviewed_pages.map((page) =>
    makeDecision(page, queryExportMap.get(page.target_url), csvMap.get(page.target_url) ?? [], recommendationMap.get(page.target_url)),
  );

  const ready = decisions.filter((item) => item.decision === READY_DECISION);
  const held = decisions.filter((item) => item.decision === HOLD_DECISION);
  const readyPaths = new Set(ready.map((item) => item.path));
  const unexpectedReady = [...readyPaths].filter((pathValue) => !READY_PATHS.has(pathValue));
  const missingReady = [...READY_PATHS].filter((pathValue) => !readyPaths.has(pathValue));
  if (unexpectedReady.length > 0) blockers.push(`unexpected_ready_paths:${unexpectedReady.join("|")}`);
  if (missingReady.length > 0) blockers.push(`missing_ready_paths:${missingReady.join("|")}`);
  if (held.length > 0) warnings.push(`HELD_QUERY_SUPPRESSED_URLS_${held.length}`);

  const summary = {
    target_url_count: decisions.length,
    ready_query_backed_low_risk_draft_review_count: ready.length,
    hold_query_evidence_suppressed_count: held.length,
    query_rows_total: decisions.reduce((total, item) => total + item.query_rows_captured, 0),
    cms_writes_allowed: false,
    search_mutations_allowed: false,
    direct_publish_allowed: false,
    direct_promotion_allowed: false,
    immediate_serp_rewrite_allowed: false,
  };

  const finalDecision = blockers.length > 0
    ? "NO_GO_QUERY_EVIDENCE_DECISION_INVALID"
    : "PASS_VISIBLE_13_QUERY_EVIDENCE_DECISION_READY";

  const output = {
    artifact: "MBTI64-AGENT-VISIBLE-EXPANSION-13-QUERY-EVIDENCE-DECISION-01",
    generated_at: new Date().toISOString(),
    status: blockers.length > 0 ? "fail" : "pass",
    final_decision: finalDecision,
    input_artifacts: {
      visible_expansion_review: "docs/seo/personality/mbti64-agent-visible-expansion-13-review-2026-06-22.json",
      gsc_query_export:
        "docs/seo/personality/mbti64-seo-measurement-cohort-gsc-query-export-2026-06-22.json",
      gsc_query_csv: "docs/seo/personality/mbti64-gsc-query-export-2026-06-22.csv",
      recommendations: "docs/seo/personality/mbti64-agent-expansion-88-recommendations-2026-06-21.json",
      qa: "docs/seo/personality/mbti64-agent-expansion-88-qa-2026-06-21.json",
    },
    decision_policy: {
      ready_requires_visible_gsc_query_rows: true,
      empty_query_table_is_not_zero_demand: true,
      low_volume_query_evidence_only_allows_draft_review: true,
      direct_publish_or_promotion_allowed: false,
    },
    summary,
    ready_paths: ready.map((item) => item.path),
    held_paths: held.map((item) => item.path),
    decisions,
    blockers,
    warnings,
    recommended_next_tasks: {
      ready_query_backed_pages: READY_NEXT_TASK,
      held_query_suppressed_pages: HOLD_NEXT_TASK,
    },
  };

  const md = `# MBTI64 Visible 13 Query Evidence Decision

Generated: ${output.generated_at}

## Decision

${output.final_decision}

This is an artifact-only decision gate. It does not write CMS content, publish, promote, index, enqueue, approve, submit, or mutate sitemap/llms surfaces.

## Summary

- Target URLs: ${summary.target_url_count}
- Ready for low-risk CMS draft dry-run: ${summary.ready_query_backed_low_risk_draft_review_count}
- Held for GSC API/manual CSV query evidence: ${summary.hold_query_evidence_suppressed_count}
- Captured query rows: ${summary.query_rows_total}

## Ready Query-Backed Pages

${ready
  .map(
    (item) =>
      `- ${item.path}: ${item.query_rows
        .map((row) => `${row.query} (${row.impressions} impressions, position ${row.position})`)
        .join("; ")}`,
  )
  .join("\n")}

## Held Pages

${held
  .map(
    (item) =>
      `- ${item.path}: page impressions ${item.page_level_gsc_metrics.impressions}, average position ${item.page_level_gsc_metrics.average_position}; query table empty/suppressed`,
  )
  .join("\n")}

## Next

- Ready set: ${READY_NEXT_TASK}
- Held set: ${HOLD_NEXT_TASK}
`;

  const csvOutputRows = decisions.map((item) => ({
    target_url: item.target_url,
    path: item.path,
    locale: item.locale,
    page_type: item.page_type,
    mbti_type: item.mbti_type,
    variant: item.variant ?? "",
    page_clicks: item.page_level_gsc_metrics.clicks,
    page_impressions: item.page_level_gsc_metrics.impressions,
    page_ctr: item.page_level_gsc_metrics.ctr,
    page_average_position: item.page_level_gsc_metrics.average_position,
    query_rows_captured: item.query_rows_captured,
    query_terms: item.query_rows.map((row) => row.query).join("|"),
    decision: item.decision,
    allowed_next_action: item.allowed_next_action,
    blocked_reason: item.blocked_reason ?? "",
    evidence_quality: item.evidence_quality,
    recommended_next_task: item.recommended_next_task,
  }));

  await fs.writeFile(OUTPUT_JSON, `${JSON.stringify(output, null, 2)}\n`);
  await fs.writeFile(OUTPUT_MD, md);
  await fs.writeFile(OUTPUT_CSV, buildCsv(csvOutputRows));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
