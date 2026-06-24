#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const GENERATED_DATE =
  getArgValue("--generated-date") ?? process.env.PERSONALITY_AGENT_AUTO_RUNNER_DATE ?? "2026-06-24";
const FRAMEWORK = getArgValue("--framework") ?? "mbti64";
const SCHEDULER_ACTIVATION =
  getArgValue("--scheduler-activation") ??
  process.env.PERSONALITY_AGENT_SCHEDULER_ACTIVATION ??
  "not_enabled_in_this_pr";

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

const DEFAULT_OUTPUT_BASENAME =
  FRAMEWORK === "enneagram"
    ? `docs/seo/personality/enneagram-public-profile-agent-pilot-${GENERATED_DATE}`
    : `docs/seo/personality/personality-agent-auto-runner-scheduler-${GENERATED_DATE}`;
const OUTPUT_JSON = resolveRepoPath(getArgValue("--output-json") ?? `${DEFAULT_OUTPUT_BASENAME}.json`);
const OUTPUT_MD = resolveRepoPath(getArgValue("--output-md") ?? `${DEFAULT_OUTPUT_BASENAME}.md`);
const OUTPUT_CSV = resolveRepoPath(getArgValue("--output-csv") ?? `${DEFAULT_OUTPUT_BASENAME}.csv`);

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

function assertSchedulerActivationSupported(value) {
  if (!["not_enabled_in_this_pr", "scheduled_actions_artifact_only_enabled"].includes(value)) {
    throw new Error(`unsupported scheduler activation: ${value}`);
  }
}

const ENNEAGRAM_ENTRIES = [
  { entity_type: "hub", code: "enneagram", path_suffix: "", en_label: "Enneagram", zh_label: "九型人格" },
  { entity_type: "center", code: "gut", path_suffix: "/centers/gut", en_label: "Gut Center", zh_label: "本能中心" },
  { entity_type: "center", code: "heart", path_suffix: "/centers/heart", en_label: "Heart Center", zh_label: "情感中心" },
  { entity_type: "center", code: "head", path_suffix: "/centers/head", en_label: "Head Center", zh_label: "思维中心" },
  ...Array.from({ length: 9 }, (_, index) => {
    const typeNumber = index + 1;
    return {
      entity_type: "core_type",
      code: `type-${typeNumber}`,
      path_suffix: `/type-${typeNumber}`,
      en_label: `Type ${typeNumber}`,
      zh_label: `第 ${typeNumber} 型`,
    };
  }),
];

const ENNEAGRAM_QA_REQUIRED = [
  "schema_validation",
  "method_evidence_boundary_gate",
  "no_clinical_diagnosis_gate",
  "no_hiring_or_screening_gate",
  "no_deterministic_claim_gate",
  "no_wing_instinct_tritype_expansion_gate",
  "duplicate_template_gate",
  "private_route_gate",
  "result_page_leakage_gate",
  "seo_projection_gate",
  "bilingual_consistency_gate",
];

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

function toEnneagramCsv(rows) {
  const headers = [
    "target_url",
    "path",
    "locale",
    "entity_type",
    "code",
    "observed_signal",
    "qa_required_count",
    "blocked_reason",
    "recommended_next_task",
  ];
  const lines = [headers.join(",")];
  for (const row of rows) {
    const flat = {
      ...row,
      qa_required_count: row.qa_required.length,
      recommended_next_task: row.recommended_next_task,
    };
    lines.push(headers.map((header) => `"${String(flat[header] ?? "").replaceAll('"', '""')}"`).join(","));
  }
  return `${lines.join("\n")}\n`;
}

function localeDisplay(locale) {
  return locale === "zh-CN" ? "zh" : "en";
}

function localizedEnneagramLabel(entry, locale) {
  return locale === "zh-CN" ? entry.zh_label : entry.en_label;
}

function localizedTestPath(locale) {
  return `/${localeDisplay(locale)}/tests/enneagram-personality-test-nine-types`;
}

function buildEnneagramRecommendation(entry, locale) {
  const label = localizedEnneagramLabel(entry, locale);
  const pathLocale = localeDisplay(locale);
  const pathValue = `/${pathLocale}/personality/enneagram${entry.path_suffix}`;
  const isZh = locale === "zh-CN";
  const isHub = entry.entity_type === "hub";
  const isCenter = entry.entity_type === "center";
  const title =
    isZh
      ? isHub
        ? "九型人格公开指南：动机模式、类型边界与自我观察"
        : isCenter
          ? `${label}：九型人格中心的动机线索与观察边界`
          : `${label}人格：动机模式、常见误读与自我观察`
      : isHub
        ? "Enneagram Personality Guide: Motivation Patterns and Method Boundaries"
        : isCenter
          ? `${label}: Motivation Cues and Enneagram Center Boundaries`
          : `Enneagram ${label}: Motivation Patterns, Misreads, and Reflection`;
  const description =
    isZh
      ? "面向公开 SEO 页面的草稿建议，仅使用反思性语言解释九型人格，不诊断、不招聘筛选，也不承诺固定结果。"
      : "Draft recommendation for a public SEO profile that explains Enneagram patterns with reflective, non-diagnostic language and no fixed-outcome claims.";
  const h1 = isZh ? `${label}公开说明` : `${label} Public Profile`;
  const quickAnswer =
    isZh
      ? `${label}可以作为观察动机、压力反应和沟通偏好的公共入口，但不应被写成诊断、筛选或最终身份判定。`
      : `${label} can frame motivation, stress response, and communication reflection, but it should not be presented as diagnosis, screening, or a final identity label.`;

  return {
    target_url: `https://fermatmind.com${pathValue}`,
    path: pathValue,
    framework: "enneagram",
    locale,
    entity_type: entry.entity_type,
    code: entry.code,
    current_surface: {
      authority: "backend_cms_personality_public_content_assets",
      route_family: "public_personality_enneagram",
      indexability_posture: "noindex_follow_until_separate_publish_gate",
      source_notes: [
        "docs/public-personality/enneagram-public-personality-source-authority-packet.v1.json",
        "docs/public-personality/enneagram-public-personality-claim-safety-packet.v1.json",
        "lib/personality/enneagramPublicRoutes.ts",
      ],
    },
    observed_signal: "GSC_EVIDENCE_PENDING",
    reference_patterns_used: [
      "personality_public_profile_agent_runner_contract",
      "enneagram_public_personality_source_authority_packet",
      "enneagram_public_personality_claim_safety_packet",
      "backend_cms_content_authority",
    ],
    recommendations: {
      title,
      description,
      h1,
      quick_answer: quickAnswer,
      faq: [
        {
          question: isZh ? `${label}能说明我的最终人格类型吗？` : `Does ${label} identify my final personality type?`,
          answer: isZh
            ? "不能。公开页面应使用反思性语言，帮助读者理解可能的动机线索，而不是给出最终或官方类型结论。"
            : "No. The public page should use reflective language to explain possible motivation cues, not a final or official type conclusion.",
        },
        {
          question: isZh ? "九型人格页面可以用于招聘或临床判断吗？" : "Can this Enneagram page be used for hiring or clinical decisions?",
          answer: isZh
            ? "不能。该页面只能作为自我观察和沟通反思材料，不应支持招聘筛选、诊断、治疗或绩效预测。"
            : "No. It is only a self-reflection and communication resource, not a hiring, diagnostic, treatment, or performance prediction tool.",
        },
      ],
      internal_links: [
        {
          target_url: `https://fermatmind.com/${pathLocale}/personality/enneagram`,
          anchor_text: isZh ? "九型人格总览" : "Enneagram overview",
          safe_public_route: true,
        },
        {
          target_url: `https://fermatmind.com${localizedTestPath(locale)}`,
          anchor_text: isZh ? "九型人格测试" : "Enneagram personality test",
          safe_public_route: true,
        },
      ],
      differentiation_notes: isZh
        ? `${label}应围绕动机观察、常见误读和方法边界区分，不复制私有结果页文本。`
        : `${label} should differentiate around motivation reflection, common misreads, and method boundaries without copying private result text.`,
    },
    qa_required: ENNEAGRAM_QA_REQUIRED,
    blocked_reason: null,
    recommended_next_task: "ENNEAGRAM-PUBLIC-PROFILE-AGENT-QA-01",
  };
}

function buildEnneagramRows() {
  return ENNEAGRAM_ENTRIES.flatMap((entry) => [
    buildEnneagramRecommendation(entry, "en"),
    buildEnneagramRecommendation(entry, "zh-CN"),
  ]);
}

async function runEnneagramPilot() {
  const recommendations = buildEnneagramRows();
  const entityCounts = recommendations.reduce((counts, row) => {
    counts[row.entity_type] = (counts[row.entity_type] ?? 0) + 1;
    return counts;
  }, {});
  const localeCounts = recommendations.reduce((counts, row) => {
    counts[row.locale] = (counts[row.locale] ?? 0) + 1;
    return counts;
  }, {});
  const forbiddenExpansionRows = recommendations.filter((row) =>
    ["wing", "instinctual_subtype", "tritype", "wing_instinct"].includes(row.entity_type),
  );
  const privatePattern = /\/(?:result|results|orders|pay|payment|history|private|account|share)(?:\/|\?|$)|(?:token|session|result_id|report_id|order_no)=/i;
  const serialized = JSON.stringify(recommendations);
  const blockers = [];

  if (recommendations.length !== 26) blockers.push(`expected_26_recommendations_found_${recommendations.length}`);
  if (localeCounts.en !== 13 || localeCounts["zh-CN"] !== 13) blockers.push("locale_count_mismatch");
  if (entityCounts.hub !== 2 || entityCounts.center !== 6 || entityCounts.core_type !== 18) {
    blockers.push("entity_type_count_mismatch");
  }
  if (forbiddenExpansionRows.length > 0) blockers.push("forbidden_enneagram_expansion_rows_present");
  if (privatePattern.test(serialized)) blockers.push("private_route_or_sensitive_query_pattern_present");

  const output = {
    artifact: "ENNEAGRAM-PUBLIC-PROFILE-AGENT-PILOT-01",
    generated_at: new Date().toISOString(),
    framework: "enneagram",
    status: blockers.length === 0 ? "pass" : "fail",
    final_decision: blockers.length === 0 ? "PASS_READY_FOR_ENNEAGRAM_QA" : "NO_GO_ENNEAGRAM_AGENT_PILOT_BLOCKED",
    run_mode: "artifact_only",
    input_artifacts: {
      source_authority_packet: "docs/public-personality/enneagram-public-personality-source-authority-packet.v1.json",
      claim_safety_packet: "docs/public-personality/enneagram-public-personality-claim-safety-packet.v1.json",
      candidate_cluster_packet: "docs/public-personality/enneagram-public-personality-candidate-cluster-packet.v1.json",
      route_contract: "lib/personality/enneagramPublicRoutes.ts",
    },
    summary: {
      recommendation_count: recommendations.length,
      locale_counts: localeCounts,
      entity_type_counts: entityCounts,
      gsc_evidence_pending_count: recommendations.filter((row) => row.observed_signal === "GSC_EVIDENCE_PENDING").length,
      qa_required_count: ENNEAGRAM_QA_REQUIRED.length,
      blocked_count: recommendations.filter((row) => row.blocked_reason).length,
    },
    scope_lock: {
      allowed_entity_types: ["hub", "center", "core_type"],
      forbidden_entity_types: ["wing", "instinctual_subtype", "tritype", "wing_instinct"],
      no_54_wing_instinct_pages: true,
      no_private_result_text: true,
      no_frontend_editorial_fallback: true,
    },
    recommendations,
    safety_boundary: {
      artifact_only: true,
      cms_write_attempted: false,
      cms_live_promotion_attempted: false,
      frontend_runtime_change_attempted: false,
      search_queue_mutation_attempted: false,
      live_search_submit_attempted: false,
      sitemap_llms_mutation_attempted: false,
      publish_indexability_change_attempted: false,
      gsc_request_indexing_attempted: false,
      production_deploy_attempted: false,
    },
    blockers,
    warnings: ["GSC query evidence is pending for all Enneagram public profile targets."],
    recommended_next_task: "ENNEAGRAM-PUBLIC-PROFILE-AGENT-QA-01",
  };

  const md = [
    "# Enneagram Public Profile Agent Pilot",
    "",
    `Generated at: ${output.generated_at}`,
    "",
    "## Decision",
    "",
    `- Status: ${output.status}`,
    `- Final decision: ${output.final_decision}`,
    "- Scope: 26 Enneagram public profile draft recommendations.",
    "- CMS, publish, indexability, sitemap/llms, Search Queue, and deploy actions were not performed.",
    "",
    "## Coverage",
    "",
    `- Total recommendations: ${output.summary.recommendation_count}`,
    `- en: ${output.summary.locale_counts.en}`,
    `- zh-CN: ${output.summary.locale_counts["zh-CN"]}`,
    `- hub: ${output.summary.entity_type_counts.hub}`,
    `- centers: ${output.summary.entity_type_counts.center}`,
    `- core types: ${output.summary.entity_type_counts.core_type}`,
    "- Wings, instinctual subtypes, 54 wing x instinct pages, and Tritype are out of scope.",
    "",
    "## QA Required",
    "",
    ...ENNEAGRAM_QA_REQUIRED.map((gate) => `- ${gate}`),
    "",
    "## Recommendations",
    "",
    ...recommendations.map((row) => `- ${row.path}: ${row.recommendations.title}`),
    "",
    "## Safety Boundary",
    "",
    "- Artifact only.",
    "- No frontend editorial fallback was added.",
    "- Backend/CMS remains the public personality content authority.",
    "- No CMS write, live promotion, publish/indexability change, sitemap/llms mutation, Search Queue mutation, live search submit, Request Indexing action, or production deploy was performed.",
    "",
    "## Blockers",
    "",
    ...(blockers.length ? blockers.map((item) => `- ${item}`) : ["- None"]),
    "",
    "## Warnings",
    "",
    ...output.warnings.map((item) => `- ${item}`),
    "",
    "## Recommended Next Task",
    "",
    `- ${output.recommended_next_task}`,
    "",
  ].join("\n");

  await fs.mkdir(path.dirname(OUTPUT_JSON), { recursive: true });
  await fs.writeFile(OUTPUT_JSON, `${JSON.stringify(output, null, 2)}\n`);
  await fs.writeFile(OUTPUT_MD, md);
  await fs.writeFile(OUTPUT_CSV, toEnneagramCsv(recommendations));

  console.log(
    JSON.stringify(
      {
        output_json: rel(OUTPUT_JSON),
        output_md: rel(OUTPUT_MD),
        output_csv: rel(OUTPUT_CSV),
        final_decision: output.final_decision,
        recommendation_count: recommendations.length,
      },
      null,
      2,
    ),
  );
}

async function main() {
  assertFrameworkSupported(FRAMEWORK);
  assertSchedulerActivationSupported(SCHEDULER_ACTIVATION);

  if (FRAMEWORK === "enneagram") {
    await runEnneagramPilot();
    return;
  }

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
        ? SCHEDULER_ACTIVATION === "scheduled_actions_artifact_only_enabled"
          ? "PASS_SCHEDULED_ACTIONS_ARTIFACT_ONLY_ENABLED"
          : "PASS_MANUAL_SCHEDULER_READY_NO_UNATTENDED_CRON"
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
      mode:
        SCHEDULER_ACTIVATION === "scheduled_actions_artifact_only_enabled"
          ? "scheduled_actions_artifact_only"
          : "manual_scheduler_ready_artifact_only",
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
      scheduler_activation: SCHEDULER_ACTIVATION,
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
      unattended_cron_enabled: SCHEDULER_ACTIVATION === "scheduled_actions_artifact_only_enabled",
    },
    blockers,
    warnings,
    recommended_next_tasks: {
      ready_draft_review_queue: "MBTI64-CMS-PROJECTION-DRAFT-VISIBLE-3-DRY-RUN-01",
      hold_for_query_evidence_queue: "MBTI64-GSC-API-READONLY-INTEGRATION-01_DEPLOY_AND_EXPORT",
      scheduler_activation:
        SCHEDULER_ACTIVATION === "scheduled_actions_artifact_only_enabled"
          ? "enabled_via_github_actions_artifact_only"
          : "PERSONALITY-AGENT-AUTO-RUNNER-SCHEDULER-ACTIVATION-01_SEPARATE_PR",
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
    SCHEDULER_ACTIVATION === "scheduled_actions_artifact_only_enabled"
      ? "- Scheduled GitHub Actions execution is enabled in artifact-only mode; it does not write CMS or mutate search/deploy surfaces."
      : "- This PR is scheduler-ready only; it does not enable unattended cron.",
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
    "- No CMS write, live promotion, frontend runtime change, Search Queue mutation, live search submit, sitemap/llms mutation, Request Indexing action, or production deploy was performed.",
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
