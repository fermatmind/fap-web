#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const GENERATED_DATE = getArgValue("--generated-date") ?? "2026-06-27";

const INPUTS = {
  mbti64PriorityRanker: resolveRepoPath(
    getArgValue("--mbti64-priority-ranker") ??
      "docs/seo/personality/mbti64-agent-priority-ranker-2026-06-23.json",
  ),
  nextBatch6Package: resolveRepoPath(
    getArgValue("--next-batch-6-package") ??
      "docs/seo/personality/personality-agent-operations-next-batch-6-handoff-package-2026-06-25.json",
  ),
  bigFiveRecommendations: resolveRepoPath(
    getArgValue("--big-five-recommendations") ??
      "docs/seo/personality/big-five-public-profile-agent-pilot-2026-06-24.json",
  ),
  bigFiveQa: resolveRepoPath(
    getArgValue("--big-five-qa") ?? "docs/seo/personality/big-five-public-profile-agent-qa-2026-06-24.json",
  ),
  enneagramRecommendations: resolveRepoPath(
    getArgValue("--enneagram-recommendations") ??
      "docs/seo/personality/enneagram-public-profile-agent-pilot-2026-06-24.json",
  ),
  enneagramQa: resolveRepoPath(
    getArgValue("--enneagram-qa") ?? "docs/seo/personality/enneagram-public-profile-agent-qa-2026-06-24.json",
  ),
};

const OUTPUT_JSON = resolveRepoPath(
  getArgValue("--output-json") ??
    `docs/seo/personality/personality-agent-opportunity-ranker-automation-${GENERATED_DATE}.json`,
);
const OUTPUT_MD = resolveRepoPath(
  getArgValue("--output-md") ??
    `docs/seo/personality/personality-agent-opportunity-ranker-automation-${GENERATED_DATE}.md`,
);
const OUTPUT_CSV = resolveRepoPath(
  getArgValue("--output-csv") ??
    `docs/seo/personality/personality-agent-opportunity-ranker-automation-${GENERATED_DATE}.csv`,
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

function normalizeLocale(locale) {
  return locale === "zh-CN" ? "zh" : locale;
}

function pathFromUrl(targetUrl) {
  try {
    return new URL(targetUrl).pathname;
  } catch {
    return "";
  }
}

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function classifyMbti(row, recentlyOptimizedUrls) {
  if (recentlyOptimizedUrls.has(row.target_url)) {
    return {
      priority_bucket: "P2_OBSERVE_RECENTLY_PROMOTED",
      allowed_next_action: "observe_post_promotion_gsc_and_indexnow_effect_before_rerun",
      blocked_reason: "recently_promoted_or_search_released",
      automation_candidate: false,
    };
  }

  if (row.action_bucket === "READY_QUERY_BACKED_LOW_RISK_DRAFT_REVIEW") {
    return {
      priority_bucket: "P0_QUERY_BACKED_READY_FOR_AUTO_RUNNER",
      allowed_next_action: "generate_or_refresh_recommendation_artifact_then_run_qa",
      blocked_reason: null,
      automation_candidate: true,
    };
  }

  if (row.action_bucket === "HOLD_QUERY_EVIDENCE_SUPPRESSED") {
    return {
      priority_bucket: "HOLD_QUERY_EVIDENCE_REQUIRED",
      allowed_next_action: "refresh_gsc_query_evidence_before_recommendation",
      blocked_reason: row.blocked_reason ?? "query_evidence_suppressed",
      automation_candidate: false,
    };
  }

  if (row.action_bucket === "OBSERVE_OPTIMIZED_PILOT") {
    return {
      priority_bucket: "P2_OBSERVE_OPTIMIZED_PILOT",
      allowed_next_action: "observe_existing_pilot_before_rerun",
      blocked_reason: "optimized_pilot_observation_window",
      automation_candidate: false,
    };
  }

  return {
    priority_bucket: "P2_DISCOVERY_BACKLOG_NEEDS_GSC_SIGNAL",
    allowed_next_action: "collect_page_or_query_level_gsc_evidence",
    blocked_reason: row.blocked_reason ?? "gsc_signal_missing",
    automation_candidate: false,
  };
}

function normalizeMbtiRecords(priorityRanker, recentlyOptimizedUrls) {
  return (priorityRanker.ranked_records ?? []).map((row) => {
    const classification = classifyMbti(row, recentlyOptimizedUrls);

    return {
      target_url: row.target_url,
      path: row.path,
      framework: "mbti64",
      locale: normalizeLocale(row.locale),
      page_type: row.page_type,
      entity_key: row.mbti_type ?? null,
      priority_rank: row.rank,
      priority_score: number(row.priority_score),
      priority_bucket: classification.priority_bucket,
      action_bucket: row.action_bucket,
      evidence_quality: row.evidence_quality,
      query_rows_captured: number(row.score_inputs?.query_rows_captured),
      page_metrics: {
        impressions: number(row.score_inputs?.impressions),
        clicks: number(row.score_inputs?.clicks),
        ctr: number(row.score_inputs?.ctr),
        average_position: row.score_inputs?.average_position ?? null,
      },
      automation_candidate: classification.automation_candidate,
      allowed_next_action: classification.allowed_next_action,
      blocked_reason: classification.blocked_reason,
      recent_processing_state: recentlyOptimizedUrls.has(row.target_url)
        ? "next_batch_6_recently_promoted_or_submitted"
        : "not_recently_processed_by_next_batch_6",
      recommended_next_task: classification.automation_candidate
        ? "PERSONALITY-AGENT-RECOMMENDATION-AUTO-RUNNER-01"
        : row.recommended_next_task,
    };
  });
}

function qaPassedForBigFive(bigFiveQa) {
  return bigFiveQa.status === "pass" && bigFiveQa.summary?.rows_failed === 0;
}

function qaPassedForEnneagram(enneagramQa) {
  return enneagramQa.final_decision === "PASS_READY_FOR_APPROVAL_QUEUE" && enneagramQa.summary?.blocked_count === 0;
}

function normalizeExistingRecommendationRecords({ artifact, framework, qaPassed, qaDecision }) {
  return (artifact.recommendations ?? []).map((row, index) => {
    const targetUrl = row.target_url;
    const sourceInputs = row.source_inputs ?? {};
    const observedSignal = row.observed_signal ?? {};
    const entityType = row.entity_type ?? sourceInputs.entity_type ?? sourceInputs.page_type ?? row.current_surface?.page_type ?? null;
    const entityKey = row.code ?? sourceInputs.entity_key ?? sourceInputs.code ?? row.current_surface?.slug ?? null;

    return {
      target_url: targetUrl,
      path: row.path ?? pathFromUrl(targetUrl),
      framework,
      locale: normalizeLocale(row.locale),
      page_type: entityType,
      entity_key: entityKey,
      priority_rank: index + 1,
      priority_score: qaPassed ? 35 : 0,
      priority_bucket: qaPassed
        ? "P1_QA_PASS_RECOMMENDATION_REFRESH_READY"
        : "HOLD_QA_NOT_PASSING",
      action_bucket: qaPassed
        ? "QA_PASS_EXISTING_RECOMMENDATION_CAN_REFRESH"
        : "QA_BLOCKED_EXISTING_RECOMMENDATION",
      evidence_quality: observedSignal.gsc_state ?? artifact.summary?.gsc_evidence_state ?? "GSC_EVIDENCE_PENDING",
      query_rows_captured: 0,
      page_metrics: {
        impressions: null,
        clicks: null,
        ctr: null,
        average_position: null,
      },
      automation_candidate: qaPassed,
      allowed_next_action: qaPassed
        ? "refresh_recommendation_artifact_or_reuse_existing_then_run_current_qa"
        : "repair_qa_before_automation",
      blocked_reason: qaPassed ? null : "qa_not_passing",
      recent_processing_state: "not_recently_processed_by_next_batch_6",
      recommended_next_task: qaPassed
        ? "PERSONALITY-AGENT-RECOMMENDATION-AUTO-RUNNER-01"
        : "PERSONALITY-AGENT-AUTO-QA-AND-APPROVAL-HANDOFF-01",
      qa_decision: qaDecision,
    };
  });
}

function bucketOrder(row) {
  const order = {
    P0_QUERY_BACKED_READY_FOR_AUTO_RUNNER: 0,
    P1_QA_PASS_RECOMMENDATION_REFRESH_READY: 1,
    P2_DISCOVERY_BACKLOG_NEEDS_GSC_SIGNAL: 2,
    P2_OBSERVE_RECENTLY_PROMOTED: 3,
    P2_OBSERVE_OPTIMIZED_PILOT: 4,
    HOLD_QUERY_EVIDENCE_REQUIRED: 5,
    HOLD_QA_NOT_PASSING: 6,
  };
  return order[row.priority_bucket] ?? 9;
}

function selectForAutoRunner(records) {
  const p0 = records
    .filter((row) => row.priority_bucket === "P0_QUERY_BACKED_READY_FOR_AUTO_RUNNER" && row.automation_candidate)
    .sort((a, b) => a.priority_rank - b.priority_rank);

  if (p0.length > 0) return p0.slice(0, 6);

  const p1 = records
    .filter((row) => row.priority_bucket === "P1_QA_PASS_RECOMMENDATION_REFRESH_READY" && row.automation_candidate)
    .sort((a, b) => {
      if (a.framework !== b.framework) return a.framework.localeCompare(b.framework);
      return a.priority_rank - b.priority_rank;
    });

  return p1.slice(0, 6);
}

function countBy(rows, key) {
  return rows.reduce((acc, row) => {
    const value = row[key] ?? "unknown";
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}

function toCsv(rows) {
  const headers = [
    "priority_bucket",
    "path",
    "target_url",
    "framework",
    "locale",
    "page_type",
    "entity_key",
    "priority_rank",
    "priority_score",
    "evidence_quality",
    "query_rows_captured",
    "automation_candidate",
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
  const [
    mbti64PriorityRanker,
    nextBatch6Package,
    bigFiveRecommendations,
    bigFiveQa,
    enneagramRecommendations,
    enneagramQa,
  ] = await Promise.all([
    readJson(INPUTS.mbti64PriorityRanker),
    readJson(INPUTS.nextBatch6Package),
    readJson(INPUTS.bigFiveRecommendations),
    readJson(INPUTS.bigFiveQa),
    readJson(INPUTS.enneagramRecommendations),
    readJson(INPUTS.enneagramQa),
  ]);

  const blockers = [];
  const warnings = [];
  const recentlyOptimizedUrls = new Set((nextBatch6Package.recommendations ?? []).map((row) => row.target_url));

  if (mbti64PriorityRanker.final_decision !== "PASS_AGENT_PRIORITY_RANKER_READY") {
    blockers.push(`mbti64_priority_ranker_not_ready:${mbti64PriorityRanker.final_decision ?? "missing"}`);
  }
  if (nextBatch6Package.final_decision !== "PASS_NEXT_BATCH_6_HANDOFF_READY_FOR_APPROVAL_QUEUE_DRY_RUN") {
    blockers.push(`next_batch_6_handoff_not_ready:${nextBatch6Package.final_decision ?? "missing"}`);
  }
  if (!qaPassedForBigFive(bigFiveQa)) blockers.push("big_five_qa_not_passing");
  if (!qaPassedForEnneagram(enneagramQa)) blockers.push("enneagram_qa_not_passing");

  const records = [
    ...normalizeMbtiRecords(mbti64PriorityRanker, recentlyOptimizedUrls),
    ...normalizeExistingRecommendationRecords({
      artifact: bigFiveRecommendations,
      framework: "big_five",
      qaPassed: qaPassedForBigFive(bigFiveQa),
      qaDecision: bigFiveQa.decision ?? bigFiveQa.status,
    }),
    ...normalizeExistingRecommendationRecords({
      artifact: enneagramRecommendations,
      framework: "enneagram",
      qaPassed: qaPassedForEnneagram(enneagramQa),
      qaDecision: enneagramQa.final_decision,
    }),
  ].sort((a, b) => bucketOrder(a) - bucketOrder(b) || b.priority_score - a.priority_score || a.path.localeCompare(b.path));

  const seen = new Set();
  for (const row of records) {
    if (seen.has(row.target_url)) blockers.push(`duplicate_target_url:${row.target_url}`);
    seen.add(row.target_url);
  }

  const selected = selectForAutoRunner(records);
  const selectedSet = new Set(selected.map((row) => row.target_url));
  const held = records.filter((row) => !row.automation_candidate);

  if (records.length !== 156) blockers.push(`expected_156_total_records_found_${records.length}`);
  if (recentlyOptimizedUrls.size !== 6) blockers.push(`expected_6_recently_processed_urls_found_${recentlyOptimizedUrls.size}`);
  if (selected.some((row) => row.recent_processing_state === "next_batch_6_recently_promoted_or_submitted")) {
    blockers.push("selected_recently_processed_url");
  }

  const output = {
    artifact: "PERSONALITY-AGENT-OPPORTUNITY-RANKER-AUTOMATION-01",
    generated_at: new Date().toISOString(),
    status: blockers.length === 0 ? "pass" : "fail",
    final_decision:
      blockers.length === 0
        ? "PASS_PERSONALITY_OPPORTUNITY_RANKER_AUTOMATION_READY"
        : "NO_GO_PERSONALITY_OPPORTUNITY_RANKER_AUTOMATION_BLOCKED",
    input_artifacts: Object.fromEntries(Object.entries(INPUTS).map(([key, value]) => [key, rel(value)])),
    ranker_policy: {
      mode: "opportunity_ranking_only_no_recommendation_body_generation",
      supported_frameworks: ["mbti64", "big_five", "enneagram"],
      p0_rule: "query-backed pages that are not in a recent promotion/search release window",
      p1_rule: "QA-passed existing recommendation assets that can be refreshed by the auto-runner without production mutation",
      hold_rule: "query-suppressed, QA-blocked, or private-risk rows do not enter the auto-runner queue",
      recently_processed_rule: "next-batch-6 URLs are observed and excluded from the next auto-runner queue",
      cms_write_policy: "never_from_ranker; approval queue and CMS draft remain separate explicit gates",
      search_release_policy: "never_from_ranker; URL Truth and IndexNow remain separate explicit gates",
    },
    summary: {
      total_records: records.length,
      framework_counts: countBy(records, "framework"),
      priority_bucket_counts: countBy(records, "priority_bucket"),
      automation_candidate_count: records.filter((row) => row.automation_candidate).length,
      selected_for_auto_runner_count: selected.length,
      held_or_observe_count: held.length,
      recently_processed_next_batch_6_count: recentlyOptimizedUrls.size,
      mbti64_query_backed_p0_count: records.filter((row) => row.priority_bucket === "P0_QUERY_BACKED_READY_FOR_AUTO_RUNNER").length,
      gsc_query_rows_total: records.reduce((total, row) => total + number(row.query_rows_captured), 0),
    },
    selected_for_auto_runner: selected,
    held_or_observe_queue: held,
    ranked_records: records.map((row, index) => ({
      ...row,
      global_rank: index + 1,
      selected_for_auto_runner: selectedSet.has(row.target_url),
    })),
    safety_boundary: {
      recommendation_body_generated: false,
      cms_write_attempted: false,
      approval_queue_write_attempted: false,
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
      selected_for_auto_runner: "PERSONALITY-AGENT-RECOMMENDATION-AUTO-RUNNER-01",
      held_or_observe_queue: "refresh_gsc_evidence_or_wait_for_observation_window",
      approval_queue_handoff: "PERSONALITY-AGENT-AUTO-QA-AND-APPROVAL-HANDOFF-01",
    },
  };

  const md = [
    "# Personality Agent Opportunity Ranker Automation",
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
    `- Total records: ${output.summary.total_records}`,
    `- Framework counts: ${JSON.stringify(output.summary.framework_counts)}`,
    `- Priority buckets: ${JSON.stringify(output.summary.priority_bucket_counts)}`,
    `- Selected for auto-runner: ${output.summary.selected_for_auto_runner_count}`,
    `- Recently processed next-batch-6 URLs excluded: ${output.summary.recently_processed_next_batch_6_count}`,
    "",
    "## Selected For Auto Runner",
    "",
    ...selected.map((row) => `- ${row.path} (${row.framework}, ${row.priority_bucket})`),
    "",
    "## Safety Boundary",
    "",
    "- This artifact ranks opportunities only.",
    "- It does not generate recommendation body copy.",
    "- It does not write CMS, approval queue, sitemap/llms, Search Queue, or production runtime state.",
    "",
    "## Blockers",
    "",
    ...(blockers.length ? blockers.map((blocker) => `- ${blocker}`) : ["- none"]),
    "",
  ].join("\n");

  await fs.mkdir(path.dirname(OUTPUT_JSON), { recursive: true });
  await Promise.all([
    fs.writeFile(OUTPUT_JSON, `${JSON.stringify(output, null, 2)}\n`),
    fs.writeFile(OUTPUT_MD, md),
    fs.writeFile(OUTPUT_CSV, toCsv(output.ranked_records)),
  ]);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
