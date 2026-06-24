#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const GENERATED_DATE = getArgValue("--generated-date") ?? process.env.MBTI64_GSC_QUERY_EXPORT_DATE ?? "2026-06-24";
const QUERY_DECISION_PATH = resolveRepoPath(
  getArgValue("--query-decision") ??
    "docs/seo/personality/mbti64-agent-visible-expansion-13-query-evidence-decision-2026-06-23.json",
);
const RERUN_LOOP_PATH = resolveRepoPath(
  getArgValue("--rerun-loop") ?? "docs/seo/personality/mbti64-agent-recommendation-rerun-loop-2026-06-23.json",
);
const OUTPUT_JSON = resolveRepoPath(
  getArgValue("--output-json") ??
    `docs/seo/personality/mbti64-gsc-query-api-or-manual-csv-export-10-${GENERATED_DATE}.json`,
);
const OUTPUT_MD = resolveRepoPath(
  getArgValue("--output-md") ??
    `docs/seo/personality/mbti64-gsc-query-api-or-manual-csv-export-10-${GENERATED_DATE}.md`,
);
const OUTPUT_CSV = resolveRepoPath(
  getArgValue("--output-csv") ??
    `docs/seo/personality/mbti64-gsc-query-api-or-manual-csv-export-10-${GENERATED_DATE}.csv`,
);

const REQUIRED_COLUMNS = [
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

function assertPublicMbti64Path(pathname) {
  if (!/^\/(?:en|zh)\/personality\/[a-z]{4}-(?:a|t)(?:-vs-[a-z]{4}-(?:a|t))?$/i.test(pathname)) {
    throw new Error(`unexpected held MBTI64 path: ${pathname}`);
  }
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

function gscUiUrl(targetUrl) {
  const base = new URL("https://search.google.com/search-console/performance/search-analytics");
  base.searchParams.set("resource_id", "sc-domain:fermatmind.com");
  base.searchParams.set("time_granularity", "HOUR");
  base.searchParams.set("breakdown", "query");
  base.searchParams.set("metrics", "CLICKS,IMPRESSIONS,CTR,POSITION");
  base.searchParams.set("last_24_hours", "true");
  return base.toString();
}

function apiRequestTemplate(targetUrl) {
  return {
    siteUrl: "sc-domain:fermatmind.com",
    request: {
      startDate: "YYYY-MM-DD",
      endDate: "YYYY-MM-DD",
      dimensions: ["page", "query"],
      dimensionFilterGroups: [
        {
          filters: [
            {
              dimension: "page",
              operator: "equals",
              expression: targetUrl,
            },
          ],
        },
      ],
      rowLimit: 250,
      startRow: 0,
    },
  };
}

async function main() {
  const [queryDecision, rerunLoop] = await Promise.all([readJson(QUERY_DECISION_PATH), readJson(RERUN_LOOP_PATH)]);
  const heldPaths = queryDecision.held_paths ?? [];
  const waitlist = rerunLoop.query_evidence_waitlist ?? [];
  const blockers = [];
  const warnings = [];

  if (queryDecision.final_decision !== "PASS_VISIBLE_13_QUERY_EVIDENCE_DECISION_READY") {
    blockers.push(`query_decision_not_ready:${queryDecision.final_decision}`);
  }
  if (rerunLoop.final_decision !== "PASS_RECOMMENDATION_RERUN_LOOP_READY") {
    blockers.push(`rerun_loop_not_ready:${rerunLoop.final_decision}`);
  }
  if (heldPaths.length !== 10) {
    blockers.push(`expected_10_held_paths_found_${heldPaths.length}`);
  }
  if (waitlist.length !== 10) {
    blockers.push(`expected_10_waitlist_rows_found_${waitlist.length}`);
  }

  const byPath = new Map(waitlist.map((row) => [row.path, row]));
  const targets = heldPaths.map((pathname, index) => {
    assertPublicMbti64Path(pathname);
    const targetUrl = `https://fermatmind.com${pathname}`;
    const waitlistRow = byPath.get(pathname) ?? null;
    if (!waitlistRow) blockers.push(`missing_waitlist_row:${pathname}`);
    return {
      position: index + 1,
      target_url: targetUrl,
      path: pathname,
      locale: pathname.startsWith("/zh/") ? "zh-CN" : "en",
      page_type: pathname.includes("-vs-") ? "comparison" : "variant",
      previous_decision: "HOLD_QUERY_EVIDENCE_SUPPRESSED",
      query_evidence_status: "pending_export",
      allowed_next_action: "manual_csv_or_gsc_api_query_export_only",
      blocked_reason: "query_table_suppressed_or_unavailable",
      gsc_ui_export_url: gscUiUrl(targetUrl),
      gsc_ui_filter_instruction: `Open Performance > Queries, add Page filter equals ${targetUrl}, export rows with query/clicks/impressions/ctr/position.`,
      gsc_api_request_template: apiRequestTemplate(targetUrl),
      current_waitlist_row: waitlistRow,
    };
  });

  const csvTemplateRows = [
    REQUIRED_COLUMNS,
    ...targets.map((target) => [
      target.target_url,
      target.path,
      "",
      "",
      "",
      "",
      "",
      "YYYY-MM-DD..YYYY-MM-DD",
      "gsc_manual_csv_or_api",
      "YYYY-MM-DDTHH:mm:ssZ",
    ]),
  ];
  const csv = `${csvTemplateRows.map((row) => row.map(csvEscape).join(",")).join("\n")}\n`;

  warnings.push("query_rows_not_exported_by_codex_browser_session");
  warnings.push("empty_query_tables_must_be_recorded_as suppressed_not_zero_demand");

  const output = {
    artifact: "MBTI64-GSC-QUERY-API-OR-MANUAL-CSV-EXPORT-10-01",
    generated_at: new Date().toISOString(),
    status: blockers.length === 0 ? "ready_for_external_query_export" : "blocked",
    final_decision:
      blockers.length === 0 ? "READY_FOR_MANUAL_CSV_OR_GSC_API_QUERY_EXPORT_10" : "NO_GO_EXPORT_PACKET_BLOCKED",
    input_artifacts: {
      query_decision: rel(QUERY_DECISION_PATH),
      rerun_loop: rel(RERUN_LOOP_PATH),
    },
    target_url_count: targets.length,
    required_csv_columns: REQUIRED_COLUMNS,
    targets,
    import_contract: {
      expected_next_input: "GSC query-level CSV or Search Analytics API response for the 10 target URLs",
      required_columns: REQUIRED_COLUMNS,
      follow_up_import_task: "MBTI64-GSC-QUERY-EVIDENCE-IMPORT-10-01",
      do_not_treat_missing_rows_as_zero_demand: true,
    },
    safety_boundary: {
      docs_script_only: true,
      gsc_request_indexing_attempted: false,
      search_submit_attempted: false,
      search_queue_mutation_attempted: false,
      cms_write_attempted: false,
      publish_attempted: false,
      sitemap_llms_mutation_attempted: false,
      frontend_runtime_change_attempted: false,
    },
    blockers,
    warnings,
    recommended_next_task:
      blockers.length === 0
        ? "MBTI64-GSC-QUERY-EVIDENCE-IMPORT-10-01 after manual CSV/API data is available"
        : "MBTI64-GSC-QUERY-API-OR-MANUAL-CSV-EXPORT-10-REPAIR-01",
  };

  const md = [
    "# MBTI64 GSC Query API or Manual CSV Export 10",
    "",
    `Generated at: ${output.generated_at}`,
    "",
    "## Decision",
    "",
    `- Status: ${output.status}`,
    `- Final decision: ${output.final_decision}`,
    `- Target URLs: ${output.target_url_count}`,
    `- Recommended next task: ${output.recommended_next_task}`,
    "",
    "## Target URLs",
    "",
    "| Path | Locale | Page type | Evidence status |",
    "| --- | --- | --- | --- |",
    ...targets.map(
      (target) =>
        `| \`${target.path}\` | ${target.locale} | ${target.page_type} | ${target.query_evidence_status} |`,
    ),
    "",
    "## Required CSV Columns",
    "",
    `\`${REQUIRED_COLUMNS.join("`, `")}\``,
    "",
    "## Operator Export Steps",
    "",
    "1. In Google Search Console, open Performance.",
    "2. Use the same date range as the measurement cohort or a clearly labeled fresh date range.",
    "3. For each target URL, add a Page filter with exact canonical URL equality.",
    "4. Keep the table on Queries.",
    "5. Export query rows with clicks, impressions, CTR, and position.",
    "6. Fill the CSV template generated by this packet.",
    "7. Run the follow-up import gate; do not infer missing query rows as zero demand.",
    "",
    "## Safety Boundary",
    "",
    "- No GSC Request Indexing.",
    "- No search submit.",
    "- No Search Queue mutation.",
    "- No CMS write, publish, sitemap/llms mutation, deploy, or frontend runtime change.",
    "",
    "## Blockers",
    "",
    ...(blockers.length ? blockers.map((item) => `- ${item}`) : ["- None"]),
    "",
    "## Warnings",
    "",
    ...(warnings.length ? warnings.map((item) => `- ${item}`) : ["- None"]),
    "",
  ].join("\n");

  await fs.mkdir(path.dirname(OUTPUT_JSON), { recursive: true });
  await fs.writeFile(OUTPUT_JSON, `${JSON.stringify(output, null, 2)}\n`);
  await fs.writeFile(OUTPUT_MD, md);
  await fs.writeFile(OUTPUT_CSV, csv);

  console.log(
    JSON.stringify(
      {
        output_json: rel(OUTPUT_JSON),
        output_md: rel(OUTPUT_MD),
        output_csv: rel(OUTPUT_CSV),
        final_decision: output.final_decision,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
