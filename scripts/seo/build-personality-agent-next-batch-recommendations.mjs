#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const GENERATED_DATE =
  getArgValue("--generated-date") ?? process.env.PERSONALITY_AGENT_NEXT_BATCH_RECOMMENDATIONS_DATE ?? "2026-06-25";
const SELECTION_PATH = resolveRepoPath(
  getArgValue("--selection") ??
    "docs/seo/personality/personality-agent-operations-next-batch-selection-2026-06-25.json",
);
const SOURCE_RECOMMENDATIONS_PATH = resolveRepoPath(
  getArgValue("--source-recommendations") ??
    "docs/seo/personality/mbti64-agent-expansion-88-recommendations-2026-06-21.json",
);
const SOURCE_QA_PATH = resolveRepoPath(
  getArgValue("--source-qa") ?? "docs/seo/personality/mbti64-agent-expansion-88-qa-2026-06-21.json",
);
const OUTPUT_JSON = resolveRepoPath(
  getArgValue("--output-json") ??
    `docs/seo/personality/personality-agent-operations-next-batch-recommendations-${GENERATED_DATE}.json`,
);
const OUTPUT_MD = resolveRepoPath(
  getArgValue("--output-md") ??
    `docs/seo/personality/personality-agent-operations-next-batch-recommendations-${GENERATED_DATE}.md`,
);
const OUTPUT_CSV = resolveRepoPath(
  getArgValue("--output-csv") ??
    `docs/seo/personality/personality-agent-operations-next-batch-recommendations-${GENERATED_DATE}.csv`,
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

function byTargetUrl(items) {
  return new Map(items.map((item) => [item.target_url, item]));
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function publicRecommendationDigest(recommendation) {
  return sha256(
    JSON.stringify({
      target_url: recommendation.target_url,
      title: recommendation.recommendations?.title?.recommended ?? "",
      description: recommendation.recommendations?.description?.recommended ?? "",
      h1: recommendation.recommendations?.h1?.recommended ?? "",
      quick_answer: recommendation.recommendations?.quick_answer?.recommended ?? "",
      faq: recommendation.recommendations?.faq ?? [],
      internal_links: recommendation.recommendations?.internal_links ?? [],
    }),
  );
}

function buildRecommendation(row, sourceRecommendation, sourceQa) {
  return {
    recommendation_id: `personality-agent-next-batch:${row.path}`,
    source_recommendation_id: sourceRecommendation.recommendation_id,
    source_recommendation_sha256: publicRecommendationDigest(sourceRecommendation),
    target_url: row.target_url,
    path: row.path,
    framework: row.framework,
    locale: sourceRecommendation.locale,
    page_type: row.page_type,
    mbti_type: row.mbti_type,
    selection_evidence: {
      priority_rank: row.priority_rank,
      priority_score: row.priority_score,
      evidence_quality: row.evidence_quality,
      query_rows_captured: row.query_rows_captured,
      page_metrics: row.page_metrics,
      selection_reason: row.selection_reason,
    },
    current_surface: sourceRecommendation.current_surface,
    observed_signal: {
      ...sourceRecommendation.observed_signal,
      selection_evidence_quality: row.evidence_quality,
      selection_query_rows_captured: row.query_rows_captured,
    },
    reference_patterns_used: sourceRecommendation.reference_patterns_used,
    recommendations: sourceRecommendation.recommendations,
    differentiation_notes: sourceRecommendation.differentiation_notes,
    qa_required: sourceRecommendation.qa_required,
    source_qa: {
      artifact_decision: sourceQa?.decision ?? null,
      blocker_count: sourceQa?.blockers?.length ?? 0,
      warning_count: sourceQa?.warnings?.length ?? 0,
    },
    blocked_reason: null,
    allowed_next_action: "run_next_batch_qa_before_any_cms_draft_handoff",
  };
}

function toCsv(rows) {
  const headers = [
    "path",
    "target_url",
    "framework",
    "locale",
    "page_type",
    "mbti_type",
    "priority_rank",
    "priority_score",
    "query_rows_captured",
    "recommended_title",
    "recommended_h1",
    "faq_count",
    "internal_link_count",
    "source_qa_decision",
  ];
  const lines = [headers.join(",")];
  for (const row of rows) {
    const flat = {
      ...row,
      priority_rank: row.selection_evidence.priority_rank,
      priority_score: row.selection_evidence.priority_score,
      query_rows_captured: row.selection_evidence.query_rows_captured,
      recommended_title: row.recommendations.title?.recommended ?? "",
      recommended_h1: row.recommendations.h1?.recommended ?? "",
      faq_count: row.recommendations.faq?.length ?? 0,
      internal_link_count: row.recommendations.internal_links?.length ?? 0,
      source_qa_decision: row.source_qa.artifact_decision ?? "",
    };
    lines.push(headers.map((header) => `"${String(flat[header] ?? "").replaceAll('"', '""')}"`).join(","));
  }
  return `${lines.join("\n")}\n`;
}

async function main() {
  const blockers = [];
  const warnings = [];
  const [selection, sourceRecommendations, sourceQa] = await Promise.all([
    readJson(SELECTION_PATH),
    readJson(SOURCE_RECOMMENDATIONS_PATH),
    readJson(SOURCE_QA_PATH),
  ]);

  if (selection.final_decision !== "PASS_NEXT_BATCH_SELECTION_READY") {
    blockers.push(`selection_not_ready:${selection.final_decision ?? "missing"}`);
  }
  if (!["pass", "pass_ready_for_qa_gates"].includes(sourceRecommendations.status)) {
    blockers.push(`source_recommendations_not_ready:${sourceRecommendations.status ?? "missing"}`);
  }
  if (sourceQa.final_decision !== "PASS_READY_FOR_CMS_DRAFT") {
    blockers.push(`source_qa_not_ready:${sourceQa.final_decision ?? "missing"}`);
  }

  const recommendationsByUrl = byTargetUrl(sourceRecommendations.recommendations ?? []);
  const qaByUrl = byTargetUrl(sourceQa.page_results ?? []);
  const selectedRows = selection.selected_next_batch ?? [];
  const recommendations = [];

  for (const row of selectedRows) {
    const sourceRecommendation = recommendationsByUrl.get(row.target_url);
    const sourceQaResult = qaByUrl.get(row.target_url);
    if (!sourceRecommendation) {
      blockers.push(`missing_source_recommendation:${row.target_url}`);
      continue;
    }
    if (sourceQaResult?.decision !== "PASS_READY_FOR_CMS_DRAFT") {
      blockers.push(`source_qa_not_pass:${row.target_url}:${sourceQaResult?.decision ?? "missing"}`);
      continue;
    }
    recommendations.push(buildRecommendation(row, sourceRecommendation, sourceQaResult));
  }

  if (selectedRows.length !== 3) blockers.push(`expected_3_selected_rows_found_${selectedRows.length}`);
  if (recommendations.length !== 3) blockers.push(`expected_3_recommendations_found_${recommendations.length}`);
  if (recommendations.some((item) => item.selection_evidence.query_rows_captured <= 0)) {
    blockers.push("recommendation_without_query_evidence");
  }

  for (const warning of [...(selection.warnings ?? []), ...(sourceQa.warnings ?? [])]) {
    if (!warnings.includes(warning)) warnings.push(warning);
  }

  const output = {
    artifact: "PERSONALITY-AGENT-OPERATIONS-NEXT-BATCH-RECOMMENDATIONS-01",
    generated_at: new Date().toISOString(),
    status: blockers.length === 0 ? "pass_ready_for_qa_gates" : "fail",
    final_decision:
      blockers.length === 0
        ? "PASS_NEXT_BATCH_RECOMMENDATIONS_READY_FOR_QA"
        : "NO_GO_NEXT_BATCH_RECOMMENDATIONS_BLOCKED",
    input_artifacts: {
      selection: rel(SELECTION_PATH),
      source_recommendations: rel(SOURCE_RECOMMENDATIONS_PATH),
      source_qa: rel(SOURCE_QA_PATH),
    },
    generation_policy: {
      mode: "subset_existing_agent_recommendations_no_new_body_generation",
      framework: "mbti64",
      selected_batch_rule: "Use exactly the 3 selected query-backed URLs from the next-batch selection artifact.",
      source_authority:
        "Repackage existing 88-page agent recommendations that already passed QA; do not create new CMS or runtime content.",
      cms_write_policy: "never_from_recommendation_artifact; CMS draft requires approval-gated backend command",
      search_release_policy: "never_from_recommendation_artifact",
    },
    summary: {
      selected_url_count: selectedRows.length,
      recommendation_count: recommendations.length,
      qa_pass_source_count: recommendations.filter((item) => item.source_qa.artifact_decision === "PASS_READY_FOR_CMS_DRAFT")
        .length,
      variant_pages: recommendations.filter((item) => item.page_type === "variant").length,
      comparison_pages: recommendations.filter((item) => item.page_type === "comparison").length,
      held_waitlist_count: selection.summary?.held_waitlist_count ?? 0,
    },
    recommendations,
    safety_boundary: {
      new_body_copy_generated: false,
      gpt_or_external_model_called: false,
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
      qa: "PERSONALITY-AGENT-OPERATIONS-NEXT-BATCH-QA-01",
      held_waitlist: "MBTI64-GSC-QUERY-API-OR-MANUAL-CSV-EXPORT-10-01",
      cms_draft: "deferred_until_next_batch_qa_passes_and_human_approval_is_available",
    },
  };

  const md = [
    "# Personality Agent Operations Next Batch Recommendations",
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
    `- Selected URLs: ${output.summary.selected_url_count}`,
    `- Recommendation packages: ${output.summary.recommendation_count}`,
    `- Variant pages: ${output.summary.variant_pages}`,
    `- Comparison pages: ${output.summary.comparison_pages}`,
    `- Held waitlist still blocked on query evidence: ${output.summary.held_waitlist_count}`,
    "",
    "## Recommendation Batch",
    "",
    ...recommendations.map(
      (item) =>
        `- ${item.path}: title "${item.recommendations.title?.recommended ?? ""}", H1 "${item.recommendations.h1?.recommended ?? ""}"`,
    ),
    "",
    "## Safety Boundary",
    "",
    "- No new body copy was generated in this PR; recommendations are a query-backed subset of the existing QA-passed 88-page package.",
    "- No CMS write, live promotion, frontend runtime change, Search Queue mutation, live search submit, sitemap/llms mutation, GSC API call, Request Indexing action, external model call, or production deploy was performed.",
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
    `- QA: ${output.recommended_next_tasks.qa}`,
    `- Held waitlist: ${output.recommended_next_tasks.held_waitlist}`,
    `- CMS draft: ${output.recommended_next_tasks.cms_draft}`,
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
