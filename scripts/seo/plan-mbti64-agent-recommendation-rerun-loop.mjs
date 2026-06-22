#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const GENERATED_DATE =
  getArgValue("--generated-date") ?? process.env.MBTI64_AGENT_RECOMMENDATION_RERUN_LOOP_DATE ?? "2026-06-23";
const PRIORITY_RANKER_PATH = resolveRepoPath(
  getArgValue("--priority-ranker") ??
    `docs/seo/personality/mbti64-agent-priority-ranker-${GENERATED_DATE}.json`,
);
const RECOMMENDATIONS_PATH = resolveRepoPath(
  getArgValue("--recommendations") ??
    "docs/seo/personality/mbti64-agent-expansion-88-recommendations-2026-06-21.json",
);
const QA_PATH = resolveRepoPath(
  getArgValue("--qa") ?? "docs/seo/personality/mbti64-agent-expansion-88-qa-2026-06-21.json",
);
const OUTPUT_JSON = resolveRepoPath(
  getArgValue("--output-json") ??
    `docs/seo/personality/mbti64-agent-recommendation-rerun-loop-${GENERATED_DATE}.json`,
);
const OUTPUT_MD = resolveRepoPath(
  getArgValue("--output-md") ??
    `docs/seo/personality/mbti64-agent-recommendation-rerun-loop-${GENERATED_DATE}.md`,
);
const OUTPUT_CSV = resolveRepoPath(
  getArgValue("--output-csv") ??
    `docs/seo/personality/mbti64-agent-recommendation-rerun-loop-${GENERATED_DATE}.csv`,
);

const READY_BUCKET = "READY_QUERY_BACKED_LOW_RISK_DRAFT_REVIEW";
const HOLD_BUCKET = "HOLD_QUERY_EVIDENCE_SUPPRESSED";
const PILOT_BUCKET = "OBSERVE_OPTIMIZED_PILOT";
const BACKLOG_BUCKET = "DISCOVERY_BACKLOG_GSC_NO_ROW";

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

function byTargetUrl(items) {
  return new Map(items.map((item) => [item.target_url, item]));
}

function safeCount(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function summarizeRerunCandidates(priorityRanker, recommendations, qa) {
  const recommendationsByUrl = byTargetUrl(recommendations.recommendations ?? []);
  const qaByUrl = byTargetUrl(qa.page_results ?? []);

  return priorityRanker.ranked_records.map((rankedRecord) => {
    const recommendation = recommendationsByUrl.get(rankedRecord.target_url) ?? null;
    const qaResult = qaByUrl.get(rankedRecord.target_url) ?? null;
    const hasRecommendation = recommendation !== null;
    const qaDecision = qaResult?.decision ?? null;
    const eligibleForRecommendationRerun =
      rankedRecord.action_bucket === READY_BUCKET &&
      hasRecommendation &&
      qaDecision === "PASS_READY_FOR_CMS_DRAFT" &&
      safeCount(rankedRecord.score_inputs?.query_rows_captured) > 0;

    return {
      rank: rankedRecord.rank,
      target_url: rankedRecord.target_url,
      path: rankedRecord.path,
      locale: rankedRecord.locale,
      page_type: rankedRecord.page_type,
      mbti_type: rankedRecord.mbti_type,
      cohort_group: rankedRecord.cohort_group,
      action_bucket: rankedRecord.action_bucket,
      rerun_lane: laneFor(rankedRecord.action_bucket, eligibleForRecommendationRerun),
      evidence_quality: rankedRecord.evidence_quality,
      priority_score: rankedRecord.priority_score,
      query_rows_captured: safeCount(rankedRecord.score_inputs?.query_rows_captured),
      impressions: safeCount(rankedRecord.score_inputs?.impressions),
      clicks: safeCount(rankedRecord.score_inputs?.clicks),
      ctr: safeCount(rankedRecord.score_inputs?.ctr),
      average_position: rankedRecord.score_inputs?.average_position ?? null,
      recommendation_artifact_present: hasRecommendation,
      qa_decision: qaDecision,
      rerun_allowed: eligibleForRecommendationRerun,
      allowed_next_action: eligibleForRecommendationRerun
        ? "generate_draft_recommendation_package_then_run_qa"
        : rankedRecord.allowed_next_action,
      blocked_reason: eligibleForRecommendationRerun ? null : blockReasonFor(rankedRecord, hasRecommendation, qaDecision),
      recommended_next_task: eligibleForRecommendationRerun
        ? "MBTI64-CMS-PROJECTION-DRAFT-VISIBLE-3-DRY-RUN-01"
        : rankedRecord.recommended_next_task,
    };
  });
}

function laneFor(actionBucket, eligibleForRecommendationRerun) {
  if (eligibleForRecommendationRerun) return "active_rerun_queue";
  if (actionBucket === HOLD_BUCKET) return "query_evidence_waitlist";
  if (actionBucket === PILOT_BUCKET) return "pilot_observation_baseline";
  if (actionBucket === BACKLOG_BUCKET) return "measurement_backlog";
  return "manual_review";
}

function blockReasonFor(rankedRecord, hasRecommendation, qaDecision) {
  if (rankedRecord.action_bucket === READY_BUCKET && !hasRecommendation) return "recommendation_artifact_missing";
  if (rankedRecord.action_bucket === READY_BUCKET && qaDecision !== "PASS_READY_FOR_CMS_DRAFT") {
    return `qa_not_ready:${qaDecision ?? "missing"}`;
  }
  return rankedRecord.blocked_reason ?? "not_in_active_rerun_queue";
}

function groupCounts(rows, field) {
  const counts = {};
  for (const row of rows) {
    const key = row[field] ?? "unknown";
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

function toCsv(rows) {
  const headers = [
    "rank",
    "path",
    "target_url",
    "locale",
    "page_type",
    "mbti_type",
    "cohort_group",
    "action_bucket",
    "rerun_lane",
    "rerun_allowed",
    "blocked_reason",
    "evidence_quality",
    "priority_score",
    "query_rows_captured",
    "impressions",
    "clicks",
    "ctr",
    "average_position",
    "qa_decision",
    "recommended_next_task",
  ];
  const lines = [headers.join(",")];
  for (const row of rows) {
    const values = headers.map((header) => row[header] ?? "");
    lines.push(values.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","));
  }
  return `${lines.join("\n")}\n`;
}

async function main() {
  const [priorityRanker, recommendations, qa] = await Promise.all([
    readJson(PRIORITY_RANKER_PATH),
    readJson(RECOMMENDATIONS_PATH),
    readJson(QA_PATH),
  ]);

  const blockers = [];
  const warnings = [];

  if (priorityRanker.final_decision !== "PASS_AGENT_PRIORITY_RANKER_READY") {
    blockers.push(`priority_ranker_not_ready:${priorityRanker.final_decision}`);
  }
  if (!["pass", "pass_ready_for_qa_gates"].includes(recommendations.status)) {
    blockers.push(`recommendations_not_pass:${recommendations.status}`);
  }
  if (qa.final_decision !== "PASS_READY_FOR_CMS_DRAFT") {
    blockers.push(`qa_not_ready:${qa.final_decision}`);
  }
  if (priorityRanker.summary?.total_urls !== 96) {
    blockers.push(`expected_96_ranked_urls_found_${priorityRanker.summary?.total_urls}`);
  }
  if (recommendations.summary?.recommendation_count !== 88) {
    blockers.push(`expected_88_recommendations_found_${recommendations.summary?.recommendation_count}`);
  }
  if (qa.summary?.checked_recommendation_count !== 88) {
    blockers.push(`expected_88_qa_results_found_${qa.summary?.checked_recommendation_count}`);
  }

  const rerunCandidates = summarizeRerunCandidates(priorityRanker, recommendations, qa);
  const activeRerunQueue = rerunCandidates.filter((row) => row.rerun_lane === "active_rerun_queue");
  const queryWaitlist = rerunCandidates.filter((row) => row.rerun_lane === "query_evidence_waitlist");
  const pilotBaseline = rerunCandidates.filter((row) => row.rerun_lane === "pilot_observation_baseline");
  const backlog = rerunCandidates.filter((row) => row.rerun_lane === "measurement_backlog");

  if (activeRerunQueue.length !== 3) blockers.push(`expected_3_active_rerun_urls_found_${activeRerunQueue.length}`);
  if (queryWaitlist.length !== 10) blockers.push(`expected_10_query_waitlist_urls_found_${queryWaitlist.length}`);
  if (pilotBaseline.length !== 8) blockers.push(`expected_8_pilot_baseline_urls_found_${pilotBaseline.length}`);
  if (backlog.length !== 75) blockers.push(`expected_75_measurement_backlog_urls_found_${backlog.length}`);

  if (priorityRanker.warnings?.includes("GSC_SOURCE_PAGE_TABLE_SNAPSHOT_QUERY_DIMENSION_LIMITED")) {
    warnings.push("GSC_SOURCE_PAGE_TABLE_SNAPSHOT_QUERY_DIMENSION_LIMITED");
  }

  const output = {
    artifact: "MBTI64-AGENT-RECOMMENDATION-RERUN-LOOP-01",
    generated_at: new Date().toISOString(),
    status: blockers.length === 0 ? "pass" : "fail",
    final_decision:
      blockers.length === 0
        ? "PASS_RECOMMENDATION_RERUN_LOOP_READY"
        : "NO_GO_RECOMMENDATION_RERUN_LOOP_BLOCKED",
    input_artifacts: {
      priority_ranker: rel(PRIORITY_RANKER_PATH),
      recommendations: rel(RECOMMENDATIONS_PATH),
      qa: rel(QA_PATH),
    },
    operating_policy: {
      mode: "recommendation_only_no_cms_write",
      cadence: {
        gsc_import_and_ranker: "weekly_or_after_new_gsc_export",
        query_evidence_refresh_for_hold_queue: "weekly_until_query_rows_are_available",
        recommendation_rerun_for_ready_queue: "after_ranker_passes_and_before_cms_draft_dry_run",
        cms_draft_handoff: "manual_gate_after_schema_and_qa_pass",
      },
      required_inputs_before_rerun: [
        "fresh_or_accepted_gsc_page_export",
        "query_export_for_visible_pages_when_available",
        "latest_priority_ranker_artifact",
        "current_cms_or_api_surface_snapshot",
        "optimized_pilot_reference_pack",
        "source_ledger_or_evidence_notes",
      ],
      stop_gates: [
        "missing_priority_ranker_pass",
        "missing_query_evidence_for_visible_non_ready_pages",
        "qa_gate_failure",
        "trademark_or_official_affiliation_risk",
        "claim_or_deterministic_language_risk",
        "duplicate_template_risk",
        "private_route_or_result_page_leakage",
        "schema_validation_failure",
      ],
      cms_write_policy: "never_from_rerun_loop; cms draft requires separate dry-run/write approval",
      search_release_policy: "never_from_rerun_loop; enqueue/approve/submit remain separate gates",
    },
    summary: {
      total_urls: rerunCandidates.length,
      active_rerun_queue_count: activeRerunQueue.length,
      query_evidence_waitlist_count: queryWaitlist.length,
      pilot_observation_baseline_count: pilotBaseline.length,
      measurement_backlog_count: backlog.length,
      recommendation_artifact_count: recommendations.summary?.recommendation_count ?? 0,
      qa_pass_count: qa.summary?.pass_ready_for_cms_draft_count ?? 0,
    },
    lane_counts: groupCounts(rerunCandidates, "rerun_lane"),
    active_rerun_queue: activeRerunQueue,
    query_evidence_waitlist: queryWaitlist,
    rerun_candidates: rerunCandidates,
    safety_boundary: {
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
      active_rerun_queue: "MBTI64-CMS-PROJECTION-DRAFT-VISIBLE-3-DRY-RUN-01",
      query_evidence_waitlist: "MBTI64-GSC-QUERY-API-OR-MANUAL-CSV-EXPORT-10-01",
      ongoing_operations: "MBTI64-AGENT-RECOMMENDATION-RERUN-LOOP-02_AFTER_NEXT_GSC_EXPORT",
    },
  };

  const md = [
    "# MBTI64 Agent Recommendation Rerun Loop",
    "",
    `Generated at: ${output.generated_at}`,
    "",
    "## Decision",
    "",
    `- Status: ${output.status}`,
    `- Final decision: ${output.final_decision}`,
    "",
    "## Operating Loop",
    "",
    "- Weekly or post-export: import GSC page data, refresh query evidence, and rerun the priority ranker.",
    "- Ready queue only: generate or reuse recommendation packages, then run QA gates.",
    "- CMS draft handoff requires a separate dry-run and explicit write approval.",
    "- Search release remains a separate enqueue/approve/submit chain.",
    "",
    "## Summary",
    "",
    `- Total URLs covered: ${output.summary.total_urls}`,
    `- Active rerun queue: ${output.summary.active_rerun_queue_count}`,
    `- Query evidence waitlist: ${output.summary.query_evidence_waitlist_count}`,
    `- Pilot observation baseline: ${output.summary.pilot_observation_baseline_count}`,
    `- Measurement backlog: ${output.summary.measurement_backlog_count}`,
    `- Recommendation artifact count: ${output.summary.recommendation_artifact_count}`,
    `- QA pass count: ${output.summary.qa_pass_count}`,
    "",
    "## Active Rerun Queue",
    "",
    ...activeRerunQueue.map(
      (row) =>
        `- ${row.path}: ${row.query_rows_captured} query row(s), score ${row.priority_score}, next ${row.recommended_next_task}`,
    ),
    "",
    "## Query Evidence Waitlist",
    "",
    ...queryWaitlist.map((row) => `- ${row.path}: ${row.blocked_reason}`),
    "",
    "## Safety Boundary",
    "",
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
    `- Active queue: ${output.recommended_next_tasks.active_rerun_queue}`,
    `- Query waitlist: ${output.recommended_next_tasks.query_evidence_waitlist}`,
    `- Ongoing operations: ${output.recommended_next_tasks.ongoing_operations}`,
    "",
  ].join("\n");

  await fs.mkdir(path.dirname(OUTPUT_JSON), { recursive: true });
  await fs.writeFile(OUTPUT_JSON, `${JSON.stringify(output, null, 2)}\n`);
  await fs.writeFile(OUTPUT_MD, md);
  await fs.writeFile(OUTPUT_CSV, toCsv(rerunCandidates));

  console.log(
    JSON.stringify(
      {
        output_json: rel(OUTPUT_JSON),
        output_md: rel(OUTPUT_MD),
        output_csv: rel(OUTPUT_CSV),
        final_decision: output.final_decision,
        active_rerun_queue_count: activeRerunQueue.length,
        query_evidence_waitlist_count: queryWaitlist.length,
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
