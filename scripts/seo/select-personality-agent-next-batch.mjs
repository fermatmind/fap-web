#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const GENERATED_DATE =
  getArgValue("--generated-date") ?? process.env.PERSONALITY_AGENT_NEXT_BATCH_SELECTION_DATE ?? "2026-06-25";
const FRAMEWORK = getArgValue("--framework") ?? "mbti64";
const RERUN_LOOP_PATH = resolveRepoPath(
  getArgValue("--rerun-loop") ??
    (FRAMEWORK === "mbti64"
      ? "docs/seo/personality/mbti64-agent-recommendation-rerun-loop-2026-06-23.json"
      : ""),
);
const PRIORITY_RANKER_PATH = resolveRepoPath(
  getArgValue("--priority-ranker") ??
    (FRAMEWORK === "mbti64" ? "docs/seo/personality/mbti64-agent-priority-ranker-2026-06-23.json" : ""),
);
const OUTPUT_JSON = resolveRepoPath(
  getArgValue("--output-json") ??
    `docs/seo/personality/personality-agent-operations-next-batch-selection-${GENERATED_DATE}.json`,
);
const OUTPUT_MD = resolveRepoPath(
  getArgValue("--output-md") ??
    `docs/seo/personality/personality-agent-operations-next-batch-selection-${GENERATED_DATE}.md`,
);
const OUTPUT_CSV = resolveRepoPath(
  getArgValue("--output-csv") ??
    `docs/seo/personality/personality-agent-operations-next-batch-selection-${GENERATED_DATE}.csv`,
);

function getArgValue(name) {
  const prefix = `${name}=`;
  const found = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : null;
}

function resolveRepoPath(filePath) {
  if (!filePath) return "";
  return path.isAbsolute(filePath) ? filePath : path.join(ROOT, filePath);
}

function rel(filePath) {
  return path.relative(ROOT, filePath);
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

function toCandidate(row, selectionReason) {
  return {
    target_url: row.target_url,
    path: row.path,
    framework: FRAMEWORK,
    locale: row.locale,
    page_type: row.page_type,
    mbti_type: row.mbti_type ?? null,
    cohort_group: row.cohort_group,
    priority_rank: row.rank,
    priority_score: row.priority_score,
    evidence_quality: row.evidence_quality,
    query_rows_captured: row.query_rows_captured,
    page_metrics: {
      impressions: row.impressions,
      clicks: row.clicks,
      ctr: row.ctr,
      average_position: row.average_position,
    },
    recommendation_artifact_present: row.recommendation_artifact_present,
    qa_decision: row.qa_decision,
    decision: "SELECTED_FOR_NEXT_BATCH_RECOMMENDATION_REVIEW",
    allowed_next_action: "generate_or_refresh_recommendation_artifact_then_run_qa",
    blocked_reason: null,
    selection_reason: selectionReason,
    recommended_next_task: "PERSONALITY-AGENT-OPERATIONS-NEXT-BATCH-RECOMMENDATIONS-01",
  };
}

function toHeld(row) {
  return {
    target_url: row.target_url,
    path: row.path,
    framework: FRAMEWORK,
    locale: row.locale,
    page_type: row.page_type,
    mbti_type: row.mbti_type ?? null,
    priority_rank: row.rank,
    priority_score: row.priority_score,
    evidence_quality: row.evidence_quality,
    query_rows_captured: row.query_rows_captured,
    decision: "HOLD_QUERY_EVIDENCE_SUPPRESSED",
    allowed_next_action: "collect_gsc_query_evidence_before_recommendation",
    blocked_reason: row.blocked_reason ?? "query_evidence_suppressed",
    recommended_next_task: "MBTI64-GSC-QUERY-API-OR-MANUAL-CSV-EXPORT-10-01",
  };
}

function toCsv(rows) {
  const headers = [
    "decision",
    "path",
    "target_url",
    "framework",
    "locale",
    "page_type",
    "mbti_type",
    "priority_rank",
    "priority_score",
    "evidence_quality",
    "query_rows_captured",
    "blocked_reason",
    "recommended_next_task",
  ];
  const lines = [headers.join(",")];
  for (const row of rows) {
    const values = headers.map((header) => row[header] ?? "");
    lines.push(values.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","));
  }
  return `${lines.join("\n")}\n`;
}

function assertNoDuplicateUrls(rows, blockers, label) {
  const seen = new Set();
  for (const row of rows) {
    if (seen.has(row.target_url)) blockers.push(`${label}_duplicate_url:${row.target_url}`);
    seen.add(row.target_url);
  }
}

async function main() {
  const blockers = [];
  const warnings = [];

  if (FRAMEWORK !== "mbti64") {
    blockers.push(`unsupported_framework:${FRAMEWORK}`);
  }

  const [rerunLoop, priorityRanker] = await Promise.all([readJson(RERUN_LOOP_PATH), readJson(PRIORITY_RANKER_PATH)]);

  if (rerunLoop.final_decision !== "PASS_RECOMMENDATION_RERUN_LOOP_READY") {
    blockers.push(`rerun_loop_not_ready:${rerunLoop.final_decision}`);
  }
  if (priorityRanker.final_decision !== "PASS_AGENT_PRIORITY_RANKER_READY") {
    blockers.push(`priority_ranker_not_ready:${priorityRanker.final_decision}`);
  }
  if (rerunLoop.summary?.total_urls !== 96) blockers.push(`expected_96_urls_found_${rerunLoop.summary?.total_urls}`);
  if (rerunLoop.summary?.active_rerun_queue_count !== 3) {
    blockers.push(`expected_3_active_rerun_urls_found_${rerunLoop.summary?.active_rerun_queue_count}`);
  }
  if (rerunLoop.summary?.query_evidence_waitlist_count !== 10) {
    blockers.push(`expected_10_query_waitlist_urls_found_${rerunLoop.summary?.query_evidence_waitlist_count}`);
  }

  const selectedNextBatch = (rerunLoop.active_rerun_queue ?? []).map((row) =>
    toCandidate(row, "query_backed_low_risk_priority_ranker_selected"),
  );
  const heldWaitlist = (rerunLoop.query_evidence_waitlist ?? []).map(toHeld);

  assertNoDuplicateUrls(selectedNextBatch, blockers, "selected_next_batch");
  assertNoDuplicateUrls(heldWaitlist, blockers, "held_waitlist");

  const selectedSet = new Set(selectedNextBatch.map((row) => row.target_url));
  for (const row of heldWaitlist) {
    if (selectedSet.has(row.target_url)) blockers.push(`selected_and_held_overlap:${row.target_url}`);
  }

  if (selectedNextBatch.some((row) => row.query_rows_captured <= 0)) {
    blockers.push("selected_next_batch_contains_row_without_query_evidence");
  }
  if (selectedNextBatch.some((row) => row.qa_decision !== "PASS_READY_FOR_CMS_DRAFT")) {
    blockers.push("selected_next_batch_contains_non_qa_pass_row");
  }

  if (priorityRanker.warnings?.includes("GSC_SOURCE_PAGE_TABLE_SNAPSHOT_QUERY_DIMENSION_LIMITED")) {
    warnings.push("GSC_SOURCE_PAGE_TABLE_SNAPSHOT_QUERY_DIMENSION_LIMITED");
  }

  const output = {
    artifact: "PERSONALITY-AGENT-OPERATIONS-NEXT-BATCH-SELECTION-01",
    generated_at: new Date().toISOString(),
    status: blockers.length === 0 ? "pass" : "fail",
    final_decision:
      blockers.length === 0
        ? "PASS_NEXT_BATCH_SELECTION_READY"
        : "NO_GO_NEXT_BATCH_SELECTION_BLOCKED",
    input_artifacts: {
      rerun_loop: rel(RERUN_LOOP_PATH),
      priority_ranker: rel(PRIORITY_RANKER_PATH),
    },
    selection_policy: {
      mode: "candidate_selection_only_no_recommendation_generation",
      framework: FRAMEWORK,
      selected_batch_rule:
        "Select only active rerun queue URLs with query evidence, existing recommendation artifact, and QA PASS status.",
      held_waitlist_rule:
        "Hold visible URLs whose page-level GSC metrics exist but query rows are suppressed or unavailable.",
      cms_write_policy: "never_from_selection; CMS draft requires separate approval-gated backend command",
      search_release_policy: "never_from_selection; enqueue/approve/submit remain separate gates",
    },
    summary: {
      total_ranked_urls: rerunLoop.summary?.total_urls ?? 0,
      selected_next_batch_count: selectedNextBatch.length,
      held_waitlist_count: heldWaitlist.length,
      pilot_observation_baseline_count: rerunLoop.summary?.pilot_observation_baseline_count ?? 0,
      measurement_backlog_count: rerunLoop.summary?.measurement_backlog_count ?? 0,
      recommendation_artifact_count: rerunLoop.summary?.recommendation_artifact_count ?? 0,
      qa_pass_count: rerunLoop.summary?.qa_pass_count ?? 0,
    },
    selected_next_batch: selectedNextBatch,
    held_waitlist: heldWaitlist,
    safety_boundary: {
      recommendation_body_generated: false,
      cms_write_attempted: false,
      cms_live_promotion_attempted: false,
      frontend_runtime_change_attempted: false,
      search_queue_mutation_attempted: false,
      live_search_submit_attempted: false,
      sitemap_llms_mutation_attempted: false,
      gsc_api_call_attempted: false,
      gsc_request_indexing_attempted: false,
      production_deploy_attempted: false,
    },
    blockers,
    warnings,
    recommended_next_tasks: {
      selected_next_batch: "PERSONALITY-AGENT-OPERATIONS-NEXT-BATCH-RECOMMENDATIONS-01",
      held_waitlist: "MBTI64-GSC-QUERY-API-OR-MANUAL-CSV-EXPORT-10-01",
      ongoing_measurement: "MBTI64-SEO-MEASUREMENT-COHORT-GSC-IMPORT-STABILIZE-02",
    },
  };

  const md = [
    "# Personality Agent Operations Next Batch Selection",
    "",
    `Generated at: ${output.generated_at}`,
    "",
    "## Decision",
    "",
    `- Status: ${output.status}`,
    `- Final decision: ${output.final_decision}`,
    "",
    "## Summary",
    "",
    `- Total ranked URLs: ${output.summary.total_ranked_urls}`,
    `- Selected next batch: ${output.summary.selected_next_batch_count}`,
    `- Held for query evidence: ${output.summary.held_waitlist_count}`,
    `- Pilot observation baseline: ${output.summary.pilot_observation_baseline_count}`,
    `- Measurement backlog: ${output.summary.measurement_backlog_count}`,
    "",
    "## Selected Next Batch",
    "",
    ...selectedNextBatch.map(
      (row) =>
        `- ${row.path}: score ${row.priority_score}, ${row.query_rows_captured} query row(s), next ${row.recommended_next_task}`,
    ),
    "",
    "## Held Waitlist",
    "",
    ...heldWaitlist.map((row) => `- ${row.path}: ${row.blocked_reason}`),
    "",
    "## Safety Boundary",
    "",
    "- No recommendation body was generated.",
    "- No CMS write, live promotion, frontend runtime change, Search Queue mutation, live search submit, sitemap/llms mutation, GSC API call, Request Indexing action, or production deploy was performed.",
    "",
    "## Blockers",
    "",
    ...(blockers.length ? blockers.map((item) => `- ${item}`) : ["- None"]),
    "",
    "## Warnings",
    "",
    ...(warnings.length ? warnings.map((item) => `- ${item}`) : ["- None"]),
    "",
    "## Recommended Next Tasks",
    "",
    `- Selected batch: ${output.recommended_next_tasks.selected_next_batch}`,
    `- Held waitlist: ${output.recommended_next_tasks.held_waitlist}`,
    `- Ongoing measurement: ${output.recommended_next_tasks.ongoing_measurement}`,
    "",
  ].join("\n");

  await fs.mkdir(path.dirname(OUTPUT_JSON), { recursive: true });
  await fs.writeFile(OUTPUT_JSON, `${JSON.stringify(output, null, 2)}\n`);
  await fs.writeFile(OUTPUT_MD, md);
  await fs.writeFile(OUTPUT_CSV, toCsv([...selectedNextBatch, ...heldWaitlist]));

  console.log(
    JSON.stringify(
      {
        output_json: rel(OUTPUT_JSON),
        output_md: rel(OUTPUT_MD),
        output_csv: rel(OUTPUT_CSV),
        final_decision: output.final_decision,
        selected_next_batch_count: selectedNextBatch.length,
        held_waitlist_count: heldWaitlist.length,
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
