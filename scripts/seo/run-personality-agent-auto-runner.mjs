#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const GENERATED_DATE =
  getArgValue("--generated-date") ?? process.env.PERSONALITY_AGENT_AUTO_RUNNER_DATE ?? "2026-06-24";
const FRAMEWORK = getArgValue("--framework") ?? "mbti64";

const GSC_STABILIZE_PATH = resolveRepoPath(
  getArgValue("--gsc-stabilize") ??
    "docs/seo/personality/mbti64-seo-measurement-cohort-gsc-import-stabilize-2026-06-23.json",
);
const PRIORITY_RANKER_PATH = resolveRepoPath(
  getArgValue("--priority-ranker") ?? "docs/seo/personality/mbti64-agent-priority-ranker-2026-06-23.json",
);
const RERUN_LOOP_PATH = resolveRepoPath(
  getArgValue("--rerun-loop") ?? "docs/seo/personality/mbti64-agent-recommendation-rerun-loop-2026-06-23.json",
);
const REFERENCE_PACK_PATH = resolveRepoPath(
  getArgValue("--reference-pack") ?? "docs/seo/personality/mbti64-optimized-pilot-reference-pack-2026-06-21.json",
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
    `docs/seo/personality/personality-agent-auto-runner-scheduler-${GENERATED_DATE}.json`,
);
const OUTPUT_MD = resolveRepoPath(
  getArgValue("--output-md") ??
    `docs/seo/personality/personality-agent-auto-runner-scheduler-${GENERATED_DATE}.md`,
);
const OUTPUT_CSV = resolveRepoPath(
  getArgValue("--output-csv") ??
    `docs/seo/personality/personality-agent-auto-runner-scheduler-${GENERATED_DATE}.csv`,
);

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

function count(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function assertFrameworkSupported(framework) {
  if (!["mbti64", "big_five", "enneagram"].includes(framework)) {
    throw new Error(`unsupported framework: ${framework}`);
  }
}

function validateInputReadiness({ gscStabilize, priorityRanker, rerunLoop, referencePack, recommendations, qa }) {
  const blockers = [];
  const warnings = [];

  if (FRAMEWORK !== "mbti64") {
    blockers.push(`framework_not_enabled_in_v1:${FRAMEWORK}`);
  }
  if (gscStabilize.final_decision !== "PASS_GSC_IMPORT_PRIORITY_PIPELINE_STABILIZED") {
    blockers.push(`gsc_pipeline_not_stabilized:${gscStabilize.final_decision ?? "missing"}`);
  }
  if (priorityRanker.final_decision !== "PASS_AGENT_PRIORITY_RANKER_READY") {
    blockers.push(`priority_ranker_not_ready:${priorityRanker.final_decision ?? "missing"}`);
  }
  if (rerunLoop.final_decision !== "PASS_RECOMMENDATION_RERUN_LOOP_READY") {
    blockers.push(`rerun_loop_not_ready:${rerunLoop.final_decision ?? "missing"}`);
  }
  if (referencePack.summary?.pilot_page_count !== 8) {
    blockers.push(`expected_8_reference_pages_found_${referencePack.summary?.pilot_page_count ?? "missing"}`);
  }
  if (recommendations.summary?.recommendation_count !== 88) {
    blockers.push(`expected_88_recommendations_found_${recommendations.summary?.recommendation_count ?? "missing"}`);
  }
  if (qa.final_decision !== "PASS_READY_FOR_CMS_DRAFT") {
    blockers.push(`qa_not_ready:${qa.final_decision ?? "missing"}`);
  }
  if (priorityRanker.summary?.total_urls !== 96 || rerunLoop.summary?.total_urls !== 96) {
    blockers.push("cohort_size_not_96");
  }
  if (count(priorityRanker.summary?.query_rows_total) === 0) {
    blockers.push("query_evidence_missing_or_suppressed");
  }

  for (const warning of [
    ...(gscStabilize.warnings ?? []),
    ...(priorityRanker.warnings ?? []),
    ...(rerunLoop.warnings ?? []),
  ]) {
    if (!warnings.includes(warning)) warnings.push(warning);
  }

  return { blockers, warnings };
}

function buildQueueRows(rerunLoop) {
  const ready = (rerunLoop.active_rerun_queue ?? []).map((row) => ({
    target_url: row.target_url,
    path: row.path,
    locale: row.locale,
    page_type: row.page_type,
    lane: "ready_for_draft_recommendation_review",
    evidence_quality: row.evidence_quality,
    query_rows_captured: count(row.query_rows_captured),
    priority_score: count(row.priority_score),
    allowed_next_action: "draft_recommendation_package_then_qa",
    blocked_reason: null,
    recommended_next_task: "MBTI64-CMS-PROJECTION-DRAFT-VISIBLE-3-DRY-RUN-01",
  }));

  const hold = (rerunLoop.query_evidence_waitlist ?? []).map((row) => ({
    target_url: row.target_url,
    path: row.path,
    locale: row.locale,
    page_type: row.page_type,
    lane: "hold_for_query_evidence",
    evidence_quality: row.evidence_quality,
    query_rows_captured: count(row.query_rows_captured),
    priority_score: count(row.priority_score),
    allowed_next_action: "refresh_gsc_query_evidence",
    blocked_reason: row.blocked_reason ?? "query_evidence_suppressed",
    recommended_next_task: "MBTI64-GSC-QUERY-API-OR-MANUAL-CSV-EXPORT-10-01",
  }));

  return { ready, hold };
}

function toCsv(rows) {
  const headers = [
    "path",
    "target_url",
    "locale",
    "page_type",
    "lane",
    "evidence_quality",
    "query_rows_captured",
    "priority_score",
    "allowed_next_action",
    "blocked_reason",
    "recommended_next_task",
  ];
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => `"${String(row[header] ?? "").replaceAll('"', '""')}"`).join(","));
  }
  return `${lines.join("\n")}\n`;
}

async function main() {
  assertFrameworkSupported(FRAMEWORK);

  const [gscStabilize, priorityRanker, rerunLoop, referencePack, recommendations, qa] = await Promise.all([
    readJson(GSC_STABILIZE_PATH),
    readJson(PRIORITY_RANKER_PATH),
    readJson(RERUN_LOOP_PATH),
    readJson(REFERENCE_PACK_PATH),
    readJson(RECOMMENDATIONS_PATH),
    readJson(QA_PATH),
  ]);

  const { blockers, warnings } = validateInputReadiness({
    gscStabilize,
    priorityRanker,
    rerunLoop,
    referencePack,
    recommendations,
    qa,
  });
  const { ready, hold } = buildQueueRows(rerunLoop);

  const output = {
    artifact: "PERSONALITY-AGENT-AUTO-RUNNER-SCHEDULER-01",
    generated_at: new Date().toISOString(),
    framework: FRAMEWORK,
    status: blockers.length === 0 ? "pass" : "fail",
    final_decision:
      blockers.length === 0
        ? "PASS_MANUAL_SCHEDULER_READY_NO_UNATTENDED_CRON"
        : "NO_GO_AUTO_RUNNER_BLOCKED",
    input_artifacts: {
      gsc_stabilize: rel(GSC_STABILIZE_PATH),
      priority_ranker: rel(PRIORITY_RANKER_PATH),
      rerun_loop: rel(RERUN_LOOP_PATH),
      optimized_reference_pack: rel(REFERENCE_PACK_PATH),
      recommendations: rel(RECOMMENDATIONS_PATH),
      qa: rel(QA_PATH),
    },
    runner_contract: {
      mode: "manual_scheduler_ready_artifact_only",
      enabled_frameworks_v1: ["mbti64"],
      future_framework_slots: ["big_five", "enneagram"],
      input_sequence: [
        "gsc_query_or_page_evidence",
        "mbti64_96_url_cohort",
        "optimized_pilot_reference_pack",
        "priority_ranker",
        "current_recommendations",
        "qa_artifacts",
      ],
      output_sequence: [
        "run_manifest",
        "priority_ranking",
        "draft_recommendation_candidates",
        "qa_summary",
        "blocked_or_ready_decision",
      ],
      scheduler_activation: "not_enabled_in_this_pr",
    },
    summary: {
      cohort_url_count: count(priorityRanker.summary?.total_urls),
      optimized_reference_pages: count(referencePack.summary?.pilot_page_count),
      recommendation_artifact_count: count(recommendations.summary?.recommendation_count),
      qa_pass_count: count(qa.summary?.pass_ready_for_cms_draft_count),
      ready_draft_review_count: ready.length,
      hold_for_query_evidence_count: hold.length,
      pilot_observation_baseline_count: count(rerunLoop.summary?.pilot_observation_baseline_count),
      measurement_backlog_count: count(rerunLoop.summary?.measurement_backlog_count),
    },
    ready_draft_review_queue: ready,
    hold_for_query_evidence_queue: hold,
    qa_required: [
      "schema_validation",
      "trademark_claim_gate",
      "claim_risk_gate",
      "duplicate_template_gate",
      "private_route_gate",
      "result_page_leakage_gate",
      "seo_projection_gate",
      "bilingual_consistency_gate",
    ],
    safety_boundary: {
      artifact_only: true,
      cms_write_attempted: false,
      cms_live_promotion_attempted: false,
      frontend_runtime_change_attempted: false,
      search_queue_mutation_attempted: false,
      live_search_submit_attempted: false,
      sitemap_llms_mutation_attempted: false,
      gsc_request_indexing_attempted: false,
      production_deploy_attempted: false,
      unattended_cron_enabled: false,
    },
    blockers,
    warnings,
    recommended_next_tasks: {
      ready_draft_review_queue: "MBTI64-CMS-PROJECTION-DRAFT-VISIBLE-3-DRY-RUN-01",
      hold_for_query_evidence_queue: "MBTI64-GSC-API-READONLY-INTEGRATION-01_DEPLOY_AND_EXPORT",
      scheduler_activation: "PERSONALITY-AGENT-AUTO-RUNNER-SCHEDULER-ACTIVATION-01_SEPARATE_PR",
      approval_queue: "PERSONALITY-AGENT-HUMAN-APPROVAL-QUEUE-01",
    },
  };

  const md = [
    "# Personality Agent Auto Runner Scheduler",
    "",
    `Generated at: ${output.generated_at}`,
    "",
    "## Decision",
    "",
    `- Status: ${output.status}`,
    `- Final decision: ${output.final_decision}`,
    `- Framework v1: ${output.framework}`,
    "",
    "## Runner Contract",
    "",
    "- Reads GSC evidence, the MBTI64 cohort, the optimized pilot reference pack, ranker output, recommendation artifacts, and QA artifacts.",
    "- Emits a run manifest, ready queue, hold queue, QA requirements, and next-step decisions.",
    "- This PR is scheduler-ready only; it does not enable unattended cron.",
    "- CMS draft writing, live promotion, and Search Queue release remain separate gates.",
    "",
    "## Summary",
    "",
    `- Cohort URLs: ${output.summary.cohort_url_count}`,
    `- Optimized reference pages: ${output.summary.optimized_reference_pages}`,
    `- Recommendation artifacts: ${output.summary.recommendation_artifact_count}`,
    `- QA pass count: ${output.summary.qa_pass_count}`,
    `- Ready draft review queue: ${output.summary.ready_draft_review_count}`,
    `- Hold for query evidence: ${output.summary.hold_for_query_evidence_count}`,
    `- Pilot observation baseline: ${output.summary.pilot_observation_baseline_count}`,
    `- Measurement backlog: ${output.summary.measurement_backlog_count}`,
    "",
    "## Ready Draft Review Queue",
    "",
    ...ready.map((row) => `- ${row.path}: ${row.query_rows_captured} query row(s), next ${row.recommended_next_task}`),
    "",
    "## Hold Queue",
    "",
    ...hold.map((row) => `- ${row.path}: ${row.blocked_reason}`),
    "",
    "## Safety Boundary",
    "",
    "- No CMS write, live promotion, frontend runtime change, Search Queue mutation, live search submit, sitemap/llms mutation, Request Indexing action, production deploy, or unattended cron activation was performed.",
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
    `- Ready queue: ${output.recommended_next_tasks.ready_draft_review_queue}`,
    `- Hold queue: ${output.recommended_next_tasks.hold_for_query_evidence_queue}`,
    `- Scheduler activation: ${output.recommended_next_tasks.scheduler_activation}`,
    `- Approval queue: ${output.recommended_next_tasks.approval_queue}`,
    "",
  ].join("\n");

  await fs.mkdir(path.dirname(OUTPUT_JSON), { recursive: true });
  await fs.writeFile(OUTPUT_JSON, `${JSON.stringify(output, null, 2)}\n`);
  await fs.writeFile(OUTPUT_MD, md);
  await fs.writeFile(OUTPUT_CSV, toCsv([...ready, ...hold]));

  console.log(
    JSON.stringify(
      {
        output_json: rel(OUTPUT_JSON),
        output_md: rel(OUTPUT_MD),
        output_csv: rel(OUTPUT_CSV),
        final_decision: output.final_decision,
        ready_count: ready.length,
        hold_count: hold.length,
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
