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
const GENERATED_DATE = sanitizeDateSlug(getArgValue("--generated-date") ?? "2026-06-25", "generated date");

const SOURCE_RECOMMENDATIONS_PATH = resolveRepoPath(
  getArgValue("--source-recommendations") ??
    "docs/seo/personality/mbti64-agent-expansion-88-recommendations-2026-06-21.json",
);
const SOURCE_QA_PATH = resolveRepoPath(
  getArgValue("--source-qa") ?? "docs/seo/personality/mbti64-agent-expansion-88-qa-2026-06-21.json",
);
const SELECTION_PATH = resolveRepoPath(
  getArgValue("--selection") ??
    "docs/seo/personality/personality-agent-operations-next-batch-selection-2026-06-25.json",
);

const OUTPUT_PACKAGE = resolveOutputPath(
  ROOT,
  getArgValue("--output-package") ??
    `docs/seo/personality/personality-agent-operations-next-batch-6-handoff-package-${GENERATED_DATE}.json`,
  "output package path",
);
const OUTPUT_QA = resolveOutputPath(
  ROOT,
  getArgValue("--output-qa") ??
    `docs/seo/personality/personality-agent-operations-next-batch-6-handoff-qa-${GENERATED_DATE}.json`,
  "output QA path",
);
const OUTPUT_MD = resolveOutputPath(
  ROOT,
  getArgValue("--output-md") ??
    `docs/seo/personality/personality-agent-operations-next-batch-6-handoff-${GENERATED_DATE}.md`,
  "output Markdown path",
);
const OUTPUT_CSV = resolveOutputPath(
  ROOT,
  getArgValue("--output-csv") ??
    `docs/seo/personality/personality-agent-operations-next-batch-6-handoff-${GENERATED_DATE}.csv`,
  "output CSV path",
);

const BILINGUAL_PAIRS = new Map([
  ["/zh/personality/intp-a", "/en/personality/intp-a"],
  ["/zh/personality/esfp-a", "/en/personality/esfp-a"],
  ["/en/personality/enfj-a", "/zh/personality/enfj-a"],
]);

const HANDOFF_PATHS = [
  "/zh/personality/intp-a",
  "/en/personality/intp-a",
  "/zh/personality/esfp-a",
  "/en/personality/esfp-a",
  "/en/personality/enfj-a",
  "/zh/personality/enfj-a",
];

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

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function byTargetUrl(items) {
  return new Map((items ?? []).map((item) => [item.target_url, item]));
}

function pathFromUrl(url) {
  return new URL(url).pathname;
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

function sourceFileSha(value) {
  return sha256(JSON.stringify(value));
}

function buildSelectionEvidence(pathname, selectionByPath) {
  const selected = selectionByPath.get(pathname);
  if (selected) {
    return {
      handoff_class: "query_backed",
      paired_source_path: null,
      evidence_quality: selected.evidence_quality,
      query_rows_captured: selected.query_rows_captured,
      priority_rank: selected.priority_rank,
      priority_score: selected.priority_score,
      page_metrics: selected.page_metrics,
      selection_reason: selected.selection_reason,
    };
  }

  const pairedSourcePath = [...BILINGUAL_PAIRS.entries()].find(([, counterpart]) => counterpart === pathname)?.[0] ?? null;
  const pairedSource = pairedSourcePath ? selectionByPath.get(pairedSourcePath) : null;
  return {
    handoff_class: "bilingual_paired_counterpart",
    paired_source_path: pairedSourcePath,
    evidence_quality: "bilingual_counterpart_of_query_backed_page",
    query_rows_captured: 0,
    priority_rank: pairedSource?.priority_rank ?? null,
    priority_score: pairedSource?.priority_score ?? null,
    page_metrics: null,
    selection_reason: pairedSourcePath
      ? `paired_with_query_backed_counterpart:${pairedSourcePath}`
      : "paired_counterpart_without_selection_row",
  };
}

function normalizeRecommendation(sourceRecommendation, qaRow, selectionEvidence) {
  const pathname = pathFromUrl(sourceRecommendation.target_url);
  return {
    recommendation_id: `personality-agent-next-batch-6:${pathname}`,
    source_recommendation_id: sourceRecommendation.recommendation_id,
    source_recommendation_sha256: publicRecommendationDigest(sourceRecommendation),
    target_url: sourceRecommendation.target_url,
    path: pathname,
    framework: sourceRecommendation.framework,
    locale: sourceRecommendation.locale,
    page_type: qaRow?.page_type ?? "variant",
    mbti_type: pathname.split("/").pop()?.split("-")[0]?.toUpperCase() ?? null,
    handoff_class: selectionEvidence.handoff_class,
    paired_source_path: selectionEvidence.paired_source_path,
    selection_evidence: selectionEvidence,
    current_surface: sourceRecommendation.current_surface,
    observed_signal: {
      ...sourceRecommendation.observed_signal,
      handoff_evidence_quality: selectionEvidence.evidence_quality,
      handoff_query_rows_captured: selectionEvidence.query_rows_captured,
    },
    reference_patterns_used: sourceRecommendation.reference_patterns_used,
    recommendations: sourceRecommendation.recommendations,
    qa_required: sourceRecommendation.qa_required,
    source_qa: {
      artifact_decision: qaRow?.decision ?? null,
      gates: qaRow?.gates ?? {},
      blocker_count: qaRow?.blockers?.length ?? 0,
      warning_count: qaRow?.warnings?.length ?? 0,
    },
    blocked_reason: null,
    allowed_next_action: "approval_queue_dry_run_before_any_cms_draft_handoff",
  };
}

function csvEscape(value) {
  return safeCsvEscape(value);
}

function toCsv(recommendations, qaRows) {
  const qaByUrl = byTargetUrl(qaRows);
  const headers = [
    "path",
    "target_url",
    "framework",
    "locale",
    "page_type",
    "mbti_type",
    "handoff_class",
    "paired_source_path",
    "qa_decision",
    "source_qa_decision",
    "evidence_quality",
    "query_rows_captured",
    "recommended_title",
    "recommended_h1",
  ];
  const lines = [headers.join(",")];
  for (const item of recommendations) {
    const qa = qaByUrl.get(item.target_url);
    const row = {
      path: item.path,
      target_url: item.target_url,
      framework: item.framework,
      locale: item.locale,
      page_type: item.page_type,
      mbti_type: item.mbti_type,
      handoff_class: item.handoff_class,
      paired_source_path: item.paired_source_path,
      qa_decision: qa?.decision ?? "",
      source_qa_decision: item.source_qa.artifact_decision,
      evidence_quality: item.selection_evidence.evidence_quality,
      query_rows_captured: item.selection_evidence.query_rows_captured,
      recommended_title: item.recommendations?.title?.recommended ?? "",
      recommended_h1: item.recommendations?.h1?.recommended ?? "",
    };
    lines.push(headers.map((header) => csvEscape(row[header])).join(","));
  }
  return `${lines.join("\n")}\n`;
}

function toMd(packageArtifact, qaArtifact) {
  const rows = packageArtifact.recommendations
    .map(
      (item) =>
        `| ${item.path} | ${item.handoff_class} | ${item.paired_source_path ?? ""} | ${
          item.selection_evidence.evidence_quality
        } | ${item.source_qa.artifact_decision} |`,
    )
    .join("\n");

  return `# PERSONALITY-AGENT-OPERATIONS-NEXT-BATCH-6-HANDOFF-01

Status: ${packageArtifact.status}

This artifact-only handoff extracts six MBTI64 recommendation rows from the already generated 88-page agent recommendation and QA artifacts.

## Decision

- Package decision: ${packageArtifact.final_decision}
- QA handoff decision: ${qaArtifact.final_decision}
- Query-backed rows: ${packageArtifact.summary.query_backed_count}
- Bilingual paired counterpart rows: ${packageArtifact.summary.bilingual_paired_counterpart_count}
- CMS writes: false
- Approval queue writes: false
- Publish/index/search/sitemap/llms: false

## Pages

| Path | Class | Paired source | Evidence quality | Source QA |
| --- | --- | --- | --- | --- |
${rows}

## Safety Boundary

- No new body copy generated.
- No GPT or external model call.
- No CMS write.
- No approval queue write.
- No live promotion.
- No frontend runtime change.
- No sitemap or llms mutation.
- No Search Queue mutation or live search submission.

## Recommended Next Task

\`PERSONALITY-AGENT-APPROVAL-QUEUE-NEXT-BATCH-6-DRY-RUN-01\`
`;
}

async function main() {
  const blockers = [];
  const warnings = [];
  const [sourceRecommendations, sourceQa, selection] = await Promise.all([
    readJson(SOURCE_RECOMMENDATIONS_PATH),
    readJson(SOURCE_QA_PATH),
    readJson(SELECTION_PATH),
  ]);

  const recommendationsByUrl = byTargetUrl(sourceRecommendations.recommendations ?? []);
  const qaByUrl = byTargetUrl(sourceQa.page_results ?? []);
  const selectionByPath = new Map((selection.selected_next_batch ?? []).map((row) => [row.path, row]));

  if (sourceQa.final_decision !== "PASS_READY_FOR_CMS_DRAFT") {
    blockers.push(`source_qa_not_pass:${sourceQa.final_decision ?? "missing"}`);
  }

  const recommendations = [];
  const qaPageResults = [];

  for (const pathname of HANDOFF_PATHS) {
    const targetUrl = `https://fermatmind.com${pathname}`;
    const sourceRecommendation = recommendationsByUrl.get(targetUrl);
    const qaRow = qaByUrl.get(targetUrl);
    const selectionEvidence = buildSelectionEvidence(pathname, selectionByPath);

    if (!sourceRecommendation) {
      blockers.push(`missing_source_recommendation:${targetUrl}`);
      continue;
    }
    if (!qaRow) {
      blockers.push(`missing_source_qa:${targetUrl}`);
      continue;
    }
    if (qaRow.decision !== "PASS_READY_FOR_CMS_DRAFT") {
      blockers.push(`source_qa_not_pass:${targetUrl}:${qaRow.decision}`);
      continue;
    }
    if (qaRow.blockers?.length) {
      blockers.push(`source_qa_blockers:${targetUrl}:${qaRow.blockers.join("|")}`);
      continue;
    }

    const item = normalizeRecommendation(sourceRecommendation, qaRow, selectionEvidence);
    recommendations.push(item);
    qaPageResults.push({
      target_url: item.target_url,
      path: item.path,
      framework: item.framework,
      locale: item.locale,
      page_type: item.page_type,
      handoff_class: item.handoff_class,
      paired_source_path: item.paired_source_path,
      decision: "PASS_READY_FOR_APPROVAL_REVIEW",
      source_qa_decision: qaRow.decision,
      gates: qaRow.gates ?? {},
      blockers: [],
      warnings: item.handoff_class === "bilingual_paired_counterpart" ? ["paired_counterpart_no_direct_query_row"] : [],
      blocked_reason: null,
      allowed_next_action: "approval_queue_dry_run",
    });
  }

  const queryBackedCount = recommendations.filter((item) => item.handoff_class === "query_backed").length;
  const pairedCount = recommendations.filter((item) => item.handoff_class === "bilingual_paired_counterpart").length;
  if (recommendations.length !== 6) blockers.push(`expected_6_recommendations_found_${recommendations.length}`);
  if (queryBackedCount !== 3) blockers.push(`expected_3_query_backed_found_${queryBackedCount}`);
  if (pairedCount !== 3) blockers.push(`expected_3_bilingual_pairs_found_${pairedCount}`);

  const generatedAt = new Date().toISOString();
  const sourceRecommendationSha = sourceFileSha(sourceRecommendations);
  const sourceQaSha = sourceFileSha(sourceQa);

  const safetyBoundary = {
    artifact_only: true,
    new_body_copy_generated: false,
    gpt_or_external_model_called: false,
    approval_queue_write_attempted: false,
    cms_write_attempted: false,
    cms_live_promotion_attempted: false,
    frontend_runtime_change_attempted: false,
    search_queue_mutation_attempted: false,
    live_search_submit_attempted: false,
    sitemap_llms_mutation_attempted: false,
    gsc_api_call_attempted: false,
    gsc_request_indexing_attempted: false,
    production_deploy_attempted: false,
  };

  const packageArtifact = {
    artifact: "PERSONALITY-AGENT-OPERATIONS-NEXT-BATCH-6-HANDOFF-01",
    generated_at: generatedAt,
    status: blockers.length === 0 ? "pass" : "fail",
    final_decision:
      blockers.length === 0
        ? "PASS_NEXT_BATCH_6_HANDOFF_READY_FOR_APPROVAL_QUEUE_DRY_RUN"
        : "NO_GO_NEXT_BATCH_6_HANDOFF_BLOCKED",
    input_artifacts: {
      source_recommendations: rel(SOURCE_RECOMMENDATIONS_PATH),
      source_recommendations_sha256: sourceRecommendationSha,
      source_qa: rel(SOURCE_QA_PATH),
      source_qa_sha256: sourceQaSha,
      selection: rel(SELECTION_PATH),
    },
    handoff_policy: {
      mode: "subset_existing_agent_recommendations_no_new_body_generation",
      framework: "mbti64",
      page_count: 6,
      query_backed_rule: "Use the 3 selected query-backed next-batch pages.",
      bilingual_pair_rule: "Add the opposite-locale counterpart for each selected MBTI type.",
      cms_write_policy: "not_allowed_from_this_artifact",
      approval_queue_policy: "dry_run_next; write_requires_separate_authorization",
    },
    summary: {
      recommendation_count: recommendations.length,
      query_backed_count: queryBackedCount,
      bilingual_paired_counterpart_count: pairedCount,
      variant_pages: recommendations.filter((item) => item.page_type === "variant").length,
      comparison_pages: recommendations.filter((item) => item.page_type === "comparison").length,
      source_qa_pass_count: recommendations.filter((item) => item.source_qa.artifact_decision === "PASS_READY_FOR_CMS_DRAFT")
        .length,
    },
    recommendations,
    safety_boundary: safetyBoundary,
    blockers,
    warnings,
    recommended_next_task: "PERSONALITY-AGENT-APPROVAL-QUEUE-NEXT-BATCH-6-DRY-RUN-01",
  };

  const qaArtifact = {
    artifact: "PERSONALITY-AGENT-OPERATIONS-NEXT-BATCH-6-HANDOFF-QA-01",
    generated_at: generatedAt,
    status: blockers.length === 0 ? "pass" : "fail",
    final_decision:
      blockers.length === 0 ? "PASS_READY_FOR_APPROVAL_REVIEW" : "NO_GO_NEXT_BATCH_6_QA_HANDOFF_BLOCKED",
    input_artifacts: packageArtifact.input_artifacts,
    summary: {
      checked_recommendation_count: qaPageResults.length,
      pass_ready_for_approval_review_count: qaPageResults.filter(
        (item) => item.decision === "PASS_READY_FOR_APPROVAL_REVIEW",
      ).length,
      query_backed_count: queryBackedCount,
      bilingual_paired_counterpart_count: pairedCount,
      blocked_count: blockers.length,
    },
    page_results: qaPageResults,
    safety_boundary: safetyBoundary,
    blockers,
    warnings,
    recommended_next_task: "PERSONALITY-AGENT-APPROVAL-QUEUE-NEXT-BATCH-6-DRY-RUN-01",
  };

  await Promise.all([
    writeJson(OUTPUT_PACKAGE, packageArtifact),
    writeJson(OUTPUT_QA, qaArtifact),
    fs.writeFile(OUTPUT_MD, toMd(packageArtifact, qaArtifact)),
    fs.writeFile(OUTPUT_CSV, toCsv(recommendations, qaPageResults)),
  ]);

  if (blockers.length > 0) {
    console.error(JSON.stringify({ blockers }, null, 2));
    process.exitCode = 1;
    return;
  }

  console.log(
    JSON.stringify(
      {
        package: rel(OUTPUT_PACKAGE),
        qa: rel(OUTPUT_QA),
        md: rel(OUTPUT_MD),
        csv: rel(OUTPUT_CSV),
        recommendation_count: recommendations.length,
        query_backed_count: queryBackedCount,
        bilingual_paired_counterpart_count: pairedCount,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
