#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const GENERATED_DATE = getArgValue("--generated-date") ?? "2026-06-27";

const INPUT_PATH = resolveRepoPath(
  getArgValue("--input") ??
    `docs/seo/personality/personality-agent-recommendation-auto-runner-${GENERATED_DATE}.json`,
);
const OUTPUT_JSON = resolveRepoPath(
  getArgValue("--output-json") ??
    `docs/seo/personality/personality-agent-auto-qa-and-approval-handoff-${GENERATED_DATE}.json`,
);
const OUTPUT_MD = resolveRepoPath(
  getArgValue("--output-md") ??
    `docs/seo/personality/personality-agent-auto-qa-and-approval-handoff-${GENERATED_DATE}.md`,
);
const OUTPUT_HANDOFF = resolveRepoPath(
  getArgValue("--output-handoff") ??
    `docs/seo/personality/personality-agent-auto-approval-handoff-package-${GENERATED_DATE}.json`,
);

const COMMON_REQUIRED_GATES = [
  "schema_validation",
  "trademark_claim_gate",
  "claim_risk_gate",
  "duplicate_template_gate",
  "private_route_gate",
  "result_page_leakage_gate",
  "seo_projection_gate",
  "bilingual_consistency_gate",
];

const FRAMEWORK_REQUIRED_GATES = {
  mbti64: COMMON_REQUIRED_GATES,
  big_five: [
    "schema_validation",
    "dimensional_model_gate",
    "no_official_big_five_32_ocean_type_gate",
    "no_high_low_good_bad_framing_gate",
    "claim_risk_gate",
    "duplicate_template_gate",
    "private_route_gate",
    "result_page_leakage_gate",
    "seo_projection_gate",
    "bilingual_consistency_gate",
  ],
  enneagram: [
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
  ],
};

const OFFICIAL_PATTERNS = [
  /\bofficial\s+MBTI\b/i,
  /\bofficial\s+Myers[-\s]?Briggs\b/i,
  /\bMyers[-\s]?Briggs\s+(?:affiliated|certified|approved|endorsed)\b/i,
  /\bMBTI\s+(?:certified|approved|endorsed|officially)\b/i,
  /\bofficial\s+16\s+types?\b/i,
  /\bofficial\s+32\s+types?\b/i,
  /\bofficial\s+Big\s+Five\s+32\b/i,
  /\bofficial\s+OCEAN\s+32\b/i,
  /官方\s*(?:MBTI|迈尔斯|Myers[-\s]?Briggs|16\s*型|32\s*型|大五\s*32|OCEAN\s*32)/i,
];

const CLAIM_RISK_PATTERNS = [
  /\bperfect\s+match\b/i,
  /\bguaranteed\b/i,
  /\bmust\s+(?:choose|avoid|become)\b/i,
  /\bdestined\b/i,
  /\b命中注定\b/i,
  /\b保证\b/i,
];

const CLINICAL_HIRING_PATTERNS = [
  /\bclinical\s+(?:diagnosis|decision)\b/i,
  /\bdiagnostic\s+tool\b/i,
  /\bhiring\s+screen(?:ing)?\s+tool\b/i,
  /\brecruitment\s+screen(?:ing)?\b/i,
  /\b临床\s*诊断\b/i,
  /\b招聘\s*筛选\s*工具\b/i,
];

const BIG_FIVE_BAD_FRAMING_PATTERNS = [
  /\bhigher\s+is\s+better\b/i,
  /\blower\s+is\s+worse\b/i,
  /\blower\s+is\s+better\b/i,
  /\bhigher\s+is\s+worse\b/i,
  /\bhigh\s+score\s+means\s+better\b/i,
  /\blow\s+score\s+means\s+worse\b/i,
  /越高越好/i,
  /越低越差/i,
  /高分代表更好/i,
  /低分代表更差/i,
];

const ENNEAGRAM_FORBIDDEN_EXPANSION_PATTERNS = [
  /\btritype\b/i,
  /\bwing\s*[x×]\s*instinct\b/i,
  /\b54\s+(?:wing|subtype|instinct)/i,
  /\b本能副型\s*[x×]\s*翼型\b/i,
  /\b三型组\b/i,
];

const RESULT_LEAKAGE_PATTERNS = [
  /\byour\s+(?:result|score|percentile)\b/i,
  /\bresult\s+id\b/i,
  /\breport\s+engine\b/i,
  /\bpayload\b/i,
  /\bscore\s+space\b/i,
  /\b你(?:这次|的)?(?:结果|分数|百分位)\b/i,
  /\b报告引擎\b/i,
  /\b结果\s*ID\b/i,
];

const PRIVATE_ROUTE_SEGMENTS = new Set([
  "result",
  "results",
  "order",
  "orders",
  "pay",
  "payment",
  "history",
  "private",
  "account",
  "share",
]);

const SENSITIVE_QUERY_PATTERNS = [/\btoken=/i, /\bsession=/i, /\bresult_id=/i, /\breport_id=/i, /\border_no=/i];

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

function sha256(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function collectStringValues(value, values = []) {
  if (typeof value === "string") {
    values.push(value);
    return values;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStringValues(item, values);
    return values;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectStringValues(item, values);
  }
  return values;
}

function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function visibleText(item) {
  return collectStringValues({
    target_url: item.target_url,
    current_surface: item.current_surface,
    observed_signal: item.observed_signal,
    recommendations: item.recommendations,
  }).join("\n");
}

function removeSafeBoundaryPhrases(text) {
  return text
    .replace(/\bnot\s+(?:a\s+)?(?:clinical\s+)?diagnosis\b/gi, " ")
    .replace(/\bnot\s+(?:for\s+)?(?:hiring|recruitment)\s+screen(?:ing)?\b/gi, " ")
    .replace(/\bnot\s+(?:a\s+)?(?:hiring|diagnostic|clinical)\s+tool\b/gi, " ")
    .replace(/\bnot\s+(?:diagnosis|hiring|deterministic)\b/gi, " ")
    .replace(/不(?:用于|作为)?(?:临床)?诊断/g, " ")
    .replace(/不(?:用于|作为)?招聘筛选/g, " ")
    .replace(/不是(?:诊断|招聘筛选|决定论)/g, " ");
}

function patternHits(text, patterns) {
  return patterns.filter((pattern) => pattern.test(text)).map((pattern) => pattern.source);
}

function pathIsPrivate(pathname) {
  const segments = pathname.split("/").filter(Boolean);
  if (!["en", "zh"].includes(segments[0])) return false;
  return PRIVATE_ROUTE_SEGMENTS.has(segments[1] ?? "");
}

function privateRouteHits(item) {
  const hits = [];
  for (const value of collectStringValues(item)) {
    const trimmed = value.trim();
    if (SENSITIVE_QUERY_PATTERNS.some((pattern) => pattern.test(trimmed))) hits.push(`sensitive_query:${trimmed}`);
    if (trimmed.startsWith("/")) {
      if (pathIsPrivate(trimmed)) hits.push(`private_path:${trimmed}`);
      continue;
    }
    if (!trimmed.startsWith("https://") && !trimmed.startsWith("http://")) continue;
    try {
      const url = new URL(trimmed);
      if (url.hostname === "fermatmind.com" && pathIsPrivate(url.pathname)) {
        hits.push(`private_absolute_url:${url.pathname}`);
      }
    } catch {
      hits.push("malformed_absolute_url");
    }
  }
  return [...new Set(hits)];
}

function schemaErrors(item) {
  const errors = [];
  const recommendation = item.recommendations ?? {};
  if (!["mbti64", "big_five", "enneagram"].includes(item.framework)) errors.push("unsupported_framework");
  if (!["en", "zh", "zh-CN"].includes(item.locale)) errors.push("unsupported_locale");
  if (!item.target_url?.startsWith("https://fermatmind.com/")) errors.push("target_url_not_canonical_host");
  if (!item.path?.startsWith("/")) errors.push("path_missing");
  if (item.blocked_reason !== null) errors.push("unexpected_blocked_reason");
  for (const key of ["title", "description", "h1", "quick_answer"]) {
    if (!recommendation[key]?.recommended) errors.push(`missing_${key}_recommendation`);
  }
  if (!Array.isArray(recommendation.faq) || recommendation.faq.length < 2) errors.push("faq_less_than_2");
  if (!Array.isArray(recommendation.internal_links) || recommendation.internal_links.length < 2) {
    errors.push("internal_links_less_than_2");
  }
  if (!Array.isArray(item.qa_required)) errors.push("qa_required_not_array");
  return errors;
}

function seoProjectionErrors(item) {
  const errors = [];
  const title = item.recommendations?.title?.recommended ?? "";
  const description = item.recommendations?.description?.recommended ?? "";
  const h1 = item.recommendations?.h1?.recommended ?? "";
  if (!title.includes("FermatMind")) errors.push("title_missing_brand");
  if ((title.match(/FermatMind/g) ?? []).length !== 1) errors.push("title_brand_not_single");
  if (description.length < 50 || description.length > 320) errors.push("description_length_outside_review_band");
  if (h1.includes("|")) errors.push("h1_contains_brand_separator");
  return errors;
}

function internalLinkErrors(item) {
  const errors = [];
  const localePrefix = item.locale === "zh-CN" || item.locale === "zh" ? "/zh/" : "/en/";
  for (const link of item.recommendations?.internal_links ?? []) {
    if (link.safe_public_route !== true) errors.push(`unsafe_internal_link:${link.href ?? "missing_href"}`);
    if (typeof link.href !== "string" || !link.href.startsWith(localePrefix)) {
      errors.push(`wrong_locale_internal_link:${link.href ?? "missing_href"}`);
    }
  }
  return errors;
}

function duplicateSignature(item) {
  const recommendation = item.recommendations ?? {};
  return normalizeText(
    [
      recommendation.title?.recommended,
      recommendation.description?.recommended,
      recommendation.h1?.recommended,
      recommendation.quick_answer?.recommended,
      ...(recommendation.faq ?? []).map((faq) => `${faq.question} ${faq.answer}`),
    ].join(" "),
  );
}

function duplicateGroups(recommendations) {
  const groups = new Map();
  for (const item of recommendations) {
    const signature = duplicateSignature(item);
    groups.set(signature, [...(groups.get(signature) ?? []), item.target_url]);
  }
  return groups;
}

function evaluateFrameworkGates(item, duplicateMap) {
  const raw = visibleText(item);
  const claimText = removeSafeBoundaryPhrases(raw);
  const duplicateHits = duplicateMap.get(duplicateSignature(item))?.length > 1 ? ["duplicate_signature"] : [];
  const common = {
    schema_validation: schemaErrors(item),
    claim_risk_gate: [
      ...patternHits(claimText, CLAIM_RISK_PATTERNS),
      ...patternHits(claimText, CLINICAL_HIRING_PATTERNS),
    ],
    duplicate_template_gate: duplicateHits,
    private_route_gate: [...privateRouteHits(item), ...internalLinkErrors(item)],
    result_page_leakage_gate: patternHits(raw, RESULT_LEAKAGE_PATTERNS),
    seo_projection_gate: seoProjectionErrors(item),
    bilingual_consistency_gate: [],
  };

  if (item.framework === "big_five") {
    return {
      schema_validation: common.schema_validation,
      dimensional_model_gate: item.recommendations?.differentiation_notes?.some((note) =>
        /dimensional|维度/i.test(note),
      )
        ? []
        : ["missing_dimensional_model_boundary"],
      no_official_big_five_32_ocean_type_gate: patternHits(raw, OFFICIAL_PATTERNS),
      no_high_low_good_bad_framing_gate: patternHits(raw, BIG_FIVE_BAD_FRAMING_PATTERNS),
      claim_risk_gate: common.claim_risk_gate,
      duplicate_template_gate: common.duplicate_template_gate,
      private_route_gate: common.private_route_gate,
      result_page_leakage_gate: common.result_page_leakage_gate,
      seo_projection_gate: common.seo_projection_gate,
      bilingual_consistency_gate: common.bilingual_consistency_gate,
    };
  }

  if (item.framework === "enneagram") {
    return {
      schema_validation: common.schema_validation,
      method_evidence_boundary_gate: /reflective|反思|observation|观察/i.test(raw) ? [] : ["missing_reflective_boundary"],
      no_clinical_diagnosis_gate: patternHits(claimText, CLINICAL_HIRING_PATTERNS),
      no_hiring_or_screening_gate: patternHits(claimText, CLINICAL_HIRING_PATTERNS),
      no_deterministic_claim_gate: patternHits(claimText, CLAIM_RISK_PATTERNS),
      no_wing_instinct_tritype_expansion_gate: patternHits(raw, ENNEAGRAM_FORBIDDEN_EXPANSION_PATTERNS),
      duplicate_template_gate: common.duplicate_template_gate,
      private_route_gate: common.private_route_gate,
      result_page_leakage_gate: common.result_page_leakage_gate,
      seo_projection_gate: common.seo_projection_gate,
      bilingual_consistency_gate: common.bilingual_consistency_gate,
    };
  }

  return {
    schema_validation: common.schema_validation,
    trademark_claim_gate: patternHits(raw, OFFICIAL_PATTERNS),
    claim_risk_gate: common.claim_risk_gate,
    duplicate_template_gate: common.duplicate_template_gate,
    private_route_gate: common.private_route_gate,
    result_page_leakage_gate: common.result_page_leakage_gate,
    seo_projection_gate: common.seo_projection_gate,
    bilingual_consistency_gate: common.bilingual_consistency_gate,
  };
}

function evaluateItem(item, duplicateMap) {
  const gateHits = evaluateFrameworkGates(item, duplicateMap);
  const blockers = Object.entries(gateHits)
    .filter(([, hits]) => hits.length > 0)
    .map(([gate, hits]) => `${gate}:${hits.join("|")}`);

  return {
    target_url: item.target_url,
    path: item.path,
    framework: item.framework,
    locale: item.locale,
    page_type: item.page_type,
    entity_key: item.entity_key,
    decision: blockers.length === 0 ? "PASS_READY_FOR_APPROVAL_HANDOFF" : "NO_GO_BLOCKED_BY_AUTO_QA",
    gates: Object.fromEntries(Object.entries(gateHits).map(([gate, hits]) => [gate, hits.length ? "fail" : "pass"])),
    blockers,
    warnings: [],
    recommendation_sha256: sha256(item),
    source_recommendation_sha256: item.source_recommendation_sha256,
    allowed_next_action: blockers.length === 0 ? "approval_queue_dry_run_only" : "repair_recommendation_artifact",
    recommended_next_task:
      blockers.length === 0
        ? "PERSONALITY-AGENT-APPROVAL-QUEUE-AUTO-HANDOFF-DRY-RUN-01"
        : "PERSONALITY-AGENT-RECOMMENDATION-AUTO-RUNNER-REPAIR-01",
  };
}

function countBy(rows, key) {
  return rows.reduce((acc, row) => {
    const value = row[key] ?? "unknown";
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}

function gateRollup(pageResults) {
  const counts = {};
  for (const result of pageResults) {
    for (const [gate, status] of Object.entries(result.gates)) {
      counts[gate] = counts[gate] ?? 0;
      if (status !== "pass") counts[gate] += 1;
    }
  }
  return counts;
}

async function main() {
  const input = await readJson(INPUT_PATH);
  const recommendations = input.recommendations ?? [];
  const blockers = [];
  const duplicateMap = duplicateGroups(recommendations);
  const pageResults = recommendations.map((item) => evaluateItem(item, duplicateMap));
  const passRows = pageResults.filter((row) => row.decision === "PASS_READY_FOR_APPROVAL_HANDOFF");

  if (input.final_decision !== "PASS_RECOMMENDATION_AUTO_RUNNER_READY_FOR_AUTO_QA") {
    blockers.push(`input_not_ready:${input.final_decision ?? "missing"}`);
  }
  if (recommendations.length === 0) blockers.push("no_recommendations_to_qa");
  if (passRows.length !== recommendations.length) blockers.push("some_recommendations_blocked_by_auto_qa");

  const report = {
    artifact: "PERSONALITY-AGENT-AUTO-QA-AND-APPROVAL-HANDOFF-01",
    generated_at: new Date().toISOString(),
    status: blockers.length === 0 ? "pass_ready_for_approval_handoff" : "fail",
    final_decision:
      blockers.length === 0
        ? "PASS_READY_FOR_APPROVAL_HANDOFF_DRY_RUN"
        : "NO_GO_AUTO_QA_OR_HANDOFF_BLOCKED",
    input_artifact: rel(INPUT_PATH),
    scope: "QA and approval handoff artifacts only. No production approval queue write, CMS write, promotion, publish, index/search release, sitemap/llms mutation, queue mutation, deploy, or external API call.",
    gates_by_framework: FRAMEWORK_REQUIRED_GATES,
    summary: {
      checked_recommendation_count: recommendations.length,
      pass_ready_for_approval_handoff_count: passRows.length,
      blocked_count: pageResults.length - passRows.length,
      framework_counts: countBy(pageResults, "framework"),
      duplicate_signature_group_count: [...duplicateMap.values()].filter((items) => items.length > 1).length,
    },
    gate_rollup: gateRollup(pageResults),
    page_results: pageResults,
    safety_boundary: {
      artifact_only: true,
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
    },
    blockers,
    warnings: input.warnings ?? [],
    recommended_next_task: "PERSONALITY-AGENT-APPROVAL-QUEUE-AUTO-HANDOFF-DRY_RUN-01",
  };

  const passByUrl = new Map(passRows.map((row) => [row.target_url, row]));
  const handoffRecommendations = recommendations
    .filter((row) => passByUrl.has(row.target_url))
    .map((row) => ({
      ...row,
      recommendation_sha256: passByUrl.get(row.target_url)?.recommendation_sha256,
      auto_qa_decision: passByUrl.get(row.target_url)?.decision,
      auto_qa_gates: passByUrl.get(row.target_url)?.gates,
      allowed_next_action: "approval_queue_dry_run_only_before_any_write",
    }));

  const handoff = {
    artifact: "PERSONALITY-AGENT-AUTO-APPROVAL-HANDOFF-PACKAGE-01",
    generated_at: report.generated_at,
    status: blockers.length === 0 ? "pass_ready_for_approval_queue_dry_run" : "blocked_by_auto_qa",
    final_decision:
      blockers.length === 0
        ? "PASS_APPROVAL_HANDOFF_PACKAGE_READY_FOR_DRY_RUN"
        : "NO_GO_APPROVAL_HANDOFF_PACKAGE_BLOCKED",
    input_artifacts: {
      recommendation_auto_runner: rel(INPUT_PATH),
      auto_qa_report: rel(OUTPUT_JSON),
    },
    handoff_policy: {
      pass_only: true,
      production_queue_write_policy: "not_allowed_from_this_pr",
      cms_write_policy: "blocked_until_human_approval_and_backend_draft_gate",
      search_release_policy: "blocked_until_live_promotion_and_post_promotion_search_gate",
    },
    summary: {
      recommendation_count: handoffRecommendations.length,
      framework_counts: countBy(handoffRecommendations, "framework"),
      blocked_source_count: recommendations.length - handoffRecommendations.length,
    },
    recommendations: handoffRecommendations,
    safety_boundary: report.safety_boundary,
    blockers,
    warnings: report.warnings,
    recommended_next_task: "PERSONALITY-AGENT-APPROVAL-QUEUE-AUTO-HANDOFF-DRY_RUN-01",
  };

  const md = [
    "# Personality Agent Auto QA And Approval Handoff",
    "",
    `Generated at: ${report.generated_at}`,
    "",
    "## Decision",
    "",
    `- Status: ${report.status}`,
    `- Final decision: ${report.final_decision}`,
    `- Checked recommendations: ${report.summary.checked_recommendation_count}`,
    `- PASS handoff rows: ${report.summary.pass_ready_for_approval_handoff_count}`,
    `- Blocked rows: ${report.summary.blocked_count}`,
    "",
    "## Scope",
    "",
    report.scope,
    "",
    "## PASS Rows",
    "",
    ...passRows.map((row) => `- ${row.path}: ${row.framework}`),
    "",
    "## Safety Boundary",
    "",
    ...Object.entries(report.safety_boundary).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Blockers",
    "",
    ...(blockers.length ? blockers.map((item) => `- ${item}`) : ["- None"]),
    "",
    "## Recommended Next Task",
    "",
    `- ${report.recommended_next_task}`,
    "",
  ].join("\n");

  await fs.mkdir(path.dirname(OUTPUT_JSON), { recursive: true });
  await fs.writeFile(OUTPUT_JSON, `${JSON.stringify(report, null, 2)}\n`);
  await fs.writeFile(OUTPUT_MD, md);
  await fs.writeFile(OUTPUT_HANDOFF, `${JSON.stringify(handoff, null, 2)}\n`);

  console.log(
    JSON.stringify(
      {
        output_json: rel(OUTPUT_JSON),
        output_md: rel(OUTPUT_MD),
        output_handoff: rel(OUTPUT_HANDOFF),
        final_decision: report.final_decision,
        pass_count: passRows.length,
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
