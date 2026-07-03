#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import {
  csvEscape as safeCsvEscape,
  resolveOutputPath,
  resolveRepoPath as resolveSafeRepoPath,
  sanitizeDateSlug,
} from "./artifactSafety.mjs";

const ROOT = process.cwd();
const GENERATED_DATE = sanitizeDateSlug(getArgValue("--generated-date") ?? "2026-06-27", "generated date");

const INPUTS = {
  opportunityRanker: resolveRepoPath(
    getArgValue("--opportunity-ranker") ??
      `docs/seo/personality/personality-agent-opportunity-ranker-automation-${GENERATED_DATE}.json`,
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
  mbti64Recommendations: resolveRepoPath(
    getArgValue("--mbti64-recommendations") ??
      "docs/seo/personality/mbti64-agent-expansion-88-recommendations-2026-06-21.json",
  ),
  mbti64Qa: resolveRepoPath(
    getArgValue("--mbti64-qa") ?? "docs/seo/personality/mbti64-agent-expansion-88-qa-2026-06-21.json",
  ),
};

const OUTPUT_JSON = resolveOutputPath(
  ROOT,
  getArgValue("--output-json") ??
    `docs/seo/personality/personality-agent-recommendation-auto-runner-${GENERATED_DATE}.json`,
  "output JSON path",
);
const OUTPUT_MD = resolveOutputPath(
  ROOT,
  getArgValue("--output-md") ??
    `docs/seo/personality/personality-agent-recommendation-auto-runner-${GENERATED_DATE}.md`,
  "output Markdown path",
);
const OUTPUT_CSV = resolveOutputPath(
  ROOT,
  getArgValue("--output-csv") ??
    `docs/seo/personality/personality-agent-recommendation-auto-runner-${GENERATED_DATE}.csv`,
  "output CSV path",
);

function getArgValue(name) {
  const prefix = `${name}=`;
  const found = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : null;
}

function resolveRepoPath(filePath) {
  return resolveSafeRepoPath(ROOT, filePath, "repo path");
}

function rel(filePath) {
  return path.relative(ROOT, filePath);
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

function sha256(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function normalizePath(targetUrl, fallbackPath) {
  if (fallbackPath) return fallbackPath;
  try {
    return new URL(targetUrl).pathname;
  } catch {
    return "";
  }
}

function frameworkQaDecision(framework, qa) {
  if (framework === "big_five") {
    return {
      decision: qa.status === "pass" && qa.summary?.rows_failed === 0 ? "PASS_READY_FOR_APPROVAL_QUEUE" : "HOLD_QA_NOT_PASSING",
      pass_count: qa.summary?.rows_passed ?? 0,
      fail_count: qa.summary?.rows_failed ?? 0,
    };
  }

  if (framework === "enneagram") {
    return {
      decision:
        qa.final_decision === "PASS_READY_FOR_APPROVAL_QUEUE" && qa.summary?.blocked_count === 0
          ? "PASS_READY_FOR_APPROVAL_QUEUE"
          : "HOLD_QA_NOT_PASSING",
      pass_count: qa.summary?.pass_count ?? qa.summary?.recommendation_count ?? 0,
      fail_count: qa.summary?.blocked_count ?? 0,
    };
  }

  return {
    decision: qa.final_decision === "PASS_READY_FOR_CMS_DRAFT" ? "PASS_READY_FOR_APPROVAL_QUEUE" : "HOLD_QA_NOT_PASSING",
    pass_count: qa.summary?.pass_ready_for_cms_draft_count ?? qa.summary?.recommendation_count ?? 0,
    fail_count: qa.summary?.blocked_count ?? 0,
  };
}

function buildSourceIndex(recommendations) {
  return new Map((recommendations.recommendations ?? []).map((row) => [row.target_url, row]));
}

function extractRecommendationFields(row) {
  const recommendations = row.recommendations ?? {};

  return {
    title: recommendations.title ?? null,
    description: recommendations.description ?? null,
    h1: recommendations.h1 ?? null,
    quick_answer: recommendations.quick_answer ?? null,
    faq: recommendations.faq ?? [],
    internal_links: recommendations.internal_links ?? [],
    differentiation_notes: recommendations.differentiation_notes ?? [],
  };
}

function assertSafeRecommendation(row) {
  const serialized = JSON.stringify(row);
  const forbidden =
    /\/(?:result|results|orders|pay|payment|history|private|account|share)(?:\/|\?|$)|(?:token|session|result_id|report_id|order_no)=/i;
  return !forbidden.test(serialized);
}

function csvEscape(value) {
  return safeCsvEscape(value);
}

function toCsv(rows) {
  const headers = [
    "priority_rank",
    "path",
    "target_url",
    "framework",
    "locale",
    "page_type",
    "entity_key",
    "priority_bucket",
    "evidence_quality",
    "query_rows_captured",
    "recommended_title",
    "recommended_h1",
    "faq_count",
    "internal_link_count",
    "source_qa_decision",
    "blocked_reason",
  ];

  return [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          if (header === "recommended_title") return csvEscape(row.recommendations.title?.recommended);
          if (header === "recommended_h1") return csvEscape(row.recommendations.h1?.recommended);
          if (header === "faq_count") return csvEscape(row.recommendations.faq.length);
          if (header === "internal_link_count") return csvEscape(row.recommendations.internal_links.length);
          if (header === "source_qa_decision") return csvEscape(row.source_qa.decision);
          return csvEscape(row[header]);
        })
        .join(","),
    ),
    "",
  ].join("\n");
}

async function main() {
  const [
    opportunityRanker,
    bigFiveRecommendations,
    bigFiveQa,
    enneagramRecommendations,
    enneagramQa,
    mbti64Recommendations,
    mbti64Qa,
  ] = await Promise.all([
    readJson(INPUTS.opportunityRanker),
    readJson(INPUTS.bigFiveRecommendations),
    readJson(INPUTS.bigFiveQa),
    readJson(INPUTS.enneagramRecommendations),
    readJson(INPUTS.enneagramQa),
    readJson(INPUTS.mbti64Recommendations),
    readJson(INPUTS.mbti64Qa),
  ]);

  const sources = {
    big_five: {
      artifact: bigFiveRecommendations,
      qa: frameworkQaDecision("big_five", bigFiveQa),
      index: buildSourceIndex(bigFiveRecommendations),
    },
    enneagram: {
      artifact: enneagramRecommendations,
      qa: frameworkQaDecision("enneagram", enneagramQa),
      index: buildSourceIndex(enneagramRecommendations),
    },
    mbti64: {
      artifact: mbti64Recommendations,
      qa: frameworkQaDecision("mbti64", mbti64Qa),
      index: buildSourceIndex(mbti64Recommendations),
    },
  };

  const selected = opportunityRanker.selected_for_auto_runner ?? [];
  const blockers = [];
  const recommendations = selected.map((candidate) => {
    const source = sources[candidate.framework];
    const sourceRow = source?.index.get(candidate.target_url);
    if (!sourceRow) {
      blockers.push(`missing_source_recommendation:${candidate.target_url}`);
      return null;
    }

    const recommendationFields = extractRecommendationFields(sourceRow);
    const item = {
      recommendation_id: `personality-agent-auto-runner:${candidate.path}`,
      source_recommendation_id: sourceRow.recommendation_id,
      source_recommendation_sha256: sha256(sourceRow),
      target_url: candidate.target_url,
      path: normalizePath(candidate.target_url, candidate.path),
      framework: candidate.framework,
      locale: candidate.locale,
      page_type: sourceRow.source_inputs?.entity_type ?? sourceRow.entity_type ?? candidate.page_type,
      entity_key: sourceRow.code ?? sourceRow.source_inputs?.entity_key ?? candidate.entity_key,
      priority_rank: candidate.priority_rank,
      priority_score: candidate.priority_score,
      priority_bucket: candidate.priority_bucket,
      evidence_quality: candidate.evidence_quality,
      query_rows_captured: candidate.query_rows_captured,
      current_surface: sourceRow.current_surface ?? {},
      observed_signal: {
        ...(sourceRow.observed_signal ?? {}),
        ranker_evidence_quality: candidate.evidence_quality,
        ranker_query_rows_captured: candidate.query_rows_captured,
      },
      reference_patterns_used: sourceRow.reference_patterns_used ?? [],
      recommendations: recommendationFields,
      qa_required: sourceRow.qa_required ?? [],
      source_qa: source.qa,
      blocked_reason: source.qa.decision === "PASS_READY_FOR_APPROVAL_QUEUE" ? null : "source_qa_not_passing",
      allowed_next_action: "run_auto_qa_and_emit_approval_handoff_if_pass",
      recommended_next_task: "PERSONALITY-AGENT-AUTO-QA-AND-APPROVAL-HANDOFF-01",
    };

    if (!assertSafeRecommendation(item)) blockers.push(`private_route_pattern_present:${candidate.target_url}`);
    return item;
  }).filter(Boolean);

  if (recommendations.length !== selected.length) {
    blockers.push(`selected_source_count_mismatch:selected_${selected.length}_recommendations_${recommendations.length}`);
  }

  const frameworkCounts = recommendations.reduce((counts, row) => {
    counts[row.framework] = (counts[row.framework] ?? 0) + 1;
    return counts;
  }, {});
  const qaPassCount = recommendations.filter((row) => row.source_qa.decision === "PASS_READY_FOR_APPROVAL_QUEUE").length;

  const output = {
    artifact: "PERSONALITY-AGENT-RECOMMENDATION-AUTO-RUNNER-01",
    generated_at: new Date().toISOString(),
    status: blockers.length === 0 ? "pass" : "fail",
    final_decision:
      blockers.length === 0
        ? "PASS_RECOMMENDATION_AUTO_RUNNER_READY_FOR_AUTO_QA"
        : "NO_GO_RECOMMENDATION_AUTO_RUNNER_BLOCKED",
    input_artifacts: {
      opportunity_ranker: rel(INPUTS.opportunityRanker),
      big_five_recommendations: rel(INPUTS.bigFiveRecommendations),
      big_five_qa: rel(INPUTS.bigFiveQa),
      enneagram_recommendations: rel(INPUTS.enneagramRecommendations),
      enneagram_qa: rel(INPUTS.enneagramQa),
      mbti64_recommendations: rel(INPUTS.mbti64Recommendations),
      mbti64_qa: rel(INPUTS.mbti64Qa),
    },
    generation_policy: {
      mode: "ranker_selected_existing_recommendation_refresh_no_external_model_call",
      selected_batch_rule: "Use exactly the selected_for_auto_runner rows from the opportunity ranker artifact.",
      source_authority: "Repackage existing QA-passed recommendation artifacts; do not write CMS, approval queue, or runtime content.",
      cms_write_policy: "never_from_recommendation_auto_runner",
      approval_queue_write_policy: "never_from_recommendation_auto_runner",
      search_release_policy: "never_from_recommendation_auto_runner",
    },
    summary: {
      selected_url_count: selected.length,
      recommendation_count: recommendations.length,
      framework_counts: frameworkCounts,
      source_qa_pass_count: qaPassCount,
      blocked_count: recommendations.filter((row) => row.blocked_reason).length,
      private_route_violation_count: blockers.filter((item) => item.startsWith("private_route_pattern_present:")).length,
    },
    recommendations,
    safety_boundary: {
      artifact_only: true,
      new_body_copy_generated: false,
      external_model_called: false,
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
    warnings: [
      "Selected rows may use pending GSC evidence when the ranker chooses QA-passed refresh candidates after no P0 query-backed MBTI rows remain.",
    ],
    recommended_next_tasks: {
      qa: "PERSONALITY-AGENT-AUTO-QA-AND-APPROVAL-HANDOFF-01",
      cms_draft: "blocked_until_qa_pass_and_human_approval_queue_write",
      search_release: "blocked_until_live_promotion_and_post_promotion_search_gate",
    },
  };

  const md = [
    "# Personality Agent Recommendation Auto Runner",
    "",
    `Generated at: ${output.generated_at}`,
    "",
    "## Decision",
    "",
    `- Status: ${output.status}`,
    `- Final decision: ${output.final_decision}`,
    `- Selected URLs: ${output.summary.selected_url_count}`,
    `- Recommendations emitted: ${output.summary.recommendation_count}`,
    "",
    "## Policy",
    "",
    "- Consumes the opportunity ranker `selected_for_auto_runner` queue.",
    "- Repackages existing recommendation artifacts that already passed their framework QA source.",
    "- Does not call GPT, GSC, CMS, Search Queue, deploy, sitemap, or llms surfaces.",
    "- CMS draft and approval queue writes remain separate backend gates.",
    "",
    "## Selected Recommendations",
    "",
    ...recommendations.map(
      (row) => `- ${row.path}: ${row.recommendations.title?.recommended ?? "(missing title)"} (${row.framework})`,
    ),
    "",
    "## Safety Boundary",
    "",
    ...Object.entries(output.safety_boundary).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Blockers",
    "",
    ...(blockers.length ? blockers.map((item) => `- ${item}`) : ["- None"]),
    "",
    "## Recommended Next Task",
    "",
    `- ${output.recommended_next_tasks.qa}`,
    "",
  ].join("\n");

  await fs.mkdir(path.dirname(OUTPUT_JSON), { recursive: true });
  await fs.writeFile(OUTPUT_JSON, `${JSON.stringify(output, null, 2)}\n`);
  await fs.writeFile(OUTPUT_MD, md);
  await fs.writeFile(OUTPUT_CSV, toCsv(recommendations));

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

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
