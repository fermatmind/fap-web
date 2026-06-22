#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const GENERATED_DATE = "2026-06-22";
const GSC_IMPORT_PATH = path.join(
  ROOT,
  "docs/seo/personality/mbti64-seo-measurement-cohort-gsc-import-2026-06-22.json",
);
const RECOMMENDATIONS_PATH = path.join(
  ROOT,
  "docs/seo/personality/mbti64-agent-expansion-88-recommendations-2026-06-21.json",
);
const QA_PATH = path.join(ROOT, "docs/seo/personality/mbti64-agent-expansion-88-qa-2026-06-21.json");
const REFERENCE_PACK_PATH = path.join(
  ROOT,
  "docs/seo/personality/mbti64-optimized-pilot-reference-pack-2026-06-21.json",
);
const OUTPUT_JSON = path.join(
  ROOT,
  `docs/seo/personality/mbti64-agent-optimization-priority-selection-${GENERATED_DATE}.json`,
);
const OUTPUT_MD = path.join(
  ROOT,
  `docs/seo/personality/mbti64-agent-optimization-priority-selection-${GENERATED_DATE}.md`,
);

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

function scoreRecord(record) {
  const impressions = record.gsc?.impressions ?? 0;
  const ctr = record.gsc?.ctr ?? 0;
  const position = record.gsc?.average_position ?? 100;
  const positionLift = Math.max(0, 30 - position) / 10;
  const noClickLift = (record.gsc?.clicks ?? 0) === 0 ? 2 : 0;
  return Number((impressions * (1 - ctr) + positionLift + noClickLift).toFixed(3));
}

function buildRecord(record, recommendationMap) {
  const hasRecommendation = recommendationMap.has(record.url);
  const hasGscRow = record.gsc.status === "GSC_IMPORTED";
  const isPilot = record.cohort_group === "pilot_8";
  const score = scoreRecord(record);
  let selectionTier = "P3_DISCOVERY_BACKLOG_NO_GSC_ROW";
  let action = "observe_until_gsc_visibility";
  let rationale = "No row appeared for this URL in the attached GSC page-table snapshot.";

  if (hasGscRow && !isPilot && hasRecommendation) {
    selectionTier = "P1_AGENT_REVIEW_VISIBLE_EXPANSION";
    action = "review_existing_agent_recommendation_against_page_level_gsc_signal";
    rationale =
      "Expansion URL has early GSC visibility and an existing QA-passed agent recommendation; prioritize it before no-row pages.";
  } else if (hasGscRow && isPilot) {
    selectionTier = "P2_PILOT_OBSERVE_NO_REWRITE";
    action = "observe_optimized_pilot_without_rewriting";
    rationale =
      "Optimized pilot page has GSC visibility; do not regenerate or rewrite unless a later query-level export shows a concrete CTR issue.";
  } else if (!hasGscRow && isPilot) {
    selectionTier = "P4_PILOT_NO_ROW_OBSERVE";
    action = "observe_optimized_pilot_until_gsc_row_appears";
    rationale = "Optimized pilot page has no row in the attached 24h page snapshot.";
  }

  return {
    url: record.url,
    path: record.path,
    locale: record.locale,
    page_type: record.page_type,
    mbti_type: record.mbti_type,
    variant: record.variant,
    cohort_group: record.cohort_group,
    selection_tier: selectionTier,
    priority_score: score,
    recommended_action: action,
    rationale,
    has_agent_recommendation: hasRecommendation,
    gsc: {
      status: record.gsc.status,
      clicks: record.gsc.clicks,
      impressions: record.gsc.impressions,
      ctr: record.gsc.ctr,
      average_position: record.gsc.average_position,
      source_kind: record.gsc.source_kind,
      query_rows_available: Array.isArray(record.gsc.queries) && record.gsc.queries.length > 0,
    },
    current_opportunity_tier: record.opportunity.tier,
    next_input_needed:
      hasGscRow && record.gsc.source_kind === "gsc_browser_page_table_snapshot"
        ? "query_level_gsc_export_before_serp_copy_rewrite"
        : "continue_measurement",
  };
}

function groupByTier(records) {
  const output = {};
  for (const record of records) {
    output[record.selection_tier] ??= [];
    output[record.selection_tier].push(record.url);
  }
  return output;
}

async function main() {
  const [gscImport, recommendations, qa, referencePack] = await Promise.all([
    readJson(GSC_IMPORT_PATH),
    readJson(RECOMMENDATIONS_PATH),
    readJson(QA_PATH),
    readJson(REFERENCE_PACK_PATH),
  ]);

  const blockers = [];
  const warnings = [];
  if (gscImport.final_decision !== "PASS_GSC_IMPORTED_PRIORITY_READY") {
    blockers.push(`gsc_import_not_ready:${gscImport.final_decision}`);
  }
  if (gscImport.summary?.total !== 96) blockers.push(`expected_96_gsc_records_found_${gscImport.summary?.total}`);
  if (recommendations.summary?.recommendation_count !== 88) {
    blockers.push(`expected_88_recommendations_found_${recommendations.summary?.recommendation_count}`);
  }
  if (qa.final_decision !== "PASS_READY_FOR_CMS_DRAFT") {
    blockers.push(`qa_not_ready:${qa.final_decision}`);
  }
  if (referencePack.summary?.pilot_page_count !== 8) {
    blockers.push(`expected_8_pilot_reference_pages_found_${referencePack.summary?.pilot_page_count}`);
  }
  if (gscImport.input_artifacts?.gsc_csv?.source_kind === "gsc_browser_page_table_snapshot") {
    warnings.push("GSC_SOURCE_PAGE_TABLE_SNAPSHOT_QUERY_DIMENSION_UNAVAILABLE");
  }

  const recommendationMap = new Map(
    recommendations.recommendations.map((recommendation) => [recommendation.target_url, recommendation]),
  );
  const records = gscImport.records
    .map((record) => buildRecord(record, recommendationMap))
    .sort((a, b) => {
      const tierOrder = {
        P1_AGENT_REVIEW_VISIBLE_EXPANSION: 1,
        P2_PILOT_OBSERVE_NO_REWRITE: 2,
        P3_DISCOVERY_BACKLOG_NO_GSC_ROW: 3,
        P4_PILOT_NO_ROW_OBSERVE: 4,
      };
      return (
        tierOrder[a.selection_tier] - tierOrder[b.selection_tier] ||
        b.priority_score - a.priority_score ||
        a.path.localeCompare(b.path)
      );
    });

  const selectedForAgentReview = records.filter(
    (record) => record.selection_tier === "P1_AGENT_REVIEW_VISIBLE_EXPANSION",
  );
  const pilotObserve = records.filter((record) => record.selection_tier === "P2_PILOT_OBSERVE_NO_REWRITE");
  const noRowExpansion = records.filter((record) => record.selection_tier === "P3_DISCOVERY_BACKLOG_NO_GSC_ROW");
  const noRowPilot = records.filter((record) => record.selection_tier === "P4_PILOT_NO_ROW_OBSERVE");

  const output = {
    artifact: "MBTI64-AGENT-OPTIMIZATION-PRIORITY-SELECTION-01",
    generated_at: new Date().toISOString(),
    status: blockers.length === 0 ? "pass" : "fail",
    final_decision: blockers.length === 0 ? "PASS_PRIORITY_SELECTION_READY" : "NO_GO_PRIORITY_SELECTION_BLOCKED",
    input_artifacts: {
      gsc_import: "docs/seo/personality/mbti64-seo-measurement-cohort-gsc-import-2026-06-22.json",
      recommendations: "docs/seo/personality/mbti64-agent-expansion-88-recommendations-2026-06-21.json",
      qa: "docs/seo/personality/mbti64-agent-expansion-88-qa-2026-06-21.json",
      optimized_pilot_reference_pack:
        "docs/seo/personality/mbti64-optimized-pilot-reference-pack-2026-06-21.json",
    },
    evidence_boundary: {
      source_kind: gscImport.input_artifacts?.gsc_csv?.source_kind ?? null,
      page_level_gsc_rows_available: gscImport.summary?.with_gsc_rows ?? 0,
      query_level_gsc_rows_available: false,
      no_cms_write: true,
      no_frontend_runtime_change: true,
      no_search_queue_mutation: true,
      no_live_search_submit: true,
    },
    selection_rules: [
      "Do not rewrite the 8 optimized pilot pages from page-level GSC evidence alone.",
      "Prioritize non-pilot expansion URLs that have GSC rows and QA-passed agent recommendations.",
      "Treat no-row URLs as discovery backlog until a longer-window or query-level export changes the evidence.",
      "Use query-level GSC export before SERP copy rewrite decisions.",
    ],
    summary: {
      total_urls: records.length,
      selected_for_agent_review: selectedForAgentReview.length,
      pilot_observe_no_rewrite: pilotObserve.length,
      expansion_backlog_no_gsc_row: noRowExpansion.length,
      pilot_no_gsc_row_observe: noRowPilot.length,
      p0_high_impressions_low_ctr: gscImport.summary?.p0 ?? 0,
      p1_visible_no_clicks: gscImport.summary?.p1 ?? 0,
      p2_early_visibility_observe: gscImport.summary?.p2 ?? 0,
      p3_no_gsc_visibility_yet: gscImport.summary?.p3 ?? 0,
    },
    priority_buckets: groupByTier(records),
    selected_for_agent_review: selectedForAgentReview,
    pilot_observe_no_rewrite: pilotObserve,
    records,
    blockers,
    warnings,
    recommended_next_task: "MBTI64-AGENT-VISIBLE-EXPANSION-13-REVIEW-01",
    alternative_next_task_if_query_level_required: "MBTI64-SEO-MEASUREMENT-COHORT-GSC-QUERY-EXPORT-01",
  };

  const topLines = selectedForAgentReview
    .slice(0, 13)
    .map(
      (record, index) =>
        `${index + 1}. ${record.path} - impressions ${record.gsc.impressions}, clicks ${record.gsc.clicks}, position ${record.gsc.average_position}, score ${record.priority_score}`,
    );

  const md = [
    "# MBTI64 Agent Optimization Priority Selection",
    "",
    `Generated at: ${output.generated_at}`,
    "",
    "## Decision",
    "",
    `- Status: ${output.status}`,
    `- Final decision: ${output.final_decision}`,
    `- Recommended next task: ${output.recommended_next_task}`,
    "",
    "## Summary",
    "",
    `- Total MBTI64 URLs: ${output.summary.total_urls}`,
    `- Selected for immediate agent review: ${output.summary.selected_for_agent_review}`,
    `- Optimized pilot pages to observe, not rewrite: ${output.summary.pilot_observe_no_rewrite}`,
    `- Expansion backlog with no GSC row in the attached snapshot: ${output.summary.expansion_backlog_no_gsc_row}`,
    `- Pilot pages with no GSC row in the attached snapshot: ${output.summary.pilot_no_gsc_row_observe}`,
    `- P0 high impressions low CTR: ${output.summary.p0_high_impressions_low_ctr}`,
    `- P1 visible no clicks: ${output.summary.p1_visible_no_clicks}`,
    `- P2 early visibility observe: ${output.summary.p2_early_visibility_observe}`,
    `- P3 no GSC visibility yet: ${output.summary.p3_no_gsc_visibility_yet}`,
    "",
    "## Immediate Agent Review Queue",
    "",
    ...(topLines.length ? topLines : ["None."]),
    "",
    "## Evidence Boundary",
    "",
    `- GSC source kind: ${output.evidence_boundary.source_kind}`,
    "- Query-level rows available: false",
    "- The current input supports page-level prioritization, not query-specific title rewrites.",
    "- No CMS write, frontend runtime change, Search Queue mutation, live search submit, sitemap, llms or llms-full mutation was performed.",
    "",
    "## Selection Rules",
    "",
    ...output.selection_rules.map((rule) => `- ${rule}`),
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
