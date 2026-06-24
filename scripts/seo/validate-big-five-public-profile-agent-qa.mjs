#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const GENERATED_DATE = process.env.GENERATED_DATE || "2026-06-24";
const GENERATED_AT = process.env.GENERATED_AT || `${GENERATED_DATE}T00:00:00.000Z`;
const PILOT_JSON = `docs/seo/personality/big-five-public-profile-agent-pilot-${GENERATED_DATE}.json`;
const OUTPUT_JSON = `docs/seo/personality/big-five-public-profile-agent-qa-${GENERATED_DATE}.json`;
const OUTPUT_MD = `docs/seo/personality/big-five-public-profile-agent-qa-${GENERATED_DATE}.md`;

const DECISIONS = {
  pass: "PASS_READY_FOR_APPROVAL_QUEUE",
  repair: "CONDITIONAL_EDITORIAL_REPAIR_REQUIRED",
  blocked: "NO_GO_BLOCKED_BY_QA",
};

const REQUIRED_GATES = [
  "schema_validation",
  "dimensional_model_gate",
  "no_official_big_five_32_ocean_type_gate",
  "no_high_low_good_bad_framing_gate",
  "claim_safety_gate",
  "private_route_gate",
  "result_page_leakage_gate",
  "duplicate_template_risk_gate",
  "bilingual_consistency_gate",
  "seo_projection_gate",
];

const PRIVATE_ROUTE_PATTERN = /\/(private|results?|orders?|pay|payment|history|account)(\/|\b|\?)/i;
const PRIVATE_SECRET_PATTERN = /\b(token|session|result_id|order_id|payment_id)=/i;
const RESULT_ROUTE_PATTERN = /\/(results?|orders?|pay|payment|history|account)(\/|\b|\?)/i;
const GOOD_BAD_PATTERN = /\b(good|bad|better|worse|best|worst|superior|inferior)\b|优秀|糟糕|更好|更差|最好|最差|优于|劣于/i;
const AFFIRMATIVE_CLAIM_PATTERN =
  /\b(clinical diagnosis|medical diagnosis|therapy|treatment|employment screening|hiring decision|intelligence score|iq score|guarantee[sd]?|predicts? (?:career|relationship|salary|success|performance))\b|诊断|治疗|招聘筛选|录用决定|智力分数|保证|预测(?:职业|关系|薪资|成功|表现)/i;

function readFile(relativePath) {
  return fs.readFileSync(path.resolve(ROOT, relativePath), "utf8");
}

function writeFile(relativePath, content) {
  const absolute = path.resolve(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, content);
}

function sha256Text(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function text(value) {
  return String(value || "").trim();
}

function markdownTableCell(value) {
  return text(value)
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", " ")
    .replaceAll("\r", " ")
    .replaceAll("|", "\\|");
}

function gate(id, passed, details, severity = "hard") {
  return {
    id,
    passed: Boolean(passed),
    severity,
    details,
  };
}

function rowText(row) {
  return [
    row.target_url,
    row.current_surface?.title,
    row.current_surface?.description,
    row.current_surface?.h1,
    row.current_surface?.quick_answer,
    row.recommendations?.title?.recommended,
    row.recommendations?.description?.recommended,
    row.recommendations?.h1?.recommended,
    row.recommendations?.quick_answer?.recommended,
    ...(row.recommendations?.differentiation_notes || []),
    ...(row.recommendations?.faq || []).flatMap((item) => [item.question, item.answer]),
    ...(row.recommendations?.internal_links || []).flatMap((item) => [item.href, item.anchor_text, item.reason]),
  ].filter(Boolean).join("\n");
}

function coreRecommendationText(row) {
  return [
    row.recommendations?.title?.recommended,
    row.recommendations?.description?.recommended,
    row.recommendations?.h1?.recommended,
    row.recommendations?.quick_answer?.recommended,
    ...(row.recommendations?.differentiation_notes || []),
  ].filter(Boolean).join("\n");
}

function removeSafetyDisclaimers(value) {
  return value
    .replace(/\bnot diagnosis, hiring or deterministic decisions\b/gi, "")
    .replace(/\bnot for diagnosis, hiring or deterministic decisions\b/gi, "")
    .replace(/\bnever good\/bad ranking\b/gi, "")
    .replace(/不用于诊断、招聘或确定性判断/g, "")
    .replace(/不是优劣排名/g, "")
    .replace(/不用于诊断/g, "");
}

function schemaValidation(row) {
  const required = [
    "recommendation_id",
    "target_url",
    "framework",
    "locale",
    "source_inputs",
    "current_surface",
    "observed_signal",
    "reference_patterns_used",
    "recommendations",
    "qa_required",
    "blocked_reason",
    "status",
  ];
  const missing = required.filter((key) => !(key in row));
  const valid =
    missing.length === 0 &&
    row.framework === "big_five" &&
    ["en", "zh-CN"].includes(row.locale) &&
    row.status === "qa_ready" &&
    /^https:\/\/fermatmind\.com\/(en|zh)\/personality\/big-five/.test(row.target_url);
  return gate("schema_validation", valid, missing.length === 0 ? "Required shape and public Big Five URL match." : `Missing keys: ${missing.join(", ")}`);
}

function dimensionalModelGate(row, coverage) {
  const valid =
    coverage?.entity_type &&
    ["hub", "domain", "polarity", "facet_hub"].includes(coverage.entity_type) &&
    coverage.entity_type !== "facet_detail" &&
    !/OCEAN_32/i.test(coverage.code || "") &&
    row.framework === "big_five";
  return gate("dimensional_model_gate", valid, "Rows remain Big Five dimensional public-profile entities, not fabricated type pages.");
}

function ocean32Gate(row, coverage) {
  const serialized = `${row.target_url}\n${coverage?.code || ""}\n${coverage?.slug || ""}\n${rowText(row)}`;
  const valid = !/OCEAN_32|Big Five 32|official OCEAN type|32型|官方.*类型/i.test(serialized);
  return gate("no_official_big_five_32_ocean_type_gate", valid, "No official Big Five 32 or OCEAN type expansion claim detected.");
}

function goodBadGate(row, coverage) {
  const serialized = removeSafetyDisclaimers(coreRecommendationText(row));
  const hasGoodBad = GOOD_BAD_PATTERN.test(serialized);
  const allowedRankContext = /\bnot a rank\b|不是(?:一个)?排名|不是优劣/i.test(serialized);
  const valid = !hasGoodBad && (coverage?.entity_type !== "polarity" || allowedRankContext || !/\brank(?:ing|ed)?\b|排名/i.test(serialized));
  return gate("no_high_low_good_bad_framing_gate", valid, "High/low language stays descriptive and avoids good/bad or superiority framing.");
}

function claimSafetyGate(row) {
  const serialized = removeSafetyDisclaimers(rowText(row));
  const valid = !AFFIRMATIVE_CLAIM_PATTERN.test(serialized);
  return gate("claim_safety_gate", valid, "No affirmative clinical, therapy, hiring, intelligence, deterministic career, relationship, salary, success, or performance claim detected.");
}

function privateRouteGate(row) {
  const serialized = rowText(row);
  const valid = !PRIVATE_ROUTE_PATTERN.test(serialized) && !PRIVATE_SECRET_PATTERN.test(serialized);
  return gate("private_route_gate", valid, "No private route or secret-like parameter marker detected.");
}

function resultPageGate(row) {
  const serialized = rowText(row);
  const valid = !RESULT_ROUTE_PATTERN.test(serialized);
  return gate("result_page_leakage_gate", valid, "No result, order, payment, history, or account route leakage detected.");
}

function duplicateRiskGate(row, sameLocaleTitleCount, sameLocaleDescriptionCount) {
  const valid = sameLocaleTitleCount === 1 && sameLocaleDescriptionCount === 1;
  return gate("duplicate_template_risk_gate", valid, "Recommended title and description are unique within the same locale.");
}

function bilingualGate(coverage, codeLocaleMap) {
  const locales = codeLocaleMap.get(coverage?.code || "") || new Set();
  const valid = locales.has("en") && locales.has("zh-CN");
  return gate("bilingual_consistency_gate", valid, "Logical Big Five entity has both en and zh-CN recommendation rows.");
}

function seoProjectionGate(row) {
  const title = text(row.recommendations?.title?.recommended);
  const description = text(row.recommendations?.description?.recommended);
  const faqCount = row.recommendations?.faq?.length || 0;
  const linkCount = row.recommendations?.internal_links?.length || 0;
  const minTitleLength = row.locale === "zh-CN" ? 6 : 12;
  const minDescriptionLength = row.locale === "zh-CN" ? 60 : 80;
  const valid = title.length >= minTitleLength && title.length <= 90 && description.length >= minDescriptionLength && description.length <= 320 && faqCount >= 1 && linkCount >= 1;
  return gate("seo_projection_gate", valid, "Title, description, FAQ, and internal-link projection are bounded for later editorial approval.");
}

function evaluateRows(pilot) {
  const coverageById = new Map(pilot.coverage.rows.map((row) => [row.recommendation_id, row]));
  const codeLocaleMap = new Map();
  for (const row of pilot.coverage.rows) {
    const locales = codeLocaleMap.get(row.code) || new Set();
    locales.add(row.locale);
    codeLocaleMap.set(row.code, locales);
  }

  const titleCounts = new Map();
  const descriptionCounts = new Map();
  for (const row of pilot.recommendations) {
    const titleKey = `${row.locale}:${text(row.recommendations?.title?.recommended).toLowerCase()}`;
    const descriptionKey = `${row.locale}:${text(row.recommendations?.description?.recommended).toLowerCase()}`;
    titleCounts.set(titleKey, (titleCounts.get(titleKey) || 0) + 1);
    descriptionCounts.set(descriptionKey, (descriptionCounts.get(descriptionKey) || 0) + 1);
  }

  return pilot.recommendations.map((row) => {
    const coverage = coverageById.get(row.recommendation_id);
    const titleKey = `${row.locale}:${text(row.recommendations?.title?.recommended).toLowerCase()}`;
    const descriptionKey = `${row.locale}:${text(row.recommendations?.description?.recommended).toLowerCase()}`;
    const gates = [
      schemaValidation(row),
      dimensionalModelGate(row, coverage),
      ocean32Gate(row, coverage),
      goodBadGate(row, coverage),
      claimSafetyGate(row),
      privateRouteGate(row),
      resultPageGate(row),
      duplicateRiskGate(row, titleCounts.get(titleKey) || 0, descriptionCounts.get(descriptionKey) || 0),
      bilingualGate(coverage, codeLocaleMap),
      seoProjectionGate(row),
    ];
    const failedGates = gates.filter((item) => !item.passed).map((item) => item.id);

    return {
      recommendation_id: row.recommendation_id,
      target_url: row.target_url,
      locale: row.locale,
      framework: row.framework,
      entity_type: coverage?.entity_type || null,
      code: coverage?.code || null,
      gates,
      failed_gates: failedGates,
      qa_status: failedGates.length === 0 ? "pass" : "failed",
      eligible_for_approval_queue: failedGates.length === 0,
      eligible_for_cms_draft_path: failedGates.length === 0,
    };
  });
}

function buildArtifact() {
  const pilotText = readFile(PILOT_JSON);
  const pilot = JSON.parse(pilotText);
  const evaluations = evaluateRows(pilot);
  const failedRows = evaluations.filter((row) => row.failed_gates.length > 0);
  const gateTotals = Object.fromEntries(REQUIRED_GATES.map((id) => [
    id,
    {
      passed: evaluations.filter((row) => row.gates.find((gateItem) => gateItem.id === id)?.passed).length,
      failed: evaluations.filter((row) => row.gates.find((gateItem) => gateItem.id === id)?.passed === false).length,
    },
  ]));
  const decision = failedRows.length === 0 ? DECISIONS.pass : DECISIONS.repair;

  return {
    artifact: "BIG-FIVE-PUBLIC-PROFILE-AGENT-QA-01",
    version: "big_five.public_profile_agent_qa.v1",
    generated_at: GENERATED_AT,
    decision,
    status: decision === DECISIONS.pass ? "pass" : "repair_required",
    scope: "Artifact-only QA over Big Five public profile agent pilot recommendations. No CMS write, publish, indexability, sitemap/llms mutation, Search Queue, search submission, or frontend runtime change.",
    inputs: {
      pilot_artifact: PILOT_JSON,
      pilot_artifact_sha256: sha256Text(pilotText),
      pilot_status: pilot.status,
    },
    summary: {
      rows_evaluated: evaluations.length,
      rows_passed: evaluations.length - failedRows.length,
      rows_failed: failedRows.length,
      failed_rows_blocked_from_next_cms_draft_path: failedRows.every((row) => row.eligible_for_cms_draft_path === false),
      logical_entity_count: pilot.summary.logical_entity_count,
      locale_counts: pilot.summary.locale_counts,
      entity_type_counts: pilot.summary.entity_type_counts,
      gate_totals: gateTotals,
    },
    negative_guarantees: {
      cms_write: false,
      frontend_runtime_change: false,
      publish: false,
      indexability_change: false,
      sitemap_mutation: false,
      llms_mutation: false,
      search_queue: false,
      search_submission: false,
    },
    next_gate: decision === DECISIONS.pass ? "BIG-FIVE-AGENT-APPROVAL-QUEUE-INTEGRATION-01" : null,
    failed_rows: failedRows.map((row) => ({
      recommendation_id: row.recommendation_id,
      target_url: row.target_url,
      failed_gates: row.failed_gates,
      eligible_for_approval_queue: row.eligible_for_approval_queue,
      eligible_for_cms_draft_path: row.eligible_for_cms_draft_path,
    })),
    evaluations,
  };
}

function markdown(artifact) {
  const sampleRows = artifact.evaluations.slice(0, 12).map((row) => (
    `| ${markdownTableCell(new URL(row.target_url).pathname)} | ${row.locale} | ${row.entity_type} | ${row.qa_status} | ${row.failed_gates.length} |`
  )).join("\n");

  return `# Big Five Public Profile Agent QA

Generated: ${artifact.generated_at}
Decision: ${artifact.decision}

## Summary

- Rows evaluated: ${artifact.summary.rows_evaluated}
- Rows passed: ${artifact.summary.rows_passed}
- Rows failed: ${artifact.summary.rows_failed}
- Failed rows blocked from next CMS draft path: ${artifact.summary.failed_rows_blocked_from_next_cms_draft_path}
- Pilot artifact sha256: ${artifact.inputs.pilot_artifact_sha256}

## Sample Rows

| URL | Locale | Entity type | QA status | Failed gates |
| --- | --- | --- | --- | --- |
${sampleRows}

## Boundary

- Artifact-only QA.
- No CMS write, frontend runtime change, publish, indexability change, sitemap/llms mutation, Search Queue action, or search submission.
- Failed rows must not enter the approval queue or later CMS draft path.

## Next Task

${artifact.next_gate || "Stop for editorial repair before approval queue integration."}
`;
}

const artifact = buildArtifact();
writeFile(OUTPUT_JSON, `${JSON.stringify(artifact, null, 2)}\n`);
writeFile(OUTPUT_MD, markdown(artifact));

console.log(JSON.stringify({
  ok: true,
  output_json: OUTPUT_JSON,
  output_md: OUTPUT_MD,
  decision: artifact.decision,
  rows_evaluated: artifact.summary.rows_evaluated,
  rows_passed: artifact.summary.rows_passed,
  rows_failed: artifact.summary.rows_failed,
}, null, 2));
