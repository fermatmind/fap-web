#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const GENERATED_DATE = "2026-06-22";
const PRIORITY_PATH = path.join(
  ROOT,
  "docs/seo/personality/mbti64-agent-optimization-priority-selection-2026-06-22.json",
);
const RECOMMENDATIONS_PATH = path.join(
  ROOT,
  "docs/seo/personality/mbti64-agent-expansion-88-recommendations-2026-06-21.json",
);
const QA_PATH = path.join(ROOT, "docs/seo/personality/mbti64-agent-expansion-88-qa-2026-06-21.json");
const OUTPUT_JSON = path.join(
  ROOT,
  `docs/seo/personality/mbti64-agent-visible-expansion-13-review-${GENERATED_DATE}.json`,
);
const OUTPUT_MD = path.join(
  ROOT,
  `docs/seo/personality/mbti64-agent-visible-expansion-13-review-${GENERATED_DATE}.md`,
);

const PRIVATE_PATTERNS = [
  /\/results?\b/i,
  /\/orders?\b/i,
  /\/pay(?:ment)?\b/i,
  /\/history\b/i,
  /\/private\b/i,
  /\/account\b/i,
  /token=/i,
  /session=/i,
  /result_id=/i,
  /report_id=/i,
  /order_no=/i,
];

const CLAIM_PATTERNS = [
  /\bofficial\s+mbti\b/i,
  /\bmyers[-\s]?briggs\b/i,
  /\bcertified\b/i,
  /\bguarantee[sd]?\b/i,
  /\bperfect\s+match\b/i,
  /\bbest\s+career\b/i,
  /官方\s*MBTI/i,
  /认证/i,
  /绝对/i,
  /最适合/i,
];

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

function flattenRecommendationText(recommendation) {
  const parts = [
    recommendation.recommendations.title?.recommended,
    recommendation.recommendations.description?.recommended,
    recommendation.recommendations.h1?.recommended,
    recommendation.recommendations.quick_answer?.recommended,
    ...(recommendation.recommendations.faq ?? []).flatMap((item) => [item.question, item.answer]),
    ...(recommendation.recommendations.internal_links ?? []).flatMap((item) => [item.href, item.anchor_text]),
  ];
  return parts.filter(Boolean).join("\n");
}

function scanPatterns(text, patterns) {
  return patterns.flatMap((pattern) => {
    const match = text.match(pattern);
    return match ? [match[0]] : [];
  });
}

function scanClaimPatterns(text) {
  const rawHits = scanPatterns(text, CLAIM_PATTERNS);
  const hasBoundaryNegation =
    /不.{0,20}(官方\s*MBTI|MBTI\s*原生维度)/i.test(text) ||
    /not.{0,80}(official\s+mbti|mbti-native|native\s+mbti)/i.test(text);
  return {
    blocking_hits: rawHits.filter((hit) => {
      const officialHit = /official\s+mbti|官方\s*MBTI/i.test(hit);
      return !(officialHit && hasBoundaryNegation);
    }),
    contextual_boundary_hits: rawHits.filter((hit) => {
      const officialHit = /official\s+mbti|官方\s*MBTI/i.test(hit);
      return officialHit && hasBoundaryNegation;
    }),
  };
}

function classifyReview(priorityRecord, recommendation) {
  const impressions = priorityRecord.gsc.impressions ?? 0;
  const clicks = priorityRecord.gsc.clicks ?? 0;
  const ctr = priorityRecord.gsc.ctr ?? 0;
  const position = priorityRecord.gsc.average_position ?? null;
  if (!recommendation) {
    return {
      review_status: "blocked_missing_recommendation",
      next_action: "repair_missing_agent_recommendation",
      rationale: "Priority record has no matching agent recommendation package.",
    };
  }
  if (impressions >= 100 && ctr < 0.005) {
    return {
      review_status: "high_priority_query_export_required",
      next_action: "attach_query_level_gsc_export_before_rewrite",
      rationale: "High impressions with near-zero CTR requires query-level evidence before rewriting title or description.",
    };
  }
  if (impressions >= 30 && clicks === 0) {
    return {
      review_status: "medium_priority_query_export_required",
      next_action: "attach_query_level_gsc_export_before_rewrite",
      rationale: "Visible no-click page needs query-title alignment evidence before rewrite.",
    };
  }
  if (impressions > 0 && position !== null) {
    return {
      review_status: "early_visibility_review_ready",
      next_action: "review_existing_recommendation_no_immediate_rewrite",
      rationale:
        "The page has early visibility, but page-level evidence is insufficient for query-specific SERP copy changes.",
    };
  }
  return {
    review_status: "observe",
    next_action: "continue_measurement",
    rationale: "No actionable GSC visibility signal in this review scope.",
  };
}

async function main() {
  const [priority, recommendations, qa] = await Promise.all([
    readJson(PRIORITY_PATH),
    readJson(RECOMMENDATIONS_PATH),
    readJson(QA_PATH),
  ]);

  const blockers = [];
  const warnings = [];
  if (priority.final_decision !== "PASS_PRIORITY_SELECTION_READY") {
    blockers.push(`priority_selection_not_ready:${priority.final_decision}`);
  }
  if (qa.final_decision !== "PASS_READY_FOR_CMS_DRAFT") {
    blockers.push(`qa_not_ready:${qa.final_decision}`);
  }
  if (priority.summary?.selected_for_agent_review !== 13) {
    blockers.push(`expected_13_selected_found_${priority.summary?.selected_for_agent_review}`);
  }
  if (priority.evidence_boundary?.query_level_gsc_rows_available === false) {
    warnings.push("QUERY_LEVEL_GSC_ROWS_UNAVAILABLE");
  }

  const recommendationMap = new Map(
    recommendations.recommendations.map((recommendation) => [recommendation.target_url, recommendation]),
  );

  const reviewedPages = priority.selected_for_agent_review.map((priorityRecord, index) => {
    const recommendation = recommendationMap.get(priorityRecord.url);
    const text = recommendation ? flattenRecommendationText(recommendation) : "";
    const privateHits = scanPatterns(text, PRIVATE_PATTERNS);
    const claimScan = scanClaimPatterns(text);
    const review = classifyReview(priorityRecord, recommendation);
    const qaReady =
      Boolean(recommendation) &&
      recommendation.blocked_reason === null &&
      recommendation.status === "draft_recommendation" &&
      privateHits.length === 0 &&
      claimScan.blocking_hits.length === 0;

    return {
      rank: index + 1,
      target_url: priorityRecord.url,
      path: priorityRecord.path,
      locale: priorityRecord.locale,
      page_type: priorityRecord.page_type,
      mbti_type: priorityRecord.mbti_type,
      variant: priorityRecord.variant,
      priority_score: priorityRecord.priority_score,
      gsc: priorityRecord.gsc,
      source_recommendation_id: recommendation?.recommendation_id ?? null,
      current_surface: recommendation?.current_surface ?? null,
      recommended_surface: recommendation?.recommendations
        ? {
            title: recommendation.recommendations.title.recommended,
            description: recommendation.recommendations.description.recommended,
            h1: recommendation.recommendations.h1.recommended,
            quick_answer: recommendation.recommendations.quick_answer.recommended,
            faq_count: recommendation.recommendations.faq.length,
            internal_link_count: recommendation.recommendations.internal_links.length,
          }
        : null,
      review,
      qa_spot_check: {
        existing_qa_ready: qaReady,
        private_route_hits: privateHits,
        claim_boundary_hits: claimScan.blocking_hits,
        contextual_claim_boundary_hits: claimScan.contextual_boundary_hits,
        safe_public_internal_links:
          recommendation?.recommendations.internal_links.every((link) => link.safe_public_route === true) ?? false,
      },
      decision:
        qaReady && review.review_status === "early_visibility_review_ready"
          ? "READY_FOR_EDITORIAL_REVIEW_NO_IMMEDIATE_SERP_REWRITE"
          : qaReady
            ? "READY_WITH_EVIDENCE_CONDITION"
            : "BLOCKED_REPAIR_REQUIRED",
    };
  });

  const summary = {
    reviewed_page_count: reviewedPages.length,
    ready_for_editorial_review_no_immediate_serp_rewrite: reviewedPages.filter(
      (page) => page.decision === "READY_FOR_EDITORIAL_REVIEW_NO_IMMEDIATE_SERP_REWRITE",
    ).length,
    ready_with_evidence_condition: reviewedPages.filter((page) => page.decision === "READY_WITH_EVIDENCE_CONDITION")
      .length,
    blocked_repair_required: reviewedPages.filter((page) => page.decision === "BLOCKED_REPAIR_REQUIRED").length,
    private_route_hit_count: reviewedPages.reduce(
      (total, page) => total + page.qa_spot_check.private_route_hits.length,
      0,
    ),
    claim_boundary_hit_count: reviewedPages.reduce(
      (total, page) => total + page.qa_spot_check.claim_boundary_hits.length,
      0,
    ),
    contextual_claim_boundary_review_count: reviewedPages.reduce(
      (total, page) => total + page.qa_spot_check.contextual_claim_boundary_hits.length,
      0,
    ),
    query_level_required_before_serp_rewrite: reviewedPages.length,
  };

  if (summary.blocked_repair_required > 0) blockers.push(`blocked_review_pages_${summary.blocked_repair_required}`);
  if (summary.contextual_claim_boundary_review_count > 0) {
    warnings.push(`CONTEXTUAL_CLAIM_BOUNDARY_REVIEW_${summary.contextual_claim_boundary_review_count}`);
  }

  const output = {
    artifact: "MBTI64-AGENT-VISIBLE-EXPANSION-13-REVIEW-01",
    generated_at: new Date().toISOString(),
    status: blockers.length === 0 ? "pass" : "fail",
    final_decision:
      blockers.length === 0
        ? "PASS_VISIBLE_EXPANSION_13_REVIEW_READY"
        : "NO_GO_VISIBLE_EXPANSION_13_REVIEW_BLOCKED",
    input_artifacts: {
      priority_selection: "docs/seo/personality/mbti64-agent-optimization-priority-selection-2026-06-22.json",
      recommendations: "docs/seo/personality/mbti64-agent-expansion-88-recommendations-2026-06-21.json",
      qa: "docs/seo/personality/mbti64-agent-expansion-88-qa-2026-06-21.json",
    },
    evidence_boundary: {
      gsc_source_kind: priority.evidence_boundary?.source_kind ?? null,
      query_level_gsc_rows_available: false,
      no_cms_write: true,
      no_frontend_runtime_change: true,
      no_search_queue_mutation: true,
      no_live_search_submit: true,
    },
    summary,
    reviewed_pages: reviewedPages,
    blockers,
    warnings,
    recommended_next_task: "MBTI64-SEO-MEASUREMENT-COHORT-GSC-QUERY-EXPORT-01",
    alternative_next_task_if_query_export_deferred: "MBTI64-CMS-PROJECTION-DRAFT-VISIBLE-13-DRY-RUN-01",
  };

  const rows = reviewedPages.map(
    (page) =>
      `${page.rank}. ${page.path} - impressions ${page.gsc.impressions}, clicks ${page.gsc.clicks}, position ${page.gsc.average_position}, decision ${page.decision}`,
  );

  const md = [
    "# MBTI64 Agent Visible Expansion 13 Review",
    "",
    `Generated at: ${output.generated_at}`,
    "",
    "## Decision",
    "",
    `- Status: ${output.status}`,
    `- Final decision: ${output.final_decision}`,
    `- Recommended next task: ${output.recommended_next_task}`,
    `- Alternative if query export is deferred: ${output.alternative_next_task_if_query_export_deferred}`,
    "",
    "## Summary",
    "",
    `- Reviewed pages: ${summary.reviewed_page_count}`,
    `- Ready for editorial review, no immediate SERP rewrite: ${summary.ready_for_editorial_review_no_immediate_serp_rewrite}`,
    `- Blocked repair required: ${summary.blocked_repair_required}`,
    `- Private route hits: ${summary.private_route_hit_count}`,
    `- Claim boundary hits: ${summary.claim_boundary_hit_count}`,
    `- Contextual claim-boundary review notes: ${summary.contextual_claim_boundary_review_count}`,
    `- Query-level export required before SERP rewrite: ${summary.query_level_required_before_serp_rewrite}`,
    "",
    "## Reviewed Pages",
    "",
    ...rows,
    "",
    "## Evidence Boundary",
    "",
    `- GSC source kind: ${output.evidence_boundary.gsc_source_kind}`,
    "- Query-level GSC rows available: false",
    "- Page-level visibility is enough to select a review queue, not enough to rewrite title/description against query intent.",
    "- No CMS write, frontend runtime change, Search Queue mutation, live search submit, sitemap, llms or llms-full mutation was performed.",
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
