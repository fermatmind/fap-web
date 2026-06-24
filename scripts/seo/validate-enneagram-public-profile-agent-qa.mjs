#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const GENERATED_DATE = getArgValue("--generated-date") ?? "2026-06-24";
const INPUT_PATH =
  getArgValue("--input") ?? "docs/seo/personality/enneagram-public-profile-agent-pilot-2026-06-24.json";
const OUTPUT_JSON_PATH =
  getArgValue("--output-json") ?? `docs/seo/personality/enneagram-public-profile-agent-qa-${GENERATED_DATE}.json`;
const OUTPUT_MD_PATH =
  getArgValue("--output-md") ?? `docs/seo/personality/enneagram-public-profile-agent-qa-${GENERATED_DATE}.md`;

const REQUIRED_GATES = [
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

const ALLOWED_ENTITY_TYPES = new Set(["hub", "center", "core_type"]);
const REQUIRED_LOCALES = new Set(["en", "zh-CN"]);
const FORBIDDEN_ROUTE_PATTERN =
  /\/(?:result|results|orders|pay|payment|history|private|account)(?:\/|\?|$)|(?:token|session|result_id|report_id|order_no)=/i;
const CLAIM_PATTERNS = {
  trademark_or_affiliation: [
    /\bofficial\s+Enneagram\b/i,
    /\bEnneagram\s+(?:Institute|official|certified|approved|endorsed|affiliated)\b/i,
    /官方\s*九型人格/i,
    /九型人格\s*(?:认证|官方|背书|授权)/i,
  ],
  clinical_or_hiring: [
    /\bdiagnos(?:e|is|tic)\b/i,
    /\bclinical\b/i,
    /\btherapy\b/i,
    /\btreatment\b/i,
    /\bhiring\b/i,
    /\bscreen(?:ing)?\b/i,
    /\b诊断\b/i,
    /\b临床\b/i,
    /\b治疗\b/i,
    /\b招聘\b/i,
    /\b筛选\b/i,
  ],
  deterministic: [
    /\bguaranteed\b/i,
    /\bperfect\s+match\b/i,
    /\bdestined\b/i,
    /\bmust\s+(?:be|choose|avoid|become)\b/i,
    /\b命中注定\b/i,
    /\b保证\b/i,
    /\b必然\b/i,
    /\b必须\b/i,
  ],
  forbidden_expansion: [
    /\btritype\b/i,
    /\bwing\s*x\s*instinct\b/i,
    /\b54\s+wing\b/i,
    /\binstinctual\s+subtype\b/i,
    /\b三型组\b/i,
    /\b侧翼\s*[x×]\s*本能\b/i,
  ],
  result_leakage: [
    /\byour\s+(?:result|score|percentile)\b/i,
    /\bprivate\s+report\b/i,
    /\battempt_id\b/i,
    /\breport\s+engine\b/i,
    /\bscore\s+vector\b/i,
    /\b你(?:这次|的)?(?:结果|分数|百分位)\b/i,
    /\b私有报告\b/i,
    /\b报告引擎\b/i,
  ],
};

function getArgValue(name) {
  const prefix = `${name}=`;
  const found = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : null;
}

function readJson(filePath) {
  const absolute = path.isAbsolute(filePath) ? filePath : path.join(ROOT, filePath);
  return JSON.parse(fs.readFileSync(absolute, "utf8"));
}

function writeJson(filePath, value) {
  const absolute = path.isAbsolute(filePath) ? filePath : path.join(ROOT, filePath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(filePath, value) {
  const absolute = path.isAbsolute(filePath) ? filePath : path.join(ROOT, filePath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, value);
}

function rel(filePath) {
  return path.relative(ROOT, path.isAbsolute(filePath) ? filePath : path.join(ROOT, filePath));
}

function collectVisibleText(row) {
  const recommendation = row.recommendations ?? {};
  return [
    recommendation.title,
    recommendation.description,
    recommendation.h1,
    recommendation.quick_answer,
    ...(recommendation.faq ?? []).map((faq) => faq.answer),
    recommendation.differentiation_notes,
  ]
    .filter(Boolean)
    .join("\n");
}

function collectSerializedPublicRoutes(row) {
  return JSON.stringify({
    target_url: row.target_url,
    path: row.path,
    internal_links: row.recommendations?.internal_links ?? [],
  });
}

function patternHits(text, patterns) {
  return patterns.filter((pattern) => pattern.test(text)).map((pattern) => pattern.source);
}

function splitEvidenceClauses(text) {
  return String(text ?? "")
    .split(/(?<=[.!?。！？])\s+|\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function isNegatedBoundaryClause(clause) {
  return /\b(?:not|no|non[-\s]?|without|never)\b/i.test(clause) || /(?:不用于|不能|不得|不可|不是|并非|非|无)/.test(clause);
}

function riskPatternHits(text, patterns) {
  const hits = new Set();
  for (const clause of splitEvidenceClauses(text)) {
    for (const pattern of patterns) {
      if (pattern.test(clause) && !isNegatedBoundaryClause(clause)) {
        hits.add(pattern.source);
      }
    }
  }
  return [...hits];
}

function requiredShapeErrors(row) {
  const errors = [];
  const recommendation = row.recommendations ?? {};
  if (row.framework !== "enneagram") errors.push("framework_not_enneagram");
  if (!REQUIRED_LOCALES.has(row.locale)) errors.push("unsupported_locale");
  if (!ALLOWED_ENTITY_TYPES.has(row.entity_type)) errors.push(`unsupported_entity_type:${row.entity_type}`);
  if (!row.target_url?.startsWith("https://fermatmind.com/")) errors.push("target_url_not_canonical_host");
  if (!row.path?.startsWith(row.locale === "zh-CN" ? "/zh/personality/enneagram" : "/en/personality/enneagram")) {
    errors.push("path_not_enneagram_public_profile");
  }
  for (const field of ["title", "description", "h1", "quick_answer", "differentiation_notes"]) {
    if (!recommendation[field]) errors.push(`missing_${field}`);
  }
  if (!Array.isArray(recommendation.faq) || recommendation.faq.length < 2) errors.push("faq_less_than_2");
  if (!Array.isArray(recommendation.internal_links) || recommendation.internal_links.length < 2) {
    errors.push("internal_links_less_than_2");
  }
  if (!Array.isArray(row.qa_required)) {
    errors.push("qa_required_not_array");
  } else {
    for (const gate of REQUIRED_GATES) {
      if (!row.qa_required.includes(gate)) errors.push(`missing_required_gate:${gate}`);
    }
  }
  return errors;
}

function privateRouteErrors(row) {
  const errors = [];
  const routeText = collectSerializedPublicRoutes(row);
  if (FORBIDDEN_ROUTE_PATTERN.test(routeText)) errors.push("private_route_or_sensitive_query_pattern");
  for (const link of row.recommendations?.internal_links ?? []) {
    if (link.safe_public_route !== true) errors.push(`unsafe_internal_link:${link.target_url ?? "missing"}`);
    if (!String(link.target_url ?? "").startsWith("https://fermatmind.com/")) {
      errors.push(`non_canonical_internal_link:${link.target_url ?? "missing"}`);
    }
  }
  return errors;
}

function claimErrors(row) {
  const text = collectVisibleText(row);
  const errors = [];
  for (const [category, patterns] of Object.entries(CLAIM_PATTERNS)) {
    const hits = riskPatternHits(text, patterns);
    if (hits.length > 0) errors.push(`${category}:${hits.join("|")}`);
  }
  return errors;
}

function seoProjectionErrors(row) {
  const errors = [];
  const recommendation = row.recommendations ?? {};
  if (String(recommendation.title ?? "").length < 20) errors.push("title_too_short");
  if (String(recommendation.description ?? "").length < 50) errors.push("description_too_short");
  if (row.observed_signal !== "GSC_EVIDENCE_PENDING") errors.push("unexpected_observed_signal_state");
  return errors;
}

function bilingualErrors(row, rowsByKey) {
  const counterpartLocale = row.locale === "en" ? "zh-CN" : "en";
  const counterpart = rowsByKey.get(`${counterpartLocale}:${row.entity_type}:${row.code}`);
  return counterpart ? [] : ["missing_bilingual_counterpart"];
}

function duplicateErrors(row, titleCounts) {
  const title = String(row.recommendations?.title ?? "").toLowerCase().trim();
  return titleCounts.get(title) > 1 ? ["duplicate_title_signature"] : [];
}

function evaluateRow(row, rowsByKey, titleCounts) {
  const gateErrors = {
    schema_validation: requiredShapeErrors(row),
    method_evidence_boundary_gate: [],
    no_clinical_diagnosis_gate: riskPatternHits(collectVisibleText(row), CLAIM_PATTERNS.clinical_or_hiring),
    no_hiring_or_screening_gate: riskPatternHits(collectVisibleText(row), CLAIM_PATTERNS.clinical_or_hiring),
    no_deterministic_claim_gate: riskPatternHits(collectVisibleText(row), CLAIM_PATTERNS.deterministic),
    no_wing_instinct_tritype_expansion_gate: riskPatternHits(collectVisibleText(row), CLAIM_PATTERNS.forbidden_expansion),
    duplicate_template_gate: duplicateErrors(row, titleCounts),
    private_route_gate: privateRouteErrors(row),
    result_page_leakage_gate: riskPatternHits(collectVisibleText(row), CLAIM_PATTERNS.result_leakage),
    seo_projection_gate: seoProjectionErrors(row),
    bilingual_consistency_gate: bilingualErrors(row, rowsByKey),
    trademark_affiliation_gate: riskPatternHits(collectVisibleText(row), CLAIM_PATTERNS.trademark_or_affiliation),
  };
  const blockers = [...new Set(Object.values(gateErrors).flat())];
  return {
    target_url: row.target_url,
    path: row.path,
    locale: row.locale,
    entity_type: row.entity_type,
    code: row.code,
    decision: blockers.length === 0 ? "PASS_READY_FOR_APPROVAL_QUEUE" : "NO_GO_BLOCKED_BY_QA",
    gates: Object.fromEntries(Object.entries(gateErrors).map(([key, value]) => [key, value.length === 0 ? "pass" : "fail"])),
    blockers,
    warnings: row.observed_signal === "GSC_EVIDENCE_PENDING" ? ["GSC_EVIDENCE_PENDING"] : [],
  };
}

function main() {
  const input = readJson(INPUT_PATH);
  const recommendations = input.recommendations ?? [];
  const rowsByKey = new Map(recommendations.map((row) => [`${row.locale}:${row.entity_type}:${row.code}`, row]));
  const titleCounts = new Map();
  for (const row of recommendations) {
    const title = String(row.recommendations?.title ?? "").toLowerCase().trim();
    titleCounts.set(title, (titleCounts.get(title) ?? 0) + 1);
  }

  const pageResults = recommendations.map((row) => evaluateRow(row, rowsByKey, titleCounts));
  const blocked = pageResults.filter((result) => result.blockers.length > 0);
  const gateRollup = {};
  for (const gate of [...REQUIRED_GATES, "trademark_affiliation_gate"]) {
    gateRollup[gate] = pageResults.filter((result) => result.gates[gate] === "fail").length;
  }
  const blockers = [];
  if (recommendations.length !== 26) blockers.push(`expected_26_recommendations_found_${recommendations.length}`);
  if (blocked.length > 0) blockers.push("one_or_more_rows_blocked_by_qa");

  const output = {
    artifact: "ENNEAGRAM-PUBLIC-PROFILE-AGENT-QA-01",
    generated_at: new Date().toISOString(),
    status: blockers.length === 0 ? "pass" : "fail",
    final_decision: blockers.length === 0 ? "PASS_READY_FOR_APPROVAL_QUEUE" : "NO_GO_BLOCKED_BY_QA",
    input_artifact: rel(INPUT_PATH),
    scope:
      "Artifact-only Enneagram QA. No CMS write, no publish, no index/search release, no sitemap/llms mutation, no frontend runtime change.",
    summary: {
      checked_recommendation_count: recommendations.length,
      pass_ready_for_approval_queue_count: pageResults.filter(
        (result) => result.decision === "PASS_READY_FOR_APPROVAL_QUEUE",
      ).length,
      blocked_count: blocked.length,
      gsc_evidence_state: "GSC_EVIDENCE_PENDING",
      no_wings_instincts_tritype_count: recommendations.filter((row) => ALLOWED_ENTITY_TYPES.has(row.entity_type)).length,
    },
    gate_rollup: gateRollup,
    page_results: pageResults,
    safety_boundary: {
      artifact_only: true,
      cms_write_attempted: false,
      cms_live_promotion_attempted: false,
      frontend_runtime_change_attempted: false,
      publish_indexability_change_attempted: false,
      sitemap_llms_mutation_attempted: false,
      search_queue_mutation_attempted: false,
      live_search_submit_attempted: false,
      production_deploy_attempted: false,
    },
    blockers,
    warnings: ["GSC_EVIDENCE_PENDING"],
    recommended_next_task: "ENNEAGRAM-AGENT-APPROVAL-QUEUE-INTEGRATION-01",
  };

  const md = [
    "# Enneagram Public Profile Agent QA",
    "",
    `Generated at: ${output.generated_at}`,
    "",
    "## Decision",
    "",
    `- Status: ${output.status}`,
    `- Final decision: ${output.final_decision}`,
    `- Checked recommendations: ${output.summary.checked_recommendation_count}`,
    `- Passed rows: ${output.summary.pass_ready_for_approval_queue_count}`,
    `- Blocked rows: ${output.summary.blocked_count}`,
    "",
    "## Gate Rollup",
    "",
    ...Object.entries(gateRollup).map(([gate, count]) => `- ${gate}: ${count} failure(s)`),
    "",
    "## Page Results",
    "",
    ...pageResults.map((result) => `- ${result.path}: ${result.decision}`),
    "",
    "## Safety Boundary",
    "",
    "- Artifact only.",
    "- No CMS write, live promotion, frontend runtime change, publish/indexability change, sitemap/llms mutation, Search Queue mutation, live search submit, or production deploy was performed.",
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

  writeJson(OUTPUT_JSON_PATH, output);
  writeText(OUTPUT_MD_PATH, md);
  console.log(
    JSON.stringify(
      {
        output_json: rel(OUTPUT_JSON_PATH),
        output_md: rel(OUTPUT_MD_PATH),
        final_decision: output.final_decision,
        checked_count: recommendations.length,
        blocked_count: blocked.length,
      },
      null,
      2,
    ),
  );
}

main();
