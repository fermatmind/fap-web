#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const GENERATED_DATE = getArgValue("--generated-date") ?? process.env.MBTI64_GSC_STABILIZE_DATE ?? "2026-06-23";
const GSC_IMPORT_PATH = resolveRepoPath(
  getArgValue("--gsc-import") ?? "docs/seo/personality/mbti64-seo-measurement-cohort-gsc-import-2026-06-22.json",
);
const PRIORITY_PATH = resolveRepoPath(
  getArgValue("--priority-selection") ??
    "docs/seo/personality/mbti64-agent-optimization-priority-selection-2026-06-22.json",
);
const QUERY_DECISION_PATH = resolveRepoPath(
  getArgValue("--query-decision") ??
    "docs/seo/personality/mbti64-agent-visible-expansion-13-query-evidence-decision-2026-06-22.json",
);
const OUTPUT_JSON = resolveRepoPath(
  getArgValue("--output-json") ??
    `docs/seo/personality/mbti64-seo-measurement-cohort-gsc-import-stabilize-${GENERATED_DATE}.json`,
);
const OUTPUT_MD = resolveRepoPath(
  getArgValue("--output-md") ??
    `docs/seo/personality/mbti64-seo-measurement-cohort-gsc-import-stabilize-${GENERATED_DATE}.md`,
);

function getArgValue(name) {
  const prefix = `${name}=`;
  const found = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : null;
}

function resolveRepoPath(filePath) {
  return path.isAbsolute(filePath) ? filePath : path.join(ROOT, filePath);
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

function rel(filePath) {
  return path.relative(ROOT, filePath);
}

async function main() {
  const [gscImport, prioritySelection, queryDecision] = await Promise.all([
    readJson(GSC_IMPORT_PATH),
    readJson(PRIORITY_PATH),
    readJson(QUERY_DECISION_PATH),
  ]);

  const blockers = [];
  const warnings = [];

  if (gscImport.final_decision !== "PASS_GSC_IMPORTED_PRIORITY_READY") {
    blockers.push(`gsc_import_not_ready:${gscImport.final_decision}`);
  }
  if (gscImport.summary?.total !== 96) blockers.push(`gsc_import_expected_96_found_${gscImport.summary?.total}`);
  if (prioritySelection.final_decision !== "PASS_PRIORITY_SELECTION_READY") {
    blockers.push(`priority_selection_not_ready:${prioritySelection.final_decision}`);
  }
  if (prioritySelection.summary?.total_urls !== 96) {
    blockers.push(`priority_selection_expected_96_found_${prioritySelection.summary?.total_urls}`);
  }
  if (prioritySelection.summary?.selected_for_agent_review !== 13) {
    blockers.push(`priority_selection_expected_13_visible_found_${prioritySelection.summary?.selected_for_agent_review}`);
  }
  if (queryDecision.final_decision !== "PASS_VISIBLE_13_QUERY_EVIDENCE_DECISION_READY") {
    blockers.push(`query_decision_not_ready:${queryDecision.final_decision}`);
  }
  if (queryDecision.summary?.ready_query_backed_low_risk_draft_review_count !== 3) {
    blockers.push(
      `query_decision_expected_3_ready_found_${queryDecision.summary?.ready_query_backed_low_risk_draft_review_count}`,
    );
  }
  if (queryDecision.summary?.hold_query_evidence_suppressed_count !== 10) {
    blockers.push(`query_decision_expected_10_hold_found_${queryDecision.summary?.hold_query_evidence_suppressed_count}`);
  }

  if (gscImport.input_artifacts?.gsc_csv?.source_kind === "gsc_browser_page_table_snapshot") {
    warnings.push("GSC_SOURCE_PAGE_TABLE_SNAPSHOT_QUERY_DIMENSION_LIMITED");
  }

  const readyDecisions = queryDecision.decisions.filter(
    (item) => item.decision === "READY_QUERY_BACKED_LOW_RISK_DRAFT_REVIEW",
  );
  const heldDecisions = queryDecision.decisions.filter((item) => item.decision === "HOLD_QUERY_EVIDENCE_SUPPRESSED");
  const selectedUrls = new Set(prioritySelection.selected_for_agent_review.map((item) => item.url));
  const decisionUrls = new Set(queryDecision.decisions.map((item) => item.target_url));
  const missingDecisionUrls = [...selectedUrls].filter((url) => !decisionUrls.has(url));
  if (missingDecisionUrls.length > 0) blockers.push(`query_decision_missing_selected_urls_${missingDecisionUrls.length}`);

  const output = {
    artifact: "MBTI64-SEO-MEASUREMENT-COHORT-GSC-IMPORT-STABILIZE-01",
    generated_at: new Date().toISOString(),
    status: blockers.length === 0 ? "pass" : "fail",
    final_decision:
      blockers.length === 0
        ? "PASS_GSC_IMPORT_PRIORITY_PIPELINE_STABILIZED"
        : "NO_GO_GSC_IMPORT_PRIORITY_PIPELINE_BLOCKED",
    input_artifacts: {
      gsc_import: rel(GSC_IMPORT_PATH),
      priority_selection: rel(PRIORITY_PATH),
      query_evidence_decision: rel(QUERY_DECISION_PATH),
    },
    stable_rerun_contract: {
      page_level_import_command: [
        "node scripts/seo/import-mbti64-gsc-measurement-cohort.mjs",
        "--generated-date=YYYY-MM-DD",
        "--cohort=docs/seo/personality/mbti64-seo-measurement-cohort-YYYY-MM-DD.json",
        "--gsc-csv=/absolute/path/to/gsc-performance.csv",
        "--source-kind=gsc_performance_csv_export",
      ].join(" "),
      priority_selection_command: [
        "node scripts/seo/select-mbti64-agent-optimization-priorities.mjs",
        "--generated-date=YYYY-MM-DD",
        "--gsc-import=docs/seo/personality/mbti64-seo-measurement-cohort-gsc-import-YYYY-MM-DD.json",
        "--recommendations=docs/seo/personality/mbti64-agent-expansion-88-recommendations-2026-06-21.json",
        "--qa=docs/seo/personality/mbti64-agent-expansion-88-qa-2026-06-21.json",
      ].join(" "),
      query_decision_command: [
        "node scripts/seo/decide-mbti64-visible-expansion-query-evidence.mjs",
        "--generated-date=YYYY-MM-DD",
      ].join(" "),
      no_gsc_api_required: true,
      manual_csv_or_browser_export_allowed: true,
      missing_gsc_rows_are_not_zero_demand: true,
    },
    evidence_summary: {
      cohort_url_count: gscImport.summary?.total ?? null,
      page_level_gsc_imported_url_count: gscImport.summary?.with_gsc_rows ?? null,
      imported_no_row_count: gscImport.summary?.imported_no_row ?? null,
      selected_for_agent_review_count: prioritySelection.summary?.selected_for_agent_review ?? null,
      query_backed_ready_count: readyDecisions.length,
      query_suppressed_hold_count: heldDecisions.length,
      query_rows_total: queryDecision.summary?.query_rows_total ?? null,
      p0_high_impressions_low_ctr: gscImport.summary?.p0 ?? null,
      p1_visible_no_clicks: gscImport.summary?.p1 ?? null,
      p2_early_visibility_observe: gscImport.summary?.p2 ?? null,
      p3_no_gsc_visibility_yet: gscImport.summary?.p3 ?? null,
    },
    selected_visible_13_decision: {
      ready_paths: queryDecision.ready_paths,
      held_paths: queryDecision.held_paths,
      ready_count: readyDecisions.length,
      held_count: heldDecisions.length,
      selected_paths_without_query_decision: missingDecisionUrls,
    },
    safety_boundary: {
      docs_script_only: true,
      cms_write_attempted: false,
      frontend_runtime_change_attempted: false,
      search_queue_mutation_attempted: false,
      live_search_submit_attempted: false,
      sitemap_llms_mutation_attempted: false,
      gsc_request_indexing_attempted: false,
      gsc_api_call_attempted: false,
    },
    blockers,
    warnings,
    recommended_next_task:
      blockers.length === 0
        ? "MBTI64-AGENT-PRIORITY-RANKER-01 or next GSC import rerun with fresh CSV"
        : "MBTI64-SEO-MEASUREMENT-COHORT-GSC-IMPORT-STABILIZE-REPAIR-01",
  };

  const md = [
    "# MBTI64 GSC Import and Priority Stabilization",
    "",
    `Generated at: ${output.generated_at}`,
    "",
    "## Decision",
    "",
    `- Status: ${output.status}`,
    `- Final decision: ${output.final_decision}`,
    `- Recommended next task: ${output.recommended_next_task}`,
    "",
    "## Stabilized Chain",
    "",
    `- Cohort URLs: ${output.evidence_summary.cohort_url_count}`,
    `- Page-level GSC imported URLs: ${output.evidence_summary.page_level_gsc_imported_url_count}`,
    `- URLs selected for agent review: ${output.evidence_summary.selected_for_agent_review_count}`,
    `- Query-backed ready URLs: ${output.evidence_summary.query_backed_ready_count}`,
    `- Query-suppressed held URLs: ${output.evidence_summary.query_suppressed_hold_count}`,
    "",
    "## Rerun Commands",
    "",
    "```bash",
    output.stable_rerun_contract.page_level_import_command,
    output.stable_rerun_contract.priority_selection_command,
    output.stable_rerun_contract.query_decision_command,
    "```",
    "",
    "## Evidence Boundary",
    "",
    "- Missing GSC rows are treated as unavailable evidence, not zero demand.",
    "- Query-suppressed pages are held until GSC API or manual query CSV evidence exists.",
    "- No CMS write, frontend runtime change, Search Queue mutation, live search submit, sitemap/llms mutation, GSC API call, or Request Indexing was performed.",
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

  await fs.writeFile(OUTPUT_JSON, `${JSON.stringify(output, null, 2)}\n`);
  await fs.writeFile(OUTPUT_MD, md);
  console.log(JSON.stringify({ output_json: OUTPUT_JSON, output_md: OUTPUT_MD, final_decision: output.final_decision }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
